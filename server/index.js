const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectDB } = require("./db");
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", async (req, res) => {
  try {
    const db = await connectDB();
    const products = await db.collection("products").find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products/apply-sale", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db
      .collection("products")
      .updateMany({ stock: { $gte: 20 }, status: { $ne: "sale" } }, [
        {
          $set: {
            status: "sale",
            price: { $round: [{ $multiply: ["$price", 0.9] }, 2] },
            schemaVersion: 4,
          },
        },
      ]);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/dev/reset-v1', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection('products');
    await collection.deleteMany({});

    const rawData = fs.readFileSync(path.join(__dirname, '../data/products_v1.json'));
    const products = JSON.parse(rawData);
    const result = await collection.insertMany(products);

    res.json({ message: 'DB reset to v1', count: result.insertedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dev/migrate-v2', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection('products').updateMany(
      {},
      {
        $set: { category: 'Hardware', schemaVersion: 2 },
        $unset: { temp_notes: '' }
      }
    );
    res.json({ message: 'Migration v2 executed', modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dev/migrate-v3', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection('products');

    // Feld umbenennen
    await collection.updateMany(
      { cost: { $exists: true } },
      { $rename: { cost: 'price' } }
    );

    // Felder zusammenführen
    const result = await collection.updateMany(
      { $or: [{ street: { $exists: true } }, { city: { $exists: true } }] },
      [
        {
          $set: {
            location: {
              $concat: [
                { $ifNull: ['$street', ''] },
                ', ',
                { $ifNull: ['$city', ''] }
              ]
            },
            schemaVersion: 3
          }
        },
        { $unset: ['street', 'city'] }
      ]
    );

    res.json({ message: 'Migration v3 executed', modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

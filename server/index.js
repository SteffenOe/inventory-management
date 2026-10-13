const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectDB } = require("./db");

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const { connectDB } = require('./db');
const fs = require('fs');
const path = require('path');

async function importDataset() {
  const db = await connectDB();
  const collection = db.collection('products');

  await collection.deleteMany({});

  const rawData = fs.readFileSync(path.join(__dirname, '../data/products_v1.json'));
  const products = JSON.parse(rawData);

  const result = await collection.insertMany(products);
  console.log(`${result.insertedCount} documents imported successfully !`);
  process.exit(0);
}

importDataset();
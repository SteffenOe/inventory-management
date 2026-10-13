const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function applySaleCampaign() {
  try {
    await client.connect();
    const db = client.db('inventory_db');
    const collection = db.collection('products');

    console.log('Starting conditional update for articles with stock >= 20...');

    const result = await collection.updateMany(
      { stock: { $gte: 20 }, status: {$ne: 'sale' } }, 
      [
        {
          $set: {
            status: 'sale',
            price: { $round: [{ $multiply: ['$price', 0.9] }, 2] }, 
            schemaVersion: 4,
          },
        },
      ]
    );

    console.log(`Success: ${result.modifiedCount} Articles have been discounted and set on "sale".`);
  } catch (error) {
    console.error('Error during conditional update:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

applySaleCampaign();
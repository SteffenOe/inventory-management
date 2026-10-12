const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function runMigration() {
  try {
    await client.connect();
    const db = client.db('inventory_db');
    const collection = db.collection('products');

    console.log('Starting migration v1 -> v2...');

    // 1. Addition of a field: category (Default "Hardware")
    // 2. Removal of a field: temp_notes 
    const result = await collection.updateMany(
      {},
      {
        $set: {            category: 'Hardware',           schemaVersion: 2          },$unset: { 
          temp_notes: '' 
        }
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} documents updated.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

runMigration();
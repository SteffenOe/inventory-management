const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function runMigrationV3() {
  try {
    await client.connect();
    const db = client.db('inventory_db');
    const collection = db.collection('products');

    console.log('Starting migration v2 -> v3...');

    // 1. Renaming of a field: cost -> price
    const renameResult = await collection.updateMany(
      { cost: { $exists: true } },
      { $rename: { cost: 'price' } }
    );
    console.log(`Renaming completed: ${renameResult.modifiedCount} fields renamed.`);

    // 2. Merging of two fields: street + city -> location
    const mergeResult = await collection.updateMany(
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
        {
          $unset: ['street', 'city']
        }
      ]
    );

    console.log(`Merging complted: ${mergeResult.modifiedCount} documents merged.`);
  } catch (error) {
    console.error('Error during migration to v3:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

runMigrationV3();
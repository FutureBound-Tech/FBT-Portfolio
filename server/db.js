import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'fbt_portfolio';

let client = null;
let db = null;

export async function connectToDatabase() {
  if (db) {
    return { client, db };
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        }
      });
      await client.connect();
      console.log('✅ Connected successfully to MongoDB:', DB_NAME);
    }
    db = client.db(DB_NAME);
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

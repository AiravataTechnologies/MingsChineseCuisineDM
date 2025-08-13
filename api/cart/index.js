import { MongoClient, ObjectId } from 'mongodb';

const connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
let client;

async function connectToDatabase() {
  if (!connectionString) {
    throw new Error('MongoDB connection string not provided');
  }
  
  if (!client) {
    client = new MongoClient(connectionString);
    await client.connect();
  }
  return client.db("mingsdb");
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    const database = await connectToDatabase();
    console.log('MongoDB connected successfully');
    
    if (req.method === 'GET') {
      console.log('Fetching cart items...');
      const cartItems = await database.collection('cart').find({}).toArray();
      console.log(`Found ${cartItems.length} cart items`);
      res.status(200).json(cartItems);
    } else if (req.method === 'POST') {
      const newCartItem = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await database.collection('cart').insertOne(newCartItem);
      const insertedItem = await database.collection('cart').findOne({ _id: result.insertedId });
      res.status(201).json(insertedItem);
    } else if (req.method === 'DELETE') {
      await database.collection('cart').deleteMany({});
      res.status(204).send();
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      connectionString: connectionString ? 'Present' : 'Missing'
    });
    res.status(500).json({ 
      error: 'Cart operation failed',
      details: error.message 
    });
  }
}
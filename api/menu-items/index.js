import { MongoClient } from 'mongodb';

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
      const { category } = req.query;

      if (category) {
        // Get items from specific category collection
        console.log(`Fetching items for category: ${category}`);

        // Map category names to collection names
        const categoryMap = {
          "soups": "soups",
          "vegstarter": "vegstarter",
          "chickenstarter": "chickenstarter",
          "prawnsstarter": "prawnsstarter",
          "seafood": "seafood",
          "springrolls": "springrolls",
          "momos": "momos",
          "gravies": "gravies",
          "potrice": "potrice",
          "rice": "rice",
          "ricewithgravy": "ricewithgravy",
          "noodle": "noodle",
          "noodlewithgravy": "noodlewithgravy",
          "thai": "thai",
          "chopsuey": "chopsuey",
          "desserts": "desserts",
          "beverages": "beverages",
          "extra": "extra"
        };



        const collectionName = categoryMap[category];
        if (!collectionName) {
          res.status(400).json({ error: 'Invalid category' });
          return;
        }

        const items = await database.collection(collectionName).find({}).toArray();
        console.log(`Found ${items.length} items in ${category} category`);
        res.status(200).json(items);
      } else {
        // Get all menu items from all category collections
        console.log('Fetching all menu items...');

        const categories = [
          "soups",
          "vegstarter",
          "chickenstarter",
          "prawnsstarter",
          "seafood",
          "springrolls",
          "momos",
          "gravies",
          "potrice",
          "rice",
          "ricewithgravy",
          "noodle",
          "noodlewithgravy",
          "thai",
          "chopsuey",
          "desserts",
          "beverages",
          "extra"
        ];


        let allMenuItems = [];

        for (const categoryCollection of categories) {
          try {
            const items = await database.collection(categoryCollection).find({}).toArray();
            allMenuItems = allMenuItems.concat(items);
          } catch (error) {
            console.log(`Collection ${categoryCollection} not found or empty`);
          }
        }

        console.log(`Found ${allMenuItems.length} menu items across all categories`);
        res.status(200).json(allMenuItems);
      }
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
      error: 'Failed to fetch menu items',
      details: error.message
    });
  }
}
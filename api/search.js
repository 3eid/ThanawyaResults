const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://cardfolioinfo:admin@cluster0.3oltzs7.mongodb.net/thanawya?retryWrites=true&w=majority';
const client = new MongoClient(uri);
let collection;

// Ensure MongoDB connection is reused
async function getCollection() {
  if (!collection) {
    await client.connect();
    const db = client.db('thanawya');
    collection = db.collection('thanawyaResultsNew');
  }
  return collection;
}

module.exports = async (req, res) => {
  const { rollNumber, name } = req.query;
  let query = {};

  if (rollNumber) {
    query['رقم الجلوس'] = { $in: [rollNumber, parseInt(rollNumber)] };
  }

  if (name) {
    query['الاسم'] = { $regex: name, $options: 'i' };
  }

  try {
    const collection = await getCollection();
    const results = await collection.find(query).toArray();
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ error: 'Error fetching records' });
  }
};

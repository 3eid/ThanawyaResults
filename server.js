const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const uri = 'mongodb+srv://cardfolioinfo:admin@cluster0.3oltzs7.mongodb.net/thanawya?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let db, collection;

// Ensure indexes exist without conflict
async function setupIndexes() {
  const indexes = await collection.indexes();

  const hasRollIndex = indexes.some(i => i.name === 'رقم الجلوس_1');
  if (!hasRollIndex) {
    await collection.createIndex({ "رقم الجلوس": 1 }, { name: "رقم الجلوس_1" });
  }

  const hasNameTextIndex = indexes.some(i => i.name === 'name_text_index');
  if (!hasNameTextIndex) {
    await collection.createIndex({ "الاسم": "text" }, { name: "name_text_index" });
  }
}

// Connect to MongoDB and start the server
client.connect()
  .then(async () => {
    console.log('Connected to MongoDB');
    db = client.db('thanawya');
    collection = db.collection('thanawyaResultsNew');

    // Optional: test data dump
    const testDocs = await collection.find({}).limit(2).toArray();
    console.log("Sample data from DB:", testDocs);

    // Ensure indexes exist
    await setupIndexes();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Search endpoint
app.get('/search', async (req, res) => {
  const rollNumber = req.query.rollNumber;
  const name = req.query.name;
  let query = {};

  if (rollNumber) {
    query['رقم الجلوس'] = {
      $in: [rollNumber, parseInt(rollNumber)]
    };
  }

  if (name) {
    query['الاسم'] = { $regex: name, $options: 'i' };
  }

  console.log("Search query:", query); // Debug

  try {
    const results = await collection.find(query).toArray();
    res.json(results);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ error: 'Error fetching records' });
  }
});

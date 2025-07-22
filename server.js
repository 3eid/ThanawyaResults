const express = require('express');
const { MongoClient } = require('mongodb'); // Use destructuring to import MongoClient
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const uri = 'mongodb+srv://cardfolioinfo:admin@cluster0.3oltzs7.mongodb.net/thanawya?retryWrites=true&w=majority';
const client = new MongoClient(uri);

let db, collection;

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        db = client.db('thanawya'); // Database name
        collection = db.collection('thanawyaResultsNew'); // Collection name



        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to search records
app.get('/search', async (req, res) => {
    const rollNumber = parseInt(req.query.rollNumber);
    const name = req.query.name;
    let query = {};

    if (rollNumber) {
        query['رقم الجلوس'] = rollNumber;
    }
    if (name) {
        query['الاسم'] = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    try {
        const results = await collection.find(query).toArray();
        res.json(results);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Error fetching records' });
    }
});

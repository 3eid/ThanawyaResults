const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Read data from JSON file
// Read data from JSON file
let data;
try {
    const jsonData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
    console.log('Data read from data.json:', jsonData); // Add this line for debugging
    data = JSON.parse(jsonData);
} catch (err) {
    console.error('Error parsing JSON file:', err);
    process.exit(1); // Exit the process if JSON parsing fails
}

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to search records
app.get('/search', (req, res) => {
    const rollNumber = req.query.rollNumber;
    const name = req.query.name;
    let result = data;
    if (rollNumber) {
        result = result.filter(record => record['رقم الجلوس'] == rollNumber);
    }
    if (name) {
        result = result.filter(record => record['الاسم'].includes(name));
    }
    res.json(result);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

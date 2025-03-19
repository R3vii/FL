const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Render or default to 3000

const corsOptions = {
    origin: "https://revdev.top",  // Allow requests from your site
    methods: "GET, POST",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

// Endpoint to get markers data
app.get('/api/markers', (req, res) => {
    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading file' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to update fuel prices
app.post('/api/update-price', (req, res) => {
    const { id, fuelPrice, dieselPrice, user } = req.body;

    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });

        let markers = JSON.parse(data);
        let marker = markers.find(m => m.id === id);

        if (!marker) return res.status(404).json({ error: 'Station not found' });

        // Update station prices
        marker.fuelPrice = fuelPrice;
        marker.dieselPrice = dieselPrice;
        marker.addedBy = user;

        fs.writeFile('markersData.json', JSON.stringify(markers, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error saving file' });
            res.json({ message: 'Prices updated!' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

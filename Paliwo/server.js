const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Render or default to 3000

const corsOptions = {
    origin: "https://revdev.top",  // Allow requests from your site
    methods: "GET, POST",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

// Full path to markersData.json
const markersDataPath = path.join(__dirname, 'markersData.json');

// ✅ Endpoint dla głównej ścieżki "/"
app.get("/", (req, res) => {
    res.send("Backend działa! 🚀");
});

// Endpoint to get markers data
app.get('/api/markers', (req, res) => {
    fs.readFile(markersDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Error reading file' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/update-price', (req, res) => {
    const { id, fuelPrice, dieselPrice, user } = req.body;

    fs.readFile(markersDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading file' });
        }

        let markers = JSON.parse(data);
        let marker = markers.find(m => m.id === id);

        if (!marker) return res.status(404).json({ error: 'Station not found' });

        // Update station prices and lastUpdated
        marker.fuelPrice = fuelPrice;
        marker.dieselPrice = dieselPrice;
        marker.addedBy = user;
        marker.lastUpdated = new Date().toISOString(); // 🔹 Dodaj aktualną datę i godzinę

        fs.writeFile(markersDataPath, JSON.stringify(markers, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error saving file' });
            res.json({ 
                message: 'Prices updated!',
                lastUpdated: marker.lastUpdated // 🔹 Zwróć datę ostatniej aktualizacji
            });
        });
    });
});

// Log the working directory and check file existence
console.log('Current working directory:', __dirname);
console.log('File path:', markersDataPath);

fs.access(markersDataPath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error('File does not exist:', err);
    } else {
        console.log('File exists!');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

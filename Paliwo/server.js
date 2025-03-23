const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;  // Możesz ustawić port w zmiennych środowiskowych

// Dozwolone domeny - dodaj adres swojego publicznego serwera
const allowedOrigins = [
    "http://127.0.0.1:5500",  // Lokalny rozwój
    "http://localhost:3000",  // Lokalny serwer
    "https://revdev.top",     // Twoja publiczna domena
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET, POST",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json());

// Endpoint do pobierania danych markerów
app.get('/api/markers', (req, res) => {
    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });
        res.json(JSON.parse(data));
    });
});

// Endpoint do aktualizacji cen paliw
app.post('/api/update-price', (req, res) => {
    const { id, fuelPrice, dieselPrice, user } = req.body;

    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error reading file' });

        let markers = JSON.parse(data);
        let marker = markers.find(m => m.id === id);

        if (!marker) return res.status(404).json({ error: 'Station not found' });

        // Aktualizacja cen
        marker.fuelPrice = fuelPrice;
        marker.dieselPrice = dieselPrice;
        marker.addedBy = user;
        
        // Dodanie daty ostatniej aktualizacji
        marker.lastUpdated = new Date().toISOString();

        // Zapisz zaktualizowane dane
        fs.writeFile('markersData.json', JSON.stringify(markers, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error saving file' });
            res.json({ message: 'Prices updated!', lastUpdated: marker.lastUpdated });
        });
    });
});

// Startowanie serwera
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

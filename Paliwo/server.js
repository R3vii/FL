const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: "https://revdev.top",
    methods: "GET, POST",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔹 Funkcja do odczytu JSON z obsługą błędów
function readJSONFile(filepath, defaultData = []) {
    try {
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
        }
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data || "[]"); 
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return [];
    }
}

// 🔹 Endpoint do pobierania danych stacji
app.get('/api/markers', (req, res) => {
    const markers = readJSONFile('markersData.json');
    res.json(markers);
});

// 🔹 Endpoint do aktualizacji cen paliwa
app.post('/api/update-price', (req, res) => {
    const { id, fuelPrice, dieselPrice, user } = req.body;

    let markers = readJSONFile('markersData.json');
    let marker = markers.find(m => m.id === id);

    if (!marker) {
        return res.status(404).json({ error: 'Station not found' });
    }

    // Aktualizacja cen stacji
    marker.fuelPrice = fuelPrice;
    marker.dieselPrice = dieselPrice;
    marker.addedBy = user;

    fs.writeFile('markersData.json', JSON.stringify(markers, null, 2), (err) => {
        if (err) {
            console.error("Error writing file:", err);
            return res.status(500).json({ error: 'Error saving file' });
        }
        res.json({ message: 'Prices updated!' });
    });
});

// 🔹 Start serwera
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


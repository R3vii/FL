const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Endpoint do pobierania markerów (danych stacji)
app.get('/api/markers', (req, res) => {
    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd odczytu pliku' });
        }
        res.json(JSON.parse(data)); // Zwraca dane w formacie JSON
    });
});

// Endpoint do aktualizowania cen markerów
app.post('/api/update-price', (req, res) => {
    const { id, fuelPrice, dieselPrice, user } = req.body;

    fs.readFile('markersData.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Błąd odczytu pliku' });

        let markers = JSON.parse(data);
        let marker = markers.find(m => m.id === id);

        if (!marker) return res.status(404).json({ error: 'Stacja nie znaleziona' });

        // Zaktualizuj ceny stacji
        marker.fuelPrice = fuelPrice;
        marker.dieselPrice = dieselPrice;
        marker.addedBy = user;

        fs.writeFile('markersData.json', JSON.stringify(markers, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Błąd zapisu do pliku' });
            res.json({ message: 'Ceny zaktualizowane!' });
        });
    });
});

// Uruchom serwer na porcie 3000
app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});

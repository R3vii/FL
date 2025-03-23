const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Render or default to 3000

const corsOptions = {
    origin: "https://revdev.top",  // Allow requests from your site
    methods: "GET, POST, DELETE",
    allowedHeaders: "Content-Type"
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

// Full path to markersData.json
const markersDataPath = path.join(__dirname, 'markersData.json');

// Folder do przechowywania backupów
const backupsDir = path.join(__dirname, 'backups');

// Sprawdź, czy folder backups istnieje, a jeśli nie, to go utwórz
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
    console.log('Folder backups został utworzony.');
}

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

        // Zapisz aktualne dane do pliku markersData.json
        fs.writeFile(markersDataPath, JSON.stringify(markers, null, 2), err => {
            if (err) return res.status(500).json({ error: 'Error saving file' });

            // Utwórz backup
            createBackup(markers);

            res.json({ 
                message: 'Prices updated!',
                lastUpdated: marker.lastUpdated // 🔹 Zwróć datę ostatniej aktualizacji
            });
        });
    });
});

// Funkcja do tworzenia backupu
function createBackup(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupsDir, `backup-${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`Backup zapisany do: ${backupPath}`);
}

// Endpoint do pobierania listy backupów
app.get('/api/backups', (req, res) => {
    fs.readdir(backupsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading backups directory' });
        }
        res.json(files);
    });
});

// Endpoint do pobierania konkretnego backupu
app.get('/api/backups/:filename', (req, res) => {
    const filename = req.params.filename;
    const backupPath = path.join(backupsDir, filename);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: 'Backup file not found' });
    }

    // Wyślij plik do pobrania
    res.download(backupPath);
});

// Endpoint do usuwania backupu
app.delete('/api/backups/:filename', (req, res) => {
    const filename = req.params.filename;
    const backupPath = path.join(backupsDir, filename);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: 'Backup file not found' });
    }

    // Usuń plik
    fs.unlinkSync(backupPath);
    res.json({ message: 'Backup deleted successfully!' });
});

// Endpoint do przywracania backupu
app.post('/api/restore-backup', (req, res) => {
    const { backupFile } = req.body;
    const backupPath = path.join(backupsDir, backupFile);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ error: 'Backup file not found' });
    }

    // Odczytaj dane z backupu
    const backupData = fs.readFileSync(backupPath, 'utf8');

    // Zapisz dane z backupu do markersData.json
    fs.writeFile(markersDataPath, backupData, err => {
        if (err) {
            return res.status(500).json({ error: 'Error restoring backup' });
        }

        res.json({ message: 'Backup restored successfully!' });
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

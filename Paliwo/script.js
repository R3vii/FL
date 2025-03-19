window.onload = function() {
    openModal();
    fetchMarkers(); // Pobiera dane i rysuje stacje
    // Upewnij się, że DOM jest gotowy przed próbą manipulacji
    document.addEventListener("DOMContentLoaded", function() {
        renderMarkers();  // Dopiero teraz próbujemy renderować markery
    });
};


// 🔹 Funkcja otwierająca modal
function openModal() {
    document.getElementById("modal").style.display = "block";
}

// 🔹 Funkcja zamykająca modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// 🔹 Ustawienie mapy Leaflet
var bounds = [[0, 0], [8192, 8192]]; 
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 5,
    maxBounds: bounds,
    maxBoundsViscosity: 1
});

var imageUrl = 'Mapa.png';
var imageLayer = L.imageOverlay(imageUrl, bounds).addTo(map);
map.fitBounds(bounds);

var markers = {}; // Obiekt przechowujący markery

// 🔹 Pobieranie danych stacji z backendu
function fetchMarkers() {
    fetch('https://fl-ygc6.onrender.com')
        .then(response => response.json())
        .then(data => {
            markersData = data; // Aktualizacja danych
            renderMarkers();
        })
        .catch(error => console.error('Błąd pobierania danych:', error));
}

// 🔹 Funkcja rysująca markery na mapie
function renderMarkers() {
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    markersData.forEach(markerData => {
        var iconUrl = 'Bena.png';
        var marker = L.marker([markerData.lat, markerData.lng], {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [50, 50],
                iconAnchor: [15, 50],
                popupAnchor: [0, -40]
            })
        }).addTo(map);

        updatePopupContent(marker, markerData);
        markers[markerData.id] = marker;
    });

    // Teraz nie renderujemy formularzy edycji na stronie, bo mają być tylko w popupie.
    // renderStationsList(); // Usunięte, ponieważ formularze są tylko w popupie
}

// 🔹 Funkcja aktualizująca popup
function updatePopupContent(marker, markerData) {
    const isLogged = isLoggedIn(); // Sprawdzamy, czy użytkownik jest zalogowany

    // Jeśli użytkownik jest zalogowany, dodajemy możliwość edycji w popupie
    let popupContent = `
        <b>Nazwa Stacji:</b> ${markerData.title}<br>
        <b>Cena Paliwa:</b> ${markerData.fuelPrice}<br>
        <b>Cena Diesla:</b> ${markerData.dieselPrice}<br>
        <b>Dodane przez:</b> ${markerData.addedBy}<br>
    `;

    // Jeśli użytkownik jest zalogowany, pokazujemy możliwość edytowania
    if (isLogged) {
        popupContent += `
            <br><input type="text" id="fuel-${markerData.id}" value="${markerData.fuelPrice}" />
            <input type="text" id="diesel-${markerData.id}" value="${markerData.dieselPrice}" />
            <button onclick="updatePrice('${markerData.id}')">Zapisz</button>
        `;
    }

    marker.bindPopup(popupContent);
}

// 🔹 Funkcja renderująca stacje bez formularzy edycji
function renderStationsList() {
    var container = document.getElementById("stations");

    if (container === null) {
        console.error("Element #stations nie został znaleziony!");
        return; // Jeśli element nie istnieje, zakończ funkcję
    }

    container.innerHTML = ""; // Resetujemy zawartość kontenera

    // Renderujemy tylko nazwy stacji i ceny, bez formularzy edycji
    markersData.forEach(marker => {
        const div = document.createElement("div");

        // Zawsze pokazujemy nazwę stacji i ceny
        div.innerHTML = `
            <h3>${marker.title}</h3>
            <p>Benzyna: ${marker.fuelPrice}</p>
            <p>Diesel: ${marker.dieselPrice}</p>
            <hr>
        `;

        container.appendChild(div);
    });
}




// 🔹 Wysyłanie nowych cen do serwera
function updatePrice(id) {
    if (!isLoggedIn()) {
        alert("Musisz być zalogowany, aby edytować ceny!");
        return;
    }

    const fuelPrice = document.getElementById(`fuel-${id}`).value;
    const dieselPrice = document.getElementById(`diesel-${id}`).value;
    const user = localStorage.getItem('loggedUser');

    fetch('http://localhost:3000/api/update-price', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fuelPrice, dieselPrice, user })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchMarkers(); // Odśwież listę stacji
    })
    .catch(error => console.error("Błąd:", error));
}

// 🔹 Sprawdzanie, czy użytkownik jest zalogowany
function isLoggedIn() {
    return localStorage.getItem('loggedUser') !== null;
}


function updateLoginStatus() {
    const statusEl = document.getElementById('login-status');
    const loggedUser = localStorage.getItem('loggedUser');

    if (loggedUser) {
        statusEl.innerHTML = `Zalogowano jako: ${loggedUser} <button id="logout-btn">Wyloguj</button>`;
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('loggedUser');
            updateLoginStatus();
            alert("Wylogowano pomyślnie!");
        });
    } else {
        statusEl.innerText = "Niezalogowano";
    }
}


document.addEventListener('DOMContentLoaded', function() {
    updateLoginStatus();
});



function toggleChangelog() {
    var changelog = document.getElementById("changelog");
    changelog.style.display = changelog.style.display === "none" ? "block" : "none";
}


function customButtonClick() {
    toggleForm();
}


function toggleForm() {
    var formContainer = document.getElementById("form-container");
    if (formContainer.style.display === "none" || formContainer.classList.contains("hidden")) {
        formContainer.style.display = "block";
        formContainer.classList.remove("hidden");
    } else {
        formContainer.style.display = "none";
        formContainer.classList.add("hidden");
    }
}


const express = require('express');
const cors = require('cors');
const app = express();

// Ustawienie CORS (zezwala na dostęp z każdego źródła, ale możesz ograniczyć do GitHub Pages)
app.use(cors());

// Inny sposób: tylko z GitHub Pages
// app.use(cors({
//   origin: 'https://twoja-strona.github.io'
// }));

app.get('/endpoint', (req, res) => {
  res.json({ message: 'Dane z API' });
});

app.listen(3000, () => {
  console.log('Serwer działa na http://localhost:3000');
});

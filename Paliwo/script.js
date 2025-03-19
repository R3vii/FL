window.onload = function () {
    openModal();
    fetchMarkers(); // Pobiera dane i rysuje stacje
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
var markersData = []; // Globalna zmienna na dane stacji

// 🔹 Pobieranie danych stacji z backendu
function fetchMarkers() {
    fetch('https://fl-ygc6.onrender.com/api/markers')
        .then(response => response.json())
        .then(data => {
            markersData = data;
            renderMarkers(); // Renderowanie markerów po pobraniu danych
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
}

// 🔹 Funkcja aktualizująca popup
function updatePopupContent(marker, markerData) {
    const isLogged = isLoggedIn();

    let popupContent = `
        <b>Nazwa Stacji:</b> ${markerData.title}<br>
        <b>Cena Paliwa:</b> ${markerData.fuelPrice}<br>
        <b>Cena Diesla:</b> ${markerData.dieselPrice}<br>
        <b>Dodane przez:</b> ${markerData.addedBy}<br>
    `;

    if (isLogged) {
        popupContent += `
            <br><input type="text" id="fuel-${markerData.id}" value="${markerData.fuelPrice}" />
            <input type="text" id="diesel-${markerData.id}" value="${markerData.dieselPrice}" />
            <button onclick="updatePrice('${markerData.id}')">Zapisz</button>
        `;
    }

    marker.bindPopup(popupContent);
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

    fetch('https://fl-ygc6.onrender.com/api/update-price', {
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

// 🔹 Aktualizacja statusu logowania
function updateLoginStatus() {
    const statusEl = document.getElementById('login-status');
    if (!statusEl) return;

    const loggedUser = localStorage.getItem('loggedUser');

    if (loggedUser) {
        statusEl.innerHTML = `Zalogowano jako: ${loggedUser} <button id="logout-btn">Wyloguj</button>`;
        document.getElementById('logout-btn').addEventListener('click', function () {
            localStorage.removeItem('loggedUser');
            updateLoginStatus();
            alert("Wylogowano pomyślnie!");
        });
    } else {
        statusEl.innerHTML = `<p>Niezalogowano</p>`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updateLoginStatus();
});

// 🔹 Funkcja przełączająca changelog
function toggleChangelog() {
    var changelog = document.getElementById("changelog");
    changelog.style.display = changelog.style.display === "none" ? "block" : "none";
}

// 🔹 Przełączanie formularza
function toggleForm() {
    var formContainer = document.getElementById("form-container");
    if (!formContainer) return;
    formContainer.classList.toggle("hidden");
    formContainer.style.display = formContainer.classList.contains("hidden") ? "none" : "block";
}

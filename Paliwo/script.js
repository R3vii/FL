window.onload = function() {
    openModal();
    fetchMarkers(); // Fetch data and draw the stations
    document.addEventListener("DOMContentLoaded", function() {
        renderMarkers();  // Render markers once DOM is ready
    });
};

// Open modal
function openModal() {
    document.getElementById("modal").style.display = "block";
}

// Close modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Initialize the map (using Leaflet)
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

var markers = {}; // Object to store markers
var markersData = []; // Initialize the markersData variable

// Fetching the markers data
function fetchMarkers() {
    fetch('https://fl-ygc6.onrender.com/api/markers')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched markers data:', data);  // Log fetched data
            if (Array.isArray(data)) {
                markersData = data; // Update markers data
                renderMarkers();
            } else {
                console.error('Expected an array but got:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Wystąpił błąd podczas pobierania danych z serwera.');
        });
}


// Render the markers on the map
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

// Update popup content (price, name, etc.)
function updatePopupContent(marker, markerData) {
    const isLogged = isLoggedIn(); // Check if the user is logged in

    let popupContent = ` 
        <b>Station Name:</b> ${markerData.title}<br>
        <b>Fuel Price:</b> ${markerData.fuelPrice}<br>
        <b>Diesel Price:</b> ${markerData.dieselPrice}<br>
        <b>Added By:</b> ${markerData.addedBy}<br>
    `;

    if (isLogged) {
        popupContent += `
            <br><input type="text" id="fuel-${markerData.id}" value="${markerData.fuelPrice}" />
            <input type="text" id="diesel-${markerData.id}" value="${markerData.dieselPrice}" />
            <button onclick="updatePrice('${markerData.id}')">Save</button>
        `;
    }

    marker.bindPopup(popupContent);
}

// Check if the user is logged in
function isLoggedIn() {
    return localStorage.getItem('loggedUser') !== null;
}

// Update login status and display user information
function updateLoginStatus() {
    const statusEl = document.getElementById('login-status');
    const loggedUser = localStorage.getItem('loggedUser');

    if (loggedUser) {
        statusEl.innerHTML = `Logged in as: ${loggedUser} <button id="logout-btn">Logout</button>`;
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('loggedUser');
            updateLoginStatus();
            alert("Successfully logged out!");
        });
    } else {
        statusEl.innerText = "Not logged in";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateLoginStatus();
});

// Handle login form submission
function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "" || password === "") {
        alert("Please enter both username and password");
        return;
    }

    // Validate user credentials (hardcoded example)
    if (username === "admin" && password === "admin123") {
        localStorage.setItem('loggedUser', username);
        updateLoginStatus();
        alert("Successfully logged in!");
        closeModal(); // Close login modal after successful login
    } else {
        alert("Invalid username or password!");
    }
}

// Update the fuel price data
function updatePrice(id) {
    if (!isLoggedIn()) {
        alert("You must be logged in to edit prices!");
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
        fetchMarkers(); // Refresh the markers list
    })
    .catch(error => console.error("Error:", error));
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



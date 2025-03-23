window.onload = function() {
    openModal();
    fetchMarkers(); // Pobiera dane i rysuje stacje
    // Upewnij się, że DOM jest gotowy przed próbą manipulacji
    document.addEventListener("DOMContentLoaded", function() {
        renderMarkers();  // Dopiero teraz próbujemy renderować markery
    });
};



document.addEventListener('DOMContentLoaded', function() {
    updateLoginStatus();

    // Podpinamy obsługę formularza logowania
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});




function login(event) {
    event.preventDefault();
    
    // Pobieramy i czyszczymy wpisane dane
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "" || password === "") {
        showNotification("Proszę wpisać zarówno nazwę użytkownika, jak i hasło!","error");
        return;
    }

    // Pobieramy dane użytkowników z pliku data.json
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Błąd przy ładowaniu pliku z danymi");
            }
            return response.json();
        })
        .then(users => {
            // Szukamy użytkownika, którego nick i hasło odpowiadają wpisanym danym
            const user = users.find(u => u.nick === username && u.password === password);
            
            if (user) {
                // Dane są poprawne – logujemy użytkownika
                localStorage.setItem('loggedUser', username);
                updateLoginStatus();
                showNotification("Pomyślnie zalogowano!");
                closeModal(); // Zamykamy modal po udanym logowaniu
                setTimeout(() => {
                    location.reload(); // ✅ Odświeżenie strony po zalogowaniu
                }, 1500);
            } else {
                // Dane nie są poprawne – nie zapisujemy w localStorage
                showNotification("Nieprawidłowa nazwa użytkownika lub hasło!","error");
            }
        })
        .catch(error => {
            console.error('Błąd podczas ładowania danych użytkowników:', error);
            showNotification("Wystąpił błąd podczas ładowania danych logowania.","error");
        });
}




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
    fetch('https://fl-ygc6.onrender.com/api/markers')
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

    // Dodajemy godzinę ostatniej aktualizacji, jeśli istnieje
    if (markerData.lastUpdated) {
        const lastUpdatedTime = new Date(markerData.lastUpdated);
        popupContent += `
            <b>Ostatnia aktualizacja:</b> ${lastUpdatedTime.toLocaleString()}<br>
        `;
    }


    // 🔹 Wyświetlanie współrzędnych po kliknięciu w mapę
map.on('click', function(event) {
    var lat = event.latlng.lat.toFixed(5);
    var lng = event.latlng.lng.toFixed(5);

    document.getElementById("coordsDisplay").textContent = `${lat}, ${lng}`;
});


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




function updatePrice(id) {
    if (!isLoggedIn()) {
        showNotification("Ojojoj, chyba nie jesteś zalogowany, by edytować ceny");
        return;
    }

    const fuelPrice = document.getElementById(`fuel-${id}`).value;
    const dieselPrice = document.getElementById(`diesel-${id}`).value;
    const user = localStorage.getItem('loggedUser'); // Get the logged-in user from localStorage

    fetch('https://fl-ygc6.onrender.com/api/update-price', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fuelPrice, dieselPrice, user }) // Sending user info to backend
    })
    .then(response => response.json())
    .then(data => {
        showNotification(data.message);
        fetchMarkers(); // Refresh the markers after update
    })
    .catch(error => console.error("Błąd:", error));
}


// 🔹 Sprawdzanie, czy użytkownik jest zalogowany
function isLoggedIn() {
    return localStorage.getItem("loggedUser") !== null;
}



// Obsługa wylogowania
function updateLoginStatus() {
    const statusEl = document.getElementById("login-status");
    const loggedUser = localStorage.getItem("loggedUser");

    if (loggedUser) {
        statusEl.innerHTML = `Zalogowano jako: ${loggedUser} <button id="logout-btn">Wyloguj</button>`;
        document.getElementById("logout-btn").addEventListener("click", function () {
            localStorage.removeItem("loggedUser");
            showNotification("Wylogowano pomyślnie!", "success");

            setTimeout(() => {
                location.reload(); // ✅ Odświeżenie strony po wylogowaniu
            }, 1500);
        });

        hideForm(); // Ukrywanie formularza po zalogowaniu
    } else {
        statusEl.innerText = "Niezalogowano";
    }
}



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






document.getElementById("showStationsBtn").addEventListener("click", function() {
    renderStationsList();
    openStationsModal();
});

// Funkcja otwierająca modal
function openStationsModal() {
    document.getElementById("stations-modal").style.display = "block";
}

// Funkcja zamykająca modal
function closeStationsModal() {
    document.getElementById("stations-modal").style.display = "none";
}












// Funkcja renderująca stacje w tabeli
function renderStationsTable(filteredData = markersData) {
    const tableBody = document.querySelector("#stations-table tbody");
    tableBody.innerHTML = ""; // Resetujemy zawartość tabeli

    filteredData.forEach(marker => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${marker.title}</td>
            <td>${marker.fuelPrice}</td>
            <td>${marker.dieselPrice}</td>
            <td>${marker.addedBy}</td>
            <td>${marker.lastUpdated ? new Date(marker.lastUpdated).toLocaleString() : "Brak danych"}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Funkcja do filtrowania stacji na podstawie wybranego kryterium
function filterStations() {
    const selectedOption = document.querySelector("#filter-select").value;

    let sortedData = [...markersData]; // Tworzymy kopię danych, aby nie modyfikować oryginalnych

    // Sortowanie danych na podstawie wybranego kryterium
    switch (selectedOption) {
        case 'fuelPriceAsc':
            sortedData.sort((a, b) => parseFloat(a.fuelPrice) - parseFloat(b.fuelPrice));
            break;
        case 'fuelPriceDesc':
            sortedData.sort((a, b) => parseFloat(b.fuelPrice) - parseFloat(a.fuelPrice));
            break;
        case 'dieselPriceAsc':
            sortedData.sort((a, b) => parseFloat(a.dieselPrice) - parseFloat(b.dieselPrice));
            break;
        case 'dieselPriceDesc':
            sortedData.sort((a, b) => parseFloat(b.dieselPrice) - parseFloat(a.dieselPrice));
            break;
        case 'lastUpdatedAsc':
            sortedData.sort((a, b) => {
                const dateA = a.lastUpdated ? new Date(a.lastUpdated) : null;
                const dateB = b.lastUpdated ? new Date(b.lastUpdated) : null;
                
                // Jeśli daty są nieprawidłowe (np. 'Invalid Date'), traktujemy je jako bardzo stare daty
                if (isNaN(dateA)) {
                    console.warn(`Błąd daty dla stacji: ${a.title}`);
                    return -1;  // Umieszczamy stację na początku listy, jeśli data jest błędna
                }
                if (isNaN(dateB)) {
                    console.warn(`Błąd daty dla stacji: ${b.title}`);
                    return 1;  // Umieszczamy stację na końcu listy, jeśli data jest błędna
                }

                return dateA - dateB; // Sortowanie rosnąco
            });
            break;
        case 'lastUpdatedDesc':
            sortedData.sort((a, b) => {
                const dateA = a.lastUpdated ? new Date(a.lastUpdated) : null;
                const dateB = b.lastUpdated ? new Date(b.lastUpdated) : null;

                // Jeśli daty są nieprawidłowe (np. 'Invalid Date'), traktujemy je jako bardzo stare daty
                if (isNaN(dateA)) {
                    console.warn(`Błąd daty dla stacji: ${a.title}`);
                    return -1;  // Umieszczamy stację na początku listy, jeśli data jest błędna
                }
                if (isNaN(dateB)) {
                    console.warn(`Błąd daty dla stacji: ${b.title}`);
                    return 1;  // Umieszczamy stację na końcu listy, jeśli data jest błędna
                }

                return dateB - dateA; // Sortowanie malejąco
            });
            break;
        default:
            sortedData = markersData; // W przypadku braku wybranej opcji, dane pozostają nieposortowane
    }

    renderStationsTable(sortedData); // Renderowanie posortowanej tabeli
}


function renderStationsTable(filteredData = markersData) {
    const tableBody = document.querySelector("#stations-table tbody");
    tableBody.innerHTML = ""; // Resetujemy zawartość tabeli

    filteredData.forEach(marker => {
        const row = document.createElement("tr");
        row.id = `station-${marker.id}`; // Dodajemy identyfikator do wiersza

        row.innerHTML = `
            <td>${marker.title}</td>
            <td>${marker.fuelPrice}</td>
            <td>${marker.dieselPrice}</td>
            <td>${marker.addedBy}</td>
            <td>${marker.lastUpdated ? new Date(marker.lastUpdated).toLocaleString() : "Brak danych"}</td>
        `;

        // Dodajemy obsługę kliknięcia na nazwę stacji
        row.querySelector("td").addEventListener("click", () => {
            focusOnStation(marker);
        });

        tableBody.appendChild(row);
    });
}

function focusOnStation(marker) {
    const markerLatLng = L.latLng(marker.lat, marker.lng);
    map.setView(markerLatLng, 1); // Ustawiamy zoom na 5, możesz dostosować wartość zoomu
    markers[marker.id].openPopup(); // Otwieramy popup dla danego markera
}
// Dodanie obsługi kliknięcia na przycisk
document.getElementById("toggle-stations-button").addEventListener("click", toggleStationsList);


function tabelkaPokazana() {
    toggleStationsTable();
}


function toggleStationsTable() {
    var tableContainer = document.getElementById("stations-table-container");
    if (tableContainer.style.display === "none" || tableContainer.classList.contains("hidden")) {
        tableContainer.style.display = "block";
        tableContainer.classList.remove("hidden");
    } else {
        tableContainer.style.display = "none";
        tableContainer.classList.add("hidden");
    }
}



function showNotification(message, type = "success", duration = 3000) {
    const container = document.getElementById("notification-container");

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">&times;</button>
    `;

    container.appendChild(notification);

    // Obsługa zamykania powiadomienia
    notification.querySelector(".close-btn").addEventListener("click", () => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 500);
    });

    // Automatyczne zamknięcie po czasie
    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 500);
    }, duration);
}





function hideForm() {
    var formContainer = document.getElementById("form-container");
    if (formContainer) {
        formContainer.style.display = "none"; // Ukrywanie formularza
    }
}



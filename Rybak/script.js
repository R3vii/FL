// Pobiera saldo z localStorage lub ustawia na 0
let saldo = parseFloat(localStorage.getItem('saldo')) || 0;
document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;

function dodajDoSalda(kwota) {
  saldo += kwota;
  localStorage.setItem('saldo', saldo);
  document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;
}

// Funkcje dla przeciągania ryb za pomocą myszy (desktop)
function allowDrop(e) {
  e.preventDefault();
  document.getElementById("beczka").classList.add("highlight");
}

function drop(e) {
  e.preventDefault();
  document.getElementById("beczka").classList.remove("highlight");

  const idRyby = e.dataTransfer.getData("text/plain");
  const rybaElement = document.getElementById(idRyby);
  if (rybaElement) {
    const cena = parseFloat(rybaElement.getAttribute("data-cena"));
    if (!isNaN(cena)) {
      dodajDoSalda(cena);
    }
  }
}

// Zapobiegamy przeciąganiu beczki
const beczka = document.getElementById("beczka");
beczka.setAttribute('draggable', 'false');
beczka.addEventListener("dragover", allowDrop);
beczka.addEventListener("dragleave", function () {
  this.classList.remove("highlight");
});
beczka.addEventListener("drop", drop);

// Obsługa dotyku (mobile)
// Zmienne globalne do obsługi przeciągania dotykiem
let currentDragged = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleTouchStart(e) {
  currentDragged = e.currentTarget;
  const touch = e.touches[0];
  const rect = currentDragged.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
  // Ustawiamy element jako absolutnie pozycjonowany, by łatwo go przesuwać
  currentDragged.style.position = "absolute";
  currentDragged.style.zIndex = "1000";
}

function handleTouchMove(e) {
  if (!currentDragged) return;
  e.preventDefault(); // Zapobiega przewijaniu strony
  const touch = e.touches[0];
  const x = touch.clientX - touchOffsetX;
  const y = touch.clientY - touchOffsetY;
  currentDragged.style.left = `${x}px`;
  currentDragged.style.top = `${y}px`;
}

function handleTouchEnd(e) {
  if (!currentDragged) return;
  const beczka = document.getElementById("beczka");
  const beczkaRect = beczka.getBoundingClientRect();
  const rybaRect = currentDragged.getBoundingClientRect();
  
  // Sprawdzamy, czy ryba została upuszczona w obrębie beczki
  if (
    rybaRect.left < beczkaRect.right &&
    rybaRect.right > beczkaRect.left &&
    rybaRect.top < beczkaRect.bottom &&
    rybaRect.bottom > beczkaRect.top
  ) {
    const cena = parseFloat(currentDragged.getAttribute("data-cena"));
    if (!isNaN(cena)) {
      dodajDoSalda(cena);
    }
    // Opcjonalnie możesz dodać efekt podświetlenia beczki tutaj
    beczka.classList.add("highlight");
    setTimeout(() => beczka.classList.remove("highlight"), 300);
  }
  // Resetujemy pozycję ryby (można też zapamiętać pierwotną pozycję, jeśli chcesz)
  currentDragged.style.position = "";
  currentDragged.style.left = "";
  currentDragged.style.top = "";
  currentDragged.style.zIndex = "";
  currentDragged = null;
}

// Dodajemy obsługę dotyku do każdego kontenera ryby
document.querySelectorAll(".ryba-container").forEach(ryba => {
  ryba.addEventListener("touchstart", handleTouchStart, false);
  ryba.addEventListener("touchmove", handleTouchMove, false);
  ryba.addEventListener("touchend", handleTouchEnd, false);
});

// Obsługa przeciągania myszy (desktop) dla ryb
document.querySelectorAll(".ryba-container").forEach(ryba => {
  ryba.addEventListener("dragstart", function (e) {
    e.dataTransfer.setData("text/plain", this.id);
  });
});

// Funkcja do rozwijania i zwijania kategorii ryb
function toggleRyby(kategoria) {
  const rybyContainer = document.getElementById(kategoria);
  rybyContainer.classList.toggle('open');
}



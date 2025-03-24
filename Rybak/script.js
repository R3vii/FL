// Pobieranie salda z localStorage lub ustawienie na 0
let saldo = parseFloat(localStorage.getItem('saldo')) || 0;
document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;

// Globalny obiekt do przechowywania liczby ryb w beczce
let fishCounter = {};

// Funkcja aktualizująca wyświetlane saldo
function dodajDoSalda(kwota) {
  saldo += kwota;
  localStorage.setItem('saldo', saldo);
  document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;
}

// Funkcja resetująca saldo oraz licznik rybek
function resetSaldo() {
  saldo = 0;
  localStorage.setItem('saldo', saldo);
  document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;
  
  // Resetowanie licznika rybek w localStorage i aktualizacja listy
  fishCounter = {};
  localStorage.setItem('fishCounter', JSON.stringify(fishCounter));
  updateFishList();
}


// Funkcja aktualizująca listę ryb w beczce
function updateFishList() {
  // Wczytujemy dane z localStorage
  const storedFishCounter = localStorage.getItem('fishCounter');
  
  if (storedFishCounter) {
    fishCounter = JSON.parse(storedFishCounter);
  }

  const fishListDiv = document.getElementById('fishList');
  const ul = fishListDiv.querySelector('ul');
  ul.innerHTML = ''; // Czyścimy bieżącą listę

  for (let fishName in fishCounter) {
    const li = document.createElement('li');
    li.innerText = `${fishName}: ${fishCounter[fishName]}`;
    ul.appendChild(li);
  }
}
// Ładowanie zawartości ryb po załadowaniu strony
document.addEventListener("DOMContentLoaded", () => {
  loadFishContent();  // Ładowanie zawartości ryb z fish.html
  updateFishList();   // Wczytanie listy ryb z localStorage
  
  // Czekamy chwilę, aby upewnić się, że wszystkie elementy są załadowane
  setTimeout(() => {
    // Rozwijamy tylko pierwszą kategorię po załadowaniu strony
    const firstCategory = document.querySelector('.kategoria');
    if (firstCategory) {
      const firstCategoryId = firstCategory.querySelector('.ryby').id;
      toggleRyby(firstCategoryId);  // Rozwijamy pierwszą kategorię
    }
  }, 500); // Opóźnienie 500ms, możesz dostosować do własnych potrzeb
});





// Funkcja dodająca daną rybę do licznika i aktualizująca listę
function addFishToList(rybaElement) {
  // Zakładamy, że typ ryby jest zapisany w elemencie z klasą .ryba-nazwa
  const nazwaElem = rybaElement.querySelector('.ryba-nazwa');
  const fishName = nazwaElem ? nazwaElem.innerText : "Nieznana ryba";

  // Zwiększamy licznik dla tej ryby
  if (fishCounter[fishName]) {
    fishCounter[fishName]++;
  } else {
    fishCounter[fishName] = 1;
  }

  // Zapisujemy zmodyfikowaną listę ryb do localStorage
  localStorage.setItem('fishCounter', JSON.stringify(fishCounter));

  // Aktualizujemy wyświetlaną listę ryb
  updateFishList();
}


// Ładowanie zawartości fish.html do kontenera
function loadFishContent() {
  fetch('fish.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('fishContainer').innerHTML = html;
      // Po załadowaniu treści, dodaj eventy do elementów ryb
      setupDragAndTouch();
    })
    .catch(error => console.error('Błąd podczas ładowania fish.html:', error));
}

// Funkcje obsługujące drag & drop (desktop)
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
    // Dodaj rybę do listy
    addFishToList(rybaElement);
  }
}


// Modyfikacja funkcji setupDragAndTouch
function setupDragAndTouch() {
  document.querySelectorAll(".ryba-container").forEach(ryba => {
    // Obsługa dotyku - teraz tylko kliknięcie
    ryba.addEventListener("click", handleFishClick);
    
    // Zachowujemy drag & drop dla desktopów
    if (window.matchMedia("(min-width: 768px)").matches) {
      ryba.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("text/plain", this.id);
      });
    }
  });
}


// Funkcja obsługująca kliknięcie ryby
function handleFishClick(e) {
  const rybaElement = e.currentTarget;
  const cena = parseFloat(rybaElement.getAttribute("data-cena"));
  
  if (!isNaN(cena)) {
    dodajDoSalda(cena);
    addFishToList(rybaElement);
    
    // Animacja "wrzucenia do beczki"
    rybaElement.classList.add("fish-throw");
    setTimeout(() => {
      rybaElement.classList.remove("fish-throw");
    }, 500);
  }
}

// Dodaj odpowiednie style CSS
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 767px) {
    .ryba-container {
      cursor: pointer;
    }
    .fish-throw {
      animation: throwAnimation 0.5s forwards;
    }
    @keyframes throwAnimation {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(0.5) translateY(100px); opacity: 0; }
    }
  }
`;
document.head.appendChild(style);





// Zapobiegamy przeciąganiu samej beczki
const beczka = document.getElementById("beczka");
beczka.setAttribute('draggable', 'false');
beczka.addEventListener("dragover", allowDrop);
beczka.addEventListener("dragleave", function () {
  this.classList.remove("highlight");
});
beczka.addEventListener("drop", drop);

// Obsługa dotyku (mobile)
let currentDragged = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleTouchStart(e) {
  currentDragged = e.currentTarget;
  const touch = e.touches[0];
  const rect = currentDragged.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
  currentDragged.style.position = "absolute";
  currentDragged.style.zIndex = "1000";
}

function handleTouchMove(e) {
  if (!currentDragged) return;
  e.preventDefault();
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
    beczka.classList.add("highlight");
    setTimeout(() => beczka.classList.remove("highlight"), 300);
    // Dodaj rybę do listy
    addFishToList(currentDragged);
  }
  currentDragged.style.position = "";
  currentDragged.style.left = "";
  currentDragged.style.top = "";
  currentDragged.style.zIndex = "";
  currentDragged = null;
}

// Funkcja, która dodaje eventy do ryb (zarówno dla dotyku jak i drag & drop)
function setupDragAndTouch() {
  document.querySelectorAll(".ryba-container").forEach(ryba => {
    // Obsługa dotyku
    ryba.addEventListener("touchstart", handleTouchStart, false);
    ryba.addEventListener("touchmove", handleTouchMove, false);
    ryba.addEventListener("touchend", handleTouchEnd, false);
    // Obsługa drag & drop (desktop)
    ryba.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", this.id);
    });
  });
}
// Funkcja do rozwijania/zamykania kategorii ryb (tylko jedna kategoria w tym samym czasie)
function toggleRyby(kategoriaId) {
  const allRybyContainers = document.querySelectorAll('.ryby');
  const allCategoryContainers = document.querySelectorAll('.kategoria');  // Całe kontenery kategorii
  const allCategoryButtons = document.querySelectorAll('.toggle');  // Wszyscy przyciski kategorii

  // Zamknięcie wszystkich rozwiniętych kategorii i ukrycie wszystkich innych kontenerów
  allRybyContainers.forEach(container => {
    if (container.id !== kategoriaId) {
      container.style.maxHeight = null; // Zwijamy inne sekcje
      container.style.width = '0'; // Zmniejszamy szerokość innych sekcji
    }
  });

  // Ukrywamy wszystkie inne kategorie
  allCategoryContainers.forEach(container => {
    if (container.querySelector('.ryby').id !== kategoriaId) {
      container.style.display = 'none';  // Ukrywamy inne kategorie
    }
  });

  // Pobieramy kontener ryb tej kategorii
  const kategoriaContainer = document.getElementById(kategoriaId);

  // Jeśli ta kategoria nie jest otwarta, to ją otwieramy
  if (kategoriaContainer.style.maxHeight) {
    kategoriaContainer.style.maxHeight = null; // Zwijamy sekcję
    kategoriaContainer.style.width = '0'; // Zmniejszamy szerokość
    // Przywracamy widoczność wszystkich przycisków kategorii
    allCategoryButtons.forEach(button => {
      button.style.display = 'block';  // Przywracamy widoczność przycisków
    });
    // Pokazujemy wszystkie ukryte kategorie
    allCategoryContainers.forEach(container => {
      container.style.display = 'block'; // Przywracamy widoczność wszystkich kontenerów
    });
  } else {
    kategoriaContainer.style.maxHeight = kategoriaContainer.scrollHeight + "px"; // Ustalamy wysokość na wysokość zawartości
    kategoriaContainer.style.width = '100%'; // Zwiększamy szerokość do 100%
    // Ukrywamy wszystkie przyciski kategorii, oprócz tego, który został kliknięty
    allCategoryButtons.forEach(button => {
      if (button.getAttribute('onclick') !== `toggleRyby('${kategoriaId}')`) {
        button.style.display = 'none';  // Ukrywamy inne przyciski
      }
    });
  }
}

// Dodajemy eventy do nagłówków kategorii (z klasą .toggle)
document.querySelectorAll('.toggle').forEach(toggleElement => {
  toggleElement.addEventListener('click', function() {
    // Pobieramy id kontenera ryb powiązanego z tą kategorią
    const kategoriaId = toggleElement.getAttribute('onclick').match(/'([^']+)'/)[1];
    toggleRyby(kategoriaId);
  });
});




// Ładowanie zawartości ryb po załadowaniu strony
document.addEventListener("DOMContentLoaded", loadFishContent);
// Funkcja, która zapisuje stan kategorii w localStorage
function saveCategoryState(kategoriaId, isActive) {
  let categoryState = JSON.parse(localStorage.getItem('categoryState')) || {};
  categoryState[kategoriaId] = isActive;
  localStorage.setItem('categoryState', JSON.stringify(categoryState));
}

// Funkcja do rozwijania/zamykania kategorii (tylko jedna kategoria w tym samym czasie)
function toggleRyby(kategoriaId) {
  const allRybyContainers = document.querySelectorAll('.ryby');
  const allCategoryContainers = document.querySelectorAll('.kategoria');  // Całe kontenery kategorii
  const allCategoryButtons = document.querySelectorAll('.toggle');  // Wszyscy przyciski kategorii

  // Zamknięcie wszystkich rozwiniętych kategorii i ukrycie wszystkich innych kontenerów
  allRybyContainers.forEach(container => {
    if (container.id !== kategoriaId) {
      container.style.maxHeight = null; // Zwijamy inne sekcje
      container.style.width = '0'; // Zmniejszamy szerokość innych sekcji
    }
  });

  // Ukrywamy wszystkie inne kategorie
  allCategoryContainers.forEach(container => {
    if (container.querySelector('.ryby').id !== kategoriaId) {
      container.style.display = 'none';  // Ukrywamy inne kategorie
    }
  });

  // Pobieramy kontener ryb tej kategorii
  const kategoriaContainer = document.getElementById(kategoriaId);
  
  // Sprawdzamy stan rozwinięcia tej kategorii w localStorage
  let categoryState = JSON.parse(localStorage.getItem('categoryState')) || {};
  const isActive = categoryState[kategoriaId] || false; // Czy ta kategoria jest aktywna?

  // Jeśli ta kategoria nie jest otwarta, to ją otwieramy
  if (isActive) {
    kategoriaContainer.style.maxHeight = null; // Zwijamy sekcję
    kategoriaContainer.style.width = '0'; // Zmniejszamy szerokość
    // Przywracamy widoczność wszystkich przycisków kategorii
    allCategoryButtons.forEach(button => {
      button.style.display = 'block';  // Przywracamy widoczność przycisków
    });
    // Pokazujemy wszystkie ukryte kategorie
    allCategoryContainers.forEach(container => {
      container.style.display = 'block'; // Przywracamy widoczność wszystkich kontenerów
    });

    // Zapisujemy stan jako zamknięty
    saveCategoryState(kategoriaId, false);
  } else {
    kategoriaContainer.style.maxHeight = kategoriaContainer.scrollHeight + "px"; // Ustalamy wysokość na wysokość zawartości
    kategoriaContainer.style.width = '100%'; // Zwiększamy szerokość do 100%
    // Ukrywamy wszystkie przyciski kategorii, oprócz tego, który został kliknięty
    allCategoryButtons.forEach(button => {
      if (button.getAttribute('onclick') !== `toggleRyby('${kategoriaId}')`) {
        button.style.display = 'none';  // Ukrywamy inne przyciski
      }
    });

    // Zapisujemy stan jako otwarty
    saveCategoryState(kategoriaId, true);
  }
}

// Ładowanie zawartości ryb po załadowaniu strony
document.addEventListener("DOMContentLoaded", () => {
  loadFishContent();  // Ładowanie zawartości ryb z fish.html
  updateFishList();   // Wczytanie listy ryb z localStorage
  
  // Czekamy chwilę, aby upewnić się, że wszystkie elementy są załadowane
  setTimeout(() => {
    // Sprawdzamy stany kategorii z localStorage i rozwijamy/zwijamy odpowiednie kategorie
    let categoryState = JSON.parse(localStorage.getItem('categoryState')) || {};
    document.querySelectorAll('.kategoria').forEach(kategoria => {
      const kategoriaId = kategoria.querySelector('.ryby').id;
      if (categoryState[kategoriaId]) {
        toggleRyby(kategoriaId);  // Rozwijamy kategorię, jeśli jest zapisana jako otwarta
      }
    });
  }, 500); // Opóźnienie 500ms, możesz dostosować do własnych potrzeb
});

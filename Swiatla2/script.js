document.addEventListener("DOMContentLoaded", function () {
    const itemsContainer = document.getElementById("items");
    const openCaseButton = document.getElementById("openCase");
    const popup = document.getElementById("popup");
    const popupItemImg = document.getElementById("popupItemImg");
    const popupItemName = document.getElementById("popupItemName");
    const closePopup = document.getElementById("closePopup");
    const marker = document.getElementById("marker");

    // Lista przedmiotów i ich szanse na wypadnięcie
    const items = [
        { name: "Trawnikowe Światła", img: "TrawnikoweSwiatla.png", chance: 0.27 },
        { name: "Czerwone Światła", img: "CzerwoneSwiatla.png", chance: 0.27 },
        { name: "Głęboko Żółte Światła", img: "GlebokoZolteSwiatla.png", chance: 1.87 },
        { name: "Fioletowe Światła", img: "FioletoweSwiatla.png", chance: 1.32 },
        { name: "Ciemnoniebieskie Światła", img: "CiemnoNiebieskieSwiatla.png", chance: 20.27 },
        { name: "Różowe Światła", img: "RóżoweŚwiatła.png", chance: 19.73 },
        { name: "Pomarańczowe Światła", img: "PomaranczoweSwiatla.png", chance: 56.27 },
    ];

    // Funkcja losująca przedmiot na podstawie szans
    function getRandomItem() {
        let random = Math.random() * 200;
        let cumulativeChance = 0;
        for (let item of items) {
            cumulativeChance += item.chance;
            if (random < cumulativeChance) return item;
        }
        return items[items.length - 1]; // Zapewnienie zwrotu ostatniego przedmiotu
    }

    // Funkcja resetująca skrzynię
    function resetCase() {
        itemsContainer.innerHTML = "";
        gsap.set(itemsContainer, { x: 0 });
    }

    // Funkcja otwierająca skrzynię
    function openCase() {
        openCaseButton.disabled = true;
        resetCase();

        // Generowanie listy przedmiotów
        let generatedItems = [];
        for (let i = 0; i < 100; i++) { // 100 elementów do animacji
            let randomItem = getRandomItem();
            generatedItems.push(randomItem);
            let div = document.createElement("div");
            div.classList.add("item");
            div.innerHTML = `<img src="${randomItem.img}" alt="${randomItem.name}">`;
            itemsContainer.appendChild(div);
        }

        // Pobranie szerokości przedmiotu
        let itemWidth = document.querySelector(".item").offsetWidth + 0;
        let totalWidth = itemWidth * 100; // Całkowita szerokość

        let finalX;
        if (window.innerWidth <= 768 && window.inderWidth > 520) {
            finalX = Math.floor(Math.random() * (4906 - 4810 + 1)) + 4810; // Inny przedział dla mniejszych ekranów
        } 
        else if (window.innerWidth <= 520) {
            finalX = Math.floor(Math.random() * (4089 - 4010 + 1)) + 4010; // Standardowy przedział
        }
        else {
            finalX = Math.floor(Math.random() * (13260 - 13135 + 1)) + 13135;
        }
        finalX = -finalX; // Przekształcamy na wartość ujemną

        // Animacja przesuwania (przyspieszanie i zwalnianie)
        gsap.to(itemsContainer, {
            x: finalX,
            duration: 8,  // Zmniejsz czas, żeby animacja była szybka
            ease: "power2.inOut",  // Przyspieszanie na początku, zwalnianie na końcu
            onComplete: function () {
                // Wybieramy przedmiot o indeksie 87 (86 w tablicy)
                let winningItem = generatedItems[90]; // Indeks 86 to przedmiot 87 (liczymy od 0)
                showPopup(winningItem);
                openCaseButton.disabled = false;
            }
        });
    }

    function showPopup(item) {
        popupItemImg.src = item.img;
        popupItemName.innerText = "Wylosowałeś: " + item.name;
        popup.style.display = "flex";
        
        // Efekt wejścia
        setTimeout(() => popup.classList.add("active"), 50);
    
        // Ukrycie markera
        marker.style.display = "none";
    }
    
    closePopup.addEventListener("click", function () {
        // Efekt wyjścia
        popup.classList.remove("active");
    
        setTimeout(() => {
            popup.style.display = "none";
            marker.style.display = "block"; // Przywrócenie markera
        }, 300);
    });

    document.addEventListener("gesturestart", function (event) {
        event.preventDefault();
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '0')) {
            event.preventDefault();
        }
    });
    
    document.addEventListener('wheel', function(event) {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    }, { passive: false });
    
    
    

    openCaseButton.addEventListener("click", openCase);
});

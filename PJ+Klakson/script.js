document.addEventListener("DOMContentLoaded", function () {
    const itemsContainer = document.getElementById("items");
    const openCaseButton = document.getElementById("openCase");
    const popup = document.getElementById("popup");
    const popupItemImg = document.getElementById("popupItemImg");
    const popupItemName = document.getElementById("popupItemName");
    const closePopup = document.getElementById("closePopup");
    const marker = document.getElementById("marker");


    const items = [
        { name: "PaintJob", img: "PaintJob.png", chance: 1.34 },
        { name: "Klakson_Pętla", img: "Klakson_Pętla.png", chance: 3.63 },
        { name: "Klakson_Muzyczny", img: "Klakson_Muzyczny.png", chance: 17.83 },
        { name: "Klakson", img: "Klakson.png", chance: 77.20 },
    ];


    function getRandomItem() {
        let random = Math.random() * 200;
        let cumulativeChance = 0;
        for (let item of items) {
            cumulativeChance += item.chance;
            if (random < cumulativeChance) return item;
        }
        return items[items.length - 1];
    }


    function resetCase() {
        itemsContainer.innerHTML = "";
        gsap.set(itemsContainer, { x: 0 });
    }


    function openCase() {
        openCaseButton.disabled = true;
        resetCase();


        let generatedItems = [];
        for (let i = 0; i < 100; i++) { 
            let randomItem = getRandomItem();
            generatedItems.push(randomItem);
            let div = document.createElement("div");
            div.classList.add("item");
            div.innerHTML = `<img src="${randomItem.img}" alt="${randomItem.name}">`;
            itemsContainer.appendChild(div);
        }


        let itemWidth = document.querySelector(".item").offsetWidth + 0;
        let totalWidth = itemWidth * 100; 


        let finalX = Math.floor(Math.random() * (13260 - 13135 + 1)) + 13135;
        finalX = -finalX; 


        gsap.to(itemsContainer, {
            x: finalX,
            duration: 8, 
            ease: "power2.inOut",  
            onComplete: function () {
                
                let winningItem = generatedItems[90];
                showPopup(winningItem);
                openCaseButton.disabled = false;
            }
        });
    }

    function showPopup(item) {
        popupItemImg.src = item.img;
        popupItemName.innerText = "Wylosowałeś: " + item.name;
        popup.style.display = "flex";
        
       
        setTimeout(() => popup.classList.add("active"), 50);
    
       
        marker.style.display = "none";
    }
    
    closePopup.addEventListener("click", function () {

        popup.classList.remove("active");
    
        setTimeout(() => {
            popup.style.display = "none";
            marker.style.display = "block"; 
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

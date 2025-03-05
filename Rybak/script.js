// Pobiera saldo z localStorage lub ustawia na 0
let saldo = parseFloat(localStorage.getItem('saldo')) || 0;
document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;

function dodajDoSalda(kwota) {
    saldo += kwota;
    localStorage.setItem('saldo', saldo);
    document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;
}

function resetujSaldo() {
    saldo = 0;
    localStorage.setItem('saldo', saldo);
    document.getElementById('saldo').innerText = `Saldo: ${saldo.toFixed(2)}$`;
}

function pokazLowisko(id) {
    let lowisko = document.getElementById(id);
    let wszystkie = document.querySelectorAll(".items");
    
    wszystkie.forEach(el => {
        if (el !== lowisko) {
            el.style.display = "none"; // Ukrywa inne łowiska
        }
    });

    if (lowisko.style.display === "none" || lowisko.style.display === "") {
        lowisko.style.display = "block"; // Pokazuje wybrane łowisko
    } else {
        lowisko.style.display = "none"; // Ukrywa, jeśli kliknięto ponownie
    }
}

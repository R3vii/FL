// Dane wejściowe (pozostają te same)
const possessedAmount = 140659.95;
const neededAmount = 200000.00;

// Obliczanie procentu
let percentage = (possessedAmount / neededAmount) * 100;
percentage = Math.min(percentage, 100);

// Formatowanie kwoty
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Funkcja do uzyskania formatu czasu (np. 22:16)
const getLastUpdateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Aktualizacja elementów na stronie
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    const currentAmountElement = document.getElementById('currentAmount');
    const percentageTextElement = document.getElementById('percentageText');
    const lastUpdatedElement = document.getElementById('lastUpdated'); 

    // 1. Aktualizacja kwot i paska postępu
    currentAmountElement.textContent = formatCurrency(possessedAmount);
    progressBar.style.width = percentage + '%';
    percentageTextElement.textContent = percentage.toFixed(2) + '%';

    // 2. Dodanie informacji o ostatniej aktualizacji
    const specificTime = '03:29'; // Czas podany przez użytkownika
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Ostatnia aktualizacja: ${specificTime}`;
    }
});

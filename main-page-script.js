// Funkcja do przełączania widoczności listy
function toggleList() {
    const list = document.getElementById('hidden-list');
    list.style.display = list.style.display === 'none' || list.style.display === '' ? 'block' : 'none';
}


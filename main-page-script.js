
// Funkcja do przełączania widoczności listy
function toggleList() {
    const list = document.getElementById('hidden-list');
    list.style.display = list.style.display === 'none' || list.style.display === '' ? 'block' : 'none';
}
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




document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdown = document.querySelector('.js-dropdown');
    const dropbtn = document.querySelector('.dropbtn');

    // 1. Lógica del Menú Hamburguesa
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Cambiar el icono de hamburguesa a una "X"
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('bi-list');
        icon.classList.toggle('bi-x');
    });

    // 2. Lógica del Dropdown (Categorías)
    dropbtn.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
    });

    // 3. Cerrar todo al hacer clic fuera (opcional pero recomendado)
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            dropdown.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('bi-x', 'bi-list');
        }
    });
});
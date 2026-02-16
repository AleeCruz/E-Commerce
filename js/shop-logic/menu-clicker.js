document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.js-dropdown');
    const dropbtn = document.querySelector('.dropbtn');

    // Alternar el menú al hacer clic (útil para móviles)
    dropbtn.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace recargue la página
        dropdown.classList.toggle('active');
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});
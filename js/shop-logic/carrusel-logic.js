/* carrusel-logic.js */

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('dotsContainer');

    // Verificación de seguridad: solo ejecutar si el carrusel existe en la página
    if (!track || !nextBtn || !prevBtn || !dotsContainer) return;

    const slides = Array.from(track.children);
    let index = 0;

    // 1. Crear los puntos automáticamente
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateUI() {
        // Mover el carrusel
        track.style.transform = `translateX(-${index * 100}%)`;
        
        // Actualizar puntos
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function goToSlide(targetIndex) {
        index = targetIndex;
        updateUI();
    }

    nextBtn.addEventListener('click', () => {
        index = (index + 1) % slides.length;
        updateUI();
    });

    prevBtn.addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        updateUI();
    });

    // Auto-play cada 7 segundos
    let autoPlay = setInterval(() => nextBtn.click(), 7000);

    // Pausar auto-play si el usuario interactúa
    const resetTimer = () => {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => nextBtn.click(), 7000);
    };

    [nextBtn, prevBtn, dotsContainer].forEach(el => {
        el.addEventListener('click', resetTimer);
    });
});
/* ============================================
   LANDING PAGE - JAVASCRIPT
   ============================================
   Funcionalidades de la página de inicio.
   En esta etapa: navegación y efectos visuales básicos.
============================================ */

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Landing page cargada');
    
    // Cargar y aplicar tema (si hay sesión)
    if (typeof cargarYAplicarTema === 'function') {
        await cargarYAplicarTema();
    }
    
    // Inicializar funcionalidades
    inicializarNavegacion();
    inicializarAnimacionesScroll();
    verificarSesion();
});

/**
 * Configura la navegación suave para enlaces internos
 */
function inicializarNavegacion() {
    // Scroll suave para enlaces con hash (#)
    const enlacesInternos = document.querySelectorAll('a[href^="#"]');
    
    enlacesInternos.forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();
            const destino = document.querySelector(this.getAttribute('href'));
            
            if (destino) {
                destino.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Inicializa animaciones al hacer scroll
 * Las tarjetas de beneficios aparecen con animación
 */
function inicializarAnimacionesScroll() {
    // Observador para animaciones de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animacion-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar tarjetas de beneficios
    const beneficioCards = document.querySelectorAll('.beneficio-card');
    beneficioCards.forEach((card, index) => {
        // Agregar delay escalonado
        card.style.transitionDelay = `${index * 100}ms`;
        card.classList.add('animacion-entrada');
        observer.observe(card);
    });
}

/**
 * Verifica si hay una sesión activa
 * Si el usuario ya inició sesión, podría redirigir a inicio
 */
function verificarSesion() {
    // Verificar si hay sesión activa usando las funciones de config.js
    if (typeof haySesionActiva === 'function' && haySesionActiva()) {
        // Mostrar mensaje o agregar indicador visual
        console.log('Usuario con sesión activa detectado');
        
        // Opcional: Agregar enlace para ir directo al sistema
        agregarEnlaceRapido();
    }
}

/**
 * Agrega un enlace rápido al sistema si hay sesión activa
 */
function agregarEnlaceRapido() {
    const header = document.querySelector('.nav-principal');
    if (header) {
        const enlaceRapido = document.createElement('a');
        enlaceRapido.href = 'inicio.html';
        enlaceRapido.className = 'btn btn-secundario btn-pequeno';
        enlaceRapido.textContent = 'Ir al sistema';
        header.insertBefore(enlaceRapido, header.firstChild);
    }
}

/* ============================================
   ESTILOS DINÁMICOS PARA ANIMACIONES
============================================ */

// Agregar estilos CSS para las animaciones de scroll
const estilosAnimacion = document.createElement('style');
estilosAnimacion.textContent = `
    .animacion-entrada {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .animacion-visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(estilosAnimacion);


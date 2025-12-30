/* ============================================
   PWA UPDATE - ADMINISGO
   ============================================
   Maneja la detección y actualización de la
   Progressive Web App cuando hay nuevas versiones
============================================ */

let updateAvailable = false;
let registration = null;
let newWorker = null;

/**
 * Verifica si hay actualizaciones disponibles
 */
async function verificarActualizaciones() {
    if ('serviceWorker' in navigator) {
        try {
            registration = await navigator.serviceWorker.getRegistration();
            
            if (!registration) {
                console.log('ℹ️ No hay Service Worker registrado');
                return;
            }
            
            // Verificar actualizaciones cada 60 segundos
            setInterval(async () => {
                try {
                    await registration.update();
                } catch (error) {
                    console.error('Error al verificar actualizaciones:', error);
                }
            }, 60000);
            
            // Escuchar cuando se encuentra una nueva versión
            registration.addEventListener('updatefound', () => {
                newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        // Hay una nueva versión instalada
                        if (navigator.serviceWorker.controller) {
                            // Hay un service worker activo, hay actualización disponible
                            updateAvailable = true;
                            mostrarBotonActualizacion();
                            console.log('🔄 Nueva versión disponible');
                        } else {
                            // Es la primera instalación
                            console.log('✅ Service Worker instalado por primera vez');
                        }
                    }
                });
            });
            
            // Verificar si ya hay una actualización esperando
            if (registration.waiting) {
                updateAvailable = true;
                mostrarBotonActualizacion();
            }
            
        } catch (error) {
            console.error('❌ Error al verificar actualizaciones:', error);
        }
    }
}

/**
 * Muestra el botón de actualización
 */
function mostrarBotonActualizacion() {
    const btnUpdate = document.getElementById('btnActualizarApp');
    if (btnUpdate) {
        btnUpdate.style.display = 'flex';
        btnUpdate.classList.add('actualizacion-disponible');
        
        // Agregar animación de pulso
        btnUpdate.classList.add('pulse');
        
        // Mostrar notificación
        mostrarNotificacionActualizacion();
    }
}

/**
 * Oculta el botón de actualización
 */
function ocultarBotonActualizacion() {
    const btnUpdate = document.getElementById('btnActualizarApp');
    if (btnUpdate) {
        btnUpdate.style.display = 'none';
        btnUpdate.classList.remove('actualizacion-disponible', 'pulse');
    }
}

/**
 * Muestra una notificación de que hay actualización disponible
 */
function mostrarNotificacionActualizacion() {
    // Solo mostrar si no hay una notificación ya visible
    if (document.getElementById('notificacion-actualizacion')) {
        return;
    }
    
    const notificacion = document.createElement('div');
    notificacion.id = 'notificacion-actualizacion';
    notificacion.className = 'notificacion-actualizacion';
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <span class="notificacion-icono">🔄</span>
            <div class="notificacion-texto">
                <strong>Nueva versión disponible</strong>
                <p>Hay una actualización lista para instalar</p>
            </div>
            <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.classList.add('visible');
    }, 100);
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        notificacion.classList.remove('visible');
        setTimeout(() => notificacion.remove(), 300);
    }, 10000);
}

/**
 * Actualiza la aplicación
 */
async function actualizarApp() {
    if (!updateAvailable) {
        console.log('ℹ️ No hay actualizaciones disponibles');
        return;
    }
    
    const btnUpdate = document.getElementById('btnActualizarApp');
    if (btnUpdate) {
        btnUpdate.disabled = true;
        btnUpdate.innerHTML = '<span class="icono-actualizar">⏳</span> Actualizando...';
    }
    
    try {
        if (registration && registration.waiting) {
            // Enviar mensaje al service worker para que se active
            console.log('Enviando SKIP_WAITING al service worker...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Esperar un momento y luego recargar
            setTimeout(() => {
                console.log('Recargando página para aplicar actualización...');
                window.location.reload(true);
            }, 1000);
        } else if (newWorker) {
            // Esperar a que el nuevo worker esté listo
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                    console.log('Nuevo Service Worker activado, recargando...');
                    window.location.reload(true);
                }
            });
            
            // Si ya está instalado, activarlo
            if (newWorker.state === 'installed') {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            }
        } else {
            // Forzar actualización del service worker
            if (registration) {
                console.log('Forzando actualización del service worker...');
                await registration.update();
                // Esperar un momento y recargar
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            }
        }
    } catch (error) {
        console.error('❌ Error al actualizar la app:', error);
        
        if (btnUpdate) {
            btnUpdate.disabled = false;
            btnUpdate.innerHTML = '<span class="icono-actualizar">🔄</span> Actualizar App';
        }
        
        mostrarMensaje('Error al actualizar. Por favor, recargá la página manualmente.', 'error');
    }
}

/**
 * Muestra un mensaje temporal
 */
function mostrarMensaje(texto, tipo = 'info') {
    const mensaje = document.createElement('div');
    mensaje.className = `pwa-mensaje pwa-mensaje-${tipo}`;
    mensaje.textContent = texto;
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.classList.add('visible');
    }, 100);
    
    setTimeout(() => {
        mensaje.classList.remove('visible');
        setTimeout(() => mensaje.remove(), 300);
    }, 3000);
}

/**
 * Inicializa el sistema de actualizaciones
 */
function initPWAUpdate() {
    // Verificar actualizaciones al cargar
    verificarActualizaciones();
    
    // Verificar actualizaciones cuando la página vuelve a estar visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            verificarActualizaciones();
        }
    });
    
    // Verificar actualizaciones cuando se recupera la conexión
    window.addEventListener('online', () => {
        verificarActualizaciones();
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWAUpdate);
} else {
    initPWAUpdate();
}

// Exportar funciones para uso global
window.actualizarApp = actualizarApp;
window.verificarActualizaciones = verificarActualizaciones;


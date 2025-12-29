/* ============================================
   PWA INSTALL - GESTIÓNKIOSCO
   ============================================
   Maneja la instalación de la PWA en diferentes
   dispositivos (Android, iOS, Windows)
============================================ */

let deferredPrompt = null;
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
let isAndroid = /Android/.test(navigator.userAgent);
let isWindows = /Windows/.test(navigator.userAgent);
let isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone || 
                   document.referrer.includes('android-app://');

/**
 * Verifica si la PWA ya está instalada
 */
function isPWAInstalled() {
    return isStandalone;
}

/**
 * Verifica si el navegador soporta instalación de PWA
 */
function canInstallPWA() {
    // Chrome, Edge, Opera
    if (deferredPrompt) return true;
    
    // iOS Safari
    if (isIOS && !isStandalone) return true;
    
    // Android Chrome
    if (isAndroid && !isStandalone) return true;
    
    return false;
}

/**
 * Muestra el botón de instalación apropiado según el dispositivo
 */
function mostrarBotonInstalacion() {
    const installSection = document.getElementById('pwa-install-section');
    if (!installSection) {
        console.warn('⚠️ Sección PWA no encontrada en el DOM');
        return;
    }
    
    // Si ya está instalada, ocultar
    if (isPWAInstalled()) {
        installSection.style.display = 'none';
        console.log('ℹ️ PWA ya instalada, ocultando sección');
        return;
    }
    
    // Mostrar la sección primero
    installSection.style.display = 'block';
    
    // Mostrar según el dispositivo
    const androidBtn = document.getElementById('pwa-install-android');
    const iosBtn = document.getElementById('pwa-install-ios');
    const windowsBtn = document.getElementById('pwa-install-windows');
    const genericBtn = document.getElementById('pwa-install-generic');
    
    // Ocultar todos primero
    if (androidBtn) androidBtn.style.display = 'none';
    if (iosBtn) iosBtn.style.display = 'none';
    if (windowsBtn) windowsBtn.style.display = 'none';
    if (genericBtn) genericBtn.style.display = 'none';
    
    // Mostrar el apropiado
    if (isAndroid && androidBtn) {
        androidBtn.style.display = 'flex';
        console.log('📱 Mostrando botón Android');
    } else if (isIOS && iosBtn) {
        iosBtn.style.display = 'flex';
        console.log('🍎 Mostrando botón iOS');
    } else if (isWindows && windowsBtn) {
        windowsBtn.style.display = 'flex';
        console.log('🪟 Mostrando botón Windows');
    } else if (genericBtn) {
        genericBtn.style.display = 'flex';
        console.log('📱 Mostrando botón genérico');
    } else {
        // Si no hay botones, mostrar la sección igual para que se vea
        console.log('ℹ️ Mostrando sección PWA sin botones específicos');
    }
}

/**
 * Instala la PWA (Chrome, Edge, Opera)
 */
async function instalarPWA() {
    if (!deferredPrompt) {
        mostrarInstrucciones();
        return;
    }
    
    // Mostrar el prompt de instalación
    deferredPrompt.prompt();
    
    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
        mostrarMensaje('¡App instalada correctamente!', 'exito');
    } else {
        console.log('❌ Usuario rechazó instalar la PWA');
    }
    
    deferredPrompt = null;
    ocultarBotonInstalacion();
}

/**
 * Muestra instrucciones de instalación según el dispositivo
 */
function mostrarInstrucciones() {
    const modal = document.getElementById('pwa-instructions-modal');
    if (!modal) return;
    
    const androidInstructions = document.getElementById('instructions-android');
    const iosInstructions = document.getElementById('instructions-ios');
    const windowsInstructions = document.getElementById('instructions-windows');
    
    // Ocultar todas las instrucciones
    if (androidInstructions) androidInstructions.style.display = 'none';
    if (iosInstructions) iosInstructions.style.display = 'none';
    if (windowsInstructions) windowsInstructions.style.display = 'none';
    
    // Mostrar las apropiadas
    if (isAndroid && androidInstructions) {
        androidInstructions.style.display = 'block';
    } else if (isIOS && iosInstructions) {
        iosInstructions.style.display = 'block';
    } else if (isWindows && windowsInstructions) {
        windowsInstructions.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

/**
 * Cierra el modal de instrucciones
 */
function cerrarInstrucciones() {
    const modal = document.getElementById('pwa-instructions-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Oculta el botón de instalación
 */
function ocultarBotonInstalacion() {
    const installSection = document.getElementById('pwa-install-section');
    if (installSection) {
        installSection.style.display = 'none';
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
 * Registra el Service Worker
 */
async function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // Ruta relativa para GitHub Pages
            const swPath = '/sistema_kioscos/service-worker.js';
            const registration = await navigator.serviceWorker.register(swPath, {
                scope: '/sistema_kioscos/'
            });
            console.log('✅ Service Worker registrado:', registration.scope);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 Nueva versión disponible');
                        // Opcional: mostrar notificación de actualización
                    }
                });
            });
        } catch (error) {
            console.error('❌ Error al registrar Service Worker:', error);
        }
    }
}

// Event Listeners
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el prompt automático
    e.preventDefault();
    // Guardar el evento para usarlo después
    deferredPrompt = e;
    console.log('✅ beforeinstallprompt capturado');
    mostrarBotonInstalacion();
});

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada');
    deferredPrompt = null;
    ocultarBotonInstalacion();
    mostrarMensaje('¡App instalada correctamente!', 'exito');
});

// Inicialización cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPWA);
} else {
    initPWA();
}

function initPWA() {
    // Registrar Service Worker
    registrarServiceWorker();
    
    // Mostrar botón de instalación si corresponde
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'complete') {
        setTimeout(() => {
            mostrarBotonInstalacion();
        }, 500);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                mostrarBotonInstalacion();
            }, 500);
        });
    }
    
    // También intentar mostrar después de un tiempo por si acaso
    setTimeout(() => {
        mostrarBotonInstalacion();
    }, 2000);
}

// Exportar funciones para uso global
window.instalarPWA = instalarPWA;
window.mostrarInstrucciones = mostrarInstrucciones;
window.cerrarInstrucciones = cerrarInstrucciones;


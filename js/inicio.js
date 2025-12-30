/* ============================================
   INICIO / HOME - JAVASCRIPT
   ============================================
   Lógica del panel principal (dashboard).
   Carga datos desde IndexedDB y sincroniza
   con Supabase cuando hay conexión.
============================================ */

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de inicio cargada');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        
        // Esperar un poco más para que se sincronice la data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cargar y aplicar tema (después de sincronización)
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarFechaHora();
        inicializarAccesosRapidos();
        inicializarEstadoConexion();
        inicializarCerrarSesion();
        inicializarSincronizacion();
        await verificarAccesosEspeciales();
        
        // Intentar cargar tema nuevamente después de sincronización (por si acaso)
        setTimeout(async () => {
            if (typeof cargarYAplicarTema === 'function') {
                await cargarYAplicarTema();
            }
        }, 2000);
    }, 500);
});

/**
 * Verifica que haya una sesión activa
 * Si no hay sesión, redirige al login
 */
async function verificarSesion() {
    let sesionValida = false;
    
    // 1. Verificar sesión en Supabase
    if (typeof getSesionActual === 'function') {
        const sesionSupabase = await getSesionActual();
        if (sesionSupabase) {
            sesionValida = true;
            console.log('✅ Sesión Supabase válida');
        }
    }
    
    // 2. Verificar sesión local en IndexedDB
    if (!sesionValida && typeof haySesionLocalActiva === 'function') {
        sesionValida = await haySesionLocalActiva();
        if (sesionValida) {
            console.log('✅ Sesión local válida');
        }
    }
    
    // 3. Fallback: localStorage
    if (!sesionValida && typeof haySesionActiva === 'function') {
        sesionValida = haySesionActiva();
        if (sesionValida) {
            console.log('✅ Sesión localStorage válida');
        }
    }
    
    if (!sesionValida) {
        console.log('❌ No hay sesión activa, redirigiendo al login...');
        navegarA(CONFIG.rutas.login);
    }
}

/**
 * Carga y muestra los datos del usuario y comercio
 */
async function inicializarDatosUsuario() {
    let usuario = null;
    let comercio = null;
    
    // 1. Intentar obtener de IndexedDB
    if (typeof obtenerSesionLocal === 'function') {
        const sesionLocal = await obtenerSesionLocal();
        if (sesionLocal) {
            usuario = {
                nombreResponsable: sesionLocal.nombre,
                email: sesionLocal.email
            };
            
            // Obtener comercio
            const db = getDB();
            if (db && sesionLocal.comercio_id) {
                comercio = await db.comercio.get(sesionLocal.comercio_id);
            }
        }
    }
    
    // 2. Fallback: localStorage
    if (!usuario) {
        usuario = obtenerUsuarioActual();
        comercio = obtenerComercioActual();
    }
    
    // Mostrar nombre del usuario
    const nombreUsuarioEl = document.getElementById('nombreUsuario');
    if (nombreUsuarioEl) {
        nombreUsuarioEl.textContent = usuario?.nombreResponsable || usuario?.nombre || usuario?.email || 'Usuario';
    }
    
    // Mostrar nombre del comercio
    const nombreComercioEl = document.getElementById('nombreComercio');
    if (nombreComercioEl) {
        nombreComercioEl.textContent = comercio?.razon_social || comercio?.nombre || 'Mi Comercio';
    }
}

/**
 * Inicializa y actualiza la fecha y hora
 */
function inicializarFechaHora() {
    const fechaEl = document.getElementById('fechaActual');
    const horaEl = document.getElementById('horaActual');
    
    function actualizarFechaHora() {
        const ahora = new Date();
        
        // Formatear fecha en español
        const opcionesFecha = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const fechaFormateada = ahora.toLocaleDateString('es-AR', opcionesFecha);
        
        // Formatear hora en formato 24 horas
        const opcionesHora = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false  // Formato 24 horas (ej: 21:42)
        };
        const horaFormateada = ahora.toLocaleTimeString('es-AR', opcionesHora);
        
        if (fechaEl) {
            fechaEl.textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        }
        
        if (horaEl) {
            horaEl.textContent = horaFormateada;
        }
    }
    
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 60000);
}

/**
 * Configura los accesos rápidos (tarjetas de módulos)
 */
function inicializarAccesosRapidos() {
    const accesos = document.querySelectorAll('.acceso-card');
    
    accesos.forEach(acceso => {
        acceso.addEventListener('click', function() {
            const modulo = this.dataset.modulo;
            mostrarMensajeModulo(modulo);
        });
        
        // Accesibilidad
        acceso.setAttribute('tabindex', '0');
        acceso.setAttribute('role', 'button');
        
        acceso.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const modulo = this.dataset.modulo;
                mostrarMensajeModulo(modulo);
            }
        });
    });
}

/**
 * Muestra mensaje indicando que el módulo está próximamente
 * @param {string} modulo - Nombre del módulo
 */
function mostrarMensajeModulo(modulo) {
    const nombresModulos = {
        dashboard: 'Dashboard',
        referencias: 'Referencias',
        compras: 'Compras',
        ventas: 'Ventas',
        usuarios: 'Usuarios',
        configuracion: 'Configuración',
        mantenimiento: 'Mantenimiento'
    };
    
    const nombreModulo = nombresModulos[modulo] || modulo;
    
    // Si es configuración o mantenimiento, no mostrar mensaje (ya navega)
    if (modulo === 'configuracion' || modulo === 'mantenimiento') {
        return;
    }
    
    mostrarNotificacion(`El módulo de ${nombreModulo} estará disponible próximamente`, 'info');
}

/**
 * Muestra una notificación temporal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const existente = document.querySelector('.notificacion-temporal');
    if (existente) {
        existente.remove();
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-temporal notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    requestAnimationFrame(() => {
        notificacion.classList.add('visible');
    });
    
    setTimeout(() => {
        notificacion.classList.remove('visible');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

/**
 * Inicializa el indicador de estado de conexión
 */
function inicializarEstadoConexion() {
    const estadoEl = document.getElementById('estadoConexion');
    if (!estadoEl) return;
    
    const indicador = estadoEl.querySelector('.estado-indicador');
    const texto = estadoEl.querySelector('.estado-texto');
    
    async function actualizarEstadoConexion() {
        const online = navigator.onLine;
        const supabaseOk = typeof isSupabaseConnected === 'function' && isSupabaseConnected();
        
        // Contar pendientes de sincronización
        let pendientes = 0;
        if (typeof contarPendientesSincronizacion === 'function') {
            pendientes = await contarPendientesSincronizacion();
        }
        
        if (indicador) {
            indicador.className = 'estado-indicador ' + (online ? 'online' : 'offline');
        }
        
        if (texto) {
            if (!online) {
                texto.textContent = 'Sin conexión';
            } else if (supabaseOk) {
                texto.textContent = pendientes > 0 ? `Conectado (${pendientes} pendientes)` : 'Conectado';
            } else {
                texto.textContent = 'Conectando...';
            }
        }
    }
    
    // Estado inicial
    actualizarEstadoConexion();
    
    // Actualizar cada 10 segundos
    setInterval(actualizarEstadoConexion, 10000);
    
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
        actualizarEstadoConexion();
        mostrarNotificacion('Conexión recuperada', 'exito');
    });
    
    window.addEventListener('offline', () => {
        actualizarEstadoConexion();
        mostrarNotificacion('Sin conexión - Modo offline activo', 'advertencia');
    });
}

/**
 * Configura el botón de cerrar sesión
 */
function inicializarCerrarSesion() {
    const btnCerrar = document.getElementById('btnCerrarSesion');
    
    if (btnCerrar) {
        btnCerrar.addEventListener('click', async function() {
            if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
                await cerrarSesionCompleta();
            }
        });
    }
}

/**
 * Cierra la sesión en todos los sistemas
 */
async function cerrarSesionCompleta() {
    console.log('🚪 Cerrando sesión...');
    
    // 1. Cerrar sesión en Supabase
    if (typeof logoutUsuarioAuth === 'function') {
        try {
            await logoutUsuarioAuth();
            console.log('✅ Sesión Supabase cerrada');
        } catch (error) {
            console.error('Error cerrando sesión Supabase:', error);
        }
    }
    
    // 2. Limpiar sesión local en IndexedDB
    if (typeof eliminarSesionLocal === 'function') {
        await eliminarSesionLocal();
        console.log('✅ Sesión local cerrada');
    }
    
    // 3. Limpiar localStorage
    if (typeof cerrarSesion === 'function') {
        cerrarSesion();
    } else {
        // Limpiar manualmente
        localStorage.removeItem(CONFIG.storage.keySesion);
        localStorage.removeItem(CONFIG.storage.keyUsuario);
        localStorage.removeItem(CONFIG.storage.keyComercio);
        navegarA(CONFIG.rutas.landing);
    }
}

/**
 * Inicializa el sistema de sincronización
 */
function inicializarSincronizacion() {
    // Verificar si hay conexión y sincronizar
    if (navigator.onLine && typeof forzarSincronizacion === 'function') {
        console.log('🔄 Iniciando sincronización...');
        
        // Sincronizar después de 2 segundos
        setTimeout(async () => {
            const resultado = await forzarSincronizacion();
            if (resultado.exito && (resultado.subidos > 0 || resultado.descargados > 0)) {
                mostrarNotificacion(`Sincronizado: ${resultado.subidos}↑ ${resultado.descargados}↓`, 'exito');
            }
        }, 2000);
    }
}

/* ============================================
   ESTILOS PARA NOTIFICACIONES
============================================ */

const estilosNotificacion = document.createElement('style');
estilosNotificacion.textContent = `
    .notificacion-temporal {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        padding: var(--espaciado-md) var(--espaciado-xl);
        border-radius: var(--radio-lg);
        font-weight: 600;
        font-size: var(--tamano-sm);
        box-shadow: var(--sombra-fuerte);
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notificacion-temporal.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    .notificacion-info {
        background: var(--color-primario);
        color: white;
    }
    
    .notificacion-exito {
        background: var(--color-exito);
        color: white;
    }
    
    .notificacion-error {
        background: var(--color-error);
        color: white;
    }
    
    .notificacion-advertencia {
        background: var(--color-advertencia);
        color: white;
    }
`;
document.head.appendChild(estilosNotificacion);

// ============================================
// ACCESOS ESPECIALES (BASADOS EN PERMISOS)
// ============================================

/**
 * Verifica los accesos especiales según el rol y permisos del usuario
 * - Configuración: visible para roles con permiso CONFIG_VER
 * - Mantenimiento: visible solo para rol programador
 */
async function verificarAccesosEspeciales() {
    try {
        // Obtener sesión actual
        const sesion = await getSesionActual();
        if (!sesion || !sesion.user) return;
        
        // Obtener datos del usuario con rol
        const datosUsuario = await obtenerDatosUsuarioCompleto(sesion.user.id);
        if (!datosUsuario) return;
        
        // Obtener permisos del usuario
        let permisosUsuario = [];
        if (datosUsuario.rol?.id) {
            permisosUsuario = await obtenerPermisosUsuario(datosUsuario.rol.id);
        }
        
        const rolNombre = datosUsuario.rol?.nombre?.toLowerCase();
        
        // ============================================
        // ACCESO A CONFIGURACIÓN
        // ============================================
        const tienePermisoConfig = permisosUsuario.includes('CONFIG_VER') || 
                                   rolNombre === 'programador' ||
                                   rolNombre === 'administrador';
        
        if (tienePermisoConfig) {
            console.log('⚙️ Mostrando acceso a Configuración');
            
            const accesoConfig = document.getElementById('accesoConfiguracion');
            if (accesoConfig) {
                accesoConfig.style.display = 'flex';
                
                // Agregar evento click para ir a configuración
                accesoConfig.addEventListener('click', function() {
                    window.location.href = 'configuracion.html';
                });
            }
        }
        
        // ============================================
        // ACCESO A USUARIOS
        // ============================================
        const tienePermisoUsuarios = permisosUsuario.includes('USUARIOS_VER') || 
                                     rolNombre === 'administrador';
        
        if (tienePermisoUsuarios) {
            console.log('👥 Mostrando acceso a Usuarios');
            
            const accesoUsuarios = document.getElementById('accesoUsuarios');
            if (accesoUsuarios) {
                accesoUsuarios.style.display = 'flex';
            }
        }
        
        // ============================================
        // ACCESO A MANTENIMIENTO (SOLO PROGRAMADOR)
        // ============================================
        if (rolNombre === 'programador') {
            console.log('🔧 Usuario programador detectado - Mostrando acceso a Mantenimiento');
            
            const accesoMant = document.getElementById('accesoMantenimiento');
            if (accesoMant) {
                accesoMant.style.display = 'flex';
                
                // Agregar evento click para ir a mantenimiento
                accesoMant.addEventListener('click', function() {
                    window.location.href = 'mantenimiento.html';
                });
            }
        }
        
    } catch (error) {
        console.warn('Error verificando accesos especiales:', error);
    }
}

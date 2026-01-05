/* ============================================
   ADMINISGO - CONFIGURACIÓN
   ============================================
   Archivo de configuración global del sistema.
   Contiene constantes, rutas y utilidades comunes.
============================================ */

/**
 * Configuración global del sistema
 * NOTA: En esta etapa usamos valores placeholder.
 * En la próxima etapa se conectará con bases de datos reales.
 */
const CONFIG = {
    // Nombre del sistema
    nombreSistema: "AdminisGo",
    
    // Versión actual
    version: "1.0.0",
    
    // URLs de las pantallas
    rutas: {
        landing: "index.html",
        registro: "registro.html",
        login: "login.html",
        inicio: "inicio.html"
    },
    
    // Configuración de almacenamiento local (placeholder)
    storage: {
        keyUsuario: "gk_usuario_actual",
        keyComercio: "gk_comercio_actual",
        keySesion: "gk_sesion_activa"
    },
    
    // Tiempo de espera para simulaciones (en ms)
    tiempoSimulacion: 800,
    
    // Mensajes del sistema en español
    mensajes: {
        // Errores generales
        errorGeneral: "Ocurrió un error. Por favor, intentá nuevamente.",
        camposObligatorios: "Por favor, completá todos los campos obligatorios.",
        
        // Registro
        registroExitoso: "¡Registro exitoso! Ahora podés iniciar sesión.",
        errorPasswordNoCoincide: "Las contraseñas no coinciden.",
        errorEmailInvalido: "Por favor, ingresá un email válido.",
        
        // Login
        loginExitoso: "¡Bienvenido! Ingresando al sistema...",
        errorCredenciales: "Email o contraseña incorrectos.",
        
        // Sesión
        sesionCerrada: "Sesión cerrada correctamente."
    }
};

/* ============================================
   UTILIDADES GLOBALES
============================================ */

/**
 * Muestra un mensaje en un elemento contenedor
 * @param {string} contenedorId - ID del elemento donde mostrar el mensaje
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - Tipo: 'exito', 'error', 'info', 'advertencia'
 */
function mostrarMensaje(contenedorId, mensaje, tipo = 'info') {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    // Limpiar clases previas
    contenedor.className = 'mensaje';
    contenedor.classList.add(`mensaje-${tipo}`);
    contenedor.textContent = mensaje;
    contenedor.classList.remove('mensaje-oculto');
    
    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (tipo === 'exito') {
        setTimeout(() => {
            contenedor.classList.add('mensaje-oculto');
        }, 5000);
    }
}

/**
 * Oculta un mensaje
 * @param {string} contenedorId - ID del elemento a ocultar
 */
function ocultarMensaje(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.classList.add('mensaje-oculto');
    }
}

/**
 * Valida un email con expresión regular
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida que una contraseña tenga mínimo 6 caracteres
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es válida
 */
function validarPassword(password) {
    return password && password.length >= 6;
}

/**
 * Simula una operación asíncrona (placeholder para conexión real)
 * @param {number} tiempo - Tiempo en milisegundos
 * @returns {Promise} - Promesa que se resuelve después del tiempo indicado
 */
function simularOperacion(tiempo = CONFIG.tiempoSimulacion) {
    return new Promise(resolve => setTimeout(resolve, tiempo));
}

/**
 * Navega a otra página
 * @param {string} ruta - Ruta de destino
 */
function navegarA(ruta) {
    window.location.href = ruta;
}

/**
 * Guarda datos en localStorage (placeholder para IndexedDB)
 * @param {string} clave - Clave de almacenamiento
 * @param {any} valor - Valor a guardar
 */
function guardarLocal(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
        return false;
    }
}

/**
 * Obtiene datos de localStorage
 * @param {string} clave - Clave de almacenamiento
 * @returns {any} - Valor almacenado o null
 */
function obtenerLocal(clave) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : null;
    } catch (e) {
        console.error('Error al leer de localStorage:', e);
        return null;
    }
}

/**
 * Elimina datos de localStorage
 * @param {string} clave - Clave a eliminar
 */
function eliminarLocal(clave) {
    try {
        localStorage.removeItem(clave);
        return true;
    } catch (e) {
        console.error('Error al eliminar de localStorage:', e);
        return false;
    }
}

/**
 * Verifica si hay una sesión activa (placeholder)
 * @returns {boolean} - True si hay sesión
 */
function haySesionActiva() {
    return obtenerLocal(CONFIG.storage.keySesion) !== null;
}

/**
 * Obtiene datos del usuario actual (placeholder)
 * @returns {object|null} - Datos del usuario o null
 */
function obtenerUsuarioActual() {
    return obtenerLocal(CONFIG.storage.keyUsuario);
}

/**
 * Obtiene datos del comercio actual (placeholder)
 * @returns {object|null} - Datos del comercio o null
 */
function obtenerComercioActual() {
    return obtenerLocal(CONFIG.storage.keyComercio);
}

/**
 * Cierra la sesión actual
 */
function cerrarSesion() {
    eliminarLocal(CONFIG.storage.keySesion);
    eliminarLocal(CONFIG.storage.keyUsuario);
    eliminarLocal(CONFIG.storage.keyComercio);
    navegarA(CONFIG.rutas.landing);
}

/* ============================================
   GESTIÓN DE TEMA
============================================ */

/**
 * Aplica el tema al documento
 * @param {string} tema - 'dark', 'light', o 'system'
 */
function aplicarTema(tema) {
    const html = document.documentElement;
    
    // Remover temas anteriores
    html.removeAttribute('data-theme');
    
    let temaAplicado = 'light';
    
    if (tema === 'dark' || tema === 'oscuro') {
        html.setAttribute('data-theme', 'dark');
        temaAplicado = 'dark';
    } else if (tema === 'light' || tema === 'claro') {
        html.setAttribute('data-theme', 'light');
        temaAplicado = 'light';
    } else if (tema === 'system' || tema === 'sistema') {
        // Usar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaAplicado = prefersDark ? 'dark' : 'light';
        html.setAttribute('data-theme', temaAplicado);
    }
    
    // Guardar en localStorage como caché para aplicación rápida en próximas cargas
    try {
        localStorage.setItem('adminisgo_tema_cache', temaAplicado);
    } catch (e) {
        console.warn('No se pudo guardar tema en localStorage:', e);
    }
    
    console.log(`🎨 Tema aplicado: ${tema} (${temaAplicado})`);
}

/**
 * Carga y aplica el tema desde la configuración del comercio
 * Esta función espera a que los módulos necesarios estén disponibles
 */
async function cargarYAplicarTema() {
    try {
        // Esperar un poco para que otros módulos se carguen
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar si las funciones necesarias están disponibles
        if (typeof getDB !== 'function' || typeof getSesionActual !== 'function') {
            console.log('⚠️ Módulos no disponibles aún, usando tema del sistema');
            aplicarTema('system');
            return;
        }
        
        // Intentar obtener comercio actual
        const db = getDB();
        if (!db) {
            aplicarTema('system');
            return;
        }
        
        // Verificar si la tabla configuraciones existe
        try {
            const tablas = db.tables.map(t => t.name);
            if (!tablas.includes('configuraciones')) {
                console.warn('⚠️ Tabla configuraciones no existe aún, usando tema del sistema');
                aplicarTema('system');
                return;
            }
        } catch (e) {
            // Si no podemos verificar, intentar de todas formas
        }
        
        const sesion = await getSesionActual();
        if (!sesion || !sesion.user) {
            // Si no hay sesión, usar tema del sistema
            aplicarTema('system');
            return;
        }
        
        // Obtener usuario y comercio
        if (typeof obtenerDatosUsuarioCompleto !== 'function') {
            aplicarTema('system');
            return;
        }
        
        const usuario = await obtenerDatosUsuarioCompleto(sesion.user.id);
        if (!usuario || !usuario.comercio?.id) {
            aplicarTema('system');
            return;
        }
        
        // Buscar configuración de tema
        try {
            console.log(`🔍 Buscando tema para comercio: ${usuario.comercio.id}`);
            
            // Método alternativo más robusto: obtener todas las configuraciones y filtrar
            const todasConfigs = await db.table('configuraciones')
                .where('comercio_id').equals(usuario.comercio.id)
                .toArray();
            
            console.log(`📦 Total configuraciones encontradas: ${todasConfigs.length}`);
            
            const temaConfig = todasConfigs.find(c => 
                c.categoria === 'aplicacion' && c.clave === 'tema'
            );
            
            if (temaConfig && temaConfig.valor) {
                console.log(`✅ Tema encontrado: ${temaConfig.valor}`);
                aplicarTema(temaConfig.valor);
            } else {
                console.log('⚠️ Tema no encontrado en IndexedDB, usando sistema');
                aplicarTema('system');
            }
        } catch (dbError) {
            console.warn('⚠️ Error consultando tema en IndexedDB:', dbError);
            aplicarTema('system');
        }
        
    } catch (error) {
        console.warn('⚠️ Error cargando tema:', error);
        aplicarTema('system');
    }
}

/* ============================================
   INICIALIZACIÓN
============================================ */

// Log de inicio (solo en desarrollo)
console.log(`${CONFIG.nombreSistema} v${CONFIG.version} - Configuración cargada`);


/* ============================================
   SINCRONIZACION - OFFLINE FIRST
   ============================================
   Servicio de sincronizacion entre IndexedDB
   (local) y Supabase (remoto).
   
   Estrategia:
   1. Todas las operaciones se hacen primero en local
   2. Se agregan a una cola de sincronizacion
   3. Cuando hay conexion, se sincronizan con Supabase
   4. Los conflictos se resuelven por fecha (ultimo gana)
============================================ */

// ============================================
// CONFIGURACION
// ============================================

const SYNC_CONFIG = {
    // Intervalo de sincronizacion automatica (en ms)
    intervalo: 30000, // 30 segundos
    
    // Maximo de intentos por operacion
    maxIntentos: 5,
    
    // Tablas que se sincronizan (en orden de dependencia)
    tablas: [
        'comercio',
        'usuario',
        'configuraciones', // Configuraciones del comercio (tema, preferencias, etc.)
        'categorias',
        'marcas',
        'proveedores',
        'productos',
        'clientes',
        'stock',
        'compras',
        'detalle_compras',
        'pagos_compras',
        'cajas',
        'ventas',
        'detalle_ventas',
        'pagos_ventas',
        'movimientos_stock'
    ],
    
    // Tablas que solo se descargan (no se suben cambios locales)
    tablasReadOnly: ['roles', 'permisos', 'roles_permisos']
};

// Estado de sincronizacion
let syncEnProgreso = false;
let syncIntervalId = null;

// ============================================
// ESTADO DE CONEXION
// ============================================

/**
 * Verifica si hay conexion a internet
 * @returns {boolean}
 */
function hayConexion() {
    return navigator.onLine;
}

/**
 * Verifica si Supabase esta disponible
 * @returns {boolean}
 */
function supabaseDisponible() {
    return typeof isSupabaseConnected === 'function' && isSupabaseConnected();
}

/**
 * Verifica si se puede sincronizar
 * @returns {boolean}
 */
function puedeSincronizar() {
    return hayConexion() && supabaseDisponible() && !syncEnProgreso;
}

// ============================================
// SINCRONIZACION PRINCIPAL
// ============================================

/**
 * Ejecuta el proceso de sincronizacion completo
 * @returns {Promise<Object>} Resultado de la sincronizacion
 */
async function sincronizar() {
    if (!puedeSincronizar()) {
        console.log('⏸️ Sincronizacion no disponible');
        return { exito: false, mensaje: 'No hay conexion o sync en progreso' };
    }
    
    syncEnProgreso = true;
    console.log('🔄 Iniciando sincronizacion...');
    
    const resultado = {
        exito: true,
        subidos: 0,
        descargados: 0,
        errores: []
    };
    
    try {
        // 1. Subir cambios locales pendientes
        const resultadoSubida = await subirCambiosPendientes();
        resultado.subidos = resultadoSubida.procesados;
        resultado.errores.push(...resultadoSubida.errores);
        
        // 2. Descargar cambios remotos
        const resultadoDescarga = await descargarCambiosRemotos();
        resultado.descargados = resultadoDescarga.descargados;
        resultado.errores.push(...resultadoDescarga.errores);
        
        console.log(`✅ Sincronizacion completada: ${resultado.subidos} subidos, ${resultado.descargados} descargados`);
        
    } catch (error) {
        console.error('❌ Error en sincronizacion:', error);
        resultado.exito = false;
        resultado.errores.push(error.message);
        
    } finally {
        syncEnProgreso = false;
    }
    
    // Notificar resultado
    notificarResultadoSync(resultado);
    
    return resultado;
}

/**
 * Sube los cambios pendientes a Supabase
 * @returns {Promise<Object>} Resultado
 */
async function subirCambiosPendientes() {
    const resultado = {
        procesados: 0,
        errores: []
    };
    
    // Obtener cola de pendientes
    const pendientes = await obtenerPendientesSincronizacion();
    
    if (pendientes.length === 0) {
        console.log('📤 No hay cambios pendientes para subir');
        return resultado;
    }
    
    console.log(`📤 Subiendo ${pendientes.length} cambios pendientes...`);
    
    for (const operacion of pendientes) {
        try {
            await procesarOperacionSync(operacion);
            await marcarComoSincronizado(operacion.id);
            resultado.procesados++;
            
        } catch (error) {
            console.error(`Error sincronizando operacion ${operacion.id}:`, error);
            resultado.errores.push(`${operacion.tabla}: ${error.message}`);
            
            // Incrementar intentos
            await incrementarIntentosSincronizacion(operacion.id);
            
            // Si supera el maximo, descartar
            if (operacion.intentos >= SYNC_CONFIG.maxIntentos) {
                console.warn(`⚠️ Operacion ${operacion.id} descartada por max intentos`);
                await marcarComoSincronizado(operacion.id);
            }
        }
    }
    
    return resultado;
}

/**
 * Procesa una operacion de sincronizacion individual
 * @param {Object} operacion - Operacion de la cola
 */
async function procesarOperacionSync(operacion) {
    const datos = JSON.parse(operacion.datos);
    const tabla = mapearTablaLocal(operacion.tabla);
    
    switch (operacion.operacion) {
        case 'insert':
            await insertarRegistro(tabla, prepararParaSupabase(datos));
            break;
            
        case 'update':
            await actualizarRegistro(tabla, datos.id, prepararParaSupabase(datos));
            break;
            
        case 'delete':
            await eliminarRegistro(tabla, datos.id);
            break;
            
        default:
            throw new Error(`Operacion desconocida: ${operacion.operacion}`);
    }
}

/**
 * Descarga cambios remotos de Supabase
 * @returns {Promise<Object>} Resultado
 */
async function descargarCambiosRemotos() {
    const resultado = {
        descargados: 0,
        errores: []
    };
    
    // Obtener sesion local para saber el comercio
    const sesion = await obtenerSesionLocal();
    if (!sesion?.comercio_id) {
        console.log('📥 No hay sesion activa para descargar datos');
        return resultado;
    }
    
    console.log('📥 Descargando datos remotos...');
    
    // Descargar tablas de solo lectura (roles, permisos)
    for (const tabla of SYNC_CONFIG.tablasReadOnly) {
        try {
            // Manejo especial para roles_permisos (clave compuesta)
            if (tabla === 'roles_permisos') {
                const datos = await obtenerRegistros(tabla);
                await sincronizarTablaRolesPermisos(datos);
                resultado.descargados += datos?.length || 0;
            } else {
                const datos = await obtenerRegistros(tabla);
                await sincronizarTablaLocal(tabla, datos);
                resultado.descargados += datos?.length || 0;
            }
        } catch (error) {
            console.warn(`Error descargando ${tabla}:`, error);
            resultado.errores.push(`${tabla}: ${error.message}`);
        }
    }
    
    // Descargar datos del comercio
    for (const tabla of ['configuraciones', 'categorias', 'marcas', 'proveedores', 'productos', 'clientes', 'compras', 'detalle_compras', 'pagos_compras', 'ventas', 'detalle_ventas', 'pagos_ventas']) {
        try {
            const datos = await obtenerRegistros(tabla, { comercio_id: sesion.comercio_id });
            await sincronizarTablaLocal(tabla, datos);
            resultado.descargados += datos?.length || 0;
        } catch (error) {
            resultado.errores.push(`${tabla}: ${error.message}`);
        }
    }
    
    return resultado;
}

/**
 * Sincroniza la tabla roles_permisos (tiene clave compuesta)
 * @param {Array} datosRemotos - Datos de Supabase
 */
async function sincronizarTablaRolesPermisos(datosRemotos) {
    const db = getDB();
    if (!db || !datosRemotos) return;
    
    // Limpiar tabla local primero (es read-only, siempre viene de Supabase)
    await db.table('roles_permisos').clear();
    
    // Insertar todos los registros
    for (const registro of datosRemotos) {
        try {
            await db.table('roles_permisos').put({
                rol_id: registro.rol_id,
                permiso_id: registro.permiso_id,
                synced: true
            });
        } catch (e) {
            console.warn('Error insertando roles_permisos:', e);
        }
    }
    
    console.log(`✅ roles_permisos sincronizados: ${datosRemotos.length} registros`);
}

/**
 * Sincroniza una tabla local con datos remotos
 * @param {string} tabla - Nombre de la tabla
 * @param {Array} datosRemotos - Datos de Supabase
 */
async function sincronizarTablaLocal(tabla, datosRemotos) {
    const db = getDB();
    if (!db || !datosRemotos) return;
    
    for (const registro of datosRemotos) {
        // Buscar si existe localmente
        const local = await db.table(tabla).get(registro.id);
        
        if (!local) {
            // No existe, insertar
            await db.table(tabla).put({
                ...registro,
                sync_id: registro.id || registro.sync_id, // Asegurar sync_id
                synced: true
            });
        } else if (new Date(registro.updated_at) > new Date(local.updated_at)) {
            // El remoto es mas nuevo, actualizar
            await db.table(tabla).put({
                ...registro,
                sync_id: registro.id || registro.sync_id, // Asegurar sync_id
                synced: true
            });
        }
        // Si el local es mas nuevo, no hacer nada (se subira en la proxima sync)
    }
}

// ============================================
// UTILIDADES DE MAPEO
// ============================================

/**
 * Mapea nombre de tabla local a nombre en Supabase
 * @param {string} tablaLocal - Nombre local
 * @returns {string} Nombre en Supabase
 */
function mapearTablaLocal(tablaLocal) {
    const mapeo = {
        'comercio': 'comercios',
        'usuario': 'usuarios'
        // Agregar mas mapeos si los nombres difieren
    };
    
    return mapeo[tablaLocal] || tablaLocal;
}

/**
 * Prepara un objeto para enviar a Supabase
 * Remueve campos locales que no existen en Supabase
 * @param {Object} datos - Datos locales
 * @returns {Object} Datos limpios
 */
function prepararParaSupabase(datos) {
    const { synced, ...datosLimpios } = datos;
    return datosLimpios;
}

// ============================================
// SINCRONIZACION AUTOMATICA
// ============================================

/**
 * Inicia la sincronizacion automatica periodica
 */
function iniciarSyncAutomatica() {
    if (syncIntervalId) {
        return; // Ya esta corriendo
    }
    
    console.log('⏰ Sincronizacion automatica iniciada');
    
    syncIntervalId = setInterval(() => {
        if (puedeSincronizar()) {
            sincronizar();
        }
    }, SYNC_CONFIG.intervalo);
    
    // Escuchar cambios de conexion
    window.addEventListener('online', onConexionRecuperada);
    window.addEventListener('offline', onConexionPerdida);
}

/**
 * Detiene la sincronizacion automatica
 */
function detenerSyncAutomatica() {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
        console.log('⏹️ Sincronizacion automatica detenida');
    }
    
    window.removeEventListener('online', onConexionRecuperada);
    window.removeEventListener('offline', onConexionPerdida);
}

/**
 * Handler cuando se recupera la conexion
 */
function onConexionRecuperada() {
    console.log('🌐 Conexion recuperada');
    mostrarNotificacionSync('Conexion recuperada. Sincronizando...');
    
    // Sincronizar inmediatamente
    setTimeout(sincronizar, 2000);
}

/**
 * Handler cuando se pierde la conexion
 */
function onConexionPerdida() {
    console.log('📴 Conexion perdida');
    mostrarNotificacionSync('Sin conexion. Modo offline activado.');
}

// ============================================
// NOTIFICACIONES
// ============================================

/**
 * Muestra una notificacion de sincronizacion
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarNotificacionSync(mensaje) {
    // Usar la funcion de notificacion si existe
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'info');
    } else {
        console.log(`🔔 ${mensaje}`);
    }
}

/**
 * Notifica el resultado de la sincronizacion
 * @param {Object} resultado - Resultado de la sync
 */
function notificarResultadoSync(resultado) {
    if (resultado.exito) {
        if (resultado.subidos > 0 || resultado.descargados > 0) {
            mostrarNotificacionSync(`Sincronizado: ${resultado.subidos}↑ ${resultado.descargados}↓`);
        }
        
        // Recargar tema después de sincronización (por si se actualizó la configuración)
        if (typeof cargarYAplicarTema === 'function') {
            setTimeout(() => {
                cargarYAplicarTema().catch(err => {
                    console.warn('Error recargando tema después de sync:', err);
                });
            }, 500);
        }
    } else {
        mostrarNotificacionSync('Error en sincronizacion');
    }
}

// ============================================
// API PUBLICA
// ============================================

/**
 * Obtiene el estado actual de sincronizacion
 * @returns {Promise<Object>} Estado
 */
async function obtenerEstadoSync() {
    const pendientes = await contarPendientesSincronizacion();
    
    return {
        enProgreso: syncEnProgreso,
        pendientes: pendientes,
        conexion: hayConexion(),
        supabaseConectado: supabaseDisponible(),
        ultimaSync: localStorage.getItem('ultima_sync') || null
    };
}

/**
 * Fuerza una sincronizacion inmediata
 * @returns {Promise<Object>} Resultado
 */
async function forzarSincronizacion() {
    if (syncEnProgreso) {
        return { exito: false, mensaje: 'Sincronizacion ya en progreso' };
    }
    
    return await sincronizar();
}

// ============================================
// INICIALIZACION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Iniciar sync automatica despues de un delay
    setTimeout(() => {
        iniciarSyncAutomatica();
    }, 5000);
});

console.log('📦 Modulo de Sincronizacion cargado');


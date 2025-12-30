/* ============================================
   INDEXEDDB - BASE DE DATOS LOCAL
   ============================================
   Base de datos local usando Dexie.js para
   funcionamiento offline.
   
   Esta es la base de datos principal de trabajo.
   Los datos se sincronizan con Supabase cuando
   hay conexion.
============================================ */

// ============================================
// CONFIGURACION DE LA BASE DE DATOS
// ============================================

const DB_NAME = 'GestionKioscosDB';
const DB_VERSION = 6; // Incrementado para agregar campos a clientes (saldo_pendiente, especificaciones, responsable_nombre)

// Variable global para la base de datos
let db = null;

/**
 * Inicializa la base de datos IndexedDB usando Dexie
 * @returns {Promise<Object>} Instancia de la base de datos
 */
async function initIndexedDB() {
    if (db) {
        return db;
    }
    
    // Verificar si Dexie esta disponible
    if (typeof Dexie === 'undefined') {
        console.error('❌ Dexie.js no esta cargado');
        return null;
    }
    
    try {
        db = new Dexie(DB_NAME);
        
        // Versión 1: Esquema inicial
        db.version(1).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        });
        
        // Versión 2: Agregar tabla configuraciones
        db.version(2).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            configuraciones: 'id, comercio_id, categoria, clave, valor, tipo, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        });
        
        // Versión 3: Agregar índice compuesto a configuraciones (opcional, para optimización)
        db.version(3).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            configuraciones: 'id, comercio_id, categoria, clave, [comercio_id+categoria+clave], valor, tipo, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        });
        
        // Versión 4: Agregar campos a categorias y marcas (especificaciones, created_at, responsable_nombre)
        db.version(4).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            configuraciones: 'id, comercio_id, categoria, clave, [comercio_id+categoria+clave], valor, tipo, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        }).upgrade(async (trans) => {
            console.log('🔄 Migrando a versión 4: Agregando campos a categorias y marcas...');
            
            // Actualizar categorias existentes
            const categorias = await trans.table('categorias').toCollection().toArray();
            for (const categoria of categorias) {
                const actualizaciones = {};
                
                // Agregar created_at si no existe (usar updated_at como fallback)
                if (!categoria.created_at) {
                    actualizaciones.created_at = categoria.updated_at || new Date().toISOString();
                }
                
                // Agregar especificaciones si no existe (null por defecto)
                if (categoria.especificaciones === undefined) {
                    actualizaciones.especificaciones = null;
                }
                
                // Agregar responsable_nombre si no existe (null por defecto)
                if (categoria.responsable_nombre === undefined) {
                    actualizaciones.responsable_nombre = null;
                }
                
                if (Object.keys(actualizaciones).length > 0) {
                    await trans.table('categorias').update(categoria.id, actualizaciones);
                }
            }
            
            // Actualizar marcas existentes
            const marcas = await trans.table('marcas').toCollection().toArray();
            for (const marca of marcas) {
                const actualizaciones = {};
                
                if (!marca.created_at) {
                    actualizaciones.created_at = marca.updated_at || new Date().toISOString();
                }
                
                if (marca.especificaciones === undefined) {
                    actualizaciones.especificaciones = null;
                }
                
                if (marca.responsable_nombre === undefined) {
                    actualizaciones.responsable_nombre = null;
                }
                
                if (Object.keys(actualizaciones).length > 0) {
                    await trans.table('marcas').update(marca.id, actualizaciones);
                }
            }
            
            console.log('✅ Migración a versión 4 completada');
        });
        
        // Versión 5: Agregar tabla proveedores
        db.version(5).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            proveedores: 'id, comercio_id, nombre, razon_social, cuit, telefono, email, direccion, contacto_nombre, saldo_pendiente, especificaciones, activo, created_at, responsable_nombre, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            configuraciones: 'id, comercio_id, categoria, clave, [comercio_id+categoria+clave], valor, tipo, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        });
        
        // Versión 6: Agregar campos a clientes (saldo_pendiente, especificaciones, responsable_nombre, telefono, email, direccion)
        db.version(6).stores({
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            config: 'clave, valor',
            comercio: 'id, razon_social, email, sync_id, updated_at',
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            categorias: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            proveedores: 'id, comercio_id, nombre, razon_social, cuit, telefono, email, direccion, contacto_nombre, saldo_pendiente, especificaciones, activo, created_at, responsable_nombre, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, telefono, email, direccion, saldo_pendiente, especificaciones, activo, created_at, responsable_nombre, sync_id, updated_at',
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            configuraciones: 'id, comercio_id, categoria, clave, [comercio_id+categoria+clave], valor, tipo, sync_id, updated_at',
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        }).upgrade(async (trans) => {
            console.log('🔄 Migrando a versión 6: Agregando campos a clientes...');
            
            // Actualizar clientes existentes
            const clientes = await trans.table('clientes').toCollection().toArray();
            for (const cliente of clientes) {
                const actualizaciones = {};
                
                // Agregar created_at si no existe (usar updated_at como fallback)
                if (!cliente.created_at) {
                    actualizaciones.created_at = cliente.updated_at || new Date().toISOString();
                }
                
                // Agregar saldo_pendiente si no existe (0 por defecto)
                if (cliente.saldo_pendiente === undefined) {
                    actualizaciones.saldo_pendiente = 0;
                }
                
                // Agregar especificaciones si no existe (null por defecto)
                if (cliente.especificaciones === undefined) {
                    actualizaciones.especificaciones = null;
                }
                
                // Agregar responsable_nombre si no existe (null por defecto)
                if (cliente.responsable_nombre === undefined) {
                    actualizaciones.responsable_nombre = null;
                }
                
                // Agregar telefono, email, direccion si no existen
                if (cliente.telefono === undefined) {
                    actualizaciones.telefono = null;
                }
                if (cliente.email === undefined) {
                    actualizaciones.email = null;
                }
                if (cliente.direccion === undefined) {
                    actualizaciones.direccion = null;
                }
                
                if (Object.keys(actualizaciones).length > 0) {
                    await trans.table('clientes').update(cliente.id, actualizaciones);
                }
            }
            
            console.log('✅ Migración a versión 6 completada');
        });
        
        // Definir esquema de la base de datos (versión actual)
        db.version(DB_VERSION).stores({
            // ============================================
            // TABLAS DE SINCRONIZACION
            // ============================================
            
            // Cola de sincronizacion: operaciones pendientes de enviar a Supabase
            sync_queue: '++id, tabla, registro_id, operacion, created_at, intentos',
            
            // Ultima sincronizacion por tabla
            sync_status: 'tabla, ultima_sync, registros_pendientes',
            
            // ============================================
            // SESION Y CONFIGURACION
            // ============================================
            
            // Sesion del usuario actual
            sesion: 'id, usuario_id, comercio_id, rol_id, email, activo',
            
            // Configuracion local
            config: 'clave, valor',
            
            // ============================================
            // DATOS DEL NEGOCIO (CACHE DE SUPABASE)
            // ============================================
            
            // Comercio actual
            comercio: 'id, razon_social, email, sync_id, updated_at',
            
            // Usuario actual
            usuario: 'id, auth_user_id, comercio_id, rol_id, nombre, email, sync_id',
            
            // Roles y permisos (cache)
            roles: 'id, nombre, sync_id',
            permisos: 'id, codigo, modulo, sync_id',
            roles_permisos: '[rol_id+permiso_id]',
            
            // Catalogos
            categorias: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            marcas: 'id, comercio_id, nombre, activo, especificaciones, created_at, responsable_nombre, sync_id, updated_at',
            proveedores: 'id, comercio_id, nombre, razon_social, cuit, telefono, email, direccion, contacto_nombre, saldo_pendiente, especificaciones, activo, created_at, responsable_nombre, sync_id, updated_at',
            productos: 'id, comercio_id, nombre, codigo_barra, precio_venta, activo, sync_id, updated_at',
            clientes: 'id, comercio_id, nombre, documento, telefono, email, direccion, saldo_pendiente, especificaciones, activo, created_at, responsable_nombre, sync_id, updated_at',
            
            // Stock
            stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at',
            
            // Configuraciones del comercio
            configuraciones: 'id, comercio_id, categoria, clave, valor, tipo, sync_id, updated_at',
            
            // ============================================
            // OPERACIONES LOCALES
            // ============================================
            
            // Cajas (se crean localmente y se sincronizan)
            cajas: 'id, comercio_id, estado, fecha_apertura, sync_id, synced',
            
            // Ventas (se crean localmente y se sincronizan)
            ventas: 'id, comercio_id, caja_id, fecha, total, sync_id, synced',
            
            // Detalle de ventas
            detalle_ventas: 'id, venta_id, producto_id, sync_id, synced',
            
            // Movimientos de stock
            movimientos_stock: 'id, producto_id, comercio_id, tipo, sync_id, synced'
        });
        
        await db.open();
        console.log('✅ IndexedDB inicializada:', DB_NAME);
        
        return db;
        
    } catch (error) {
        console.error('❌ Error inicializando IndexedDB:', error);
        return null;
    }
}

/**
 * Obtiene la instancia de la base de datos
 * @returns {Object|null} Base de datos o null
 */
function getDB() {
    return db;
}

/**
 * Verifica si IndexedDB esta disponible
 * @returns {boolean}
 */
function isIndexedDBAvailable() {
    return db !== null;
}

// ============================================
// OPERACIONES CRUD GENERICAS
// ============================================

/**
 * Guarda un registro en una tabla local
 * @param {string} tabla - Nombre de la tabla
 * @param {Object} datos - Datos a guardar
 * @param {boolean} marcarParaSync - Si debe agregarse a la cola de sync
 * @returns {Promise<any>} ID del registro
 */
async function guardarLocal(tabla, datos, marcarParaSync = true) {
    if (!db) {
        throw new Error('IndexedDB no inicializada');
    }
    
    // Agregar campos de control
    const registro = {
        ...datos,
        sync_id: datos.sync_id || generarUUID(),
        updated_at: new Date().toISOString(),
        synced: false
    };
    
    // Guardar en la tabla
    const id = await db.table(tabla).put(registro);
    
    // Agregar a cola de sincronizacion si corresponde
    if (marcarParaSync) {
        await agregarAColaSincronizacion(tabla, id, 'insert', registro);
    }
    
    return id;
}

/**
 * Obtiene todos los registros de una tabla
 * @param {string} tabla - Nombre de la tabla
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} Registros
 */
async function obtenerTodosLocal(tabla, filtros = {}) {
    if (!db) {
        return [];
    }
    
    let collection = db.table(tabla);
    
    // Aplicar filtros si existen
    if (Object.keys(filtros).length > 0) {
        collection = collection.filter(item => {
            return Object.keys(filtros).every(key => item[key] === filtros[key]);
        });
    }
    
    return await collection.toArray();
}

/**
 * Obtiene un registro por ID
 * @param {string} tabla - Nombre de la tabla
 * @param {any} id - ID del registro
 * @returns {Promise<Object|undefined>}
 */
async function obtenerPorIdLocal(tabla, id) {
    if (!db) {
        return undefined;
    }
    
    return await db.table(tabla).get(id);
}

/**
 * Actualiza un registro local
 * @param {string} tabla - Nombre de la tabla
 * @param {any} id - ID del registro
 * @param {Object} cambios - Cambios a aplicar
 * @param {boolean} marcarParaSync - Si debe sincronizarse
 * @returns {Promise<number>} Registros afectados
 */
async function actualizarLocal(tabla, id, cambios, marcarParaSync = true) {
    if (!db) {
        throw new Error('IndexedDB no inicializada');
    }
    
    const datosActualizados = {
        ...cambios,
        updated_at: new Date().toISOString(),
        synced: false
    };
    
    const result = await db.table(tabla).update(id, datosActualizados);
    
    if (marcarParaSync && result > 0) {
        const registro = await db.table(tabla).get(id);
        await agregarAColaSincronizacion(tabla, id, 'update', registro);
    }
    
    return result;
}

/**
 * Elimina un registro local
 * @param {string} tabla - Nombre de la tabla
 * @param {any} id - ID del registro
 * @param {boolean} marcarParaSync - Si debe sincronizarse
 * @returns {Promise<void>}
 */
async function eliminarLocal(tabla, id, marcarParaSync = true) {
    if (!db) {
        throw new Error('IndexedDB no inicializada');
    }
    
    // Obtener registro antes de eliminar para tener el sync_id
    const registro = await db.table(tabla).get(id);
    
    await db.table(tabla).delete(id);
    
    if (marcarParaSync && registro) {
        await agregarAColaSincronizacion(tabla, id, 'delete', registro);
    }
}

/**
 * Limpia todos los registros de una tabla
 * @param {string} tabla - Nombre de la tabla
 * @returns {Promise<void>}
 */
async function limpiarTablaLocal(tabla) {
    if (!db) {
        return;
    }
    
    await db.table(tabla).clear();
}

// ============================================
// COLA DE SINCRONIZACION
// ============================================

/**
 * Agrega una operacion a la cola de sincronizacion
 * @param {string} tabla - Nombre de la tabla
 * @param {any} registroId - ID del registro
 * @param {string} operacion - Tipo: 'insert', 'update', 'delete'
 * @param {Object} datos - Datos del registro
 */
async function agregarAColaSincronizacion(tabla, registroId, operacion, datos) {
    if (!db) return;
    
    await db.sync_queue.put({
        tabla: tabla,
        registro_id: registroId,
        operacion: operacion,
        datos: JSON.stringify(datos),
        created_at: new Date().toISOString(),
        intentos: 0
    });
    
    console.log(`📝 Agregado a cola de sync: ${operacion} en ${tabla}`);
}

/**
 * Obtiene operaciones pendientes de sincronizar
 * @returns {Promise<Array>} Operaciones pendientes
 */
async function obtenerPendientesSincronizacion() {
    if (!db) return [];
    
    return await db.sync_queue.toArray();
}

/**
 * Marca una operacion como sincronizada (la elimina de la cola)
 * @param {number} id - ID de la operacion en la cola
 */
async function marcarComoSincronizado(id) {
    if (!db) return;
    
    await db.sync_queue.delete(id);
}

/**
 * Incrementa los intentos de una operacion
 * @param {number} id - ID de la operacion
 */
async function incrementarIntentosSincronizacion(id) {
    if (!db) return;
    
    await db.sync_queue.update(id, {
        intentos: db.sync_queue.get(id).then(op => (op?.intentos || 0) + 1)
    });
}

/**
 * Cuenta las operaciones pendientes
 * @returns {Promise<number>} Cantidad de pendientes
 */
async function contarPendientesSincronizacion() {
    if (!db) return 0;
    
    return await db.sync_queue.count();
}

// ============================================
// SESION LOCAL
// ============================================

/**
 * Guarda la sesion del usuario localmente
 * @param {Object} datosSesion - Datos de la sesion
 */
async function guardarSesionLocal(datosSesion) {
    if (!db) return;
    
    // Limpiar sesion anterior
    await db.sesion.clear();
    
    // Guardar nueva sesion
    await db.sesion.put({
        id: 'actual',
        ...datosSesion,
        activo: true
    });
}

/**
 * Obtiene la sesion local actual
 * @returns {Promise<Object|undefined>}
 */
async function obtenerSesionLocal() {
    if (!db) return undefined;
    
    return await db.sesion.get('actual');
}

/**
 * Elimina la sesion local
 */
async function eliminarSesionLocal() {
    if (!db) return;
    
    await db.sesion.clear();
}

/**
 * Verifica si hay una sesion local activa
 * @returns {Promise<boolean>}
 */
async function haySesionLocalActiva() {
    const sesion = await obtenerSesionLocal();
    return sesion?.activo === true;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un UUID v4
 * @returns {string} UUID
 */
function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================
// INICIALIZACION
// ============================================

// Inicializar cuando se carga el documento
document.addEventListener('DOMContentLoaded', async function() {
    await initIndexedDB();
});

console.log('📦 Modulo IndexedDB cargado');


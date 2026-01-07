/* ============================================
   SUPABASE - CONEXION A BASE DE DATOS REMOTA
   ============================================
   Cliente de Supabase para conexion con la
   base de datos en la nube.
   
   IMPORTANTE: Reemplazar SUPABASE_URL y SUPABASE_KEY
   con las credenciales reales del proyecto.
============================================ */

// ============================================
// CONFIGURACION DE SUPABASE
// ============================================
const SUPABASE_URL = 'https://arspyvtixxwjrdlkuiic.supabase.co' ;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyc3B5dnRpeHh3anJkbGt1aWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjQwMDMsImV4cCI6MjA4MzQwMDAwM30.povptcvQ8M2TEQ5dcSw_K6OE9S5DiIwUT-Nn8yhE2oE';

// Variable global para el cliente de Supabase
let supabaseClient = null;

/**
 * Inicializa el cliente de Supabase
 * @returns {Object} Cliente de Supabase
 */
function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    // Verificar que las credenciales esten configuradas
    if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' || SUPABASE_KEY === 'TU_SUPABASE_ANON_KEY_AQUI') {
        console.warn('⚠️ Supabase no configurado. Usando modo offline.');
        return null;
    }
    
    // Crear cliente usando la libreria de Supabase
    // La libreria se carga desde CDN en el HTML
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase conectado');
        return supabaseClient;
    } else {
        console.error('❌ Libreria de Supabase no cargada');
        return null;
    }
}

/**
 * Obtiene el cliente de Supabase
 * @returns {Object|null} Cliente o null si no esta disponible
 */
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

/**
 * Verifica si hay conexion con Supabase
 * @returns {boolean} True si esta conectado
 */
function isSupabaseConnected() {
    return supabaseClient !== null && navigator.onLine;
}

// ============================================
// AUTENTICACION
// ============================================

/**
 * Registra un nuevo usuario en Supabase Auth
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Resultado del registro
 */
async function registrarUsuarioAuth(email, password) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { data, error } = await client.auth.signUp({
        email: email,
        password: password
    });
    
    if (error) {
        console.error('Error en registro:', error.message);
        throw error;
    }
    
    return data;
}

/**
 * Inicia sesion con email y password
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario
 */
async function loginUsuarioAuth(email, password) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        console.error('Error en login:', error.message);
        throw error;
    }
    
    return data;
}

/**
 * Cierra la sesion del usuario
 * @returns {Promise<void>}
 */
async function logoutUsuarioAuth() {
    const client = getSupabase();
    if (!client) return;
    
    const { error } = await client.auth.signOut();
    if (error) {
        console.error('Error al cerrar sesion:', error.message);
    }
}

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Promise<Object|null>} Usuario o null
 */
async function getUsuarioActualAuth() {
    const client = getSupabase();
    if (!client) return null;
    
    const { data: { user } } = await client.auth.getUser();
    return user;
}

/**
 * Obtiene la sesion actual
 * @returns {Promise<Object|null>} Sesion o null
 */
async function getSesionActual() {
    const client = getSupabase();
    if (!client) return null;
    
    const { data: { session } } = await client.auth.getSession();
    return session;
}

// ============================================
// OPERACIONES DE BASE DE DATOS
// ============================================

/**
 * Inserta un registro en una tabla
 * @param {string} tabla - Nombre de la tabla
 * @param {Object} datos - Datos a insertar
 * @returns {Promise<Object>} Registro insertado
 */
async function insertarRegistro(tabla, datos) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { data, error } = await client
        .from(tabla)
        .insert(datos)
        .select()
        .single();
    
    if (error) {
        console.error(`Error insertando en ${tabla}:`, error.message);
        throw error;
    }
    
    return data;
}

/**
 * Obtiene registros de una tabla
 * @param {string} tabla - Nombre de la tabla
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} Registros encontrados
 */
async function obtenerRegistros(tabla, filtros = {}) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    let query = client.from(tabla).select('*');
    
    // Aplicar filtros
    Object.keys(filtros).forEach(key => {
        query = query.eq(key, filtros[key]);
    });
    
    const { data, error } = await query;
    
    if (error) {
        console.error(`Error obteniendo de ${tabla}:`, error.message);
        throw error;
    }
    
    return data || [];
}

/**
 * Obtiene un registro por ID
 * @param {string} tabla - Nombre de la tabla
 * @param {string} id - ID del registro
 * @returns {Promise<Object|null>} Registro o null
 */
async function obtenerRegistroPorId(tabla, id) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { data, error } = await client
        .from(tabla)
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; // No encontrado
        console.error(`Error obteniendo de ${tabla}:`, error.message);
        throw error;
    }
    
    return data;
}

/**
 * Actualiza un registro
 * @param {string} tabla - Nombre de la tabla
 * @param {string} id - ID del registro
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Registro actualizado
 */
async function actualizarRegistro(tabla, id, datos) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { data, error } = await client
        .from(tabla)
        .update(datos)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.error(`Error actualizando en ${tabla}:`, error.message);
        throw error;
    }
    
    return data;
}

/**
 * Elimina un registro
 * @param {string} tabla - Nombre de la tabla
 * @param {string} id - ID del registro
 * @returns {Promise<void>}
 */
async function eliminarRegistro(tabla, id) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    const { error } = await client
        .from(tabla)
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error(`Error eliminando de ${tabla}:`, error.message);
        throw error;
    }
}

// ============================================
// FUNCIONES ESPECIFICAS DEL NEGOCIO
// ============================================

/**
 * Crea un nuevo comercio con su usuario propietario
 * @param {Object} datosComercio - Datos del comercio
 * @param {string} authUserId - ID del usuario en auth.users
 * @returns {Promise<Object>} Comercio y usuario creados
 */
async function crearComercioConPropietario(datosComercio, authUserId) {
    const client = getSupabase();
    if (!client) {
        throw new Error('Supabase no disponible');
    }
    
    // 1. Crear el comercio
    const comercio = await insertarRegistro('comercios', {
        razon_social: datosComercio.nombreComercio,
        nombre_responsable: datosComercio.nombreResponsable,
        email: datosComercio.email
    });
    
    // 2. Obtener el rol de administrador
    const roles = await obtenerRegistros('roles', { nombre: 'administrador' });
    const rolAdmin = roles[0];
    
    // 3. Crear el usuario vinculado
    const usuario = await insertarRegistro('usuarios', {
        auth_user_id: authUserId,
        comercio_id: comercio.id,
        rol_id: rolAdmin ? rolAdmin.id : null,
        nombre: datosComercio.nombreResponsable,
        email: datosComercio.email,
        es_propietario: true
    });
    
    return { comercio, usuario };
}

/**
 * Obtiene los datos completos del usuario logueado
 * @param {string} authUserId - ID del usuario en auth.users
 * @returns {Promise<Object|null>} Datos del usuario con comercio y rol
 */
async function obtenerDatosUsuarioCompleto(authUserId) {
    const client = getSupabase();
    if (!client) return null;
    
    // Obtener usuario con comercio y rol
    const { data, error } = await client
        .from('usuarios')
        .select(`
            *,
            comercio:comercios(*),
            rol:roles(*)
        `)
        .eq('auth_user_id', authUserId)
        .single();
    
    if (error) {
        console.error('Error obteniendo datos de usuario:', error.message);
        return null;
    }
    
    return data;
}

/**
 * Obtiene los permisos del usuario
 * @param {string} rolId - ID del rol
 * @returns {Promise<Array>} Lista de codigos de permisos
 */
async function obtenerPermisosUsuario(rolId) {
    const client = getSupabase();
    if (!client) return [];
    
    const { data, error } = await client
        .from('roles_permisos')
        .select(`
            permiso:permisos(codigo)
        `)
        .eq('rol_id', rolId);
    
    if (error) {
        console.error('Error obteniendo permisos:', error.message);
        return [];
    }
    
    return data.map(rp => rp.permiso.codigo);
}

// ============================================
// INICIALIZACION
// ============================================

// Intentar inicializar Supabase cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    initSupabase();
});

console.log('📦 Modulo Supabase cargado');


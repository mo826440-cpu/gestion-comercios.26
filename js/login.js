/* ============================================
   LOGIN - JAVASCRIPT
   ============================================
   Lógica del formulario de inicio de sesión.
   Conecta con Supabase para autenticación y
   sincroniza datos con IndexedDB local.
============================================ */

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de login cargada');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        // Cargar y aplicar tema (si hay sesión)
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        verificarSesionExistente();
        inicializarFormulario();
    }, 500);
});

/**
 * Verifica si ya existe una sesión activa
 * Si existe, redirige directamente al inicio
 */
async function verificarSesionExistente() {
    // Verificar sesión en Supabase
    if (typeof getSesionActual === 'function') {
        const sesionSupabase = await getSesionActual();
        if (sesionSupabase) {
            console.log('Sesión de Supabase activa, redirigiendo...');
            navegarA(CONFIG.rutas.inicio);
            return;
        }
    }
    
    // Verificar sesión local
    if (typeof haySesionLocalActiva === 'function') {
        const sesionLocal = await haySesionLocalActiva();
        if (sesionLocal) {
            console.log('Sesión local activa, redirigiendo...');
            navegarA(CONFIG.rutas.inicio);
            return;
        }
    }
    
    // Fallback: verificar localStorage
    if (typeof haySesionActiva === 'function' && haySesionActiva()) {
        console.log('Sesión en localStorage activa, redirigiendo...');
        navegarA(CONFIG.rutas.inicio);
    }
}

/**
 * Configura el formulario de login y sus validaciones
 */
function inicializarFormulario() {
    const form = document.getElementById('formLogin');
    
    if (!form) {
        console.error('No se encontró el formulario de login');
        return;
    }
    
    // Manejar el envío del formulario
    form.addEventListener('submit', manejarLogin);
    
    // Validación en tiempo real
    const campos = form.querySelectorAll('.form-input');
    campos.forEach(campo => {
        campo.addEventListener('blur', function() {
            validarCampo(this);
        });
        
        campo.addEventListener('input', function() {
            limpiarErrorCampo(this);
        });
    });
    
    // Configurar botón mostrar/ocultar contraseña
    configurarMostrarPassword();
}

/**
 * Configura el toggle para mostrar/ocultar contraseña
 */
function configurarMostrarPassword() {
    const btnMostrar = document.getElementById('btnMostrarPassword');
    const inputPassword = document.getElementById('password');
    
    if (!btnMostrar || !inputPassword) return;
    
    btnMostrar.addEventListener('click', function() {
        if (inputPassword.type === 'password') {
            inputPassword.type = 'text';
            btnMostrar.textContent = '🙈';
            btnMostrar.classList.add('activo');
            btnMostrar.title = 'Ocultar contraseña';
        } else {
            inputPassword.type = 'password';
            btnMostrar.textContent = '👁️';
            btnMostrar.classList.remove('activo');
            btnMostrar.title = 'Mostrar contraseña';
        }
    });
}

/**
 * Maneja el envío del formulario de login
 * @param {Event} e - Evento del formulario
 */
async function manejarLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const btnIngresar = document.getElementById('btnIngresar');
    const loginCard = document.querySelector('.login-card');
    
    // Ocultar mensajes previos
    ocultarMensaje('mensajeLogin');
    
    // Validar campos
    if (!validarFormularioCompleto(form)) {
        loginCard.classList.add('error-shake');
        setTimeout(() => loginCard.classList.remove('error-shake'), 500);
        return;
    }
    
    // Obtener datos
    const datos = {
        email: form.email.value.trim().toLowerCase(),
        password: form.password.value,
        recordar: form.recordar.checked
    };
    
    // Mostrar estado de carga
    btnIngresar.classList.add('btn-cargando');
    btnIngresar.textContent = 'Ingresando...';
    btnIngresar.disabled = true;
    
    try {
        // Intentar autenticación
        const resultado = await autenticarUsuario(datos);
        
        // Mostrar mensaje de éxito
        mostrarMensaje('mensajeLogin', CONFIG.mensajes.loginExitoso, 'exito');
        
        // Redirigir al inicio después de 1 segundo
        setTimeout(() => {
            navegarA(CONFIG.rutas.inicio);
        }, 1000);
        
    } catch (error) {
        console.error('Error en login:', error);
        
        // Mostrar mensaje de error apropiado
        let mensajeError = CONFIG.mensajes.errorCredenciales;
        
        if (error.message) {
            if (error.message.includes('Invalid login') || error.message.includes('invalid')) {
                mensajeError = 'Email o contraseña incorrectos';
            } else if (error.message.includes('Email not confirmed')) {
                mensajeError = 'Debés confirmar tu email antes de ingresar';
            } else if (error.message.includes('No encontrado')) {
                mensajeError = 'Usuario no encontrado. ¿Ya te registraste?';
            }
        }
        
        mostrarMensaje('mensajeLogin', mensajeError, 'error');
        
        // Efecto de shake
        loginCard.classList.add('error-shake');
        setTimeout(() => loginCard.classList.remove('error-shake'), 500);
        
    } finally {
        // Restaurar botón
        btnIngresar.classList.remove('btn-cargando');
        btnIngresar.textContent = 'Ingresar';
        btnIngresar.disabled = false;
    }
}

/**
 * Autentica al usuario
 * Primero intenta con Supabase, si no está disponible usa modo offline
 * @param {Object} datos - Credenciales del usuario
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
async function autenticarUsuario(datos) {
    // Verificar si Supabase está disponible
    const supabaseOk = typeof isSupabaseConnected === 'function' && getSupabase();
    
    if (supabaseOk && navigator.onLine) {
        // ========================================
        // MODO ONLINE: Autenticación con Supabase
        // ========================================
        console.log('🔐 Autenticando con Supabase...');
        
        // 1. Login en Supabase Auth
        const authResult = await loginUsuarioAuth(datos.email, datos.password);
        
        if (!authResult.user) {
            throw new Error('Credenciales inválidas');
        }
        
        console.log('✅ Autenticado en Supabase:', authResult.user.email);
        
        // 2. Obtener datos completos del usuario
        const datosUsuario = await obtenerDatosUsuarioCompleto(authResult.user.id);
        
        if (!datosUsuario) {
            throw new Error('Usuario no encontrado en el sistema');
        }
        
        // 3. Obtener permisos del usuario
        let permisos = [];
        if (datosUsuario.rol_id) {
            permisos = await obtenerPermisosUsuario(datosUsuario.rol_id);
        }
        
        // 4. Guardar sesión localmente
        await guardarSesion(datosUsuario, permisos, datos.recordar);
        
        // 5. Sincronizar datos del comercio
        await sincronizarDatosIniciales(datosUsuario);
        
        return datosUsuario;
        
    } else {
        // ========================================
        // MODO OFFLINE: Autenticación local
        // ========================================
        console.log('📴 Modo offline: Autenticando localmente...');
        
        return await autenticarOffline(datos);
    }
}

/**
 * Autenticación offline usando datos locales
 * @param {Object} datos - Credenciales
 * @returns {Promise<Object>} Usuario autenticado
 */
async function autenticarOffline(datos) {
    const db = getDB();
    
    if (!db) {
        // Fallback a localStorage
        return autenticarLocalStorage(datos);
    }
    
    // Buscar usuario por email
    const usuarios = await db.usuario.where('email').equals(datos.email).toArray();
    
    if (usuarios.length === 0) {
        throw new Error('No encontrado');
    }
    
    const usuario = usuarios[0];
    
    // Verificar password
    const passwordHash = await hashPassword(datos.password);
    
    if (usuario.password_hash && usuario.password_hash !== passwordHash) {
        throw new Error('Credenciales inválidas');
    }
    
    // Obtener comercio
    const comercio = await db.comercio.get(usuario.comercio_id);
    
    // Crear objeto de sesión
    const datosUsuario = {
        ...usuario,
        comercio: comercio
    };
    
    // Guardar sesión
    await guardarSesionLocal({
        usuario_id: usuario.id,
        comercio_id: usuario.comercio_id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol_id: usuario.rol_id
    });
    
    console.log('✅ Autenticado offline');
    
    return datosUsuario;
}

/**
 * Autenticación usando localStorage (fallback)
 * @param {Object} datos - Credenciales
 * @returns {Object} Usuario simulado
 */
function autenticarLocalStorage(datos) {
    // Verificar si hay un registro previo
    const ultimoRegistro = obtenerLocal('gk_ultimo_registro');
    
    if (ultimoRegistro && ultimoRegistro.usuario.email === datos.email) {
        // Crear sesión
        const usuario = {
            id: ultimoRegistro.usuario.id,
            email: datos.email,
            nombreResponsable: ultimoRegistro.usuario.nombre,
            rol: 'administrador'
        };
        
        const comercio = {
            id: ultimoRegistro.comercio.id,
            nombre: ultimoRegistro.comercio.razon_social
        };
        
        guardarLocal(CONFIG.storage.keyUsuario, usuario);
        guardarLocal(CONFIG.storage.keyComercio, comercio);
        guardarLocal(CONFIG.storage.keySesion, {
            activa: true,
            fechaInicio: new Date().toISOString()
        });
        
        return { ...usuario, comercio };
    }
    
    // Si no hay registro, simular (para desarrollo)
    if (!validarEmail(datos.email) || !validarPassword(datos.password)) {
        throw new Error('Credenciales inválidas');
    }
    
    const usuario = {
        id: Date.now(),
        email: datos.email,
        nombreResponsable: 'Usuario Demo',
        rol: 'administrador'
    };
    
    const comercio = {
        id: 1,
        nombre: 'Mi Kiosco'
    };
    
    guardarLocal(CONFIG.storage.keyUsuario, usuario);
    guardarLocal(CONFIG.storage.keyComercio, comercio);
    guardarLocal(CONFIG.storage.keySesion, {
        activa: true,
        fechaInicio: new Date().toISOString()
    });
    
    return { ...usuario, comercio };
}

/**
 * Guarda la sesión del usuario
 * @param {Object} datosUsuario - Datos del usuario
 * @param {Array} permisos - Lista de permisos
 * @param {boolean} recordar - Si debe recordar la sesión
 */
async function guardarSesion(datosUsuario, permisos, recordar) {
    // Guardar en IndexedDB
    if (typeof guardarSesionLocal === 'function') {
        await guardarSesionLocal({
            usuario_id: datosUsuario.id,
            comercio_id: datosUsuario.comercio_id,
            rol_id: datosUsuario.rol_id,
            email: datosUsuario.email,
            nombre: datosUsuario.nombre,
            permisos: permisos
        });
    }
    
    // Guardar también en localStorage para compatibilidad
    guardarLocal(CONFIG.storage.keyUsuario, {
        id: datosUsuario.id,
        email: datosUsuario.email,
        nombreResponsable: datosUsuario.nombre,
        rol: datosUsuario.rol?.nombre || 'administrador'
    });
    
    guardarLocal(CONFIG.storage.keyComercio, {
        id: datosUsuario.comercio?.id,
        nombre: datosUsuario.comercio?.razon_social || 'Mi Comercio'
    });
    
    guardarLocal(CONFIG.storage.keySesion, {
        activa: true,
        fechaInicio: new Date().toISOString(),
        recordar: recordar
    });
}

/**
 * Sincroniza datos iniciales del comercio desde Supabase
 * @param {Object} datosUsuario - Datos del usuario logueado
 */
async function sincronizarDatosIniciales(datosUsuario) {
    if (!datosUsuario.comercio_id) return;
    
    console.log('📥 Sincronizando datos iniciales...');
    
    const db = getDB();
    if (!db) return;
    
    try {
        // Guardar comercio localmente
        if (datosUsuario.comercio) {
            await db.comercio.put({
                ...datosUsuario.comercio,
                synced: true
            });
        }
        
        // Guardar usuario localmente
        await db.usuario.put({
            ...datosUsuario,
            comercio: undefined, // No duplicar
            rol: undefined,
            synced: true
        });
        
        console.log('✅ Datos iniciales sincronizados');
        
    } catch (error) {
        console.error('Error sincronizando datos iniciales:', error);
    }
}

/**
 * Hash de password para comparación local
 * @param {string} password - Contraseña
 * @returns {Promise<string>} Hash
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida todos los campos del formulario
 * @param {HTMLFormElement} form - El formulario a validar
 * @returns {boolean} - True si todo es válido
 */
function validarFormularioCompleto(form) {
    let esValido = true;
    
    // Validar email
    const email = form.email.value.trim();
    if (!email) {
        mostrarErrorCampo(form.email, 'errorEmail', 'El email es obligatorio');
        esValido = false;
    } else if (!validarEmail(email)) {
        mostrarErrorCampo(form.email, 'errorEmail', CONFIG.mensajes.errorEmailInvalido);
        esValido = false;
    }
    
    // Validar contraseña
    const password = form.password.value;
    if (!password) {
        mostrarErrorCampo(form.password, 'errorPassword', 'La contraseña es obligatoria');
        esValido = false;
    }
    
    return esValido;
}

/**
 * Valida un campo individual
 * @param {HTMLInputElement} campo - Campo a validar
 */
function validarCampo(campo) {
    const valor = campo.value.trim();
    const nombre = campo.name;
    
    switch (nombre) {
        case 'email':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorEmail', 'El email es obligatorio');
            } else if (!validarEmail(valor)) {
                mostrarErrorCampo(campo, 'errorEmail', CONFIG.mensajes.errorEmailInvalido);
            } else {
                limpiarErrorCampo(campo);
            }
            break;
            
        case 'password':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorPassword', 'La contraseña es obligatoria');
            } else {
                limpiarErrorCampo(campo);
            }
            break;
    }
}

/**
 * Muestra error en un campo
 * @param {HTMLInputElement} campo - Campo con error
 * @param {string} errorId - ID del elemento de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarErrorCampo(campo, errorId, mensaje) {
    campo.classList.add('error');
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = mensaje;
    }
}

/**
 * Limpia el error de un campo
 * @param {HTMLInputElement} campo - Campo a limpiar
 */
function limpiarErrorCampo(campo) {
    campo.classList.remove('error');
    
    const nombre = campo.name;
    const errorId = 'error' + nombre.charAt(0).toUpperCase() + nombre.slice(1);
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

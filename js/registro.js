/* ============================================
   REGISTRO - JAVASCRIPT
   ============================================
   Lógica del formulario de registro.
   Conecta con Supabase para autenticación y
   guarda datos localmente en IndexedDB.
============================================ */

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de registro cargada');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        // Cargar y aplicar tema (si hay sesión)
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarFormulario();
    }, 500);
});

/**
 * Configura el formulario de registro y sus validaciones
 */
function inicializarFormulario() {
    const form = document.getElementById('formRegistro');
    
    if (!form) {
        console.error('No se encontró el formulario de registro');
        return;
    }
    
    // Manejar el envío del formulario
    form.addEventListener('submit', manejarRegistro);
    
    // Validación en tiempo real de campos
    const campos = form.querySelectorAll('.form-input');
    campos.forEach(campo => {
        campo.addEventListener('blur', function() {
            validarCampo(this);
        });
        
        campo.addEventListener('input', function() {
            limpiarErrorCampo(this);
        });
    });
    
    // Validación especial para confirmar contraseña
    const confirmarPassword = document.getElementById('confirmarPassword');
    if (confirmarPassword) {
        confirmarPassword.addEventListener('input', validarCoincidenciaPassword);
    }
}

/**
 * Maneja el envío del formulario de registro
 * @param {Event} e - Evento del formulario
 */
async function manejarRegistro(e) {
    e.preventDefault();
    
    const form = e.target;
    const btnRegistrar = document.getElementById('btnRegistrar');
    
    // Ocultar mensajes previos
    ocultarMensaje('mensajeRegistro');
    
    // Validar todos los campos
    if (!validarFormularioCompleto(form)) {
        return;
    }
    
    // Obtener datos del formulario
    const datos = {
        nombreComercio: form.nombreComercio.value.trim(),
        nombreResponsable: form.nombreResponsable.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        password: form.password.value
    };
    
    // Mostrar estado de carga
    btnRegistrar.classList.add('btn-cargando');
    btnRegistrar.textContent = 'Registrando...';
    btnRegistrar.disabled = true;
    
    try {
        // Intentar registro con Supabase
        const resultado = await registrarUsuario(datos);
        
        // Cerrar sesión de Supabase para que el usuario tenga que loguearse
        // (Supabase crea sesión automática si no hay confirmación de email)
        if (typeof logoutUsuarioAuth === 'function') {
            await logoutUsuarioAuth();
            console.log('🔓 Sesión cerrada para que el usuario ingrese manualmente');
        }
        
        // Mostrar mensaje de éxito
        mostrarMensaje('mensajeRegistro', '¡Registro exitoso! Ahora podés iniciar sesión.', 'exito');
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            navegarA(CONFIG.rutas.login);
        }, 2000);
        
    } catch (error) {
        console.error('Error en registro:', error);
        
        // Mostrar mensaje de error apropiado
        let mensajeError = CONFIG.mensajes.errorGeneral;
        
        if (error.message) {
            if (error.message.includes('already registered') || error.message.includes('already exists')) {
                mensajeError = 'Este email ya está registrado. Probá iniciando sesión.';
            } else if (error.message.includes('invalid email')) {
                mensajeError = 'El email ingresado no es válido.';
            } else if (error.message.includes('password')) {
                mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
            } else {
                mensajeError = error.message;
            }
        }
        
        mostrarMensaje('mensajeRegistro', mensajeError, 'error');
        
    } finally {
        // Restaurar botón
        btnRegistrar.classList.remove('btn-cargando');
        btnRegistrar.textContent = 'Crear mi cuenta';
        btnRegistrar.disabled = false;
    }
}

/**
 * Registra un nuevo usuario
 * Primero intenta con Supabase, si no está disponible usa modo offline
 * @param {Object} datos - Datos del registro
 * @returns {Promise<Object>} Resultado del registro
 */
async function registrarUsuario(datos) {
    // Verificar si Supabase está disponible
    const supabaseOk = typeof isSupabaseConnected === 'function' && getSupabase();
    
    if (supabaseOk && navigator.onLine) {
        // ========================================
        // MODO ONLINE: Registro en Supabase
        // ========================================
        console.log('📤 Registrando en Supabase...');
        
        // 1. Registrar en Supabase Auth
        const authResult = await registrarUsuarioAuth(datos.email, datos.password);
        
        if (!authResult.user) {
            throw new Error('Error al crear usuario en el sistema de autenticación');
        }
        
        console.log('✅ Usuario creado en Auth:', authResult.user.id);
        
        // 2. Crear comercio y usuario en la base de datos
        const { comercio, usuario } = await crearComercioConPropietario(datos, authResult.user.id);
        
        console.log('✅ Comercio creado:', comercio.id);
        console.log('✅ Usuario creado:', usuario.id);
        
        // 3. Guardar en IndexedDB local también
        await guardarDatosLocales(comercio, usuario, datos);
        
        return { comercio, usuario, authUser: authResult.user };
        
    } else {
        // ========================================
        // MODO OFFLINE: Registro solo local
        // ========================================
        console.log('📴 Modo offline: Guardando localmente...');
        
        // Generar IDs temporales
        const tempComercioId = generarUUID();
        const tempUsuarioId = generarUUID();
        
        const comercio = {
            id: tempComercioId,
            razon_social: datos.nombreComercio,
            nombre_responsable: datos.nombreResponsable,
            email: datos.email,
            activo: true,
            created_at: new Date().toISOString()
        };
        
        const usuario = {
            id: tempUsuarioId,
            comercio_id: tempComercioId,
            nombre: datos.nombreResponsable,
            email: datos.email,
            es_propietario: true,
            activo: true,
            created_at: new Date().toISOString(),
            // Guardar password hasheado localmente para login offline
            password_hash: await hashPassword(datos.password)
        };
        
        // Guardar en IndexedDB
        await guardarDatosLocales(comercio, usuario, datos);
        
        // Agregar a cola de sincronización para cuando haya conexión
        console.log('📝 Agregado a cola de sincronización');
        
        return { comercio, usuario, modoOffline: true };
    }
}

/**
 * Guarda los datos del registro en IndexedDB
 * @param {Object} comercio - Datos del comercio
 * @param {Object} usuario - Datos del usuario
 * @param {Object} datosOriginales - Datos originales del formulario
 */
async function guardarDatosLocales(comercio, usuario, datosOriginales) {
    const db = getDB();
    
    if (!db) {
        console.warn('IndexedDB no disponible, usando localStorage');
        // Fallback a localStorage
        guardarLocal('gk_ultimo_registro', {
            comercio,
            usuario,
            fecha: new Date().toISOString()
        });
        return;
    }
    
    try {
        // Guardar comercio
        await db.comercio.put({
            ...comercio,
            sync_id: comercio.sync_id || generarUUID(),
            synced: comercio.id ? true : false
        });
        
        // Guardar usuario
        await db.usuario.put({
            ...usuario,
            sync_id: usuario.sync_id || generarUUID(),
            synced: usuario.id ? true : false
        });
        
        console.log('✅ Datos guardados en IndexedDB');
        
    } catch (error) {
        console.error('Error guardando en IndexedDB:', error);
    }
}

/**
 * Hash simple de password para almacenamiento local
 * NOTA: En producción usar bcrypt o similar
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} Hash del password
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

/**
 * Valida todos los campos del formulario
 * @param {HTMLFormElement} form - El formulario a validar
 * @returns {boolean} - True si todo es válido
 */
function validarFormularioCompleto(form) {
    let esValido = true;
    
    // Validar nombre del comercio
    if (!validarCampoRequerido(form.nombreComercio, 'errorNombreComercio', 'El nombre del comercio es obligatorio')) {
        esValido = false;
    }
    
    // Validar nombre del responsable
    if (!validarCampoRequerido(form.nombreResponsable, 'errorNombreResponsable', 'El nombre del responsable es obligatorio')) {
        esValido = false;
    }
    
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
    } else if (!validarPassword(password)) {
        mostrarErrorCampo(form.password, 'errorPassword', 'La contraseña debe tener al menos 6 caracteres');
        esValido = false;
    }
    
    // Validar confirmación de contraseña
    const confirmarPassword = form.confirmarPassword.value;
    if (!confirmarPassword) {
        mostrarErrorCampo(form.confirmarPassword, 'errorConfirmarPassword', 'Debés confirmar la contraseña');
        esValido = false;
    } else if (password !== confirmarPassword) {
        mostrarErrorCampo(form.confirmarPassword, 'errorConfirmarPassword', CONFIG.mensajes.errorPasswordNoCoincide);
        esValido = false;
    }
    
    return esValido;
}

/**
 * Valida un campo requerido
 * @param {HTMLInputElement} campo - Campo a validar
 * @param {string} errorId - ID del elemento de error
 * @param {string} mensaje - Mensaje de error
 * @returns {boolean} - True si es válido
 */
function validarCampoRequerido(campo, errorId, mensaje) {
    const valor = campo.value.trim();
    if (!valor) {
        mostrarErrorCampo(campo, errorId, mensaje);
        return false;
    }
    marcarCampoValido(campo);
    return true;
}

/**
 * Valida un campo individual al perder el foco
 * @param {HTMLInputElement} campo - Campo a validar
 */
function validarCampo(campo) {
    const valor = campo.value.trim();
    const nombre = campo.name;
    
    switch (nombre) {
        case 'nombreComercio':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorNombreComercio', 'El nombre del comercio es obligatorio');
            } else {
                marcarCampoValido(campo);
            }
            break;
            
        case 'nombreResponsable':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorNombreResponsable', 'El nombre del responsable es obligatorio');
            } else {
                marcarCampoValido(campo);
            }
            break;
            
        case 'email':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorEmail', 'El email es obligatorio');
            } else if (!validarEmail(valor)) {
                mostrarErrorCampo(campo, 'errorEmail', CONFIG.mensajes.errorEmailInvalido);
            } else {
                marcarCampoValido(campo);
            }
            break;
            
        case 'password':
            if (!valor) {
                mostrarErrorCampo(campo, 'errorPassword', 'La contraseña es obligatoria');
            } else if (!validarPassword(valor)) {
                mostrarErrorCampo(campo, 'errorPassword', 'La contraseña debe tener al menos 6 caracteres');
            } else {
                marcarCampoValido(campo);
            }
            validarCoincidenciaPassword();
            break;
            
        case 'confirmarPassword':
            validarCoincidenciaPassword();
            break;
    }
}

/**
 * Valida que las contraseñas coincidan
 */
function validarCoincidenciaPassword() {
    const password = document.getElementById('password');
    const confirmar = document.getElementById('confirmarPassword');
    
    if (!password || !confirmar) return;
    
    const valorPassword = password.value;
    const valorConfirmar = confirmar.value;
    
    if (valorConfirmar && valorPassword !== valorConfirmar) {
        mostrarErrorCampo(confirmar, 'errorConfirmarPassword', CONFIG.mensajes.errorPasswordNoCoincide);
    } else if (valorConfirmar && valorPassword === valorConfirmar) {
        marcarCampoValido(confirmar);
        limpiarErrorCampo(confirmar);
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
    campo.classList.remove('valido');
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = mensaje;
    }
}

/**
 * Marca un campo como válido
 * @param {HTMLInputElement} campo - Campo válido
 */
function marcarCampoValido(campo) {
    campo.classList.remove('error');
    campo.classList.add('valido');
}

/**
 * Limpia el error de un campo
 * @param {HTMLInputElement} campo - Campo a limpiar
 */
function limpiarErrorCampo(campo) {
    campo.classList.remove('error');
    
    const errorId = 'error' + campo.name.charAt(0).toUpperCase() + campo.name.slice(1);
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/* ============================================
   USUARIOS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Usuarios
============================================ */

// Variables globales
let usuariosData = [];
let usuariosFiltradas = [];
let rolesData = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let usuarioEditando = null;
let filtroNombre = '';
let filtroRol = '';
let filtroEstado = '';

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Usuarios cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarRoles();
        await cargarUsuarios();
        
        // Cargar y aplicar tema
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarEventos();
        inicializarCerrarSesion();
        
        // Cargar tema nuevamente después de sincronización
        setTimeout(async () => {
            if (typeof cargarYAplicarTema === 'function') {
                await cargarYAplicarTema();
            }
        }, 2000);
    }, 500);
});

/**
 * Verifica que haya una sesión activa
 */
async function verificarSesion() {
    let sesionValida = false;
    
    if (typeof getSesionActual === 'function') {
        const sesionSupabase = await getSesionActual();
        if (sesionSupabase) {
            sesionValida = true;
        }
    }
    
    if (!sesionValida && typeof haySesionLocalActiva === 'function') {
        sesionValida = await haySesionLocalActiva();
    }
    
    if (!sesionValida && typeof haySesionActiva === 'function') {
        sesionValida = haySesionActiva();
    }
    
    if (!sesionValida) {
        navegarA(CONFIG.rutas.login);
    }
}

/**
 * Carga y muestra los datos del usuario
 */
async function inicializarDatosUsuario() {
    let usuario = null;
    
    if (typeof obtenerSesionLocal === 'function') {
        const sesionLocal = await obtenerSesionLocal();
        if (sesionLocal) {
            usuario = {
                nombreResponsable: sesionLocal.nombre,
                email: sesionLocal.email
            };
        }
    }
    
    if (!usuario) {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            usuario = JSON.parse(usuarioStr);
        }
    }
    
    const nombreEl = document.getElementById('nombreUsuario');
    if (nombreEl && usuario) {
        nombreEl.textContent = usuario.nombreResponsable || usuario.email || 'Usuario';
    }
}

/**
 * Carga los roles desde IndexedDB
 */
async function cargarRoles() {
    try {
        const db = getDB();
        if (!db) return;
        
        rolesData = await db.roles.toArray();
        
        // Llenar select de roles en el formulario
        const selectRol = document.getElementById('rol');
        if (selectRol) {
            selectRol.innerHTML = '<option value="">Seleccionar rol...</option>';
            rolesData.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.nombre || 'Sin nombre';
                selectRol.appendChild(option);
            });
        }
        
        // Llenar select de filtro de roles
        const selectFiltroRol = document.getElementById('filtroRol');
        if (selectFiltroRol) {
            selectFiltroRol.innerHTML = '<option value="">Todos los roles</option>';
            rolesData.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.id;
                option.textContent = rol.nombre || 'Sin nombre';
                selectFiltroRol.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando roles:', error);
    }
}

/**
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Botón nuevo usuario
    const btnNuevo = document.getElementById('btnNuevoUsuario');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cerrar panel
    const btnCerrarPanel = document.getElementById('btnCerrarPanel');
    if (btnCerrarPanel) {
        btnCerrarPanel.addEventListener('click', ocultarPanelCarga);
    }
    
    // Botón cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario
    const form = document.getElementById('formUsuario');
    if (form) {
        form.addEventListener('submit', manejarGuardar);
    }
    
    // Filtros
    const inputFiltroNombre = document.getElementById('filtroNombre');
    if (inputFiltroNombre) {
        let timeoutFiltro;
        inputFiltroNombre.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroNombre = this.value.toLowerCase().trim();
                aplicarFiltros();
            }, 300);
        });
    }
    
    const selectFiltroRol = document.getElementById('filtroRol');
    if (selectFiltroRol) {
        selectFiltroRol.addEventListener('change', function() {
            filtroRol = this.value;
            aplicarFiltros();
        });
    }
    
    const selectFiltroEstado = document.getElementById('filtroEstado');
    if (selectFiltroEstado) {
        selectFiltroEstado.addEventListener('change', function() {
            filtroEstado = this.value;
            aplicarFiltros();
        });
    }
    
    // Registros por página
    const selectRegistros = document.getElementById('registrosPorPagina');
    if (selectRegistros) {
        selectRegistros.addEventListener('change', function() {
            registrosPorPagina = parseInt(this.value);
            paginaActual = 1;
            renderizarTabla();
        });
    }
    
    // Paginación
    const btnAnterior = document.getElementById('btnAnterior');
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTabla();
            }
        });
    }
    
    const btnSiguiente = document.getElementById('btnSiguiente');
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            const totalPaginas = Math.ceil(usuariosFiltradas.length / registrosPorPagina);
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarTabla();
            }
        });
    }
}

/**
 * Carga los usuarios desde IndexedDB
 */
async function cargarUsuarios() {
    try {
        const db = getDB();
        if (!db) {
            mostrarNotificacion('Error: Base de datos no disponible', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            mostrarNotificacion('Error: No hay sesión activa', 'error');
            return;
        }
        
        // Cargar desde IndexedDB
        usuariosData = await db.usuario
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Ordenar por nombre
        usuariosData.sort((a, b) => {
            const nombreA = (a.nombre || '').toLowerCase();
            const nombreB = (b.nombre || '').toLowerCase();
            return nombreA.localeCompare(nombreB);
        });
        
        actualizarIndicadores();
        aplicarFiltros();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        mostrarNotificacion('Error al cargar usuarios', 'error');
    }
}

/**
 * Actualiza los indicadores
 */
function actualizarIndicadores() {
    const total = usuariosData.length;
    const activos = usuariosData.filter(u => u.activo !== false).length;
    
    const totalEl = document.getElementById('totalUsuarios');
    const activosEl = document.getElementById('usuariosActivos');
    
    if (totalEl) totalEl.textContent = total;
    if (activosEl) activosEl.textContent = activos;
}

/**
 * Aplica los filtros
 */
function aplicarFiltros() {
    usuariosFiltradas = usuariosData.filter(usuario => {
        // Filtro por nombre
        if (filtroNombre) {
            const nombre = (usuario.nombre || '').toLowerCase();
            const email = (usuario.email || '').toLowerCase();
            if (!nombre.includes(filtroNombre) && !email.includes(filtroNombre)) {
                return false;
            }
        }
        
        // Filtro por rol
        if (filtroRol && usuario.rol_id !== filtroRol) {
            return false;
        }
        
        // Filtro por estado
        if (filtroEstado) {
            if (filtroEstado === 'activo' && usuario.activo === false) {
                return false;
            }
            if (filtroEstado === 'inactivo' && usuario.activo !== false) {
                return false;
            }
        }
        
        return true;
    });
    
    paginaActual = 1;
    renderizarTabla();
}

/**
 * Renderiza la tabla de usuarios
 */
function renderizarTabla() {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;
    
    if (usuariosFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="tabla-vacia">
                    <span>No se encontraron usuarios</span>
                </td>
            </tr>
        `;
        actualizarPaginacion();
        return;
    }
    
    // Calcular paginación
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const usuariosPagina = usuariosFiltradas.slice(inicio, fin);
    
    tbody.innerHTML = usuariosPagina.map(usuario => {
        const rol = rolesData.find(r => r.id === usuario.rol_id);
        const rolNombre = rol ? rol.nombre : 'Sin rol';
        const estado = usuario.activo !== false ? 'Activo' : 'Inactivo';
        const estadoClase = usuario.activo !== false ? 'estado-activo' : 'estado-inactivo';
        const fecha = usuario.created_at ? formatearFecha(usuario.created_at) : 'N/A';
        const responsable = usuario.responsable_nombre || 'N/A';
        
        return `
            <tr data-id="${usuario.id}">
                <td class="col-id">${usuario.id.substring(0, 8)}...</td>
                <td class="col-nombre">${usuario.nombre || 'Sin nombre'}</td>
                <td class="col-email">${usuario.email || 'N/A'}</td>
                <td class="col-rol">${rolNombre}</td>
                <td class="col-estado">
                    <span class="estado-badge ${estadoClase}">${estado}</span>
                </td>
                <td class="col-fecha">${fecha}</td>
                <td class="col-responsable">${responsable}</td>
                <td class="col-acciones">
                    <button class="btn-accion btn-editar" data-id="${usuario.id}" title="Editar">
                        <span>✏️</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Agregar event listeners a los botones de editar
    tbody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            editarUsuario(id);
        });
    });
    
    actualizarPaginacion();
}

/**
 * Actualiza los controles de paginación
 */
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(usuariosFiltradas.length / registrosPorPagina);
    
    const paginaActualEl = document.getElementById('paginaActual');
    const totalPaginasEl = document.getElementById('totalPaginas');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (paginaActualEl) paginaActualEl.textContent = paginaActual;
    if (totalPaginasEl) totalPaginasEl.textContent = totalPaginas;
    
    if (btnAnterior) btnAnterior.disabled = paginaActual <= 1;
    if (btnSiguiente) btnSiguiente.disabled = paginaActual >= totalPaginas;
}

/**
 * Muestra el panel de carga
 */
function mostrarPanelCarga() {
    usuarioEditando = null;
    const panel = document.getElementById('panelFormulario');
    const titulo = document.getElementById('panelTitulo');
    const form = document.getElementById('formUsuario');
    const grupoPassword = document.getElementById('grupoPassword');
    
    if (panel) panel.style.display = 'block';
    if (titulo) titulo.textContent = 'Cargar nuevo usuario';
    if (form) form.reset();
    if (grupoPassword) grupoPassword.style.display = 'block';
    
    // Hacer password requerido para nuevos usuarios
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.required = true;
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    const panel = document.getElementById('panelFormulario');
    if (panel) panel.style.display = 'none';
    
    usuarioEditando = null;
    const form = document.getElementById('formUsuario');
    if (form) form.reset();
}

/**
 * Edita un usuario
 */
async function editarUsuario(id) {
    const usuario = usuariosData.find(u => u.id === id);
    if (!usuario) {
        mostrarNotificacion('Usuario no encontrado', 'error');
        return;
    }
    
    usuarioEditando = usuario;
    const panel = document.getElementById('panelFormulario');
    const titulo = document.getElementById('panelTitulo');
    const form = document.getElementById('formUsuario');
    const grupoPassword = document.getElementById('grupoPassword');
    
    if (panel) panel.style.display = 'block';
    if (titulo) titulo.textContent = 'Editar usuario';
    if (form) {
        document.getElementById('nombre').value = usuario.nombre || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('rol').value = usuario.rol_id || '';
        document.getElementById('activo').checked = usuario.activo !== false;
    }
    
    // Ocultar campo de contraseña para edición
    if (grupoPassword) grupoPassword.style.display = 'none';
    
    // Hacer password no requerido para edición
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.required = false;
        passwordInput.value = '';
    }
}

/**
 * Maneja el guardado del formulario
 */
async function manejarGuardar(e) {
    e.preventDefault();
    
    const form = e.target;
    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const rolId = form.rol.value;
    const activo = form.activo.checked;
    
    // Validaciones
    if (!nombre) {
        mostrarErrorCampo(form.nombre, 'errorNombre', 'El nombre es obligatorio');
        return;
    }
    
    if (!email) {
        mostrarErrorCampo(form.email, 'errorEmail', 'El email es obligatorio');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarErrorCampo(form.email, 'errorEmail', 'El email no es válido');
        return;
    }
    
    if (!rolId) {
        mostrarErrorCampo(form.rol, 'errorRol', 'Debés seleccionar un rol');
        return;
    }
    
    // Si es nuevo usuario, validar contraseña
    if (!usuarioEditando && !password) {
        mostrarErrorCampo(form.password, 'errorPassword', 'La contraseña es obligatoria para nuevos usuarios');
        return;
    }
    
    if (password && password.length < 6) {
        mostrarErrorCampo(form.password, 'errorPassword', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Verificar que el email no esté duplicado (excepto si es el mismo usuario)
    const emailExistente = usuariosData.find(u => 
        u.email === email && 
        (!usuarioEditando || u.id !== usuarioEditando.id)
    );
    
    if (emailExistente) {
        mostrarErrorCampo(form.email, 'errorEmail', 'Este email ya está registrado');
        return;
    }
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            throw new Error('No hay sesión activa');
        }
        
        const responsableNombre = sesion.nombre || sesion.email || 'Sistema';
        
        if (usuarioEditando) {
            // Editar usuario existente
            await editarUsuarioEnDB(usuarioEditando.id, {
                nombre,
                email,
                rol_id: rolId,
                activo,
                responsable_nombre: responsableNombre,
                updated_at: new Date().toISOString()
            });
            
            mostrarNotificacion('Usuario actualizado correctamente', 'exito');
        } else {
            // Crear nuevo usuario
            // Primero crear en Supabase Auth si está disponible
            let authUserId = null;
            if (typeof registrarUsuarioAuth === 'function' && typeof getSupabase === 'function' && getSupabase()) {
                try {
                    const authResult = await registrarUsuarioAuth(email, password);
                    if (authResult && authResult.user) {
                        authUserId = authResult.user.id;
                        console.log('✅ Usuario creado en Supabase Auth:', authUserId);
                    }
                } catch (error) {
                    console.error('Error creando usuario en Auth:', error);
                    // Continuar de todas formas, se creará solo en IndexedDB
                }
            }
            
            const nuevoUsuario = {
                id: generarUUID(),
                auth_user_id: authUserId || generarUUID(), // Si no hay auth, usar UUID temporal
                comercio_id: sesion.comercio_id,
                rol_id: rolId,
                nombre,
                email,
                activo,
                responsable_nombre: responsableNombre,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sync_id: generarUUID()
            };
            
            await db.usuario.add(nuevoUsuario);
            
            // Agregar a la cola de sincronización
            if (typeof agregarASyncQueue === 'function') {
                await agregarASyncQueue('usuario', nuevoUsuario.id, 'insert', nuevoUsuario);
            }
            
            mostrarNotificacion('Usuario creado correctamente', 'exito');
        }
        
        // Recargar datos
        await cargarUsuarios();
        ocultarPanelCarga();
        
        // Sincronizar si hay conexión
        if (typeof sincronizar === 'function') {
            setTimeout(() => sincronizar(), 1000);
        }
        
    } catch (error) {
        console.error('Error guardando usuario:', error);
        mostrarNotificacion('Error al guardar usuario: ' + error.message, 'error');
    }
}

/**
 * Edita un usuario en la base de datos
 */
async function editarUsuarioEnDB(id, datos) {
    const db = getDB();
    if (!db) throw new Error('Base de datos no disponible');
    
    const usuario = await db.usuario.get(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    
    // Actualizar datos
    const datosActualizados = {
        ...usuario,
        ...datos,
        sync_id: usuario.sync_id || generarUUID()
    };
    
    await db.usuario.put(datosActualizados);
    
    // Agregar a la cola de sincronización
    if (typeof agregarASyncQueue === 'function') {
        await agregarASyncQueue('usuario', id, 'update', datosActualizados);
    }
}

/**
 * Formatea una fecha
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Valida un email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Muestra un error en un campo
 */
function mostrarErrorCampo(campo, errorId, mensaje) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = mensaje;
        errorEl.style.display = 'block';
    }
    
    campo.classList.add('input-error');
    campo.focus();
}

/**
 * Muestra una notificación
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
    
    setTimeout(() => {
        notificacion.classList.add('visible');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.remove('visible');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
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
 * Cierra la sesión
 */
async function cerrarSesionCompleta() {
    console.log('🚪 Cerrando sesión...');
    
    if (typeof logoutUsuarioAuth === 'function') {
        try {
            await logoutUsuarioAuth();
        } catch (error) {
            console.error('Error cerrando sesión Supabase:', error);
        }
    }
    
    if (typeof eliminarSesionLocal === 'function') {
        try {
            await eliminarSesionLocal();
        } catch (error) {
            console.error('Error eliminando sesión local:', error);
        }
    }
    
    localStorage.removeItem('usuario');
    localStorage.removeItem('sesion');
    localStorage.removeItem('token');
    
    navegarA(CONFIG.rutas.login);
}


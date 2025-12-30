/* ============================================
   PROVEEDORES - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Proveedores
============================================ */

// Variables globales
let proveedoresData = [];
let proveedoresFiltrados = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let proveedorEditando = null;
let filtroNombre = '';

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Proveedores cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarProveedores();
        
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
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Botón nuevo proveedor
    const btnNuevo = document.getElementById('btnNuevoProveedor');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario
    const form = document.getElementById('formProveedor');
    if (form) {
        form.addEventListener('submit', manejarGuardar);
    }
    
    // Filtro nombre (tipo Excel)
    const filterNombre = document.getElementById('filterNombre');
    if (filterNombre) {
        let timeoutFiltro;
        filterNombre.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroNombre = this.value.toLowerCase().trim();
                aplicarFiltros();
            }, 300);
        });
        
        // Navegación con flechas y Enter
        filterNombre.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                // Navegar por resultados filtrados
                const resultados = document.querySelectorAll('#tbodyProveedores tr');
                if (resultados.length > 0) {
                    const index = Array.from(resultados).findIndex(tr => tr.classList.contains('highlighted'));
                    let nuevoIndex = index;
                    
                    if (e.key === 'ArrowDown') {
                        nuevoIndex = index < resultados.length - 1 ? index + 1 : 0;
                    } else {
                        nuevoIndex = index > 0 ? index - 1 : resultados.length - 1;
                    }
                    
                    resultados.forEach(tr => tr.classList.remove('highlighted'));
                    if (nuevoIndex >= 0) {
                        resultados[nuevoIndex].classList.add('highlighted');
                        resultados[nuevoIndex].scrollIntoView({ block: 'nearest' });
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const highlighted = document.querySelector('#tbodyProveedores tr.highlighted');
                if (highlighted) {
                    const id = highlighted.dataset.id;
                    editarProveedor(id);
                }
            }
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
}

/**
 * Carga los proveedores desde IndexedDB
 */
async function cargarProveedores() {
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
        proveedoresData = await db.proveedores
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Ordenar por updated_at descendente (más recientes primero)
        proveedoresData.sort((a, b) => {
            const fechaA = new Date(a.updated_at || a.created_at || 0);
            const fechaB = new Date(b.updated_at || b.created_at || 0);
            return fechaB - fechaA;
        });
        
        proveedoresFiltrados = [...proveedoresData];
        
        actualizarIndicadores();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error cargando proveedores:', error);
        mostrarNotificacion('Error al cargar proveedores', 'error');
    }
}

/**
 * Actualiza los indicadores superiores
 */
function actualizarIndicadores() {
    const totalEl = document.getElementById('totalProveedores');
    if (totalEl) {
        totalEl.textContent = proveedoresData.length;
    }
    
    // Calcular deuda total
    const totalDeuda = proveedoresData.reduce((suma, proveedor) => {
        const deuda = parseFloat(proveedor.saldo_pendiente || 0);
        return suma + (isNaN(deuda) ? 0 : deuda);
    }, 0);
    
    const deudaEl = document.getElementById('totalDeuda');
    if (deudaEl) {
        deudaEl.textContent = formatearPrecio(totalDeuda);
    }
}

/**
 * Aplica los filtros y renderiza la tabla
 */
function aplicarFiltros() {
    proveedoresFiltrados = proveedoresData.filter(proveedor => {
        // Filtro por nombre
        if (filtroNombre) {
            const nombreMatch = proveedor.nombre?.toLowerCase().includes(filtroNombre);
            if (!nombreMatch) return false;
        }
        
        return true;
    });
    
    paginaActual = 1;
    renderizarTabla();
}

/**
 * Renderiza la tabla con paginación
 */
function renderizarTabla() {
    const tbody = document.getElementById('tbodyProveedores');
    if (!tbody) return;
    
    // Calcular paginación
    const totalRegistros = proveedoresFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = proveedoresFiltrados.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (registrosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: var(--espaciado-xl); color: var(--color-texto-secundario);">
                    ${filtroNombre ? 'No se encontraron proveedores con ese nombre' : 'No hay proveedores cargados'}
                </td>
            </tr>
        `;
    } else {
        registrosPagina.forEach(proveedor => {
            const tr = document.createElement('tr');
            tr.dataset.id = proveedor.id;
            
            const fecha = proveedor.updated_at || proveedor.created_at || new Date().toISOString();
            const fechaFormateada = formatearFecha(fecha);
            const estado = proveedor.activo !== false ? 'Activa' : 'Inactiva';
            const estadoClass = proveedor.activo !== false ? 'activa' : 'inactiva';
            const deuda = parseFloat(proveedor.saldo_pendiente || 0);
            const deudaClass = deuda > 0 ? 'con-deuda' : 'sin-deuda';
            
            tr.innerHTML = `
                <td>${proveedor.id.substring(0, 8)}...</td>
                <td>${escapeHtml(proveedor.nombre || '')}</td>
                <td>${escapeHtml(proveedor.contacto_nombre || 'N/A')}</td>
                <td>${escapeHtml(proveedor.telefono || 'N/A')}</td>
                <td>
                    <span class="deuda-valor ${deudaClass}">
                        ${formatearPrecio(deuda)}
                    </span>
                </td>
                <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                <td>${fechaFormateada}</td>
                <td>${escapeHtml(proveedor.responsable_nombre || 'N/A')}</td>
                <td class="acciones-cell">
                    <button class="btn-accion editar" onclick="editarProveedor('${proveedor.id}')" title="Editar">
                        ✏️ Editar
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    }
    
    renderizarPaginacion(totalPaginas, totalRegistros);
}

/**
 * Renderiza los controles de paginación
 */
function renderizarPaginacion(totalPaginas, totalRegistros) {
    const paginacion = document.getElementById('paginacion');
    if (!paginacion) return;
    
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    
    let html = `
        <div class="paginacion-info">
            Mostrando ${inicio} - ${fin} de ${totalRegistros} proveedores
        </div>
        <div class="paginacion-controls">
    `;
    
    // Botón anterior
    html += `
        <button class="btn-pagina" onclick="cambiarPagina(${paginaActual - 1})" 
                ${paginaActual === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;
    
    // Números de página
    const maxBotones = 5;
    let inicioPaginas = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let finPaginas = Math.min(totalPaginas, inicioPaginas + maxBotones - 1);
    
    if (finPaginas - inicioPaginas < maxBotones - 1) {
        inicioPaginas = Math.max(1, finPaginas - maxBotones + 1);
    }
    
    if (inicioPaginas > 1) {
        html += `<button class="btn-pagina" onclick="cambiarPagina(1)">1</button>`;
        if (inicioPaginas > 2) {
            html += `<span style="padding: 0 var(--espaciado-xs);">...</span>`;
        }
    }
    
    for (let i = inicioPaginas; i <= finPaginas; i++) {
        html += `
            <button class="btn-pagina ${i === paginaActual ? 'activa' : ''}" 
                    onclick="cambiarPagina(${i})">
                ${i}
            </button>
        `;
    }
    
    if (finPaginas < totalPaginas) {
        if (finPaginas < totalPaginas - 1) {
            html += `<span style="padding: 0 var(--espaciado-xs);">...</span>`;
        }
        html += `<button class="btn-pagina" onclick="cambiarPagina(${totalPaginas})">${totalPaginas}</button>`;
    }
    
    // Botón siguiente
    html += `
        <button class="btn-pagina" onclick="cambiarPagina(${paginaActual + 1})" 
                ${paginaActual === totalPaginas ? 'disabled' : ''}>
            →
        </button>
    `;
    
    html += `</div>`;
    paginacion.innerHTML = html;
}

/**
 * Cambia de página
 */
function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(proveedoresFiltrados.length / registrosPorPagina);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTabla();
        // Scroll al inicio de la tabla
        document.querySelector('.tabla-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Muestra el panel de carga
 */
function mostrarPanelCarga() {
    const panel = document.getElementById('panelCarga');
    const form = document.getElementById('formProveedor');
    const titulo = document.querySelector('.panel-titulo');
    
    if (panel && form) {
        proveedorEditando = null;
        form.reset();
        document.getElementById('errorNombre').classList.remove('visible');
        
        if (titulo) {
            titulo.textContent = 'Nuevo Proveedor';
        }
        
        panel.style.display = 'block';
        document.getElementById('nombreProveedor').focus();
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    const panel = document.getElementById('panelCarga');
    if (panel) {
        panel.style.display = 'none';
        proveedorEditando = null;
        const form = document.getElementById('formProveedor');
        if (form) {
            form.reset();
            document.getElementById('errorNombre').classList.remove('visible');
        }
    }
}

/**
 * Maneja el guardado del proveedor
 */
async function manejarGuardar(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreProveedor').value.trim();
    const razonSocial = document.getElementById('razonSocial').value.trim();
    const cuit = document.getElementById('cuit').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const contactoNombre = document.getElementById('contactoNombre').value.trim();
    const especificaciones = document.getElementById('especificaciones').value.trim();
    const errorNombre = document.getElementById('errorNombre');
    
    // Validaciones
    if (!nombre) {
        errorNombre.textContent = 'El nombre es obligatorio';
        errorNombre.classList.add('visible');
        document.getElementById('nombreProveedor').focus();
        return;
    }
    
    errorNombre.classList.remove('visible');
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            throw new Error('No hay sesión activa');
        }
        
        // Obtener nombre del responsable
        const responsableNombre = sesion.nombre || sesion.email || 'Usuario';
        
        if (proveedorEditando) {
            // Editar proveedor existente
            const cambios = {
                nombre: nombre,
                razon_social: razonSocial || null,
                cuit: cuit || null,
                telefono: telefono || null,
                email: email || null,
                direccion: direccion || null,
                contacto_nombre: contactoNombre || null,
                especificaciones: especificaciones || null,
                responsable_nombre: responsableNombre
            };
            
            await db.proveedores.update(proveedorEditando.id, {
                ...cambios,
                updated_at: new Date().toISOString(),
                synced: false
            });
            
            // Agregar a cola de sincronización
            const registroActualizado = await db.proveedores.get(proveedorEditando.id);
            if (typeof agregarAColaSincronizacion === 'function' && registroActualizado) {
                await agregarAColaSincronizacion('proveedores', proveedorEditando.id, 'update', registroActualizado);
            }
            
            mostrarNotificacion('Proveedor actualizado correctamente', 'exito');
        } else {
            // Crear nuevo proveedor
            const nuevoProveedor = {
                id: generarUUID(),
                comercio_id: sesion.comercio_id,
                nombre: nombre,
                razon_social: razonSocial || null,
                cuit: cuit || null,
                telefono: telefono || null,
                email: email || null,
                direccion: direccion || null,
                contacto_nombre: contactoNombre || null,
                saldo_pendiente: 0,
                especificaciones: especificaciones || null,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                responsable_nombre: responsableNombre,
                sync_id: generarUUID(),
                synced: false
            };
            
            await db.proveedores.add(nuevoProveedor);
            
            // Agregar a cola de sincronización
            if (typeof agregarAColaSincronizacion === 'function') {
                await agregarAColaSincronizacion('proveedores', nuevoProveedor.id, 'insert', nuevoProveedor);
            }
            
            mostrarNotificacion('Proveedor creado correctamente', 'exito');
        }
        
        ocultarPanelCarga();
        await cargarProveedores();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error guardando proveedor:', error);
        mostrarNotificacion('Error al guardar el proveedor: ' + error.message, 'error');
    }
}

/**
 * Edita un proveedor
 */
async function editarProveedor(id) {
    try {
        const db = getDB();
        if (!db) return;
        
        const proveedor = await db.proveedores.get(id);
        if (!proveedor) {
            mostrarNotificacion('Proveedor no encontrado', 'error');
            return;
        }
        
        proveedorEditando = proveedor;
        
        // Llenar formulario
        document.getElementById('nombreProveedor').value = proveedor.nombre || '';
        document.getElementById('razonSocial').value = proveedor.razon_social || '';
        document.getElementById('cuit').value = proveedor.cuit || '';
        document.getElementById('telefono').value = proveedor.telefono || '';
        document.getElementById('email').value = proveedor.email || '';
        document.getElementById('direccion').value = proveedor.direccion || '';
        document.getElementById('contactoNombre').value = proveedor.contacto_nombre || '';
        document.getElementById('especificaciones').value = proveedor.especificaciones || '';
        
        const titulo = document.querySelector('.panel-titulo');
        if (titulo) {
            titulo.textContent = 'Editar Proveedor';
        }
        
        // Mostrar panel
        const panel = document.getElementById('panelCarga');
        if (panel) {
            panel.style.display = 'block';
            document.getElementById('nombreProveedor').focus();
        }
        
    } catch (error) {
        console.error('Error editando proveedor:', error);
        mostrarNotificacion('Error al cargar el proveedor', 'error');
    }
}

/**
 * Formatea una fecha
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    const fecha = new Date(fechaISO);
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return fecha.toLocaleDateString('es-AR', opciones);
}

/**
 * Formatea un precio en pesos argentinos
 */
function formatearPrecio(precio) {
    if (isNaN(precio) || precio === null || precio === undefined) {
        return '$0,00';
    }
    
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(precio);
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Genera un UUID
 */
function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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

// Exportar funciones globales
window.cambiarPagina = cambiarPagina;
window.editarProveedor = editarProveedor;


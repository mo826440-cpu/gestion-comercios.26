/* ============================================
   CATEGORÍAS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Categorías
============================================ */

// Variables globales
let categoriasData = [];
let categoriasFiltradas = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let categoriaEditando = null;
let filtroNombre = '';

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Categorías cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarCategorias();
        
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
    // Botón nueva categoría
    const btnNueva = document.getElementById('btnNuevaCategoria');
    if (btnNueva) {
        btnNueva.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario
    const form = document.getElementById('formCategoria');
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
                const resultados = document.querySelectorAll('#tbodyCategorias tr');
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
                const highlighted = document.querySelector('#tbodyCategorias tr.highlighted');
                if (highlighted) {
                    const id = highlighted.dataset.id;
                    editarCategoria(id);
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
 * Carga las categorías desde IndexedDB
 */
async function cargarCategorias() {
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
        categoriasData = await db.categorias
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Ordenar por updated_at descendente (más recientes primero)
        categoriasData.sort((a, b) => {
            const fechaA = new Date(a.updated_at || a.created_at || 0);
            const fechaB = new Date(b.updated_at || b.created_at || 0);
            return fechaB - fechaA;
        });
        
        categoriasFiltradas = [...categoriasData];
        
        actualizarIndicadores();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        mostrarNotificacion('Error al cargar categorías', 'error');
    }
}

/**
 * Actualiza los indicadores superiores
 */
function actualizarIndicadores() {
    const totalEl = document.getElementById('totalCategorias');
    if (totalEl) {
        totalEl.textContent = categoriasData.length;
    }
}

/**
 * Aplica los filtros y renderiza la tabla
 */
function aplicarFiltros() {
    categoriasFiltradas = categoriasData.filter(categoria => {
        // Filtro por nombre
        if (filtroNombre) {
            const nombreMatch = categoria.nombre?.toLowerCase().includes(filtroNombre);
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
    const tbody = document.getElementById('tbodyCategorias');
    if (!tbody) return;
    
    // Calcular paginación
    const totalRegistros = categoriasFiltradas.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = categoriasFiltradas.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (registrosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: var(--espaciado-xl); color: var(--color-texto-secundario);">
                    ${filtroNombre ? 'No se encontraron categorías con ese nombre' : 'No hay categorías cargadas'}
                </td>
            </tr>
        `;
    } else {
        registrosPagina.forEach(categoria => {
            const tr = document.createElement('tr');
            tr.dataset.id = categoria.id;
            
            const fecha = categoria.updated_at || categoria.created_at || new Date().toISOString();
            const fechaFormateada = formatearFecha(fecha);
            const estado = categoria.activo !== false ? 'Activa' : 'Inactiva';
            const estadoClass = categoria.activo !== false ? 'activa' : 'inactiva';
            
            tr.innerHTML = `
                <td>${categoria.id.substring(0, 8)}...</td>
                <td>${escapeHtml(categoria.nombre || '')}</td>
                <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                <td>${fechaFormateada}</td>
                <td>${escapeHtml(categoria.responsable_nombre || 'N/A')}</td>
                <td class="acciones-cell">
                    <button class="btn-accion editar" onclick="editarCategoria('${categoria.id}')" title="Editar">
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
            Mostrando ${inicio} - ${fin} de ${totalRegistros} categorías
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
    const totalPaginas = Math.ceil(categoriasFiltradas.length / registrosPorPagina);
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
    const form = document.getElementById('formCategoria');
    const titulo = document.querySelector('.panel-titulo');
    
    if (panel && form) {
        categoriaEditando = null;
        form.reset();
        document.getElementById('errorNombre').classList.remove('visible');
        
        if (titulo) {
            titulo.textContent = 'Nueva Categoría';
        }
        
        panel.style.display = 'block';
        document.getElementById('nombreCategoria').focus();
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    const panel = document.getElementById('panelCarga');
    if (panel) {
        panel.style.display = 'none';
        categoriaEditando = null;
        const form = document.getElementById('formCategoria');
        if (form) {
            form.reset();
            document.getElementById('errorNombre').classList.remove('visible');
        }
    }
}

/**
 * Maneja el guardado de la categoría
 */
async function manejarGuardar(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreCategoria').value.trim();
    const especificaciones = document.getElementById('especificaciones').value.trim();
    const errorNombre = document.getElementById('errorNombre');
    
    // Validaciones
    if (!nombre) {
        errorNombre.textContent = 'El nombre de categoría es obligatorio';
        errorNombre.classList.add('visible');
        document.getElementById('nombreCategoria').focus();
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
        
        if (categoriaEditando) {
            // Editar categoría existente
            const cambios = {
                nombre: nombre,
                especificaciones: especificaciones || null,
                responsable_nombre: responsableNombre
            };
            
            await db.categorias.update(categoriaEditando.id, {
                ...cambios,
                updated_at: new Date().toISOString(),
                synced: false
            });
            
            // Agregar a cola de sincronización
            const registroActualizado = await db.categorias.get(categoriaEditando.id);
            if (typeof agregarAColaSincronizacion === 'function' && registroActualizado) {
                await agregarAColaSincronizacion('categorias', categoriaEditando.id, 'update', registroActualizado);
            }
            
            mostrarNotificacion('Categoría actualizada correctamente', 'exito');
        } else {
            // Crear nueva categoría
            const nuevaCategoria = {
                id: generarUUID(),
                comercio_id: sesion.comercio_id,
                nombre: nombre,
                especificaciones: especificaciones || null,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                responsable_nombre: responsableNombre,
                sync_id: generarUUID(),
                synced: false
            };
            
            await db.categorias.add(nuevaCategoria);
            
            // Agregar a cola de sincronización
            if (typeof agregarAColaSincronizacion === 'function') {
                await agregarAColaSincronizacion('categorias', nuevaCategoria.id, 'insert', nuevaCategoria);
            }
            
            mostrarNotificacion('Categoría creada correctamente', 'exito');
        }
        
        ocultarPanelCarga();
        await cargarCategorias();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error guardando categoría:', error);
        mostrarNotificacion('Error al guardar la categoría: ' + error.message, 'error');
    }
}

/**
 * Edita una categoría
 */
async function editarCategoria(id) {
    try {
        const db = getDB();
        if (!db) return;
        
        const categoria = await db.categorias.get(id);
        if (!categoria) {
            mostrarNotificacion('Categoría no encontrada', 'error');
            return;
        }
        
        categoriaEditando = categoria;
        
        // Llenar formulario
        document.getElementById('nombreCategoria').value = categoria.nombre || '';
        document.getElementById('especificaciones').value = categoria.especificaciones || '';
        
        const titulo = document.querySelector('.panel-titulo');
        if (titulo) {
            titulo.textContent = 'Editar Categoría';
        }
        
        // Mostrar panel
        const panel = document.getElementById('panelCarga');
        if (panel) {
            panel.style.display = 'block';
            document.getElementById('nombreCategoria').focus();
        }
        
    } catch (error) {
        console.error('Error editando categoría:', error);
        mostrarNotificacion('Error al cargar la categoría', 'error');
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
window.editarCategoria = editarCategoria;


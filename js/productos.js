/* ============================================
   PRODUCTOS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Productos
============================================ */

// Variables globales
let productosData = [];
let productosFiltrados = [];
let categoriasData = [];
let marcasData = [];
let stockData = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let productoEditando = null;
let filtroNombre = '';
let filtroCodigoBarra = '';

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Productos cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarCategoriasYMarcas();
        await cargarProductos();
        
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
 * Carga categorías y marcas para los selects
 */
async function cargarCategoriasYMarcas() {
    try {
        const db = getDB();
        if (!db) return;
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) return;
        
        // Cargar categorías activas
        categoriasData = await db.categorias
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(cat => cat.activo !== false)
            .toArray();
        
        // Cargar marcas activas
        marcasData = await db.marcas
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(marca => marca.activo !== false)
            .toArray();
        
        // Llenar select de categorías
        const selectCategoria = document.getElementById('categoriaProducto');
        if (selectCategoria) {
            selectCategoria.innerHTML = '<option value="">Seleccionar categoría...</option>';
            categoriasData.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                selectCategoria.appendChild(option);
            });
        }
        
        // Llenar select de marcas
        const selectMarca = document.getElementById('marcaProducto');
        if (selectMarca) {
            selectMarca.innerHTML = '<option value="">Seleccionar marca...</option>';
            marcasData.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca.id;
                option.textContent = marca.nombre;
                selectMarca.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error cargando categorías y marcas:', error);
    }
}

/**
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Botón nuevo producto
    const btnNuevo = document.getElementById('btnNuevoProducto');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario
    const form = document.getElementById('formProducto');
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
                const resultados = document.querySelectorAll('#tbodyProductos tr');
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
                const highlighted = document.querySelector('#tbodyProductos tr.highlighted');
                if (highlighted) {
                    const id = highlighted.dataset.id;
                    editarProducto(id);
                }
            }
        });
    }
    
    // Filtro código de barras
    const filterCodigoBarra = document.getElementById('filterCodigoBarra');
    if (filterCodigoBarra) {
        let timeoutFiltro;
        filterCodigoBarra.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroCodigoBarra = this.value.toLowerCase().trim();
                aplicarFiltros();
            }, 300);
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
 * Carga los productos desde IndexedDB
 */
async function cargarProductos() {
    try {
        const db = getDB();
        if (!db) {
            mostrarNotificacion('Error: Base de datos no disponible', 'error');
            return;
        }
        
        // Verificar que la tabla productos existe
        if (!db.productos) {
            console.error('❌ La tabla productos no existe en IndexedDB. Versión de BD:', db.verno);
            mostrarNotificacion('Error: La base de datos necesita actualizarse. Por favor, recargá la página (F5) o limpiá el caché del navegador.', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            mostrarNotificacion('Error: No hay sesión activa', 'error');
            return;
        }
        
        // Cargar productos desde IndexedDB
        productosData = await db.productos
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Cargar stock
        stockData = await db.stock
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Crear mapa de stock por producto
        const stockMap = {};
        stockData.forEach(stock => {
            stockMap[stock.producto_id] = parseFloat(stock.cantidad || 0);
        });
        
        // Agregar stock a cada producto
        productosData.forEach(producto => {
            producto.stock = stockMap[producto.id] || 0;
        });
        
        // Ordenar por updated_at descendente (más recientes primero)
        productosData.sort((a, b) => {
            const fechaA = new Date(a.updated_at || a.created_at || 0);
            const fechaB = new Date(b.updated_at || b.created_at || 0);
            return fechaB - fechaA;
        });
        
        productosFiltrados = [...productosData];
        
        actualizarIndicadores();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos', 'error');
    }
}

/**
 * Actualiza los indicadores superiores
 */
function actualizarIndicadores() {
    const totalEl = document.getElementById('totalProductos');
    if (totalEl) {
        totalEl.textContent = productosData.length;
    }
    
    // Calcular stock total
    const totalStock = productosData.reduce((suma, producto) => {
        const stock = parseFloat(producto.stock || 0);
        return suma + (isNaN(stock) ? 0 : stock);
    }, 0);
    
    const stockEl = document.getElementById('totalStock');
    if (stockEl) {
        stockEl.textContent = totalStock.toLocaleString('es-AR');
    }
    
    // Calcular valor del inventario (stock * precio_costo)
    const valorInventario = productosData.reduce((suma, producto) => {
        const stock = parseFloat(producto.stock || 0);
        const precioCosto = parseFloat(producto.precio_costo || 0);
        return suma + (stock * precioCosto);
    }, 0);
    
    const valorEl = document.getElementById('valorInventario');
    if (valorEl) {
        valorEl.textContent = formatearPrecio(valorInventario);
    }
}

/**
 * Aplica los filtros y renderiza la tabla
 */
function aplicarFiltros() {
    productosFiltrados = productosData.filter(producto => {
        // Filtro por nombre
        if (filtroNombre) {
            const nombreMatch = producto.nombre?.toLowerCase().includes(filtroNombre);
            if (!nombreMatch) return false;
        }
        
        // Filtro por código de barras
        if (filtroCodigoBarra) {
            const codigoMatch = producto.codigo_barra?.toLowerCase().includes(filtroCodigoBarra);
            if (!codigoMatch) return false;
        }
        
        return true;
    });
    
    paginaActual = 1;
    renderizarTabla();
}

/**
 * Obtiene el nombre de una categoría por ID
 */
function obtenerNombreCategoria(categoriaId) {
    if (!categoriaId) return 'N/A';
    const categoria = categoriasData.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'N/A';
}

/**
 * Obtiene el nombre de una marca por ID
 */
function obtenerNombreMarca(marcaId) {
    if (!marcaId) return 'N/A';
    const marca = marcasData.find(m => m.id === marcaId);
    return marca ? marca.nombre : 'N/A';
}

/**
 * Renderiza la tabla con paginación
 */
function renderizarTabla() {
    const tbody = document.getElementById('tbodyProductos');
    if (!tbody) return;
    
    // Calcular paginación
    const totalRegistros = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = productosFiltrados.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (registrosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: var(--espaciado-xl); color: var(--color-texto-secundario);">
                    ${filtroNombre || filtroCodigoBarra ? 'No se encontraron productos con esos filtros' : 'No hay productos cargados'}
                </td>
            </tr>
        `;
    } else {
        registrosPagina.forEach(producto => {
            const tr = document.createElement('tr');
            tr.dataset.id = producto.id;
            
            const fecha = producto.updated_at || producto.created_at || new Date().toISOString();
            const fechaFormateada = formatearFecha(fecha);
            const estado = producto.activo !== false ? 'Activa' : 'Inactiva';
            const estadoClass = producto.activo !== false ? 'activa' : 'inactiva';
            const stock = parseFloat(producto.stock || 0);
            const stockClass = stock === 0 ? 'sin-stock' : (stock < 10 ? 'bajo' : 'normal');
            const categoriaNombre = obtenerNombreCategoria(producto.categoria_id);
            const marcaNombre = obtenerNombreMarca(producto.marca_id);
            
            tr.innerHTML = `
                <td>${producto.id.substring(0, 8)}...</td>
                <td>${escapeHtml(producto.nombre || '')}</td>
                <td>${escapeHtml(producto.codigo_barra || 'N/A')}</td>
                <td>${escapeHtml(categoriaNombre)}</td>
                <td>${escapeHtml(marcaNombre)}</td>
                <td>${formatearPrecio(parseFloat(producto.precio_venta || 0))}</td>
                <td>
                    <span class="stock-valor ${stockClass}">
                        ${stock.toLocaleString('es-AR')}
                    </span>
                </td>
                <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                <td>${fechaFormateada}</td>
                <td>${escapeHtml(producto.responsable_nombre || 'N/A')}</td>
                <td class="acciones-cell">
                    <button class="btn-accion editar" onclick="editarProducto('${producto.id}')" title="Editar">
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
            Mostrando ${inicio} - ${fin} de ${totalRegistros} productos
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
    const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
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
    const form = document.getElementById('formProducto');
    const titulo = document.querySelector('.panel-titulo');
    
    if (panel && form) {
        productoEditando = null;
        form.reset();
        document.getElementById('errorNombre').classList.remove('visible');
        document.getElementById('errorPrecioVenta').classList.remove('visible');
        
        // Recargar categorías y marcas por si se agregaron nuevas
        cargarCategoriasYMarcas();
        
        if (titulo) {
            titulo.textContent = 'Nuevo Producto';
        }
        
        panel.style.display = 'block';
        document.getElementById('nombreProducto').focus();
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    const panel = document.getElementById('panelCarga');
    if (panel) {
        panel.style.display = 'none';
        productoEditando = null;
        const form = document.getElementById('formProducto');
        if (form) {
            form.reset();
            document.getElementById('errorNombre').classList.remove('visible');
            document.getElementById('errorPrecioVenta').classList.remove('visible');
        }
    }
}

/**
 * Valida que el código de barras sea único por comercio
 */
async function validarCodigoBarraUnico(codigoBarra, productoIdExcluir = null) {
    if (!codigoBarra) return true; // Código de barras opcional
    
    const db = getDB();
    if (!db) return false;
    
    const sesion = await obtenerSesionLocal();
    if (!sesion || !sesion.comercio_id) return false;
    
    const productos = await db.productos
        .where('comercio_id')
        .equals(sesion.comercio_id)
        .filter(p => p.codigo_barra === codigoBarra)
        .toArray();
    
    // Si estamos editando, excluir el producto actual
    if (productoIdExcluir) {
        return productos.filter(p => p.id !== productoIdExcluir).length === 0;
    }
    
    return productos.length === 0;
}

/**
 * Maneja el guardado del producto
 */
async function manejarGuardar(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoriaId = document.getElementById('categoriaProducto').value.trim();
    const marcaId = document.getElementById('marcaProducto').value.trim();
    const codigoBarra = document.getElementById('codigoBarra').value.trim();
    const precioCosto = parseFloat(document.getElementById('precioCosto').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value);
    const descripcion = document.getElementById('descripcionProducto').value.trim();
    const especificaciones = document.getElementById('especificaciones').value.trim();
    const errorNombre = document.getElementById('errorNombre');
    const errorPrecioVenta = document.getElementById('errorPrecioVenta');
    
    // Validaciones
    if (!nombre) {
        errorNombre.textContent = 'El nombre es obligatorio';
        errorNombre.classList.add('visible');
        document.getElementById('nombreProducto').focus();
        return;
    }
    
    if (isNaN(precioVenta) || precioVenta <= 0) {
        errorPrecioVenta.textContent = 'El precio de venta es obligatorio y debe ser mayor a 0';
        errorPrecioVenta.classList.add('visible');
        document.getElementById('precioVenta').focus();
        return;
    }
    
    // Validar código de barras único
    if (codigoBarra) {
        const codigoUnico = await validarCodigoBarraUnico(codigoBarra, productoEditando?.id);
        if (!codigoUnico) {
            mostrarNotificacion('El código de barras ya existe para otro producto en este comercio', 'error');
            document.getElementById('codigoBarra').focus();
            return;
        }
    }
    
    errorNombre.classList.remove('visible');
    errorPrecioVenta.classList.remove('visible');
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        // Verificar que la tabla productos existe
        if (!db.productos) {
            console.error('❌ La tabla productos no existe en IndexedDB');
            mostrarNotificacion('Error: La base de datos necesita actualizarse. Por favor, recargá la página (F5) o limpiá el caché del navegador.', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            throw new Error('No hay sesión activa');
        }
        
        // Obtener nombre del responsable
        const responsableNombre = sesion.nombre || sesion.email || 'Usuario';
        
        if (productoEditando) {
            // Editar producto existente
            const cambios = {
                nombre: nombre,
                descripcion: descripcion || null,
                categoria_id: categoriaId || null,
                marca_id: marcaId || null,
                codigo_barra: codigoBarra || null,
                precio_costo: precioCosto,
                precio_venta: precioVenta,
                especificaciones: especificaciones || null,
                responsable_nombre: responsableNombre
            };
            
            await db.productos.update(productoEditando.id, {
                ...cambios,
                updated_at: new Date().toISOString(),
                synced: false
            });
            
            // Agregar a cola de sincronización
            const registroActualizado = await db.productos.get(productoEditando.id);
            if (typeof agregarAColaSincronizacion === 'function' && registroActualizado) {
                await agregarAColaSincronizacion('productos', productoEditando.id, 'update', registroActualizado);
            }
            
            mostrarNotificacion('Producto actualizado correctamente', 'exito');
        } else {
            // Crear nuevo producto
            const nuevoProducto = {
                id: generarUUID(),
                comercio_id: sesion.comercio_id,
                nombre: nombre,
                descripcion: descripcion || null,
                categoria_id: categoriaId || null,
                marca_id: marcaId || null,
                codigo_barra: codigoBarra || null,
                precio_costo: precioCosto,
                precio_venta: precioVenta,
                especificaciones: especificaciones || null,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                responsable_nombre: responsableNombre,
                sync_id: generarUUID(),
                synced: false
            };
            
            await db.productos.add(nuevoProducto);
            
            // Crear registro de stock inicial (0)
            if (db.stock) {
                const nuevoStock = {
                    id: generarUUID(),
                    producto_id: nuevoProducto.id,
                    comercio_id: sesion.comercio_id,
                    cantidad: 0,
                    stock_minimo: 0,
                    sync_id: generarUUID(),
                    synced: false
                };
                
                try {
                    await db.stock.add(nuevoStock);
                    if (typeof agregarAColaSincronizacion === 'function') {
                        await agregarAColaSincronizacion('stock', nuevoStock.id, 'insert', nuevoStock);
                    }
                } catch (error) {
                    console.warn('Error creando stock inicial:', error);
                }
            }
            
            // Agregar a cola de sincronización
            if (typeof agregarAColaSincronizacion === 'function') {
                await agregarAColaSincronizacion('productos', nuevoProducto.id, 'insert', nuevoProducto);
            }
            
            mostrarNotificacion('Producto creado correctamente', 'exito');
        }
        
        ocultarPanelCarga();
        await cargarProductos();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarNotificacion('Error al guardar el producto: ' + error.message, 'error');
    }
}

/**
 * Edita un producto
 */
async function editarProducto(id) {
    try {
        const db = getDB();
        if (!db) return;
        
        const producto = await db.productos.get(id);
        if (!producto) {
            mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        productoEditando = producto;
        
        // Recargar categorías y marcas por si se agregaron nuevas
        await cargarCategoriasYMarcas();
        
        // Llenar formulario
        document.getElementById('nombreProducto').value = producto.nombre || '';
        document.getElementById('descripcionProducto').value = producto.descripcion || '';
        document.getElementById('categoriaProducto').value = producto.categoria_id || '';
        document.getElementById('marcaProducto').value = producto.marca_id || '';
        document.getElementById('codigoBarra').value = producto.codigo_barra || '';
        document.getElementById('precioCosto').value = producto.precio_costo || 0;
        document.getElementById('precioVenta').value = producto.precio_venta || 0;
        document.getElementById('especificaciones').value = producto.especificaciones || '';
        
        const titulo = document.querySelector('.panel-titulo');
        if (titulo) {
            titulo.textContent = 'Editar Producto';
        }
        
        // Mostrar panel
        const panel = document.getElementById('panelCarga');
        if (panel) {
            panel.style.display = 'block';
            document.getElementById('nombreProducto').focus();
        }
        
    } catch (error) {
        console.error('Error editando producto:', error);
        mostrarNotificacion('Error al cargar el producto', 'error');
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
window.editarProducto = editarProducto;


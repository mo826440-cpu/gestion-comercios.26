/* ============================================
   COMPRAS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Compras
============================================ */

// Variables globales
let comprasData = [];
let comprasFiltradas = [];
let productosData = [];
let proveedoresData = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let filtroFacturacion = '';
let filtroProveedor = '';

// Datos de la compra en curso
let compraEnCurso = {
    facturacion: 'No Aplica',
    proveedor_id: null,
    productos: [],
    pagos: []
};

// Índice del producto/pago que se está editando
let productoEditandoIndex = -1;
let pagoEditandoIndex = -1;

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Compras cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarProveedores();
        await cargarProductos();
        await cargarCompras();
        
        // Cargar y aplicar tema
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarEventos();
        inicializarCerrarSesion();
        inicializarAtajosTeclado();
        
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
 * Carga proveedores para el select
 */
async function cargarProveedores() {
    try {
        const db = getDB();
        if (!db) return;
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) return;
        
        proveedoresData = await db.proveedores
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(p => p.activo !== false)
            .toArray();
        
        const selectProveedor = document.getElementById('proveedorCompra');
        if (selectProveedor) {
            selectProveedor.innerHTML = '<option value="">No Aplica</option>';
            proveedoresData.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id;
                option.textContent = proveedor.nombre || proveedor.razon_social;
                selectProveedor.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

/**
 * Carga productos para búsqueda
 */
async function cargarProductos() {
    try {
        const db = getDB();
        if (!db) return;
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) return;
        
        productosData = await db.productos
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(p => p.activo !== false)
            .toArray();
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

/**
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Botón nueva compra
    const btnNuevo = document.getElementById('btnNuevaCompra');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cancelar compra
    const btnCancelar = document.getElementById('btnCancelarCompra');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario compra
    const form = document.getElementById('formCompra');
    if (form) {
        form.addEventListener('submit', manejarFinalizarCompra);
    }
    
    // Agregar producto
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', mostrarFormAgregarProducto);
    }
    
    const btnCancelarProducto = document.getElementById('btnCancelarProducto');
    if (btnCancelarProducto) {
        btnCancelarProducto.addEventListener('click', ocultarFormAgregarProducto);
    }
    
    const btnGuardarProducto = document.getElementById('btnGuardarProducto');
    if (btnGuardarProducto) {
        btnGuardarProducto.addEventListener('click', manejarAgregarProducto);
    }
    
    // Búsqueda de productos
    const inputNombreProducto = document.getElementById('nombreProductoCompra');
    if (inputNombreProducto) {
        let timeoutBusqueda;
        inputNombreProducto.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                buscarProductos(this.value);
            }, 300);
        });
        
        inputNombreProducto.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                navegarSugerencias(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                seleccionarSugerencia();
            } else if (e.key === 'Escape') {
                ocultarSugerencias();
            }
        });
    }
    
    // Código de barras
    const inputCodigoBarra = document.getElementById('codigoBarraProducto');
    if (inputCodigoBarra) {
        inputCodigoBarra.addEventListener('blur', function() {
            if (this.value.trim()) {
                buscarProductoPorCodigo(this.value.trim());
            }
        });
    }
    
    // Agregar pago
    const btnAgregarPago = document.getElementById('btnAgregarPago');
    if (btnAgregarPago) {
        btnAgregarPago.addEventListener('click', mostrarFormAgregarPago);
    }
    
    const btnCancelarPago = document.getElementById('btnCancelarPago');
    if (btnCancelarPago) {
        btnCancelarPago.addEventListener('click', ocultarFormAgregarPago);
    }
    
    const btnGuardarPago = document.getElementById('btnGuardarPago');
    if (btnGuardarPago) {
        btnGuardarPago.addEventListener('click', manejarAgregarPago);
    }
    
    // Monto de pago (auto-completar con deuda pendiente)
    const inputMontoPago = document.getElementById('montoPago');
    if (inputMontoPago) {
        inputMontoPago.addEventListener('focus', function() {
            const deuda = calcularDeudaPendiente();
            if (deuda > 0 && !this.value) {
                this.value = deuda.toFixed(2);
            }
        });
    }
    
    // Filtros
    const filterFacturacion = document.getElementById('filterFacturacion');
    if (filterFacturacion) {
        let timeoutFiltro;
        filterFacturacion.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroFacturacion = this.value.toLowerCase().trim();
                aplicarFiltros();
            }, 300);
        });
    }
    
    const filterProveedor = document.getElementById('filterProveedor');
    if (filterProveedor) {
        let timeoutFiltro;
        filterProveedor.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroProveedor = this.value.toLowerCase().trim();
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
 * Inicializa atajos de teclado
 */
function inicializarAtajosTeclado() {
    document.addEventListener('keydown', function(e) {
        // F2 para nueva compra
        if (e.key === 'F2' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            const panel = document.getElementById('panelCarga');
            if (panel && panel.style.display === 'none') {
                mostrarPanelCarga();
            }
        }
    });
}

/**
 * Muestra el panel de carga
 */
function mostrarPanelCarga() {
    const panel = document.getElementById('panelCarga');
    if (panel) {
        resetearCompraEnCurso();
        panel.style.display = 'block';
        document.getElementById('facturacion').focus();
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    if (compraEnCurso.productos.length > 0 || compraEnCurso.pagos.length > 0) {
        if (!confirm('¿Estás seguro de que querés cancelar esta compra? Se perderán todos los datos ingresados.')) {
            return;
        }
    }
    
    const panel = document.getElementById('panelCarga');
    if (panel) {
        panel.style.display = 'none';
        resetearCompraEnCurso();
    }
}

/**
 * Resetea la compra en curso
 */
function resetearCompraEnCurso() {
    compraEnCurso = {
        facturacion: 'No Aplica',
        proveedor_id: null,
        productos: [],
        pagos: []
    };
    productoEditandoIndex = -1;
    pagoEditandoIndex = -1;
    
    const form = document.getElementById('formCompra');
    if (form) {
        form.reset();
        document.getElementById('facturacion').value = 'No Aplica';
    }
    
    renderizarProductos();
    renderizarPagos();
    actualizarTotales();
    ocultarFormAgregarProducto();
    ocultarFormAgregarPago();
}

/**
 * Muestra el formulario para agregar producto
 */
function mostrarFormAgregarProducto() {
    const form = document.getElementById('formAgregarProducto');
    if (form) {
        form.style.display = 'block';
        document.getElementById('codigoBarraProducto').focus();
    }
}

/**
 * Oculta el formulario para agregar producto
 */
function ocultarFormAgregarProducto() {
    const form = document.getElementById('formAgregarProducto');
    if (form) {
        form.style.display = 'none';
        const formInputs = form.querySelectorAll('input');
        formInputs.forEach(input => input.value = '');
        productoEditandoIndex = -1;
    }
    ocultarSugerencias();
}

/**
 * Busca productos por nombre
 */
function buscarProductos(termino) {
    if (!termino || termino.length < 2) {
        ocultarSugerencias();
        return;
    }
    
    const terminoLower = termino.toLowerCase();
    const sugerencias = productosData
        .filter(p => p.nombre?.toLowerCase().includes(terminoLower))
        .slice(0, 10);
    
    mostrarSugerencias(sugerencias);
}

/**
 * Muestra sugerencias de productos
 */
function mostrarSugerencias(productos) {
    const contenedor = document.getElementById('sugerenciasProductos');
    if (!contenedor) return;
    
    if (productos.length === 0) {
        ocultarSugerencias();
        return;
    }
    
    contenedor.innerHTML = '';
    productos.forEach((producto, index) => {
        const item = document.createElement('div');
        item.className = 'sugerencia-item';
        item.dataset.index = index;
        item.dataset.productoId = producto.id;
        item.innerHTML = `
            <strong>${escapeHtml(producto.nombre)}</strong>
            ${producto.codigo_barra ? `<br><small>Código: ${escapeHtml(producto.codigo_barra)}</small>` : ''}
        `;
        item.addEventListener('click', () => seleccionarProducto(producto));
        contenedor.appendChild(item);
    });
    
    contenedor.style.display = 'block';
}

/**
 * Oculta sugerencias
 */
function ocultarSugerencias() {
    const contenedor = document.getElementById('sugerenciasProductos');
    if (contenedor) {
        contenedor.style.display = 'none';
    }
}

/**
 * Navega por las sugerencias con flechas
 */
let sugerenciaSeleccionadaIndex = -1;

function navegarSugerencias(direccion) {
    const contenedor = document.getElementById('sugerenciasProductos');
    if (!contenedor || contenedor.style.display === 'none') return;
    
    const items = contenedor.querySelectorAll('.sugerencia-item');
    if (items.length === 0) return;
    
    sugerenciaSeleccionadaIndex += direccion;
    if (sugerenciaSeleccionadaIndex < 0) sugerenciaSeleccionadaIndex = items.length - 1;
    if (sugerenciaSeleccionadaIndex >= items.length) sugerenciaSeleccionadaIndex = 0;
    
    items.forEach((item, index) => {
        item.classList.toggle('highlighted', index === sugerenciaSeleccionadaIndex);
    });
    
    items[sugerenciaSeleccionadaIndex].scrollIntoView({ block: 'nearest' });
}

/**
 * Selecciona una sugerencia
 */
function seleccionarSugerencia() {
    const contenedor = document.getElementById('sugerenciasProductos');
    if (!contenedor || contenedor.style.display === 'none') return;
    
    const items = contenedor.querySelectorAll('.sugerencia-item');
    if (items.length === 0 || sugerenciaSeleccionadaIndex < 0) return;
    
    const item = items[sugerenciaSeleccionadaIndex];
    const productoId = item.dataset.productoId;
    const producto = productosData.find(p => p.id === productoId);
    
    if (producto) {
        seleccionarProducto(producto);
    }
}

/**
 * Selecciona un producto de las sugerencias
 */
function seleccionarProducto(producto) {
    document.getElementById('codigoBarraProducto').value = producto.codigo_barra || '';
    document.getElementById('nombreProductoCompra').value = producto.nombre || '';
    document.getElementById('precioProducto').value = producto.precio_costo || 0;
    ocultarSugerencias();
    document.getElementById('cantidadProducto').focus();
}

/**
 * Busca producto por código de barras
 */
function buscarProductoPorCodigo(codigo) {
    const producto = productosData.find(p => p.codigo_barra === codigo);
    if (producto) {
        document.getElementById('nombreProductoCompra').value = producto.nombre || '';
        document.getElementById('precioProducto').value = producto.precio_costo || 0;
        document.getElementById('cantidadProducto').focus();
    }
}

/**
 * Maneja agregar producto a la compra
 */
function manejarAgregarProducto() {
    const codigoBarra = document.getElementById('codigoBarraProducto').value.trim();
    const nombre = document.getElementById('nombreProductoCompra').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidadProducto').value);
    const precio = parseFloat(document.getElementById('precioProducto').value);
    
    // Validaciones
    if (!nombre) {
        mostrarNotificacion('El nombre del producto es obligatorio', 'error');
        return;
    }
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion('La cantidad debe ser mayor a 0', 'error');
        return;
    }
    
    if (isNaN(precio) || precio < 0) {
        mostrarNotificacion('El precio debe ser mayor o igual a 0', 'error');
        return;
    }
    
    const subtotal = cantidad * precio;
    
    // Buscar producto en la base de datos
    let productoId = null;
    if (codigoBarra) {
        const producto = productosData.find(p => p.codigo_barra === codigoBarra);
        if (producto) {
            productoId = producto.id;
        }
    }
    
    const productoItem = {
        producto_id: productoId,
        codigo_barra: codigoBarra || null,
        nombre_producto: nombre,
        cantidad: cantidad,
        precio_unitario: precio,
        subtotal: subtotal
    };
    
    if (productoEditandoIndex >= 0) {
        // Editar producto existente
        compraEnCurso.productos[productoEditandoIndex] = productoItem;
        productoEditandoIndex = -1;
    } else {
        // Agregar nuevo producto
        compraEnCurso.productos.push(productoItem);
    }
    
    renderizarProductos();
    actualizarTotales();
    ocultarFormAgregarProducto();
    
    // Enfocar código de barras para agregar siguiente producto
    setTimeout(() => {
        mostrarFormAgregarProducto();
    }, 100);
}

/**
 * Elimina un producto de la compra
 */
function eliminarProducto(index) {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
        compraEnCurso.productos.splice(index, 1);
        renderizarProductos();
        actualizarTotales();
    }
}

/**
 * Edita un producto de la compra
 */
function editarProducto(index) {
    const producto = compraEnCurso.productos[index];
    if (!producto) return;
    
    document.getElementById('codigoBarraProducto').value = producto.codigo_barra || '';
    document.getElementById('nombreProductoCompra').value = producto.nombre_producto || '';
    document.getElementById('cantidadProducto').value = producto.cantidad || 0;
    document.getElementById('precioProducto').value = producto.precio_unitario || 0;
    
    productoEditandoIndex = index;
    mostrarFormAgregarProducto();
}

/**
 * Renderiza la tabla de productos
 */
function renderizarProductos() {
    const tbody = document.getElementById('tbodyProductosCompra');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (compraEnCurso.productos.length === 0) {
        tbody.innerHTML = `
            <tr class="tabla-vacia">
                <td colspan="6" style="text-align: center; padding: var(--espaciado-lg); color: var(--color-texto-secundario);">
                    No hay productos agregados
                </td>
            </tr>
        `;
    } else {
        compraEnCurso.productos.forEach((producto, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(producto.codigo_barra || 'N/A')}</td>
                <td>${escapeHtml(producto.nombre_producto)}</td>
                <td>${producto.cantidad.toLocaleString('es-AR')}</td>
                <td>${formatearPrecio(producto.precio_unitario)}</td>
                <td>${formatearPrecio(producto.subtotal)}</td>
                <td>
                    <button class="btn-editar-item" onclick="editarProducto(${index})" title="Editar">✏️</button>
                    <button class="btn-eliminar-item" onclick="eliminarProducto(${index})" title="Eliminar">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

/**
 * Muestra el formulario para agregar pago
 */
function mostrarFormAgregarPago() {
    const form = document.getElementById('formAgregarPago');
    if (form) {
        form.style.display = 'block';
        const deuda = calcularDeudaPendiente();
        document.getElementById('montoPago').value = deuda > 0 ? deuda.toFixed(2) : '';
        document.getElementById('formaPago').focus();
    }
}

/**
 * Oculta el formulario para agregar pago
 */
function ocultarFormAgregarPago() {
    const form = document.getElementById('formAgregarPago');
    if (form) {
        form.style.display = 'none';
        const formInputs = form.querySelectorAll('input, select');
        formInputs.forEach(input => {
            if (input.id === 'formaPago') {
                input.value = 'efectivo';
            } else {
                input.value = '';
            }
        });
        pagoEditandoIndex = -1;
    }
}

/**
 * Maneja agregar pago a la compra
 */
function manejarAgregarPago() {
    const formaPago = document.getElementById('formaPago').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    
    // Validaciones
    if (!formaPago) {
        mostrarNotificacion('La forma de pago es obligatoria', 'error');
        return;
    }
    
    if (isNaN(monto) || monto <= 0) {
        mostrarNotificacion('El monto debe ser mayor a 0', 'error');
        return;
    }
    
    const pagoItem = {
        forma_pago: formaPago,
        monto: monto
    };
    
    if (pagoEditandoIndex >= 0) {
        // Editar pago existente
        compraEnCurso.pagos[pagoEditandoIndex] = pagoItem;
        pagoEditandoIndex = -1;
    } else {
        // Agregar nuevo pago
        compraEnCurso.pagos.push(pagoItem);
    }
    
    renderizarPagos();
    actualizarTotales();
    ocultarFormAgregarPago();
}

/**
 * Elimina un pago de la compra
 */
function eliminarPago(index) {
    if (confirm('¿Estás seguro de que querés eliminar este pago?')) {
        compraEnCurso.pagos.splice(index, 1);
        renderizarPagos();
        actualizarTotales();
    }
}

/**
 * Edita un pago de la compra
 */
function editarPago(index) {
    const pago = compraEnCurso.pagos[index];
    if (!pago) return;
    
    document.getElementById('formaPago').value = pago.forma_pago;
    document.getElementById('montoPago').value = pago.monto;
    
    pagoEditandoIndex = index;
    mostrarFormAgregarPago();
}

/**
 * Renderiza la tabla de pagos
 */
function renderizarPagos() {
    const tbody = document.getElementById('tbodyPagosCompra');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (compraEnCurso.pagos.length === 0) {
        tbody.innerHTML = `
            <tr class="tabla-vacia">
                <td colspan="3" style="text-align: center; padding: var(--espaciado-lg); color: var(--color-texto-secundario);">
                    No hay pagos agregados
                </td>
            </tr>
        `;
    } else {
        compraEnCurso.pagos.forEach((pago, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatearFormaPago(pago.forma_pago)}</td>
                <td>${formatearPrecio(pago.monto)}</td>
                <td>
                    <button class="btn-editar-item" onclick="editarPago(${index})" title="Editar">✏️</button>
                    <button class="btn-eliminar-item" onclick="eliminarPago(${index})" title="Eliminar">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

/**
 * Calcula el total de productos
 */
function calcularTotalProductos() {
    return compraEnCurso.productos.reduce((suma, producto) => {
        return suma + (producto.subtotal || 0);
    }, 0);
}

/**
 * Calcula el total pagado
 */
function calcularTotalPagado() {
    return compraEnCurso.pagos.reduce((suma, pago) => {
        return suma + (pago.monto || 0);
    }, 0);
}

/**
 * Calcula la deuda pendiente
 */
function calcularDeudaPendiente() {
    const total = calcularTotalProductos();
    const pagado = calcularTotalPagado();
    return Math.max(0, total - pagado);
}

/**
 * Actualiza los totales en la interfaz
 */
function actualizarTotales() {
    const totalProductos = calcularTotalProductos();
    const totalPagado = calcularTotalPagado();
    const deudaPendiente = calcularDeudaPendiente();
    
    const totalProductosEl = document.getElementById('totalProductos');
    if (totalProductosEl) {
        totalProductosEl.textContent = formatearPrecio(totalProductos);
    }
    
    const totalPagadoEl = document.getElementById('totalPagado');
    if (totalPagadoEl) {
        totalPagadoEl.textContent = formatearPrecio(totalPagado);
    }
    
    const deudaPendienteEl = document.getElementById('deudaPendiente');
    if (deudaPendienteEl) {
        deudaPendienteEl.textContent = formatearPrecio(deudaPendiente);
    }
    
    // Habilitar/deshabilitar botón finalizar
    const btnFinalizar = document.getElementById('btnFinalizarCompra');
    if (btnFinalizar) {
        const puedeFinalizar = compraEnCurso.productos.length > 0;
        btnFinalizar.disabled = !puedeFinalizar;
    }
}

/**
 * Maneja finalizar la compra
 */
async function manejarFinalizarCompra(e) {
    e.preventDefault();
    
    // Validaciones
    if (compraEnCurso.productos.length === 0) {
        mostrarNotificacion('Debés agregar al menos un producto', 'error');
        return;
    }
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        // Verificar que las tablas existen
        if (!db.compras || !db.detalle_compras || !db.pagos_compras) {
            console.error('❌ Las tablas de compras no existen en IndexedDB');
            mostrarNotificacion('Error: La base de datos necesita actualizarse. Por favor, recargá la página (F5) o limpiá el caché del navegador.', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            throw new Error('No hay sesión activa');
        }
        
        const responsableNombre = sesion.nombre || sesion.email || 'Usuario';
        const total = calcularTotalProductos();
        const totalPagado = calcularTotalPagado();
        const deudaPendiente = calcularDeudaPendiente();
        
        // Determinar estado
        let estado = 'pagada';
        if (deudaPendiente > 0) {
            estado = totalPagado > 0 ? 'parcial' : 'pendiente';
        }
        
        // Crear compra
        const nuevaCompra = {
            id: generarUUID(),
            comercio_id: sesion.comercio_id,
            proveedor_id: compraEnCurso.proveedor_id || null,
            facturacion: compraEnCurso.facturacion || 'No Aplica',
            fecha: new Date().toISOString(),
            subtotal: total,
            descuento: 0,
            total: total,
            monto_pagado: totalPagado,
            monto_deuda: deudaPendiente,
            estado: estado,
            observaciones: null,
            responsable_nombre: responsableNombre,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_id: generarUUID(),
            synced: false
        };
        
        await db.compras.add(nuevaCompra);
        
        // Crear detalles de compra
        for (const producto of compraEnCurso.productos) {
            const detalle = {
                id: generarUUID(),
                compra_id: nuevaCompra.id,
                producto_id: producto.producto_id || null,
                codigo_barra: producto.codigo_barra || null,
                nombre_producto: producto.nombre_producto,
                cantidad: producto.cantidad,
                precio_unitario: producto.precio_unitario,
                subtotal: producto.subtotal,
                sync_id: generarUUID(),
                created_at: new Date().toISOString()
            };
            
            await db.detalle_compras.add(detalle);
            
            // Actualizar stock si el producto existe
            if (producto.producto_id && db.stock) {
                const stockExistente = await db.stock
                    .where('producto_id')
                    .equals(producto.producto_id)
                    .first();
                
                if (stockExistente) {
                    const nuevaCantidad = (parseFloat(stockExistente.cantidad || 0) + producto.cantidad);
                    await db.stock.update(stockExistente.id, {
                        cantidad: nuevaCantidad,
                        updated_at: new Date().toISOString(),
                        synced: false
                    });
                    
                    // Agregar a cola de sincronización
                    const stockActualizado = await db.stock.get(stockExistente.id);
                    if (typeof agregarAColaSincronizacion === 'function' && stockActualizado) {
                        await agregarAColaSincronizacion('stock', stockExistente.id, 'update', stockActualizado);
                    }
                } else {
                    // Crear registro de stock si no existe
                    const nuevoStock = {
                        id: generarUUID(),
                        producto_id: producto.producto_id,
                        comercio_id: sesion.comercio_id,
                        cantidad: producto.cantidad,
                        stock_minimo: 0,
                        sync_id: generarUUID(),
                        synced: false
                    };
                    
                    await db.stock.add(nuevoStock);
                    if (typeof agregarAColaSincronizacion === 'function') {
                        await agregarAColaSincronizacion('stock', nuevoStock.id, 'insert', nuevoStock);
                    }
                }
            }
        }
        
        // Crear pagos
        for (const pago of compraEnCurso.pagos) {
            const pagoCompra = {
                id: generarUUID(),
                compra_id: nuevaCompra.id,
                forma_pago: pago.forma_pago,
                monto: pago.monto,
                fecha_pago: new Date().toISOString(),
                observaciones: null,
                sync_id: generarUUID(),
                created_at: new Date().toISOString()
            };
            
            await db.pagos_compras.add(pagoCompra);
        }
        
        // Actualizar deuda del proveedor
        if (compraEnCurso.proveedor_id && deudaPendiente > 0 && db.proveedores) {
            const proveedor = await db.proveedores.get(compraEnCurso.proveedor_id);
            if (proveedor) {
                const nuevaDeuda = (parseFloat(proveedor.saldo_pendiente || 0) + deudaPendiente);
                await db.proveedores.update(compraEnCurso.proveedor_id, {
                    saldo_pendiente: nuevaDeuda,
                    updated_at: new Date().toISOString(),
                    synced: false
                });
                
                // Agregar a cola de sincronización
                const proveedorActualizado = await db.proveedores.get(compraEnCurso.proveedor_id);
                if (typeof agregarAColaSincronizacion === 'function' && proveedorActualizado) {
                    await agregarAColaSincronizacion('proveedores', compraEnCurso.proveedor_id, 'update', proveedorActualizado);
                }
            }
        }
        
        // Agregar a cola de sincronización
        if (typeof agregarAColaSincronizacion === 'function') {
            await agregarAColaSincronizacion('compras', nuevaCompra.id, 'insert', nuevaCompra);
            
            // Agregar detalles y pagos
            const detalles = await db.detalle_compras.where('compra_id').equals(nuevaCompra.id).toArray();
            for (const detalle of detalles) {
                await agregarAColaSincronizacion('detalle_compras', detalle.id, 'insert', detalle);
            }
            
            const pagos = await db.pagos_compras.where('compra_id').equals(nuevaCompra.id).toArray();
            for (const pago of pagos) {
                await agregarAColaSincronizacion('pagos_compras', pago.id, 'insert', pago);
            }
        }
        
        mostrarNotificacion('Compra registrada correctamente', 'exito');
        ocultarPanelCarga();
        await cargarCompras();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error guardando compra:', error);
        mostrarNotificacion('Error al guardar la compra: ' + error.message, 'error');
    }
}

/**
 * Carga las compras desde IndexedDB
 */
async function cargarCompras() {
    try {
        const db = getDB();
        if (!db) {
            mostrarNotificacion('Error: Base de datos no disponible', 'error');
            return;
        }
        
        // Verificar que la tabla compras existe
        if (!db.compras) {
            console.error('❌ La tabla compras no existe en IndexedDB. Versión de BD:', db.verno);
            mostrarNotificacion('Error: La base de datos necesita actualizarse. Por favor, recargá la página (F5) o limpiá el caché del navegador.', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            mostrarNotificacion('Error: No hay sesión activa', 'error');
            return;
        }
        
        // Cargar compras del mes actual
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        
        comprasData = await db.compras
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(compra => {
                const fecha = new Date(compra.fecha || compra.created_at);
                return fecha >= inicioMes && fecha <= finMes;
            })
            .toArray();
        
        // Cargar detalles y pagos para cada compra
        for (const compra of comprasData) {
            // Cargar detalles
            const detalles = await db.detalle_compras
                .where('compra_id')
                .equals(compra.id)
                .toArray();
            compra.detalles = detalles;
            
            // Cargar pagos
            const pagos = await db.pagos_compras
                .where('compra_id')
                .equals(compra.id)
                .toArray();
            compra.pagos = pagos;
            
            // Obtener nombre del proveedor
            if (compra.proveedor_id) {
                const proveedor = proveedoresData.find(p => p.id === compra.proveedor_id);
                compra.proveedor_nombre = proveedor ? (proveedor.nombre || proveedor.razon_social) : 'N/A';
            } else {
                compra.proveedor_nombre = 'No Aplica';
            }
        }
        
        // Ordenar por fecha descendente (más recientes primero)
        comprasData.sort((a, b) => {
            const fechaA = new Date(a.fecha || a.created_at || 0);
            const fechaB = new Date(b.fecha || b.created_at || 0);
            return fechaB - fechaA;
        });
        
        comprasFiltradas = [...comprasData];
        
        actualizarIndicadores();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error cargando compras:', error);
        mostrarNotificacion('Error al cargar compras', 'error');
    }
}

/**
 * Actualiza los indicadores superiores
 */
function actualizarIndicadores() {
    const totalEl = document.getElementById('totalComprasMes');
    if (totalEl) {
        totalEl.textContent = comprasData.length;
    }
    
    const montoTotal = comprasData.reduce((suma, compra) => {
        return suma + (parseFloat(compra.total || 0));
    }, 0);
    
    const montoEl = document.getElementById('montoTotalMes');
    if (montoEl) {
        montoEl.textContent = formatearPrecio(montoTotal);
    }
}

/**
 * Aplica los filtros y renderiza la tabla
 */
function aplicarFiltros() {
    comprasFiltradas = comprasData.filter(compra => {
        // Filtro por facturación
        if (filtroFacturacion) {
            const facturacionMatch = compra.facturacion?.toLowerCase().includes(filtroFacturacion);
            if (!facturacionMatch) return false;
        }
        
        // Filtro por proveedor
        if (filtroProveedor) {
            const proveedorMatch = compra.proveedor_nombre?.toLowerCase().includes(filtroProveedor);
            if (!proveedorMatch) return false;
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
    const tbody = document.getElementById('tbodyCompras');
    if (!tbody) return;
    
    // Calcular paginación
    const totalRegistros = comprasFiltradas.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = comprasFiltradas.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (registrosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: var(--espaciado-xl); color: var(--color-texto-secundario);">
                    ${filtroFacturacion || filtroProveedor ? 'No se encontraron compras con esos filtros' : 'No hay compras registradas este mes'}
                </td>
            </tr>
        `;
    } else {
        registrosPagina.forEach(compra => {
            const tr = document.createElement('tr');
            tr.dataset.id = compra.id;
            
            const fecha = compra.fecha || compra.created_at || new Date().toISOString();
            const fechaFormateada = formatearFecha(fecha);
            const estado = compra.estado || 'pendiente';
            const estadoClass = estado === 'pagada' ? 'pagada' : (estado === 'parcial' ? 'parcial' : 'deuda');
            const cantidadProductos = compra.detalles ? compra.detalles.reduce((suma, detalle) => suma + (parseFloat(detalle.cantidad || 0)), 0) : 0;
            
            tr.innerHTML = `
                <td>${compra.id.substring(0, 8)}...</td>
                <td>${escapeHtml(compra.facturacion || 'N/A')}</td>
                <td>${escapeHtml(compra.proveedor_nombre || 'N/A')}</td>
                <td>${cantidadProductos.toLocaleString('es-AR')}</td>
                <td>${formatearPrecio(parseFloat(compra.total || 0))}</td>
                <td>${formatearPrecio(parseFloat(compra.monto_pagado || 0))}</td>
                <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                <td>${fechaFormateada}</td>
                <td>${escapeHtml(compra.responsable_nombre || 'N/A')}</td>
                <td class="acciones-cell">
                    <button class="btn-accion ver" onclick="verDetalleCompra('${compra.id}')" title="Ver detalle">👁️</button>
                    <button class="btn-accion editar" onclick="editarCompra('${compra.id}')" title="Editar">✏️</button>
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
            Mostrando ${inicio} - ${fin} de ${totalRegistros} compras
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
    const totalPaginas = Math.ceil(comprasFiltradas.length / registrosPorPagina);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTabla();
        document.querySelector('.tabla-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Ver detalle de compra
 */
function verDetalleCompra(id) {
    mostrarNotificacion('Funcionalidad de ver detalle próximamente', 'info');
}

/**
 * Editar compra
 */
function editarCompra(id) {
    mostrarNotificacion('Funcionalidad de editar compra próximamente', 'info');
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
 * Formatea forma de pago
 */
function formatearFormaPago(forma) {
    const formas = {
        efectivo: 'Efectivo',
        transferencia: 'Transferencia',
        QR: 'QR',
        debito: 'Débito',
        credito: 'Crédito',
        cheque: 'Cheque',
        otro: 'Otro'
    };
    return formas[forma] || forma;
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
window.eliminarProducto = eliminarProducto;
window.editarProducto = editarProducto;
window.eliminarPago = eliminarPago;
window.editarPago = editarPago;
window.verDetalleCompra = verDetalleCompra;
window.editarCompra = editarCompra;


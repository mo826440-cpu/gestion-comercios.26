/* ============================================
   VENTAS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Ventas
============================================ */

// Variables globales
let ventasData = [];
let ventasFiltradas = [];
let productosData = [];
let clientesData = [];
let stockData = [];
let paginaActual = 1;
let registrosPorPagina = 25;
let filtroFacturacion = '';
let filtroCliente = '';

// Datos de la venta en curso
let ventaEnCurso = {
    facturacion: 'No Aplica',
    cliente_id: null,
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
    console.log('Pantalla de Ventas cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarClientes();
        await cargarProductosYStock();
        await cargarVentas();
        
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
 * Carga clientes para el select
 */
async function cargarClientes() {
    try {
        const db = getDB();
        if (!db) return;
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) return;
        
        clientesData = await db.clientes
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(c => c.activo !== false)
            .toArray();
        
        const selectCliente = document.getElementById('clienteVenta');
        if (selectCliente) {
            selectCliente.innerHTML = '<option value="">No Aplica</option>';
            clientesData.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nombre;
                selectCliente.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

/**
 * Carga productos y stock para búsqueda
 */
async function cargarProductosYStock() {
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
    } catch (error) {
        console.error('Error cargando productos y stock:', error);
    }
}

/**
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Botón nueva venta
    const btnNuevo = document.getElementById('btnNuevaVenta');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarPanelCarga);
    }
    
    // Botón cancelar venta
    const btnCancelar = document.getElementById('btnCancelarVenta');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarPanelCarga);
    }
    
    // Formulario venta
    const form = document.getElementById('formVenta');
    if (form) {
        form.addEventListener('submit', manejarFinalizarVenta);
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
    const inputNombreProducto = document.getElementById('nombreProductoVenta');
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
    
    // Descuento (calcular subtotal automáticamente)
    const inputDescuento = document.getElementById('descuentoProducto');
    const inputCantidad = document.getElementById('cantidadProducto');
    const inputPrecio = document.getElementById('precioProducto');
    
    if (inputDescuento && inputCantidad && inputPrecio) {
        const calcularSubtotal = () => {
            const cantidad = parseFloat(inputCantidad.value) || 0;
            const precio = parseFloat(inputPrecio.value) || 0;
            const descuento = parseFloat(inputDescuento.value) || 0;
            
            if (cantidad > 0 && precio > 0) {
                const subtotalSinDescuento = cantidad * precio;
                const montoDescuento = (subtotalSinDescuento * descuento) / 100;
                const subtotal = subtotalSinDescuento - montoDescuento;
                // No actualizamos el campo subtotal aquí, se calcula al guardar
            }
        };
        
        inputCantidad.addEventListener('input', calcularSubtotal);
        inputPrecio.addEventListener('input', calcularSubtotal);
        inputDescuento.addEventListener('input', calcularSubtotal);
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
    
    const filterCliente = document.getElementById('filterCliente');
    if (filterCliente) {
        let timeoutFiltro;
        filterCliente.addEventListener('input', function() {
            clearTimeout(timeoutFiltro);
            timeoutFiltro = setTimeout(() => {
                filtroCliente = this.value.toLowerCase().trim();
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
        // F2 para nueva venta
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
        resetearVentaEnCurso();
        panel.style.display = 'block';
        document.getElementById('facturacion').focus();
    }
}

/**
 * Oculta el panel de carga
 */
function ocultarPanelCarga() {
    if (ventaEnCurso.productos.length > 0 || ventaEnCurso.pagos.length > 0) {
        if (!confirm('¿Estás seguro de que querés cancelar esta venta? Se perderán todos los datos ingresados.')) {
            return;
        }
    }
    
    const panel = document.getElementById('panelCarga');
    if (panel) {
        panel.style.display = 'none';
        resetearVentaEnCurso();
    }
}

/**
 * Resetea la venta en curso
 */
function resetearVentaEnCurso() {
    ventaEnCurso = {
        id: null,
        facturacion: 'No Aplica',
        cliente_id: null,
        productos: [],
        pagos: []
    };
    productoEditandoIndex = -1;
    pagoEditandoIndex = -1;
    
    const form = document.getElementById('formVenta');
    if (form) {
        form.reset();
        document.getElementById('facturacion').value = 'No Aplica';
        document.getElementById('descuentoProducto').value = '0';
    }
    
    // Restaurar título y botón
    const panelTitulo = document.querySelector('.panel-titulo');
    if (panelTitulo) {
        panelTitulo.textContent = 'Nueva Venta';
    }
    
    const btnFinalizar = document.getElementById('btnFinalizarVenta');
    if (btnFinalizar) {
        btnFinalizar.textContent = 'Finalizar venta';
        btnFinalizar.onclick = null; // Restaurar handler por defecto del form
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
        formInputs.forEach(input => {
            if (input.id === 'descuentoProducto') {
                input.value = '0';
            } else {
                input.value = '';
            }
        });
        productoEditandoIndex = -1;
        ocultarStockDisponible();
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
            <br><small>Stock: ${producto.stock || 0} | Precio: ${formatearPrecio(producto.precio_venta || 0)}</small>
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
    document.getElementById('nombreProductoVenta').value = producto.nombre || '';
    document.getElementById('precioProducto').value = producto.precio_venta || 0;
    document.getElementById('descuentoProducto').value = '0';
    mostrarStockDisponible(producto);
    ocultarSugerencias();
    document.getElementById('cantidadProducto').focus();
}

/**
 * Muestra el stock disponible del producto
 */
function mostrarStockDisponible(producto) {
    const stockEl = document.getElementById('stockDisponible');
    if (stockEl) {
        const stock = producto.stock || 0;
        stockEl.textContent = `Stock disponible: ${stock.toLocaleString('es-AR')}`;
        stockEl.style.display = 'block';
        stockEl.style.color = stock > 0 ? 'var(--color-exito)' : 'var(--color-error)';
    }
}

/**
 * Oculta el stock disponible
 */
function ocultarStockDisponible() {
    const stockEl = document.getElementById('stockDisponible');
    if (stockEl) {
        stockEl.style.display = 'none';
    }
}

/**
 * Busca producto por código de barras
 */
function buscarProductoPorCodigo(codigo) {
    const producto = productosData.find(p => p.codigo_barra === codigo);
    if (producto) {
        document.getElementById('nombreProductoVenta').value = producto.nombre || '';
        document.getElementById('precioProducto').value = producto.precio_venta || 0;
        document.getElementById('descuentoProducto').value = '0';
        mostrarStockDisponible(producto);
        document.getElementById('cantidadProducto').focus();
    }
}

/**
 * Maneja agregar producto a la venta
 */
async function manejarAgregarProducto() {
    const codigoBarra = document.getElementById('codigoBarraProducto').value.trim();
    const nombre = document.getElementById('nombreProductoVenta').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidadProducto').value);
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const descuento = parseFloat(document.getElementById('descuentoProducto').value) || 0;
    
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
    
    if (descuento < 0 || descuento > 100) {
        mostrarNotificacion('El descuento debe estar entre 0 y 100%', 'error');
        return;
    }
    
    // Buscar producto en la base de datos
    let productoId = null;
    let productoEncontrado = null;
    if (codigoBarra) {
        productoEncontrado = productosData.find(p => p.codigo_barra === codigoBarra);
        if (productoEncontrado) {
            productoId = productoEncontrado.id;
        }
    } else {
        // Buscar por nombre
        productoEncontrado = productosData.find(p => p.nombre === nombre);
        if (productoEncontrado) {
            productoId = productoEncontrado.id;
        }
    }
    
    // Validar stock disponible
    if (productoEncontrado) {
        const stockDisponible = productoEncontrado.stock || 0;
        
        // Calcular cantidad total ya agregada en esta venta
        const cantidadYaAgregada = ventaEnCurso.productos
            .filter(p => p.producto_id === productoId)
            .reduce((suma, p) => suma + (p.cantidad || 0), 0);
        
        // Si estamos editando, restar la cantidad del producto que estamos editando
        let cantidadTotal = cantidadYaAgregada + cantidad;
        if (productoEditandoIndex >= 0) {
            const productoEditando = ventaEnCurso.productos[productoEditandoIndex];
            if (productoEditando.producto_id === productoId) {
                cantidadTotal = cantidadYaAgregada - productoEditando.cantidad + cantidad;
            }
        }
        
        if (cantidadTotal > stockDisponible) {
            mostrarNotificacion(`Stock insuficiente. Disponible: ${stockDisponible.toLocaleString('es-AR')}`, 'error');
            return;
        }
    }
    
    // Calcular subtotal con descuento
    const subtotalSinDescuento = cantidad * precio;
    const montoDescuento = (subtotalSinDescuento * descuento) / 100;
    const subtotal = subtotalSinDescuento - montoDescuento;
    
    const productoItem = {
        producto_id: productoId,
        codigo_barra: codigoBarra || null,
        nombre_producto: nombre,
        cantidad: cantidad,
        precio_unitario: precio,
        descuento: descuento,
        subtotal: subtotal
    };
    
    if (productoEditandoIndex >= 0) {
        // Editar producto existente
        ventaEnCurso.productos[productoEditandoIndex] = productoItem;
        productoEditandoIndex = -1;
    } else {
        // Agregar nuevo producto
        ventaEnCurso.productos.push(productoItem);
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
 * Elimina un producto de la venta
 */
function eliminarProducto(index) {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
        ventaEnCurso.productos.splice(index, 1);
        renderizarProductos();
        actualizarTotales();
    }
}

/**
 * Edita un producto de la venta
 */
function editarProducto(index) {
    const producto = ventaEnCurso.productos[index];
    if (!producto) return;
    
    document.getElementById('codigoBarraProducto').value = producto.codigo_barra || '';
    document.getElementById('nombreProductoVenta').value = producto.nombre_producto || '';
    document.getElementById('cantidadProducto').value = producto.cantidad || 0;
    document.getElementById('precioProducto').value = producto.precio_unitario || 0;
    document.getElementById('descuentoProducto').value = producto.descuento || 0;
    
    // Mostrar stock si el producto existe
    if (producto.producto_id) {
        const productoEncontrado = productosData.find(p => p.id === producto.producto_id);
        if (productoEncontrado) {
            mostrarStockDisponible(productoEncontrado);
        }
    }
    
    productoEditandoIndex = index;
    mostrarFormAgregarProducto();
}

/**
 * Renderiza la tabla de productos
 */
function renderizarProductos() {
    const tbody = document.getElementById('tbodyProductosVenta');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (ventaEnCurso.productos.length === 0) {
        tbody.innerHTML = `
            <tr class="tabla-vacia">
                <td colspan="7" style="text-align: center; padding: var(--espaciado-lg); color: var(--color-texto-secundario);">
                    No hay productos agregados
                </td>
            </tr>
        `;
    } else {
        ventaEnCurso.productos.forEach((producto, index) => {
            const tr = document.createElement('tr');
            const descuentoTexto = producto.descuento > 0 ? `${producto.descuento}%` : '0%';
            tr.innerHTML = `
                <td>${escapeHtml(producto.codigo_barra || 'N/A')}</td>
                <td>${escapeHtml(producto.nombre_producto)}</td>
                <td>${producto.cantidad.toLocaleString('es-AR')}</td>
                <td>${formatearPrecio(producto.precio_unitario)}</td>
                <td>${descuentoTexto}</td>
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
 * Maneja agregar pago a la venta
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
        ventaEnCurso.pagos[pagoEditandoIndex] = pagoItem;
        pagoEditandoIndex = -1;
    } else {
        // Agregar nuevo pago
        ventaEnCurso.pagos.push(pagoItem);
    }
    
    renderizarPagos();
    actualizarTotales();
    ocultarFormAgregarPago();
}

/**
 * Elimina un pago de la venta
 */
function eliminarPago(index) {
    if (confirm('¿Estás seguro de que querés eliminar este pago?')) {
        ventaEnCurso.pagos.splice(index, 1);
        renderizarPagos();
        actualizarTotales();
    }
}

/**
 * Edita un pago de la venta
 */
function editarPago(index) {
    const pago = ventaEnCurso.pagos[index];
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
    const tbody = document.getElementById('tbodyPagosVenta');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (ventaEnCurso.pagos.length === 0) {
        tbody.innerHTML = `
            <tr class="tabla-vacia">
                <td colspan="3" style="text-align: center; padding: var(--espaciado-lg); color: var(--color-texto-secundario);">
                    No hay pagos agregados
                </td>
            </tr>
        `;
    } else {
        ventaEnCurso.pagos.forEach((pago, index) => {
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
 * Calcula el total de productos (con descuentos)
 */
function calcularTotalProductos() {
    return ventaEnCurso.productos.reduce((suma, producto) => {
        return suma + (producto.subtotal || 0);
    }, 0);
}

/**
 * Calcula el total pagado
 */
function calcularTotalPagado() {
    return ventaEnCurso.pagos.reduce((suma, pago) => {
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
    const btnFinalizar = document.getElementById('btnFinalizarVenta');
    if (btnFinalizar) {
        const puedeFinalizar = ventaEnCurso.productos.length > 0;
        btnFinalizar.disabled = !puedeFinalizar;
    }
}

/**
 * Maneja guardar cambios de una venta editada
 */
async function manejarGuardarCambiosVenta() {
    if (!ventaEnCurso.id) {
        // Si no hay ID, es una nueva venta
        return manejarFinalizarVenta({ preventDefault: () => {} });
    }
    
    // Validaciones
    if (ventaEnCurso.productos.length === 0) {
        mostrarNotificacion('Debés agregar al menos un producto', 'error');
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
        
        // TODO: Implementar lógica de actualización de venta existente
        // Por ahora, mostrar mensaje de que la edición de ventas está en desarrollo
        mostrarNotificacion('La edición de ventas existentes está en desarrollo. Por ahora podés eliminar y crear una nueva.', 'info');
        
    } catch (error) {
        console.error('Error guardando cambios de venta:', error);
        mostrarNotificacion('Error al guardar los cambios: ' + error.message, 'error');
    }
}

/**
 * Maneja finalizar la venta
 */
async function manejarFinalizarVenta(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    // Validaciones
    if (ventaEnCurso.productos.length === 0) {
        mostrarNotificacion('Debés agregar al menos un producto', 'error');
        return;
    }
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        // Verificar que las tablas existen
        if (!db.ventas || !db.detalle_ventas || !db.pagos_ventas) {
            console.error('❌ Las tablas de ventas no existen en IndexedDB');
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
        
        // Crear venta
        const nuevaVenta = {
            id: generarUUID(),
            comercio_id: sesion.comercio_id,
            caja_id: null, // TODO: Implementar cajas
            cliente_id: ventaEnCurso.cliente_id || null,
            facturacion: ventaEnCurso.facturacion || 'No Aplica',
            fecha: new Date().toISOString(),
            subtotal: total,
            descuento: 0, // Descuento total (por ahora 0, los descuentos están por producto)
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
        
        await db.ventas.add(nuevaVenta);
        
        // Crear detalles de venta y actualizar stock
        for (const producto of ventaEnCurso.productos) {
            const detalle = {
                id: generarUUID(),
                venta_id: nuevaVenta.id,
                producto_id: producto.producto_id || null,
                codigo_barra: producto.codigo_barra || null,
                nombre_producto: producto.nombre_producto,
                cantidad: producto.cantidad,
                precio_unitario: producto.precio_unitario,
                subtotal: producto.subtotal,
                descuento: producto.descuento || 0,
                sync_id: generarUUID(),
                created_at: new Date().toISOString()
            };
            
            await db.detalle_ventas.add(detalle);
            
            // Reducir stock si el producto existe
            if (producto.producto_id && db.stock) {
                const stockExistente = await db.stock
                    .where('producto_id')
                    .equals(producto.producto_id)
                    .first();
                
                if (stockExistente) {
                    const nuevaCantidad = Math.max(0, parseFloat(stockExistente.cantidad || 0) - producto.cantidad);
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
                }
            }
        }
        
        // Crear pagos
        for (const pago of ventaEnCurso.pagos) {
            const pagoVenta = {
                id: generarUUID(),
                venta_id: nuevaVenta.id,
                forma_pago: pago.forma_pago,
                monto: pago.monto,
                fecha_pago: new Date().toISOString(),
                observaciones: null,
                sync_id: generarUUID(),
                created_at: new Date().toISOString()
            };
            
            await db.pagos_ventas.add(pagoVenta);
        }
        
        // Actualizar deuda del cliente
        if (ventaEnCurso.cliente_id && deudaPendiente > 0 && db.clientes) {
            const cliente = await db.clientes.get(ventaEnCurso.cliente_id);
            if (cliente) {
                const nuevaDeuda = (parseFloat(cliente.saldo_pendiente || 0) + deudaPendiente);
                await db.clientes.update(ventaEnCurso.cliente_id, {
                    saldo_pendiente: nuevaDeuda,
                    updated_at: new Date().toISOString(),
                    synced: false
                });
                
                // Agregar a cola de sincronización
                const clienteActualizado = await db.clientes.get(ventaEnCurso.cliente_id);
                if (typeof agregarAColaSincronizacion === 'function' && clienteActualizado) {
                    await agregarAColaSincronizacion('clientes', ventaEnCurso.cliente_id, 'update', clienteActualizado);
                }
            }
        }
        
        // Agregar a cola de sincronización
        if (typeof agregarAColaSincronizacion === 'function') {
            await agregarAColaSincronizacion('ventas', nuevaVenta.id, 'insert', nuevaVenta);
            
            // Agregar detalles y pagos
            const detalles = await db.detalle_ventas.where('venta_id').equals(nuevaVenta.id).toArray();
            for (const detalle of detalles) {
                await agregarAColaSincronizacion('detalle_ventas', detalle.id, 'insert', detalle);
            }
            
            const pagos = await db.pagos_ventas.where('venta_id').equals(nuevaVenta.id).toArray();
            for (const pago of pagos) {
                await agregarAColaSincronizacion('pagos_ventas', pago.id, 'insert', pago);
            }
        }
        
        mostrarNotificacion('Venta registrada correctamente', 'exito');
        ocultarPanelCarga();
        await cargarVentas();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error guardando venta:', error);
        mostrarNotificacion('Error al guardar la venta: ' + error.message, 'error');
    }
}

/**
 * Carga las ventas desde IndexedDB
 */
async function cargarVentas() {
    try {
        const db = getDB();
        if (!db) {
            mostrarNotificacion('Error: Base de datos no disponible', 'error');
            return;
        }
        
        // Verificar que la tabla ventas existe
        if (!db.ventas) {
            console.error('❌ La tabla ventas no existe en IndexedDB. Versión de BD:', db.verno);
            mostrarNotificacion('Error: La base de datos necesita actualizarse. Por favor, recargá la página (F5) o limpiá el caché del navegador.', 'error');
            return;
        }
        
        const sesion = await obtenerSesionLocal();
        if (!sesion || !sesion.comercio_id) {
            mostrarNotificacion('Error: No hay sesión activa', 'error');
            return;
        }
        
        // Cargar ventas del mes actual
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        
        ventasData = await db.ventas
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .filter(venta => {
                const fecha = new Date(venta.fecha || venta.created_at);
                return fecha >= inicioMes && fecha <= finMes;
            })
            .toArray();
        
        // Cargar detalles y pagos para cada venta
        for (const venta of ventasData) {
            // Cargar detalles
            const detalles = await db.detalle_ventas
                .where('venta_id')
                .equals(venta.id)
                .toArray();
            venta.detalles = detalles;
            
            // Cargar pagos
            const pagos = await db.pagos_ventas
                .where('venta_id')
                .equals(venta.id)
                .toArray();
            venta.pagos = pagos;
            
            // Obtener nombre del cliente
            if (venta.cliente_id) {
                const cliente = clientesData.find(c => c.id === venta.cliente_id);
                venta.cliente_nombre = cliente ? cliente.nombre : 'N/A';
            } else {
                venta.cliente_nombre = 'No Aplica';
            }
        }
        
        // Ordenar por fecha descendente (más recientes primero)
        ventasData.sort((a, b) => {
            const fechaA = new Date(a.fecha || a.created_at || 0);
            const fechaB = new Date(b.fecha || b.created_at || 0);
            return fechaB - fechaA;
        });
        
        ventasFiltradas = [...ventasData];
        
        actualizarIndicadores();
        aplicarFiltros();
        
    } catch (error) {
        console.error('Error cargando ventas:', error);
        mostrarNotificacion('Error al cargar ventas', 'error');
    }
}

/**
 * Actualiza los indicadores superiores
 */
function actualizarIndicadores() {
    const totalEl = document.getElementById('totalVentasMes');
    if (totalEl) {
        totalEl.textContent = ventasData.length;
    }
    
    const montoTotal = ventasData.reduce((suma, venta) => {
        return suma + (parseFloat(venta.total || 0));
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
    ventasFiltradas = ventasData.filter(venta => {
        // Filtro por facturación
        if (filtroFacturacion) {
            const facturacionMatch = venta.facturacion?.toLowerCase().includes(filtroFacturacion);
            if (!facturacionMatch) return false;
        }
        
        // Filtro por cliente
        if (filtroCliente) {
            const clienteMatch = venta.cliente_nombre?.toLowerCase().includes(filtroCliente);
            if (!clienteMatch) return false;
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
    const tbody = document.getElementById('tbodyVentas');
    if (!tbody) return;
    
    // Calcular paginación
    const totalRegistros = ventasFiltradas.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = ventasFiltradas.slice(inicio, fin);
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (registrosPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: var(--espaciado-xl); color: var(--color-texto-secundario);">
                    ${filtroFacturacion || filtroCliente ? 'No se encontraron ventas con esos filtros' : 'No hay ventas registradas este mes'}
                </td>
            </tr>
        `;
    } else {
        registrosPagina.forEach(venta => {
            const tr = document.createElement('tr');
            tr.dataset.id = venta.id;
            
            const fecha = venta.fecha || venta.created_at || new Date().toISOString();
            const fechaFormateada = formatearFecha(fecha);
            const estado = venta.estado || 'pendiente';
            const estadoClass = estado === 'pagada' ? 'pagada' : (estado === 'parcial' ? 'parcial' : 'deuda');
            const cantidadProductos = venta.detalles ? venta.detalles.reduce((suma, detalle) => suma + (parseFloat(detalle.cantidad || 0)), 0) : 0;
            
            tr.innerHTML = `
                <td>${venta.id.substring(0, 8)}...</td>
                <td>${escapeHtml(venta.facturacion || 'N/A')}</td>
                <td>${escapeHtml(venta.cliente_nombre || 'N/A')}</td>
                <td>${cantidadProductos.toLocaleString('es-AR')}</td>
                <td>${formatearPrecio(parseFloat(venta.total || 0))}</td>
                <td>${formatearPrecio(parseFloat(venta.monto_pagado || 0))}</td>
                <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                <td>${fechaFormateada}</td>
                <td>${escapeHtml(venta.responsable_nombre || 'N/A')}</td>
                <td class="acciones-cell">
                    <button class="btn-accion ver" onclick="verDetalleVenta('${venta.id}')" title="Ver detalle">👁️</button>
                    <button class="btn-accion editar" onclick="editarVenta('${venta.id}')" title="Editar">✏️</button>
                    <button class="btn-accion eliminar" onclick="eliminarVenta('${venta.id}')" title="Eliminar">🗑️</button>
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
            Mostrando ${inicio} - ${fin} de ${totalRegistros} ventas
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
    const totalPaginas = Math.ceil(ventasFiltradas.length / registrosPorPagina);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        renderizarTabla();
        document.querySelector('.tabla-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Ver detalle de venta
 */
async function verDetalleVenta(id) {
    try {
        const venta = ventasData.find(v => v.id === id);
        if (!venta) {
            mostrarNotificacion('Venta no encontrada', 'error');
            return;
        }
        
        const modal = document.getElementById('modalDetalleVenta');
        const modalBody = document.getElementById('modalDetalleVentaBody');
        
        if (!modal || !modalBody) return;
        
        // Construir HTML del detalle
        let html = `
            <div class="detalle-venta">
                <div class="detalle-seccion">
                    <h4>Información General</h4>
                    <div class="detalle-fila">
                        <span class="detalle-label">ID:</span>
                        <span class="detalle-valor">${venta.id.substring(0, 8)}...</span>
                    </div>
                    <div class="detalle-fila">
                        <span class="detalle-label">Fecha:</span>
                        <span class="detalle-valor">${formatearFecha(venta.fecha || venta.created_at)}</span>
                    </div>
                    <div class="detalle-fila">
                        <span class="detalle-label">Facturación:</span>
                        <span class="detalle-valor">${escapeHtml(venta.facturacion || 'No Aplica')}</span>
                    </div>
                    <div class="detalle-fila">
                        <span class="detalle-label">Cliente:</span>
                        <span class="detalle-valor">${escapeHtml(venta.cliente_nombre || 'No Aplica')}</span>
                    </div>
                    <div class="detalle-fila">
                        <span class="detalle-label">Estado:</span>
                        <span class="detalle-valor">
                            <span class="estado-badge ${venta.estado === 'pagada' ? 'pagada' : (venta.estado === 'parcial' ? 'parcial' : 'deuda')}">${venta.estado || 'pendiente'}</span>
                        </span>
                    </div>
                    <div class="detalle-fila">
                        <span class="detalle-label">Responsable:</span>
                        <span class="detalle-valor">${escapeHtml(venta.responsable_nombre || 'N/A')}</span>
                    </div>
                </div>
                
                <div class="detalle-seccion">
                    <h4>Productos</h4>
                    <table class="tabla-detalle">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Descuento</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (venta.detalles && venta.detalles.length > 0) {
            venta.detalles.forEach(detalle => {
                // Manejar tanto descuento_porcentaje como descuento (compatibilidad)
                const descuentoPorcentaje = detalle.descuento_porcentaje || detalle.descuento || 0;
                const descuentoTexto = descuentoPorcentaje > 0 ? `${descuentoPorcentaje}%` : '0%';
                html += `
                    <tr>
                        <td>${escapeHtml(detalle.codigo_barra || 'N/A')}</td>
                        <td>${escapeHtml(detalle.nombre_producto || 'N/A')}</td>
                        <td>${(detalle.cantidad || 0).toLocaleString('es-AR')}</td>
                        <td>${formatearPrecio(detalle.precio_unitario || 0)}</td>
                        <td>${descuentoTexto}</td>
                        <td>${formatearPrecio(detalle.subtotal || 0)}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="6" style="text-align: center; padding: var(--espaciado-lg);">No hay productos</td></tr>`;
        }
        
        html += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5" style="text-align: right; font-weight: 700;">Total:</td>
                                <td style="font-weight: 700;">${formatearPrecio(parseFloat(venta.total || 0))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="detalle-seccion">
                    <h4>Pagos</h4>
                    <table class="tabla-detalle">
                        <thead>
                            <tr>
                                <th>Forma de pago</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (venta.pagos && venta.pagos.length > 0) {
            venta.pagos.forEach(pago => {
                html += `
                    <tr>
                        <td>${formatearFormaPago(pago.forma_pago)}</td>
                        <td>${formatearPrecio(pago.monto || 0)}</td>
                        <td>${formatearFecha(pago.fecha_pago || pago.created_at)}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="3" style="text-align: center; padding: var(--espaciado-lg);">No hay pagos registrados</td></tr>`;
        }
        
        html += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="text-align: right; font-weight: 700;">Total pagado:</td>
                                <td style="font-weight: 700;">${formatearPrecio(parseFloat(venta.monto_pagado || 0))}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; font-weight: 700; color: var(--color-advertencia);">Deuda pendiente:</td>
                                <td style="font-weight: 700; color: var(--color-advertencia);">${formatearPrecio(parseFloat(venta.monto_deuda || 0))}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = html;
        modal.style.display = 'flex';
        
        // Guardar ID para impresión
        modal.dataset.ventaId = id;
        
    } catch (error) {
        console.error('Error mostrando detalle de venta:', error);
        mostrarNotificacion('Error al cargar el detalle de la venta', 'error');
    }
}

/**
 * Cierra el modal de detalle
 */
function cerrarModalDetalle() {
    const modal = document.getElementById('modalDetalleVenta');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Imprime el detalle de la venta
 */
function imprimirDetalleVenta() {
    const modal = document.getElementById('modalDetalleVenta');
    const ventaId = modal?.dataset.ventaId;
    if (!ventaId) return;
    
    const venta = ventasData.find(v => v.id === ventaId);
    if (!venta) return;
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Detalle de Venta ${venta.id.substring(0, 8)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .detalle-seccion { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tfoot td { font-weight: bold; border-top: 2px solid #333; }
            </style>
        </head>
        <body>
            ${document.getElementById('modalDetalleVentaBody').innerHTML}
        </body>
        </html>
    `);
    ventanaImpresion.document.close();
    ventanaImpresion.print();
}

/**
 * Editar venta
 */
async function editarVenta(id) {
    try {
        const venta = ventasData.find(v => v.id === id);
        if (!venta) {
            mostrarNotificacion('Venta no encontrada', 'error');
            return;
        }
        
        // Cargar detalles y pagos si no están cargados
        if (!venta.detalles || !venta.pagos) {
            const db = getDB();
            if (db) {
                venta.detalles = await db.detalle_ventas.where('venta_id').equals(venta.id).toArray();
                venta.pagos = await db.pagos_ventas.where('venta_id').equals(venta.id).toArray();
            }
        }
        
        // Preparar datos para el formulario
        ventaEnCurso = {
            id: venta.id,
            facturacion: venta.facturacion || 'No Aplica',
            cliente_id: venta.cliente_id || null,
            productos: (venta.detalles || []).map(detalle => ({
                producto_id: detalle.producto_id,
                codigo_barra: detalle.codigo_barra,
                nombre_producto: detalle.nombre_producto,
                cantidad: detalle.cantidad,
                precio_unitario: detalle.precio_unitario,
                descuento: detalle.descuento_porcentaje || detalle.descuento || 0,
                subtotal: detalle.subtotal
            })),
            pagos: (venta.pagos || []).map(pago => ({
                forma_pago: pago.forma_pago,
                monto: pago.monto
            }))
        };
        
        // Llenar formulario
        document.getElementById('facturacion').value = ventaEnCurso.facturacion;
        document.getElementById('clienteVenta').value = ventaEnCurso.cliente_id || '';
        
        // Renderizar productos y pagos
        renderizarProductos();
        renderizarPagos();
        actualizarTotales();
        
        // Mostrar panel
        const panel = document.getElementById('panelCarga');
        if (panel) {
            panel.style.display = 'block';
            const panelTitulo = panel.querySelector('.panel-titulo');
            if (panelTitulo) {
                panelTitulo.textContent = 'Editar Venta';
            }
            
            // Cambiar el botón de finalizar a guardar cambios
            const btnFinalizar = document.getElementById('btnFinalizarVenta');
            if (btnFinalizar) {
                btnFinalizar.textContent = 'Guardar cambios';
                btnFinalizar.onclick = async (e) => {
                    e.preventDefault();
                    await manejarGuardarCambiosVenta();
                };
            }
        }
        
        // Scroll al panel
        panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error editando venta:', error);
        mostrarNotificacion('Error al cargar la venta para editar', 'error');
    }
}

/**
 * Eliminar venta
 */
async function eliminarVenta(id) {
    if (!confirm('¿Estás seguro de que querés eliminar esta venta? Esta acción no se puede deshacer y se revertirán los cambios de stock y deuda del cliente.')) {
        return;
    }
    
    try {
        const db = getDB();
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        const venta = ventasData.find(v => v.id === id);
        if (!venta) {
            mostrarNotificacion('Venta no encontrada', 'error');
            return;
        }
        
        // Cargar detalles y pagos
        const detalles = await db.detalle_ventas.where('venta_id').equals(id).toArray();
        const pagos = await db.pagos_ventas.where('venta_id').equals(id).toArray();
        
        // Revertir stock para cada producto
        for (const detalle of detalles) {
            if (detalle.producto_id && db.stock) {
                const stockExistente = await db.stock
                    .where('producto_id')
                    .equals(detalle.producto_id)
                    .first();
                
                if (stockExistente) {
                    const nuevaCantidad = parseFloat(stockExistente.cantidad || 0) + parseFloat(detalle.cantidad || 0);
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
                }
            }
        }
        
        // Revertir deuda del cliente
        if (venta.cliente_id && venta.monto_deuda > 0 && db.clientes) {
            const cliente = await db.clientes.get(venta.cliente_id);
            if (cliente) {
                const nuevaDeuda = Math.max(0, parseFloat(cliente.saldo_pendiente || 0) - parseFloat(venta.monto_deuda || 0));
                await db.clientes.update(venta.cliente_id, {
                    saldo_pendiente: nuevaDeuda,
                    updated_at: new Date().toISOString(),
                    synced: false
                });
                
                // Agregar a cola de sincronización
                const clienteActualizado = await db.clientes.get(venta.cliente_id);
                if (typeof agregarAColaSincronizacion === 'function' && clienteActualizado) {
                    await agregarAColaSincronizacion('clientes', venta.cliente_id, 'update', clienteActualizado);
                }
            }
        }
        
        // Eliminar pagos
        for (const pago of pagos) {
            await db.pagos_ventas.delete(pago.id);
            if (typeof agregarAColaSincronizacion === 'function') {
                await agregarAColaSincronizacion('pagos_ventas', pago.id, 'delete', null);
            }
        }
        
        // Eliminar detalles
        for (const detalle of detalles) {
            await db.detalle_ventas.delete(detalle.id);
            if (typeof agregarAColaSincronizacion === 'function') {
                await agregarAColaSincronizacion('detalle_ventas', detalle.id, 'delete', null);
            }
        }
        
        // Eliminar venta
        await db.ventas.delete(id);
        if (typeof agregarAColaSincronizacion === 'function') {
            await agregarAColaSincronizacion('ventas', id, 'delete', null);
        }
        
        mostrarNotificacion('Venta eliminada correctamente', 'exito');
        await cargarVentas();
        
        // Intentar sincronizar
        if (typeof forzarSincronizacion === 'function') {
            forzarSincronizacion();
        }
        
    } catch (error) {
        console.error('Error eliminando venta:', error);
        mostrarNotificacion('Error al eliminar la venta: ' + error.message, 'error');
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
window.verDetalleVenta = verDetalleVenta;
window.editarVenta = editarVenta;
window.eliminarVenta = eliminarVenta;
window.cerrarModalDetalle = cerrarModalDetalle;
window.imprimirDetalleVenta = imprimirDetalleVenta;


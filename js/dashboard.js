/* ============================================
   DASHBOARD - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Dashboard
============================================ */

// Variables globales
let clientesData = [];
let ventasData = [];
let detalleVentasData = [];
let pagosVentasData = [];
let productosData = [];
let proveedoresData = [];
let usuariosData = [];

// Instancias de gráficos
let graficoClientesDeudas = null;
let graficoVentas = null;
let graficoProductosVendidos = null;
let graficoProveedoresDeuda = null;
let graficoFormasPago = null;
let graficoVentasUsuarios = null;

// Rango de fechas global
let fechaDesde = null;
let fechaHasta = null;

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Dashboard cargada');
    
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        await cargarDatos();
        
        // Cargar y aplicar tema
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarEventos();
        inicializarCerrarSesion();
        inicializarFiltrosFecha();
        
        // Esperar un poco para que Chart.js se cargue completamente
        setTimeout(() => {
            actualizarTodosLosGraficos();
        }, 100);
        
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
 * Carga todos los datos necesarios
 */
async function cargarDatos() {
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
        
        // Cargar clientes
        clientesData = await db.clientes
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Cargar ventas
        ventasData = await db.ventas
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Cargar detalles de ventas
        detalleVentasData = await db.detalle_ventas.toArray();
        
        // Cargar pagos de ventas
        pagosVentasData = await db.pagos_ventas.toArray();
        
        // Cargar productos
        productosData = await db.productos
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Cargar proveedores
        proveedoresData = await db.proveedores
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        // Cargar usuarios
        usuariosData = await db.usuario
            .where('comercio_id')
            .equals(sesion.comercio_id)
            .toArray();
        
        console.log('✅ Datos cargados para Dashboard');
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarNotificacion('Error al cargar datos', 'error');
    }
}

/**
 * Inicializa los event listeners
 */
function inicializarEventos() {
    // Filtro global de fecha
    const filtroGlobal = document.getElementById('filtroFechaGlobal');
    if (filtroGlobal) {
        filtroGlobal.addEventListener('change', function() {
            actualizarFiltroGlobal(this.value);
        });
    }
    
    // Botón aplicar filtro personalizado
    const btnAplicar = document.getElementById('btnAplicarFiltro');
    if (btnAplicar) {
        btnAplicar.addEventListener('click', function() {
            const desde = document.getElementById('fechaDesde').value;
            const hasta = document.getElementById('fechaHasta').value;
            
            if (desde && hasta) {
                fechaDesde = new Date(desde);
                fechaHasta = new Date(hasta);
                fechaHasta.setHours(23, 59, 59, 999);
                actualizarTodosLosGraficos();
            } else {
                mostrarNotificacion('Debés seleccionar ambas fechas', 'error');
            }
        });
    }
    
    // Filtros individuales de fecha
    const filtrosFecha = [
        'filtroFechaClientes',
        'filtroFechaVentas',
        'filtroFechaProductos',
        'filtroFechaProveedores',
        'filtroFechaFormasPago',
        'filtroFechaUsuarios'
    ];
    
    filtrosFecha.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', function() {
                actualizarGraficoIndividual(id);
            });
        }
    });
    
    // Cantidad de productos
    const cantidadProductos = document.getElementById('cantidadProductos');
    if (cantidadProductos) {
        cantidadProductos.addEventListener('change', function() {
            actualizarGraficoProductos();
        });
    }
}

/**
 * Inicializa los filtros de fecha
 */
function inicializarFiltrosFecha() {
    // Establecer fecha por defecto (este mes)
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    
    fechaDesde = inicioMes;
    fechaHasta = finMes;
    
    // Establecer valores por defecto en los inputs
    const fechaDesdeStr = inicioMes.toISOString().split('T')[0];
    
    document.querySelectorAll('.filtro-fecha-individual').forEach(input => {
        input.value = fechaDesdeStr;
    });
    
    // Establecer valores en el filtro personalizado
    const fechaDesdeInput = document.getElementById('fechaDesde');
    const fechaHastaInput = document.getElementById('fechaHasta');
    if (fechaDesdeInput) fechaDesdeInput.value = fechaDesdeStr;
    if (fechaHastaInput) fechaHastaInput.value = finMes.toISOString().split('T')[0];
}

/**
 * Actualiza el filtro global de fecha
 */
function actualizarFiltroGlobal(periodo) {
    const ahora = new Date();
    let inicio, fin;
    
    switch (periodo) {
        case 'hoy':
            inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
            fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
            break;
        case 'semana':
            const diaSemana = ahora.getDay();
            inicio = new Date(ahora);
            inicio.setDate(ahora.getDate() - diaSemana);
            inicio.setHours(0, 0, 0, 0);
            fin = new Date(inicio);
            fin.setDate(inicio.getDate() + 6);
            fin.setHours(23, 59, 59, 999);
            break;
        case 'mes':
            inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
            fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
            break;
        case 'trimestre':
            const trimestre = Math.floor(ahora.getMonth() / 3);
            inicio = new Date(ahora.getFullYear(), trimestre * 3, 1);
            fin = new Date(ahora.getFullYear(), (trimestre + 1) * 3, 0, 23, 59, 59);
            break;
        case 'año':
            inicio = new Date(ahora.getFullYear(), 0, 1);
            fin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);
            break;
        case 'personalizado':
            const filtroPersonalizado = document.getElementById('filtroPersonalizado');
            if (filtroPersonalizado) {
                filtroPersonalizado.style.display = 'flex';
            }
            return;
        default:
            return;
    }
    
    fechaDesde = inicio;
    fechaHasta = fin;
    
    const filtroPersonalizado = document.getElementById('filtroPersonalizado');
    if (filtroPersonalizado) {
        filtroPersonalizado.style.display = 'none';
    }
    
    // Actualizar inputs individuales
    const fechaDesdeStr = inicio.toISOString().split('T')[0];
    document.querySelectorAll('.filtro-fecha-individual').forEach(input => {
        input.value = fechaDesdeStr;
    });
    
    actualizarTodosLosGraficos();
}

/**
 * Obtiene el rango de fechas para un gráfico individual
 */
function obtenerRangoFechas(graficoId) {
    const input = document.getElementById(graficoId);
    if (input && input.value) {
        const fecha = new Date(input.value);
        const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59);
        return { desde: inicio, hasta: fin };
    }
    return { desde: fechaDesde, hasta: fechaHasta };
}

/**
 * Actualiza un gráfico individual
 */
function actualizarGraficoIndividual(graficoId) {
    switch (graficoId) {
        case 'filtroFechaClientes':
            actualizarGraficoClientesDeudas();
            break;
        case 'filtroFechaVentas':
            actualizarGraficoVentas();
            break;
        case 'filtroFechaProductos':
            actualizarGraficoProductos();
            break;
        case 'filtroFechaProveedores':
            actualizarGraficoProveedoresDeuda();
            break;
        case 'filtroFechaFormasPago':
            actualizarGraficoFormasPago();
            break;
        case 'filtroFechaUsuarios':
            actualizarGraficoVentasUsuarios();
            break;
    }
}

/**
 * Actualiza todos los gráficos
 */
function actualizarTodosLosGraficos() {
    actualizarGraficoClientesDeudas();
    actualizarGraficoVentas();
    actualizarGraficoProductos();
    actualizarGraficoProveedoresDeuda();
    actualizarGraficoFormasPago();
    actualizarGraficoVentasUsuarios();
}

/**
 * Actualiza el gráfico de clientes con deudas
 */
function actualizarGraficoClientesDeudas() {
    const rango = obtenerRangoFechas('filtroFechaClientes');
    
    // Filtrar clientes con deudas (el filtro de fecha se aplica a las ventas que generaron la deuda)
    // Por ahora mostramos todos los clientes con deudas
    const clientesConDeuda = clientesData
        .filter(c => parseFloat(c.saldo_pendiente || 0) > 0)
        .sort((a, b) => parseFloat(b.saldo_pendiente || 0) - parseFloat(a.saldo_pendiente || 0))
        .slice(0, 10); // Top 10
    
    if (clientesConDeuda.length === 0) {
        const ctx = document.getElementById('graficoClientesDeudas');
        if (ctx && graficoClientesDeudas) {
            graficoClientesDeudas.destroy();
            graficoClientesDeudas = null;
        }
        return;
    }
    
    const ctx = document.getElementById('graficoClientesDeudas');
    if (!ctx) return;
    
    if (graficoClientesDeudas) {
        graficoClientesDeudas.destroy();
    }
    
    graficoClientesDeudas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: clientesConDeuda.map(c => c.nombre || 'Sin nombre'),
            datasets: [{
                label: 'Deuda',
                data: clientesConDeuda.map(c => parseFloat(c.saldo_pendiente || 0)),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatearPrecio(context.parsed.x);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatearPrecio(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de ventas
 */
function actualizarGraficoVentas() {
    const rango = obtenerRangoFechas('filtroFechaVentas');
    
    // Filtrar ventas en el rango de fechas
    const ventasFiltradas = ventasData.filter(v => {
        const fecha = new Date(v.fecha || v.created_at);
        return fecha >= rango.desde && fecha <= rango.hasta;
    });
    
    // Agrupar por día
    const ventasPorDia = {};
    ventasFiltradas.forEach(venta => {
        const fecha = new Date(venta.fecha || venta.created_at);
        const dia = fecha.toISOString().split('T')[0];
        if (!ventasPorDia[dia]) {
            ventasPorDia[dia] = { total: 0, cantidad: 0 };
        }
        ventasPorDia[dia].total += parseFloat(venta.total || 0);
        ventasPorDia[dia].cantidad += 1;
    });
    
    const dias = Object.keys(ventasPorDia).sort();
    const montos = dias.map(dia => ventasPorDia[dia].total);
    const cantidades = dias.map(dia => ventasPorDia[dia].cantidad);
    
    // Si no hay datos, mostrar mensaje
    if (dias.length === 0) {
        if (graficoVentas) {
            graficoVentas.destroy();
            graficoVentas = null;
        }
        return;
    }
    
    const ctx = document.getElementById('graficoVentas');
    if (!ctx) return;
    
    if (graficoVentas) {
        graficoVentas.destroy();
    }
    
    graficoVentas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dias.map(dia => formatearFechaCorta(dia)),
            datasets: [
                {
                    label: 'Monto Total',
                    data: montos,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Número de Ventas',
                    data: cantidades,
                    type: 'line',
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Monto: ${formatearPrecio(context.parsed.y)}`;
                            } else {
                                return `Cantidad: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatearPrecio(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de productos más vendidos
 */
function actualizarGraficoProductos() {
    const rango = obtenerRangoFechas('filtroFechaProductos');
    const cantidad = parseInt(document.getElementById('cantidadProductos')?.value || 5);
    
    // Filtrar ventas en el rango de fechas
    const ventasFiltradas = ventasData.filter(v => {
        const fecha = new Date(v.fecha || v.created_at);
        return fecha >= rango.desde && fecha <= rango.hasta;
    });
    
    const ventaIds = ventasFiltradas.map(v => v.id);
    
    // Filtrar detalles de esas ventas
    const detallesFiltrados = detalleVentasData.filter(d => ventaIds.includes(d.venta_id));
    
    // Agrupar por producto
    const productosVendidos = {};
    detallesFiltrados.forEach(detalle => {
        const productoId = detalle.producto_id;
        if (!productoId) return;
        
        if (!productosVendidos[productoId]) {
            productosVendidos[productoId] = {
                nombre: detalle.nombre_producto || 'Producto desconocido',
                cantidad: 0
            };
        }
        productosVendidos[productoId].cantidad += parseFloat(detalle.cantidad || 0);
    });
    
    // Ordenar y tomar los top N
    const topProductos = Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, cantidad);
    
    const ctx = document.getElementById('graficoProductosVendidos');
    if (!ctx) return;
    
    if (graficoProductosVendidos) {
        graficoProductosVendidos.destroy();
    }
    
    // Colores para el gráfico de torta
    const colores = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(168, 85, 247, 0.8)'
    ];
    
    graficoProductosVendidos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topProductos.map(p => p.nombre),
            datasets: [{
                label: 'Cantidad vendida',
                data: topProductos.map(p => p.cantidad),
                backgroundColor: colores.slice(0, topProductos.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value.toLocaleString('es-AR')} unidades`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de proveedores que les debo
 */
function actualizarGraficoProveedoresDeuda() {
    const rango = obtenerRangoFechas('filtroFechaProveedores');
    
    // Filtrar proveedores con deudas
    const proveedoresConDeuda = proveedoresData
        .filter(p => parseFloat(p.saldo_pendiente || 0) > 0)
        .sort((a, b) => parseFloat(b.saldo_pendiente || 0) - parseFloat(a.saldo_pendiente || 0))
        .slice(0, 10); // Top 10
    
    const ctx = document.getElementById('graficoProveedoresDeuda');
    if (!ctx) return;
    
    if (graficoProveedoresDeuda) {
        graficoProveedoresDeuda.destroy();
    }
    
    graficoProveedoresDeuda = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: proveedoresConDeuda.map(p => p.nombre || p.razon_social || 'Sin nombre'),
            datasets: [{
                label: 'Deuda',
                data: proveedoresConDeuda.map(p => parseFloat(p.saldo_pendiente || 0)),
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatearPrecio(context.parsed.x);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatearPrecio(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de formas de pago
 */
function actualizarGraficoFormasPago() {
    const rango = obtenerRangoFechas('filtroFechaFormasPago');
    
    // Filtrar ventas en el rango de fechas
    const ventasFiltradas = ventasData.filter(v => {
        const fecha = new Date(v.fecha || v.created_at);
        return fecha >= rango.desde && fecha <= rango.hasta;
    });
    
    const ventaIds = ventasFiltradas.map(v => v.id);
    
    // Filtrar pagos de esas ventas
    const pagosFiltrados = pagosVentasData.filter(p => ventaIds.includes(p.venta_id));
    
    // Agrupar por forma de pago
    const formasPago = {};
    pagosFiltrados.forEach(pago => {
        const forma = pago.forma_pago || 'otro';
        if (!formasPago[forma]) {
            formasPago[forma] = 0;
        }
        formasPago[forma] += parseFloat(pago.monto || 0);
    });
    
    const formas = Object.keys(formasPago);
    const montos = formas.map(forma => formasPago[forma]);
    
    if (formas.length === 0) {
        const ctx = document.getElementById('graficoFormasPago');
        if (ctx && graficoFormasPago) {
            graficoFormasPago.destroy();
            graficoFormasPago = null;
        }
        return;
    }
    
    const ctx = document.getElementById('graficoFormasPago');
    if (!ctx) return;
    
    if (graficoFormasPago) {
        graficoFormasPago.destroy();
    }
    
    // Colores para formas de pago
    const colores = {
        efectivo: 'rgba(34, 197, 94, 0.8)',
        transferencia: 'rgba(59, 130, 246, 0.8)',
        QR: 'rgba(139, 92, 246, 0.8)',
        debito: 'rgba(16, 185, 129, 0.8)',
        credito: 'rgba(245, 158, 11, 0.8)',
        cheque: 'rgba(239, 68, 68, 0.8)',
        otro: 'rgba(107, 114, 128, 0.8)'
    };
    
    graficoFormasPago = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formas.map(f => formatearFormaPago(f)),
            datasets: [{
                label: 'Monto',
                data: montos,
                backgroundColor: formas.map(f => colores[f] || colores.otro),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${formatearPrecio(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza el gráfico de ventas por usuario
 */
function actualizarGraficoVentasUsuarios() {
    const rango = obtenerRangoFechas('filtroFechaUsuarios');
    
    // Filtrar ventas en el rango de fechas
    const ventasFiltradas = ventasData.filter(v => {
        const fecha = new Date(v.fecha || v.created_at);
        return fecha >= rango.desde && fecha <= rango.hasta;
    });
    
    // Agrupar por responsable
    const ventasPorUsuario = {};
    ventasFiltradas.forEach(venta => {
        const responsable = venta.responsable_nombre || 'Usuario desconocido';
        if (!ventasPorUsuario[responsable]) {
            ventasPorUsuario[responsable] = 0;
        }
        ventasPorUsuario[responsable] += parseFloat(venta.total || 0);
    });
    
    const usuarios = Object.keys(ventasPorUsuario);
    const montos = usuarios.map(usuario => ventasPorUsuario[usuario]);
    
    const ctx = document.getElementById('graficoVentasUsuarios');
    if (!ctx) return;
    
    if (graficoVentasUsuarios) {
        graficoVentasUsuarios.destroy();
    }
    
    // Colores para el gráfico de torta
    const colores = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(34, 197, 94, 0.8)'
    ];
    
    graficoVentasUsuarios = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: usuarios,
            datasets: [{
                label: 'Monto vendido',
                data: montos,
                backgroundColor: colores.slice(0, usuarios.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${formatearPrecio(value)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Formatea una fecha corta (solo fecha)
 */
function formatearFechaCorta(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
    });
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


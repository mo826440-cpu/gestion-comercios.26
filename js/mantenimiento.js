/* ============================================
   MANTENIMIENTO - JAVASCRIPT
   ============================================
   Panel técnico exclusivo para rol "programador"
   
   SEGURIDAD:
   - Solo accesible con rol === "programador"
   - Usuario programador NO se puede crear desde la app
   - Solo existe si fue creado manualmente en Supabase
   - NO se sincroniza con IndexedDB
============================================ */

// ============================================
// CONSTANTES
// ============================================
const ROL_PROGRAMADOR = 'programador';

// Tablas de Supabase a consultar (solo las que existen actualmente)
// NOTA: Agregar 'proveedores', 'compras', 'detalle_compras' cuando se creen esas tablas
const TABLAS_SUPABASE = [
    'comercios',
    'usuarios',
    'roles',
    'permisos',
    'roles_permisos',
    'categorias',
    'marcas',
    'productos',
    'clientes',
    'cajas',
    'ventas',
    'detalle_ventas',
    'stock',
    'movimientos_stock',
    'logs_sistema'
];

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Panel de Mantenimiento - Inicializando...');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        // Cargar y aplicar tema
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        // CRÍTICO: Verificar permisos de acceso
        const tieneAcceso = await verificarAccesoProgramador();
        
        if (!tieneAcceso) {
            console.error('❌ Acceso denegado - Usuario no es programador');
            mostrarAccesoDenegado();
            return;
        }
        
        console.log('✅ Acceso autorizado - Cargando panel...');
        
        // Inicializar el panel
        await inicializarPanel();
        
    }, 500);
});

// ============================================
// VERIFICACIÓN DE ACCESO
// ============================================

/**
 * Verifica si el usuario actual tiene rol de programador
 * @returns {Promise<boolean>} True si tiene acceso
 */
async function verificarAccesoProgramador() {
    try {
        // 1. Verificar sesión en Supabase
        const sesion = await getSesionActual();
        
        if (!sesion || !sesion.user) {
            console.warn('⚠️ No hay sesión activa');
            redirigirALogin();
            return false;
        }
        
        // 2. Obtener datos del usuario con su rol
        const datosUsuario = await obtenerDatosUsuarioCompleto(sesion.user.id);
        
        if (!datosUsuario) {
            console.warn('⚠️ No se encontraron datos del usuario');
            return false;
        }
        
        // 3. Verificar si el rol es "programador"
        const rolNombre = datosUsuario.rol?.nombre?.toLowerCase();
        
        if (rolNombre !== ROL_PROGRAMADOR) {
            console.warn(`⚠️ Rol actual: ${rolNombre} - Se requiere: ${ROL_PROGRAMADOR}`);
            registrarIntentoNoAutorizado(datosUsuario);
            return false;
        }
        
        // 4. Mostrar info del usuario
        mostrarInfoUsuario(datosUsuario);
        
        return true;
        
    } catch (error) {
        console.error('Error verificando acceso:', error);
        return false;
    }
}

/**
 * Registra intento de acceso no autorizado
 * @param {Object} usuario - Datos del usuario
 */
function registrarIntentoNoAutorizado(usuario) {
    console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO:', {
        usuario: usuario.email,
        rol: usuario.rol?.nombre,
        fecha: new Date().toISOString()
    });
}

/**
 * Muestra mensaje de acceso denegado y redirige
 */
function mostrarAccesoDenegado() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0d1117;
            color: #f85149;
            font-family: monospace;
            text-align: center;
            padding: 20px;
        ">
            <div style="font-size: 4rem; margin-bottom: 20px;">🚫</div>
            <h1 style="margin: 0 0 10px 0;">Acceso Denegado</h1>
            <p style="color: #8b949e; margin-bottom: 30px;">
                Esta sección es exclusiva para usuarios con rol de programador.
            </p>
            <a href="inicio.html" style="
                color: #58a6ff;
                text-decoration: none;
                padding: 10px 20px;
                border: 1px solid #58a6ff;
                border-radius: 6px;
            ">← Volver al Inicio</a>
        </div>
    `;
    
    // Redirigir después de 3 segundos
    setTimeout(() => {
        window.location.href = 'inicio.html';
    }, 3000);
}

/**
 * Redirige al login
 */
function redirigirALogin() {
    window.location.href = 'login.html';
}

/**
 * Muestra información del usuario en el header
 * @param {Object} usuario - Datos del usuario
 */
function mostrarInfoUsuario(usuario) {
    const infoEl = document.getElementById('usuarioInfo');
    if (infoEl) {
        infoEl.textContent = `${usuario.email} • ${usuario.rol?.nombre || 'Sin rol'}`;
    }
}

// ============================================
// INICIALIZACIÓN DEL PANEL
// ============================================

/**
 * Inicializa todos los componentes del panel
 */
async function inicializarPanel() {
    // Configurar botones de actualización
    configurarBotones();
    
    // Cargar datos iniciales
    await Promise.all([
        cargarEstadoMemoria(),
        cargarEstadisticas(),
        cargarEstructuraBD(),
        cargarDiferenciasSincronizacion()
    ]);
}

/**
 * Configura los event listeners de los botones
 */
function configurarBotones() {
    // Botón actualizar memoria
    const btnMemoria = document.getElementById('btnActualizarMemoria');
    if (btnMemoria) {
        btnMemoria.addEventListener('click', () => cargarEstadoMemoria());
    }
    
    // Botón actualizar estadísticas
    const btnStats = document.getElementById('btnActualizarEstadisticas');
    if (btnStats) {
        btnStats.addEventListener('click', () => cargarEstadisticas());
    }
    
    // Botón actualizar estructura
    const btnEstructura = document.getElementById('btnActualizarEstructura');
    if (btnEstructura) {
        btnEstructura.addEventListener('click', () => cargarEstructuraBD());
    }
    
    // Botón forzar sincronización
    const btnSync = document.getElementById('btnForzarSync');
    if (btnSync) {
        btnSync.addEventListener('click', () => ejecutarSincronizacion());
    }
    
    // Botón limpiar cola de sincronización
    const btnLimpiarColaSync = document.getElementById('btnLimpiarColaSync');
    if (btnLimpiarColaSync) {
        btnLimpiarColaSync.addEventListener('click', () => limpiarColaSincronizacion());
    }
    
    // Botón limpiar duplicados
    const btnLimpiarDuplicados = document.getElementById('btnLimpiarDuplicados');
    if (btnLimpiarDuplicados) {
        btnLimpiarDuplicados.addEventListener('click', () => limpiarDuplicadosLocales());
    }
    
    // Botón limpiar todo y re-sincronizar
    const btnLimpiarTodo = document.getElementById('btnLimpiarTodo');
    if (btnLimpiarTodo) {
        btnLimpiarTodo.addEventListener('click', () => limpiarTodoYResincronizar());
    }
}

// ============================================
// SECCIÓN 1: ESTADO DE MEMORIA
// ============================================

/**
 * Carga y muestra el estado de memoria
 */
async function cargarEstadoMemoria() {
    console.log('💾 Cargando estado de memoria...');
    
    const btnMemoria = document.getElementById('btnActualizarMemoria');
    if (btnMemoria) {
        btnMemoria.disabled = true;
        btnMemoria.textContent = '⏳ Cargando...';
    }
    
    try {
        // Cargar memoria de Supabase
        await cargarMemoriaSupabase();
        
        // Cargar memoria de IndexedDB
        await cargarMemoriaIndexedDB();
        
        // Cargar memoria por comercio
        await cargarMemoriaPorComercio();
        
    } catch (error) {
        console.error('Error cargando memoria:', error);
    } finally {
        if (btnMemoria) {
            btnMemoria.disabled = false;
            btnMemoria.textContent = '🔄 Actualizar';
        }
    }
}

/**
 * Carga información de memoria de Supabase
 */
async function cargarMemoriaSupabase() {
    const client = getSupabase();
    if (!client) return;
    
    // Constantes del Plan Gratuito de Supabase
    const PLAN_GRATIS_LIMITE_MB = 500; // 500 MB límite de base de datos
    const PLAN_GRATIS_STORAGE_GB = 1;  // 1 GB almacenamiento
    const PLAN_PRO_LIMITE_GB = 8;      // 8 GB límite inicial (escalable)
    
    let totalRegistros = 0;
    let detalles = [];
    
    for (const tabla of TABLAS_SUPABASE) {
        try {
            const { count, error } = await client
                .from(tabla)
                .select('*', { count: 'exact', head: true });
            
            if (!error && count !== null) {
                totalRegistros += count;
                if (count > 0) {
                    detalles.push(`${tabla}: ${count}`);
                }
            }
        } catch (e) {
            // Tabla puede no existir
        }
    }
    
    // Mostrar total de registros
    const valorEl = document.querySelector('#memoriaSupabase .memoria-valor');
    if (valorEl) {
        valorEl.textContent = totalRegistros.toLocaleString();
    }
    
    // Calcular estimación de almacenamiento (aproximado ~1KB por registro)
    const estimacionKB = totalRegistros * 1;
    const estimacionMB = estimacionKB / 1024;
    const estimacionTexto = estimacionKB < 1024 
        ? `~${estimacionKB} KB` 
        : `~${estimacionMB.toFixed(2)} MB`;
    
    // Calcular porcentaje de uso
    const porcentajeUso = (estimacionMB / PLAN_GRATIS_LIMITE_MB) * 100;
    const disponibleMB = PLAN_GRATIS_LIMITE_MB - estimacionMB;
    
    // Determinar estado/color según uso
    let estadoColor = '#3fb950'; // Verde
    let estadoTexto = 'Excelente';
    if (porcentajeUso > 80) {
        estadoColor = '#f85149'; // Rojo
        estadoTexto = '⚠️ Crítico';
    } else if (porcentajeUso > 60) {
        estadoColor = '#d29922'; // Amarillo
        estadoTexto = 'Moderado';
    } else if (porcentajeUso > 30) {
        estadoColor = '#58a6ff'; // Azul
        estadoTexto = 'Normal';
    }
    
    // Mostrar detalle con toda la información
    const detalleEl = document.getElementById('memoriaSupabaseDetalle');
    if (detalleEl) {
        let html = detalles.length > 0 
            ? detalles.map(d => `<div>${d}</div>`).join('')
            : 'Sin datos';
        
        // Sección de memoria con barra de progreso
        html += `
            <div class="memoria-supabase-info">
                <!-- Barra de progreso -->
                <div class="memoria-barra-container">
                    <div class="memoria-barra-header">
                        <span>Storage Estimado</span>
                        <span style="color: ${estadoColor}">${estadoTexto}</span>
                    </div>
                    <div class="memoria-barra">
                        <div class="memoria-barra-progreso" style="width: ${Math.min(porcentajeUso, 100)}%; background: ${estadoColor}"></div>
                    </div>
                    <div class="memoria-barra-labels">
                        <span><strong>${estimacionTexto}</strong> usado</span>
                        <span><strong>${disponibleMB.toFixed(1)} MB</strong> disponible</span>
                    </div>
                </div>
                
                <!-- Advertencia de estimación -->
                <div class="memoria-advertencia">
                    <span class="icono">⚠️</span>
                    <div>
                        <strong>Valor estimado</strong> - Este cálculo se basa en ~1KB por registro. 
                        El uso real puede variar según el tamaño de tus datos.
                    </div>
                </div>
                
                <!-- Link a Supabase -->
                <a href="https://supabase.com/dashboard/project/jnplnwpofxzfqchkvgpv/observability/database#database-size-report" 
                   target="_blank" 
                   class="memoria-link-dashboard">
                    📊 Ver uso real en Supabase Dashboard →
                </a>
                
                <!-- Comparativa de planes -->
                <div class="planes-comparativa">
                    <h4>📋 Comparativa de Planes</h4>
                    
                    <div class="plan-card plan-gratis">
                        <div class="plan-header">
                            <span class="plan-nombre">🆓 Plan Gratuito</span>
                            <span class="plan-precio">$0/mes</span>
                        </div>
                        <ul class="plan-features">
                            <li>✓ Base de datos: <strong>500 MB</strong></li>
                            <li>✓ Almacenamiento: <strong>1 GB</strong></li>
                            <li>✓ Ancho de banda: <strong>2 GB/mes</strong></li>
                            <li>✓ Edge Functions: <strong>500K invocaciones</strong></li>
                            <li>✗ Sin backups automáticos</li>
                            <li>✗ Sin escalado automático</li>
                        </ul>
                        <div class="plan-nota">
                            💡 Ideal para: desarrollo y pruebas
                        </div>
                    </div>
                    
                    <div class="plan-card plan-pro">
                        <div class="plan-header">
                            <span class="plan-nombre">⚡ Plan Pro</span>
                            <span class="plan-precio">$25/mes</span>
                        </div>
                        <ul class="plan-features">
                            <li>✓ Base de datos: <strong>8 GB</strong> (escalable)</li>
                            <li>✓ Almacenamiento: <strong>100 GB</strong></li>
                            <li>✓ Ancho de banda: <strong>Ilimitado</strong></li>
                            <li>✓ Edge Functions: <strong>2M invocaciones</strong></li>
                            <li>✓ Backups diarios (7 días)</li>
                            <li>✓ Escalado automático</li>
                        </ul>
                        <div class="plan-nota plan-nota-recomendado">
                            🚀 Recomendado para: producción con clientes reales
                        </div>
                    </div>
                    
                    <!-- Botón upgrade -->
                    <a href="https://supabase.com/dashboard/project/jnplnwpofxzfqchkvgpv/settings/billing/subscription" 
                       target="_blank" 
                       class="btn-upgrade">
                        ⬆️ Actualizar a Plan Pro
                    </a>
                </div>
                
                <!-- Consideraciones -->
                <div class="memoria-consideraciones">
                    <h4>💡 Consideraciones Importantes</h4>
                    <ul>
                        <li>🔴 A <strong>500 MB</strong> la base de datos pasa a <strong>modo solo-lectura</strong></li>
                        <li>📈 El sistema actual soporta aproximadamente <strong>5-10 comercios pequeños</strong> con el plan gratuito</li>
                        <li>🛒 Cada venta con 5 productos genera ~6 registros (~6 KB)</li>
                        <li>📦 Con ~50,000 ventas mensuales empezarías a acercarte al límite</li>
                        <li>💰 El Plan Pro se paga solo con ~2-3 clientes comerciales</li>
                    </ul>
                </div>
            </div>
        `;
        
        detalleEl.innerHTML = html;
    }
}

/**
 * Carga información de memoria de IndexedDB
 */
async function cargarMemoriaIndexedDB() {
    const db = getDB();
    if (!db) {
        document.querySelector('#memoriaIndexedDB .memoria-valor').textContent = 'N/A';
        document.getElementById('memoriaIndexedDBDetalle').textContent = 'IndexedDB no disponible';
        return;
    }
    
    let totalRegistros = 0;
    let detalles = [];
    
    // Obtener nombres de tablas de Dexie
    const tablas = db.tables;
    
    for (const tabla of tablas) {
        try {
            const count = await tabla.count();
            totalRegistros += count;
            if (count > 0) {
                detalles.push(`${tabla.name}: ${count}`);
            }
        } catch (e) {
            console.warn(`Error contando ${tabla.name}:`, e);
        }
    }
    
    // Mostrar total
    const valorEl = document.querySelector('#memoriaIndexedDB .memoria-valor');
    if (valorEl) {
        valorEl.textContent = totalRegistros.toLocaleString();
    }
    
    // Mostrar detalle
    const detalleEl = document.getElementById('memoriaIndexedDBDetalle');
    if (detalleEl) {
        detalleEl.innerHTML = detalles.length > 0 
            ? detalles.map(d => `<div>${d}</div>`).join('')
            : 'Sin datos locales';
    }
    
    // Intentar obtener estimación de storage
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(0);
        detalleEl.innerHTML += `<div style="margin-top: 10px; color: #58a6ff;">Storage: ${usedMB} MB / ${quotaMB} MB</div>`;
    }
}

/**
 * Carga uso de memoria por comercio
 */
async function cargarMemoriaPorComercio() {
    const client = getSupabase();
    const container = document.getElementById('memoriaPorComercio');
    
    if (!client || !container) return;
    
    try {
        // Obtener comercios
        const { data: comercios, error } = await client
            .from('comercios')
            .select('id, razon_social');
        
        if (error) throw error;
        
        if (!comercios || comercios.length === 0) {
            container.innerHTML = '<p class="cargando">No hay comercios registrados</p>';
            return;
        }
        
        // Contar registros por comercio
        let rows = [];
        
        for (const comercio of comercios) {
            const stats = await contarRegistrosComercio(comercio.id);
            rows.push({
                nombre: comercio.razon_social,
                usuarios: stats.usuarios,
                productos: stats.productos,
                ventas: stats.ventas,
                total: stats.total
            });
        }
        
        // Generar tabla
        container.innerHTML = `
            <table class="tabla-mant">
                <thead>
                    <tr>
                        <th>Comercio</th>
                        <th>Usuarios</th>
                        <th>Productos</th>
                        <th>Ventas</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td>${r.nombre}</td>
                            <td>${r.usuarios}</td>
                            <td>${r.productos}</td>
                            <td>${r.ventas}</td>
                            <td style="color: #58a6ff; font-weight: 600;">${r.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error cargando memoria por comercio:', error);
        container.innerHTML = `<p class="cargando" style="color: #f85149;">Error: ${error.message}</p>`;
    }
}

/**
 * Cuenta registros de un comercio específico
 * @param {string} comercioId - ID del comercio
 * @returns {Object} Estadísticas
 */
async function contarRegistrosComercio(comercioId) {
    const client = getSupabase();
    let stats = { usuarios: 0, productos: 0, ventas: 0, total: 0 };
    
    try {
        // Usuarios
        const { count: usuarios } = await client
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('comercio_id', comercioId);
        stats.usuarios = usuarios || 0;
        
        // Productos
        const { count: productos } = await client
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('comercio_id', comercioId);
        stats.productos = productos || 0;
        
        // Ventas
        const { count: ventas } = await client
            .from('ventas')
            .select('*', { count: 'exact', head: true })
            .eq('comercio_id', comercioId);
        stats.ventas = ventas || 0;
        
        stats.total = stats.usuarios + stats.productos + stats.ventas;
        
    } catch (e) {
        console.warn('Error contando registros:', e);
    }
    
    return stats;
}

// ============================================
// SECCIÓN 2: ESTADÍSTICAS
// ============================================

/**
 * Carga estadísticas del sistema
 */
async function cargarEstadisticas() {
    console.log('📈 Cargando estadísticas...');
    
    const btnStats = document.getElementById('btnActualizarEstadisticas');
    if (btnStats) {
        btnStats.disabled = true;
        btnStats.textContent = '⏳ Cargando...';
    }
    
    const client = getSupabase();
    if (!client) return;
    
    try {
        // Total comercios
        const { count: comercios } = await client
            .from('comercios')
            .select('*', { count: 'exact', head: true });
        document.getElementById('totalComercios').textContent = comercios || 0;
        
        // Total usuarios
        const { count: usuarios } = await client
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        document.getElementById('totalUsuarios').textContent = usuarios || 0;
        
        // Total productos
        const { count: productos } = await client
            .from('productos')
            .select('*', { count: 'exact', head: true });
        document.getElementById('totalProductos').textContent = productos || 0;
        
        // Total ventas
        const { count: ventas } = await client
            .from('ventas')
            .select('*', { count: 'exact', head: true });
        document.getElementById('totalVentas').textContent = ventas || 0;
        
        // Cargar detalle por comercio
        await cargarDetalleComerciosTabla();
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    } finally {
        if (btnStats) {
            btnStats.disabled = false;
            btnStats.textContent = '🔄 Actualizar';
        }
    }
}

/**
 * Carga tabla de detalle por comercio
 */
async function cargarDetalleComerciosTabla() {
    const client = getSupabase();
    const container = document.getElementById('detalleComerciosTabla');
    
    if (!client || !container) return;
    
    try {
        const { data: comercios, error } = await client
            .from('comercios')
            .select(`
                id,
                razon_social,
                email,
                created_at,
                activo
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!comercios || comercios.length === 0) {
            container.innerHTML = '<p class="cargando">No hay comercios registrados</p>';
            return;
        }
        
        // Contar usuarios por comercio
        let rows = [];
        for (const c of comercios) {
            const { count } = await client
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('comercio_id', c.id);
            
            rows.push({
                ...c,
                usuariosCount: count || 0
            });
        }
        
        container.innerHTML = `
            <table class="tabla-mant">
                <thead>
                    <tr>
                        <th>Comercio</th>
                        <th>Email</th>
                        <th>Usuarios</th>
                        <th>Fecha Registro</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(c => `
                        <tr>
                            <td>${c.razon_social}</td>
                            <td>${c.email}</td>
                            <td>${c.usuariosCount}</td>
                            <td>${new Date(c.created_at).toLocaleDateString('es-AR')}</td>
                            <td>
                                <span style="color: ${c.activo ? '#3fb950' : '#f85149'}">
                                    ${c.activo ? '● Activo' : '○ Inactivo'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error cargando detalle comercios:', error);
        container.innerHTML = `<p class="cargando" style="color: #f85149;">Error: ${error.message}</p>`;
    }
}

// ============================================
// SECCIÓN 3: ESTRUCTURA DE BASES DE DATOS
// ============================================

/**
 * Carga estructura de las bases de datos
 */
async function cargarEstructuraBD() {
    console.log('🗄️ Cargando estructura de BD...');
    
    const btnEstructura = document.getElementById('btnActualizarEstructura');
    if (btnEstructura) {
        btnEstructura.disabled = true;
        btnEstructura.textContent = '⏳ Cargando...';
    }
    
    try {
        await Promise.all([
            cargarEstructuraSupabase(),
            cargarEstructuraIndexedDB()
        ]);
    } catch (error) {
        console.error('Error cargando estructura:', error);
    } finally {
        if (btnEstructura) {
            btnEstructura.disabled = false;
            btnEstructura.textContent = '🔄 Actualizar';
        }
    }
}

/**
 * Carga estructura de Supabase
 */
async function cargarEstructuraSupabase() {
    const client = getSupabase();
    const container = document.getElementById('supabaseEstructura');
    const totalEl = document.getElementById('supabaseTotalTablas');
    
    if (!client || !container) return;
    
    let tablasEncontradas = [];
    
    for (const tabla of TABLAS_SUPABASE) {
        try {
            const { count, error } = await client
                .from(tabla)
                .select('*', { count: 'exact', head: true });
            
            if (!error) {
                tablasEncontradas.push({
                    nombre: tabla,
                    registros: count || 0
                });
            }
        } catch (e) {
            // Tabla puede no existir
        }
    }
    
    // Actualizar total
    if (totalEl) {
        totalEl.textContent = `${tablasEncontradas.length} tablas`;
    }
    
    // Generar tabla
    container.innerHTML = `
        <table class="tabla-mant">
            <thead>
                <tr>
                    <th>Tabla</th>
                    <th>Registros</th>
                </tr>
            </thead>
            <tbody>
                ${tablasEncontradas.map(t => `
                    <tr>
                        <td>${t.nombre}</td>
                        <td>${t.registros.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Carga estructura de IndexedDB
 */
async function cargarEstructuraIndexedDB() {
    const db = getDB();
    const container = document.getElementById('indexedDBEstructura');
    const totalEl = document.getElementById('indexedDBTotalStores');
    
    if (!db || !container) {
        container.innerHTML = '<p class="cargando">IndexedDB no disponible</p>';
        return;
    }
    
    const tablas = db.tables;
    
    // Actualizar total
    if (totalEl) {
        totalEl.textContent = `${tablas.length} object stores`;
    }
    
    // Obtener info de cada tabla
    let rows = [];
    for (const tabla of tablas) {
        try {
            const count = await tabla.count();
            rows.push({
                nombre: tabla.name,
                registros: count,
                primaryKey: tabla.schema.primKey.name || 'auto'
            });
        } catch (e) {
            rows.push({
                nombre: tabla.name,
                registros: 'Error',
                primaryKey: '-'
            });
        }
    }
    
    // Generar tabla
    container.innerHTML = `
        <table class="tabla-mant">
            <thead>
                <tr>
                    <th>Object Store</th>
                    <th>Registros</th>
                    <th>Primary Key</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(t => `
                    <tr>
                        <td>${t.nombre}</td>
                        <td>${typeof t.registros === 'number' ? t.registros.toLocaleString() : t.registros}</td>
                        <td>${t.primaryKey}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============================================
// SECCIÓN 4: SINCRONIZACIÓN MANUAL
// ============================================

/**
 * Ejecuta sincronización forzada
 */
async function ejecutarSincronizacion() {
    console.log('🔄 Iniciando sincronización forzada...');
    
    const btnSync = document.getElementById('btnForzarSync');
    const estadoEl = document.getElementById('syncEstado');
    const logEl = document.getElementById('syncLog');
    
    // Deshabilitar botón
    if (btnSync) {
        btnSync.disabled = true;
    }
    
    // Mostrar estado
    actualizarEstadoSync('sincronizando', '🔄', 'Sincronizando...');
    
    // Mostrar log
    if (logEl) {
        logEl.classList.add('visible');
        logEl.innerHTML = '';
    }
    
    agregarLogSync('Iniciando sincronización forzada...');
    
    try {
        // Verificar conexión
        if (!navigator.onLine) {
            throw new Error('No hay conexión a internet');
        }
        agregarLogSync('✓ Conexión verificada', 'success');
        
        // Ejecutar sincronización
        if (typeof forzarSincronizacion === 'function') {
            agregarLogSync('Ejecutando sincronización...');
            
            const resultado = await forzarSincronizacion();
            
            agregarLogSync(`✓ Subidos: ${resultado.subidos || 0} registros`, 'success');
            agregarLogSync(`✓ Descargados: ${resultado.descargados || 0} registros`, 'success');
            
            // Estado final
            actualizarEstadoSync('exito', '✅', `Sincronización completada`);
            agregarLogSync('Sincronización completada exitosamente', 'success');
            
        } else {
            throw new Error('Función de sincronización no disponible');
        }
        
    } catch (error) {
        console.error('Error en sincronización:', error);
        actualizarEstadoSync('error', '❌', `Error: ${error.message}`);
        agregarLogSync(`Error: ${error.message}`, 'error');
        
    } finally {
        // Re-habilitar botón después de 2 segundos
        setTimeout(() => {
            if (btnSync) {
                btnSync.disabled = false;
            }
        }, 2000);
    }
}

/**
 * Actualiza el estado visual de sincronización
 */
function actualizarEstadoSync(estado, icono, texto) {
    const estadoEl = document.getElementById('syncEstado');
    if (!estadoEl) return;
    
    estadoEl.className = `sync-estado ${estado}`;
    estadoEl.querySelector('.sync-icono').textContent = icono;
    estadoEl.querySelector('.sync-texto').textContent = texto;
}

/**
 * Agrega entrada al log de sincronización
 */
function agregarLogSync(mensaje, tipo = '') {
    const logEl = document.getElementById('syncLog');
    if (!logEl) return;
    
    const hora = new Date().toLocaleTimeString('es-AR');
    const entry = document.createElement('div');
    entry.className = 'sync-log-entry';
    entry.innerHTML = `
        <span class="sync-log-time">${hora}</span>
        <span class="sync-log-msg ${tipo}">${mensaje}</span>
    `;
    
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

// ============================================
// SECCIÓN 5: DIFERENCIAS Y LIMPIEZA DE DATOS
// ============================================

// Mapeo de tablas locales a remotas
const MAPEO_TABLAS = {
    'comercio': 'comercios',
    'usuario': 'usuarios',
    'roles': 'roles',
    'permisos': 'permisos',
    'roles_permisos': 'roles_permisos',
    'categorias': 'categorias',
    'marcas': 'marcas',
    'productos': 'productos',
    'clientes': 'clientes',
    'stock': 'stock',
    'cajas': 'cajas',
    'ventas': 'ventas',
    'detalle_ventas': 'detalle_ventas',
    'movimientos_stock': 'movimientos_stock'
};

/**
 * Carga y muestra las diferencias entre Supabase e IndexedDB
 */
async function cargarDiferenciasSincronizacion() {
    const container = document.getElementById('tablaDiferencias');
    if (!container) return;
    
    const client = getSupabase();
    const db = getDB();
    
    if (!client || !db) {
        container.innerHTML = '<p class="cargando">Base de datos no disponible</p>';
        return;
    }
    
    try {
        let rows = [];
        
        // Comparar cada tabla
        for (const [tablaLocal, tablaRemota] of Object.entries(MAPEO_TABLAS)) {
            let countSupabase = 0;
            let countLocal = 0;
            
            // Contar en Supabase
            try {
                const { count } = await client
                    .from(tablaRemota)
                    .select('*', { count: 'exact', head: true });
                countSupabase = count || 0;
            } catch (e) {
                // Tabla puede no existir
            }
            
            // Contar en IndexedDB
            try {
                countLocal = await db.table(tablaLocal).count();
            } catch (e) {
                // Tabla puede no existir
            }
            
            // Solo mostrar si hay datos
            if (countSupabase > 0 || countLocal > 0) {
                const diferencia = countSupabase - countLocal;
                let estado = 'ok';
                let estadoTexto = '✓ Sincronizado';
                
                if (diferencia > 0) {
                    estado = 'warning';
                    estadoTexto = `↓ Faltan ${diferencia}`;
                } else if (diferencia < 0) {
                    estado = 'error';
                    estadoTexto = `↑ Sobran ${Math.abs(diferencia)}`;
                }
                
                // Marcar tablas especiales (que no se sincronizan por diseño)
                if (tablaLocal === 'usuario' || tablaLocal === 'comercio') {
                    if (diferencia !== 0) {
                        estado = 'info';
                        estadoTexto = '🔒 Datos locales';
                    }
                }
                
                rows.push({
                    tabla: tablaLocal,
                    supabase: countSupabase,
                    local: countLocal,
                    estado: estado,
                    estadoTexto: estadoTexto
                });
            }
        }
        
        // Generar HTML
        if (rows.length === 0) {
            container.innerHTML = '<p class="cargando">No hay datos para comparar</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="diferencia-row" style="font-weight: 600; color: var(--mant-text-secondary); font-size: 0.7rem;">
                <div>Tabla</div>
                <div style="text-align: center;">Supabase</div>
                <div style="text-align: center;">Local</div>
                <div style="text-align: center;">Estado</div>
            </div>
            ${rows.map(r => `
                <div class="diferencia-row">
                    <div class="diferencia-tabla">${r.tabla}</div>
                    <div class="diferencia-supabase">${r.supabase}</div>
                    <div class="diferencia-local">${r.local}</div>
                    <div class="diferencia-estado ${r.estado}">${r.estadoTexto}</div>
                </div>
            `).join('')}
        `;
        
    } catch (error) {
        console.error('Error cargando diferencias:', error);
        container.innerHTML = `<p class="cargando" style="color: var(--mant-error);">Error: ${error.message}</p>`;
    }
}

/**
 * Limpia la cola de sincronización (operaciones pendientes)
 */
async function limpiarColaSincronizacion() {
    const btnLimpiar = document.getElementById('btnLimpiarColaSync');
    
    // Confirmar antes de proceder
    if (!confirm('⚠️ Esto eliminará todas las operaciones pendientes de la cola de sincronización.\n\n¿Estás seguro?')) {
        return;
    }
    
    if (btnLimpiar) btnLimpiar.disabled = true;
    mostrarEstadoLimpieza('procesando', '🔄 Limpiando cola de sincronización...');
    
    try {
        const db = getDB();
        if (!db) throw new Error('IndexedDB no disponible');
        
        const count = await db.sync_queue.count();
        await db.sync_queue.clear();
        
        mostrarEstadoLimpieza('exito', `✅ Cola de sincronización limpiada. ${count} operaciones eliminadas.`);
        
        // Recargar datos
        await Promise.all([
            cargarEstadoMemoria(),
            cargarDiferenciasSincronizacion()
        ]);
        
    } catch (error) {
        console.error('Error limpiando cola de sincronización:', error);
        mostrarEstadoLimpieza('error', `❌ Error: ${error.message}`);
    } finally {
        if (btnLimpiar) btnLimpiar.disabled = false;
    }
}

/**
 * Limpia registros duplicados de IndexedDB
 */
async function limpiarDuplicadosLocales() {
    const btnLimpiar = document.getElementById('btnLimpiarDuplicados');
    const estadoEl = document.getElementById('limpiezaEstado');
    
    if (btnLimpiar) btnLimpiar.disabled = true;
    mostrarEstadoLimpieza('procesando', '🔄 Analizando duplicados...');
    
    try {
        const db = getDB();
        if (!db) throw new Error('IndexedDB no disponible');
        
        let duplicadosEliminados = 0;
        
        // Para cada tabla, eliminar duplicados basándose en sync_id o id
        const tablasALimpiar = ['comercio', 'usuario', 'categorias', 'marcas', 'productos'];
        
        for (const tabla of tablasALimpiar) {
            try {
                const registros = await db.table(tabla).toArray();
                const vistos = new Map();
                const duplicados = [];
                
                for (const registro of registros) {
                    const clave = registro.sync_id || registro.id;
                    if (vistos.has(clave)) {
                        // Es duplicado, marcar para eliminar
                        duplicados.push(registro.id);
                    } else {
                        vistos.set(clave, true);
                    }
                }
                
                // Eliminar duplicados
                for (const id of duplicados) {
                    await db.table(tabla).delete(id);
                    duplicadosEliminados++;
                }
                
                if (duplicados.length > 0) {
                    console.log(`🧹 Eliminados ${duplicados.length} duplicados de ${tabla}`);
                }
                
            } catch (e) {
                console.warn(`Error limpiando ${tabla}:`, e);
            }
        }
        
        mostrarEstadoLimpieza('exito', `✅ Limpieza completada. ${duplicadosEliminados} duplicados eliminados.`);
        
        // Recargar datos
        await Promise.all([
            cargarEstadoMemoria(),
            cargarDiferenciasSincronizacion()
        ]);
        
    } catch (error) {
        console.error('Error limpiando duplicados:', error);
        mostrarEstadoLimpieza('error', `❌ Error: ${error.message}`);
    } finally {
        if (btnLimpiar) btnLimpiar.disabled = false;
    }
}

/**
 * Limpia todos los datos locales y re-sincroniza desde Supabase
 */
async function limpiarTodoYResincronizar() {
    // Confirmar antes de proceder
    if (!confirm('⚠️ ATENCIÓN: Esto eliminará TODOS los datos locales y los volverá a descargar de Supabase.\n\n¿Estás seguro?')) {
        return;
    }
    
    const btnLimpiar = document.getElementById('btnLimpiarTodo');
    const estadoEl = document.getElementById('limpiezaEstado');
    
    if (btnLimpiar) btnLimpiar.disabled = true;
    mostrarEstadoLimpieza('procesando', '🗑️ Eliminando datos locales...');
    
    try {
        const db = getDB();
        if (!db) throw new Error('IndexedDB no disponible');
        
        // Tablas a limpiar (NO limpiar sesion ni config)
        const tablasALimpiar = [
            'comercio', 'usuario', 'roles', 'permisos', 'roles_permisos',
            'categorias', 'marcas', 'productos', 'clientes', 'stock',
            'cajas', 'ventas', 'detalle_ventas', 'movimientos_stock',
            'sync_queue', 'sync_status'
        ];
        
        // Limpiar cada tabla
        for (const tabla of tablasALimpiar) {
            try {
                await db.table(tabla).clear();
                console.log(`🗑️ Tabla ${tabla} limpiada`);
            } catch (e) {
                console.warn(`No se pudo limpiar ${tabla}:`, e);
            }
        }
        
        mostrarEstadoLimpieza('procesando', '📥 Descargando datos desde Supabase...');
        
        // Re-sincronizar
        if (typeof forzarSincronizacion === 'function') {
            await forzarSincronizacion();
        }
        
        mostrarEstadoLimpieza('exito', '✅ Datos locales limpiados y re-sincronizados exitosamente.');
        
        // Recargar todas las secciones
        await inicializarPanel();
        
    } catch (error) {
        console.error('Error en limpieza total:', error);
        mostrarEstadoLimpieza('error', `❌ Error: ${error.message}`);
    } finally {
        if (btnLimpiar) btnLimpiar.disabled = false;
    }
}

/**
 * Muestra el estado de la operación de limpieza
 */
function mostrarEstadoLimpieza(tipo, mensaje) {
    const estadoEl = document.getElementById('limpiezaEstado');
    if (!estadoEl) return;
    
    estadoEl.className = `limpieza-estado visible ${tipo}`;
    estadoEl.textContent = mensaje;
}

// ============================================
// LOG DE INICIALIZACIÓN
// ============================================
console.log('🔧 Módulo Mantenimiento cargado');


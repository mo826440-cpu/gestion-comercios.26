/* ============================================
   CONFIGURACIÓN - JAVASCRIPT
   ============================================
   Pantalla de configuración del sistema
   
   PERMISOS:
   - CONFIG_VER: Puede ver la pantalla
   - CONFIG_EDITAR: Puede editar todo
   - CONFIG_COMERCIO: Puede editar datos comercio
   - CONFIG_VENTAS: Puede editar config ventas
   - CONFIG_STOCK: Puede editar config stock
   - CONFIG_IMPRESION: Puede editar impresión
============================================ */

// ============================================
// VARIABLES GLOBALES
// ============================================
let usuarioActual = null;
let comercioActual = null;
let permisosUsuario = [];
let configuracionesCache = {};

// Mapeo de secciones a permisos
const PERMISOS_SECCION = {
    'comercio': 'CONFIG_COMERCIO',
    'ventas': 'CONFIG_VENTAS',
    'stock': 'CONFIG_STOCK',
    'impresion': 'CONFIG_IMPRESION',
    'aplicacion': 'CONFIG_EDITAR'
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('⚙️ Pantalla de Configuración - Inicializando...');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        // Verificar acceso
        const tieneAcceso = await verificarAcceso();
        
        if (!tieneAcceso) {
            mostrarAccesoDenegado();
            return;
        }
        
        // Inicializar la pantalla
        await inicializarPantalla();
        
    }, 500);
});

// ============================================
// VERIFICACIÓN DE ACCESO
// ============================================

/**
 * Verifica si el usuario puede acceder a la pantalla
 */
async function verificarAcceso() {
    try {
        // Verificar sesión
        const sesion = await getSesionActual();
        
        if (!sesion || !sesion.user) {
            console.warn('⚠️ No hay sesión activa');
            window.location.href = 'login.html';
            return false;
        }
        
        // Obtener datos del usuario
        usuarioActual = await obtenerDatosUsuarioCompleto(sesion.user.id);
        
        if (!usuarioActual) {
            console.warn('⚠️ No se encontraron datos del usuario');
            return false;
        }
        
        comercioActual = usuarioActual.comercio;
        
        // Obtener permisos
        if (usuarioActual.rol?.id) {
            permisosUsuario = await obtenerPermisosUsuario(usuarioActual.rol.id);
        }
        
        // Verificar permiso CONFIG_VER
        if (!tienePermiso('CONFIG_VER')) {
            console.warn('⚠️ Usuario sin permiso CONFIG_VER');
            return false;
        }
        
        // Mostrar info del usuario
        mostrarInfoUsuario();
        
        return true;
        
    } catch (error) {
        console.error('Error verificando acceso:', error);
        return false;
    }
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
function tienePermiso(codigo) {
    // El programador tiene todos los permisos
    if (usuarioActual?.rol?.nombre?.toLowerCase() === 'programador') {
        return true;
    }
    return permisosUsuario.includes(codigo);
}

/**
 * Muestra mensaje de acceso denegado
 */
function mostrarAccesoDenegado() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--color-fondo);
            text-align: center;
            padding: 20px;
        ">
            <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
            <h1 style="color: var(--color-error); margin: 0 0 10px 0;">Acceso Denegado</h1>
            <p style="color: var(--color-texto-secundario); margin-bottom: 30px;">
                No tienes permisos para acceder a la configuración.
            </p>
            <a href="inicio.html" style="
                color: var(--color-primario);
                text-decoration: none;
                padding: 10px 20px;
                border: 1px solid var(--color-primario);
                border-radius: var(--radio-md);
            ">← Volver al Inicio</a>
        </div>
    `;
    
    setTimeout(() => {
        window.location.href = 'inicio.html';
    }, 3000);
}

/**
 * Muestra información del usuario en el header
 */
function mostrarInfoUsuario() {
    const infoEl = document.getElementById('usuarioInfo');
    if (infoEl) {
        infoEl.textContent = `${usuarioActual.email} • ${usuarioActual.rol?.nombre || 'Sin rol'}`;
    }
}

// ============================================
// INICIALIZACIÓN DE LA PANTALLA
// ============================================

/**
 * Inicializa todos los componentes de la pantalla
 */
async function inicializarPantalla() {
    console.log('✅ Inicializando pantalla de configuración...');
    
    // Configurar navegación del sidebar
    configurarNavegacion();
    
    // Aplicar permisos a las secciones
    aplicarPermisos();
    
    // Cargar datos del comercio
    await cargarDatosComercio();
    
    // Cargar configuraciones
    await cargarConfiguraciones();
    
    // Aplicar tema inicial
    await aplicarTemaInicial();
    
    // Configurar formularios
    configurarFormularios();
    
    // Configurar color picker
    configurarColorPicker();
    
    // Escuchar cambios en el selector de tema
    const temaSelect = document.getElementById('tema');
    if (temaSelect && typeof aplicarTema === 'function') {
        temaSelect.addEventListener('change', function() {
            aplicarTema(this.value);
        });
    }
    
    console.log('✅ Pantalla de configuración lista');
}

/**
 * Configura la navegación del sidebar
 */
function configurarNavegacion() {
    const navItems = document.querySelectorAll('.config-nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const seccion = this.dataset.seccion;
            
            // Verificar si está deshabilitado
            if (this.classList.contains('disabled')) {
                mostrarToast('No tienes permisos para esta sección', 'error');
                return;
            }
            
            // Actualizar navegación activa
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            mostrarSeccion(seccion);
        });
    });
}

/**
 * Muestra una sección específica
 */
function mostrarSeccion(seccionId) {
    const secciones = document.querySelectorAll('.config-seccion');
    
    secciones.forEach(seccion => {
        seccion.classList.remove('active');
    });
    
    const seccionActiva = document.getElementById(`seccion-${seccionId}`);
    if (seccionActiva) {
        seccionActiva.classList.add('active');
    }
}

/**
 * Aplica permisos a las secciones y campos
 */
function aplicarPermisos() {
    // Para cada sección, verificar si el usuario puede editar
    Object.entries(PERMISOS_SECCION).forEach(([seccion, permiso]) => {
        const puedeEditar = tienePermiso(permiso) || tienePermiso('CONFIG_EDITAR');
        const seccionEl = document.getElementById(`seccion-${seccion}`);
        const navItem = document.querySelector(`[data-seccion="${seccion}"]`);
        
        if (!puedeEditar && seccionEl) {
            // Deshabilitar todos los inputs de la sección
            const inputs = seccionEl.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });
            
            // Ocultar botón de guardar
            const acciones = seccionEl.querySelector('.form-acciones');
            if (acciones) {
                acciones.style.display = 'none';
            }
            
            // Marcar nav item como solo lectura
            if (navItem) {
                navItem.title = 'Solo lectura';
            }
        }
    });
    
    // Si no tiene permiso para ver, ocultar secciones
    // (El vendedor no debería llegar aquí, pero por si acaso)
}

// ============================================
// CARGA DE DATOS
// ============================================

/**
 * Carga los datos del comercio en el formulario
 */
async function cargarDatosComercio() {
    if (!comercioActual) return;
    
    // Llenar campos del formulario
    setValorCampo('razon_social', comercioActual.razon_social);
    setValorCampo('nombre_fantasia', comercioActual.nombre_fantasia);
    setValorCampo('cuit', comercioActual.cuit);
    setValorCampo('condicion_iva', comercioActual.condicion_iva);
    setValorCampo('direccion', comercioActual.direccion);
    setValorCampo('ciudad', comercioActual.ciudad);
    setValorCampo('provincia', comercioActual.provincia);
    setValorCampo('codigo_postal', comercioActual.codigo_postal);
    setValorCampo('telefono', comercioActual.telefono);
    setValorCampo('email_contacto', comercioActual.email);
    setValorCampo('sitio_web', comercioActual.sitio_web);
}

/**
 * Carga las configuraciones del comercio
 */
async function cargarConfiguraciones() {
    if (!comercioActual?.id) return;
    
    try {
        const client = getSupabase();
        if (!client) return;
        
        // Obtener configuraciones de Supabase
        const { data, error } = await client
            .from('configuraciones')
            .select('*')
            .eq('comercio_id', comercioActual.id);
        
        if (error) {
            console.warn('Error cargando configuraciones:', error);
            // Intentar cargar desde IndexedDB
            await cargarConfiguracionesLocales();
            return;
        }
        
        // Procesar configuraciones
        if (data && data.length > 0) {
            data.forEach(config => {
                configuracionesCache[`${config.categoria}_${config.clave}`] = config;
                aplicarConfiguracionACampo(config);
            });
        }
        
        console.log(`✅ ${data?.length || 0} configuraciones cargadas`);
        
    } catch (error) {
        console.error('Error cargando configuraciones:', error);
    }
}

/**
 * Carga configuraciones desde IndexedDB (offline)
 */
async function cargarConfiguracionesLocales() {
    const db = getDB();
    if (!db) return;
    
    try {
        const configs = await db.table('configuraciones')
            .where('comercio_id')
            .equals(comercioActual.id)
            .toArray();
        
        configs.forEach(config => {
            configuracionesCache[`${config.categoria}_${config.clave}`] = config;
            aplicarConfiguracionACampo(config);
        });
        
    } catch (error) {
        console.warn('Error cargando configuraciones locales:', error);
    }
}

/**
 * Aplica una configuración a su campo correspondiente
 */
function aplicarConfiguracionACampo(config) {
    const campo = document.getElementById(config.clave);
    if (!campo) return;
    
    let valor = config.valor;
    
    // Convertir según tipo
    if (config.tipo === 'boolean') {
        valor = valor === 'true';
        campo.checked = valor;
    } else if (config.tipo === 'json') {
        // Manejar arrays (como métodos de pago)
        try {
            const arr = JSON.parse(valor);
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    const checkbox = document.getElementById(`mp_${item}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } catch (e) {}
    } else {
        campo.value = valor || '';
    }
    
            // Aplicar tema inmediatamente si es la configuración de tema
            if (config.clave === 'tema' && typeof aplicarTema === 'function') {
                aplicarTema(valor);
            }
}

// ============================================
// FORMULARIOS Y GUARDADO
// ============================================

/**
 * Configura los event listeners de los formularios
 */
function configurarFormularios() {
    // Formulario Comercio
    const formComercio = document.getElementById('formComercio');
    if (formComercio) {
        formComercio.addEventListener('submit', (e) => guardarComercio(e));
    }
    
    // Formulario Ventas
    const formVentas = document.getElementById('formVentas');
    if (formVentas) {
        formVentas.addEventListener('submit', (e) => guardarConfiguracion(e, 'ventas'));
    }
    
    // Formulario Stock
    const formStock = document.getElementById('formStock');
    if (formStock) {
        formStock.addEventListener('submit', (e) => guardarConfiguracion(e, 'stock'));
    }
    
    // Formulario Impresión
    const formImpresion = document.getElementById('formImpresion');
    if (formImpresion) {
        formImpresion.addEventListener('submit', (e) => guardarConfiguracion(e, 'impresion'));
    }
    
    // Formulario Aplicación
    const formAplicacion = document.getElementById('formAplicacion');
    if (formAplicacion) {
        formAplicacion.addEventListener('submit', (e) => guardarConfiguracion(e, 'aplicacion'));
    }
}

/**
 * Guarda los datos del comercio
 */
async function guardarComercio(e) {
    e.preventDefault();
    
    const statusEl = document.getElementById('statusComercio');
    mostrarEstadoGuardado(statusEl, 'guardando', '💾 Guardando...');
    
    try {
        const client = getSupabase();
        if (!client) throw new Error('Supabase no disponible');
        
        // Recopilar datos del formulario
        const datosComercio = {
            razon_social: getValorCampo('razon_social'),
            nombre_fantasia: getValorCampo('nombre_fantasia'),
            cuit: getValorCampo('cuit'),
            condicion_iva: getValorCampo('condicion_iva'),
            direccion: getValorCampo('direccion'),
            ciudad: getValorCampo('ciudad'),
            provincia: getValorCampo('provincia'),
            codigo_postal: getValorCampo('codigo_postal'),
            telefono: getValorCampo('telefono'),
            email: getValorCampo('email_contacto'),
            sitio_web: getValorCampo('sitio_web'),
            updated_at: new Date().toISOString()
        };
        
        // Actualizar en Supabase
        const { error } = await client
            .from('comercios')
            .update(datosComercio)
            .eq('id', comercioActual.id);
        
        if (error) throw error;
        
        // Actualizar cache local
        comercioActual = { ...comercioActual, ...datosComercio };
        
        mostrarEstadoGuardado(statusEl, 'exito', '✅ Guardado');
        mostrarToast('Datos del comercio guardados correctamente', 'exito');
        
    } catch (error) {
        console.error('Error guardando comercio:', error);
        mostrarEstadoGuardado(statusEl, 'error', '❌ Error al guardar');
        mostrarToast('Error al guardar: ' + error.message, 'error');
    }
}

/**
 * Guarda configuraciones de una categoría
 */
async function guardarConfiguracion(e, categoria) {
    e.preventDefault();
    
    const statusEl = document.getElementById(`status${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
    mostrarEstadoGuardado(statusEl, 'guardando', '💾 Guardando...');
    
    try {
        const client = getSupabase();
        if (!client) throw new Error('Supabase no disponible');
        
        // Recopilar configuraciones según categoría
        const configs = obtenerConfiguracionesCategoria(categoria);
        
        // Guardar cada configuración
        for (const config of configs) {
            await upsertConfiguracion(config.clave, config.valor, config.tipo, categoria);
            
            // Aplicar tema inmediatamente si se guardó el tema
            if (config.clave === 'tema' && typeof aplicarTema === 'function') {
                aplicarTema(config.valor);
            }
        }
        
        mostrarEstadoGuardado(statusEl, 'exito', '✅ Guardado');
        mostrarToast(`Configuración de ${categoria} guardada`, 'exito');
        
    } catch (error) {
        console.error(`Error guardando ${categoria}:`, error);
        mostrarEstadoGuardado(statusEl, 'error', '❌ Error al guardar');
        mostrarToast('Error al guardar: ' + error.message, 'error');
    }
}

/**
 * Obtiene las configuraciones de una categoría desde el formulario
 */
function obtenerConfiguracionesCategoria(categoria) {
    const configs = [];
    
    switch (categoria) {
        case 'ventas':
            configs.push(
                { clave: 'iva_defecto', valor: getValorCampo('iva_defecto'), tipo: 'number' },
                { clave: 'redondeo', valor: getValorCampo('redondeo'), tipo: 'string' },
                { clave: 'descuento_max', valor: getValorCampo('descuento_max'), tipo: 'number' },
                { clave: 'iva_incluido', valor: getValorCheckbox('iva_incluido'), tipo: 'boolean' },
                { clave: 'ventas_sin_stock', valor: getValorCheckbox('ventas_sin_stock'), tipo: 'boolean' },
                { clave: 'precios_personalizados', valor: getValorCheckbox('precios_personalizados'), tipo: 'boolean' },
                { clave: 'requiere_cliente', valor: getValorCheckbox('requiere_cliente'), tipo: 'boolean' },
                { clave: 'ventas_credito', valor: getValorCheckbox('ventas_credito'), tipo: 'boolean' },
                { clave: 'metodos_pago', valor: obtenerMetodosPago(), tipo: 'json' }
            );
            break;
            
        case 'stock':
            configs.push(
                { clave: 'alerta_stock_bajo', valor: getValorCampo('alerta_stock_bajo'), tipo: 'number' },
                { clave: 'email_notificaciones', valor: getValorCampo('email_notificaciones'), tipo: 'string' },
                { clave: 'control_activo', valor: getValorCheckbox('control_activo'), tipo: 'boolean' },
                { clave: 'stock_negativo', valor: getValorCheckbox('stock_negativo'), tipo: 'boolean' },
                { clave: 'notificar_email', valor: getValorCheckbox('notificar_email'), tipo: 'boolean' },
                { clave: 'actualizacion_automatica', valor: getValorCheckbox('actualizacion_automatica'), tipo: 'boolean' },
                { clave: 'mostrar_sin_stock', valor: getValorCheckbox('mostrar_sin_stock'), tipo: 'boolean' }
            );
            break;
            
        case 'impresion':
            configs.push(
                { clave: 'ancho_ticket', valor: getValorCampo('ancho_ticket'), tipo: 'string' },
                { clave: 'copias', valor: getValorCampo('copias'), tipo: 'number' },
                { clave: 'encabezado', valor: getValorCampo('encabezado'), tipo: 'string' },
                { clave: 'pie_ticket', valor: getValorCampo('pie_ticket'), tipo: 'string' },
                { clave: 'mostrar_logo', valor: getValorCheckbox('mostrar_logo'), tipo: 'boolean' },
                { clave: 'mostrar_iva', valor: getValorCheckbox('mostrar_iva'), tipo: 'boolean' },
                { clave: 'imprimir_auto', valor: getValorCheckbox('imprimir_auto'), tipo: 'boolean' },
                { clave: 'codigo_barras', valor: getValorCheckbox('codigo_barras'), tipo: 'boolean' }
            );
            break;
            
        case 'aplicacion':
            configs.push(
                { clave: 'tema', valor: getValorCampo('tema'), tipo: 'string' },
                { clave: 'color_principal', valor: getValorCampo('color_principal'), tipo: 'string' },
                { clave: 'formato_fecha', valor: getValorCampo('formato_fecha'), tipo: 'string' },
                { clave: 'formato_hora', valor: getValorCampo('formato_hora'), tipo: 'string' },
                { clave: 'tiempo_inactividad', valor: getValorCampo('tiempo_inactividad'), tipo: 'number' },
                { clave: 'zona_horaria', valor: getValorCampo('zona_horaria'), tipo: 'string' },
                { clave: 'sonidos', valor: getValorCheckbox('sonidos'), tipo: 'boolean' },
                { clave: 'animaciones', valor: getValorCheckbox('animaciones'), tipo: 'boolean' }
            );
            break;
    }
    
    return configs;
}

/**
 * Obtiene los métodos de pago seleccionados como JSON
 */
function obtenerMetodosPago() {
    const metodos = [];
    const checkboxes = ['efectivo', 'debito', 'credito', 'qr', 'transferencia', 'cuenta_corriente'];
    
    checkboxes.forEach(mp => {
        const checkbox = document.getElementById(`mp_${mp}`);
        if (checkbox && checkbox.checked) {
            metodos.push(mp);
        }
    });
    
    return JSON.stringify(metodos);
}

/**
 * Inserta o actualiza una configuración
 */
async function upsertConfiguracion(clave, valor, tipo, categoria) {
    const client = getSupabase();
    if (!client) return;
    
    const configData = {
        comercio_id: comercioActual.id,
        categoria: categoria,
        clave: clave,
        valor: String(valor),
        tipo: tipo,
        updated_at: new Date().toISOString()
    };
    
    // Guardar en Supabase
    const { data, error } = await client
        .from('configuraciones')
        .upsert(configData, {
            onConflict: 'comercio_id,categoria,clave'
        })
        .select()
        .single();
    
    if (error) {
        console.error(`Error guardando ${clave} en Supabase:`, error);
        throw error;
    }
    
    // Guardar también en IndexedDB inmediatamente (para acceso offline)
    const db = getDB();
    if (db && data) {
        try {
            await db.table('configuraciones').put({
                id: data.id,
                comercio_id: data.comercio_id,
                categoria: data.categoria,
                clave: data.clave,
                valor: data.valor,
                tipo: data.tipo,
                sync_id: data.id, // Usar el ID de Supabase como sync_id
                updated_at: data.updated_at
            });
            console.log(`✅ Configuración ${clave} guardada en IndexedDB`);
        } catch (dbError) {
            console.warn(`⚠️ Error guardando ${clave} en IndexedDB:`, dbError);
            // No lanzar error, solo loguear
        }
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene el valor de un campo
 */
function getValorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value : '';
}

/**
 * Establece el valor de un campo
 */
function setValorCampo(id, valor) {
    const campo = document.getElementById(id);
    if (campo) {
        campo.value = valor || '';
    }
}

/**
 * Obtiene el valor de un checkbox como string
 */
function getValorCheckbox(id) {
    const campo = document.getElementById(id);
    return campo ? String(campo.checked) : 'false';
}

/**
 * Muestra el estado de guardado
 */
function mostrarEstadoGuardado(elemento, tipo, texto) {
    if (!elemento) return;
    
    elemento.className = `guardado-status ${tipo}`;
    elemento.textContent = texto;
    
    // Limpiar después de 3 segundos si es éxito
    if (tipo === 'exito') {
        setTimeout(() => {
            elemento.textContent = '';
        }, 3000);
    }
}

/**
 * Muestra un toast de notificación
 */
function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const icono = tipo === 'exito' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icono}</span><span>${mensaje}</span>`;
    
    container.appendChild(toast);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

/**
 * Configura el color picker
 */
function configurarColorPicker() {
    const colorInput = document.getElementById('color_principal');
    const colorText = document.getElementById('color_principal_text');
    
    if (colorInput && colorText) {
        // Sincronizar color picker con input de texto
        colorInput.addEventListener('input', function() {
            colorText.value = this.value;
        });
        
        colorText.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                colorInput.value = this.value;
            }
        });
    }
}

/**
 * Aplica el tema inicial desde la configuración
 */
async function aplicarTemaInicial() {
    // Buscar tema en configuraciones cache
    const temaConfig = configuracionesCache['aplicacion_tema'];
    if (temaConfig) {
        if (typeof aplicarTema === 'function') {
            aplicarTema(temaConfig.valor);
        }
        return;
    }
    
        // Si no está en cache, intentar cargar desde IndexedDB
        const db = getDB();
        if (db && comercioActual?.id) {
            try {
                // Usar filtro múltiple para mayor compatibilidad
                const todasConfigs = await db.table('configuraciones')
                    .where('comercio_id').equals(comercioActual.id)
                    .toArray();
                
                const config = todasConfigs.find(c => 
                    c.categoria === 'aplicacion' && c.clave === 'tema'
                );
                
                if (config && typeof aplicarTema === 'function') {
                    aplicarTema(config.valor);
                    return;
                }
            } catch (error) {
                console.warn('Error cargando tema desde IndexedDB:', error);
            }
        }
    
    // Por defecto, usar 'system'
    if (typeof aplicarTema === 'function') {
        aplicarTema('system');
    }
}

// ============================================
// LOG DE INICIALIZACIÓN
// ============================================
console.log('⚙️ Módulo Configuración cargado');


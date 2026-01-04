/* ============================================
   REFERENCIAS - JAVASCRIPT
   ============================================
   Lógica de la pantalla de Referencias
============================================ */

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pantalla de Referencias cargada');
    
    // Esperar a que se inicialicen las bases de datos
    setTimeout(async () => {
        await verificarSesion();
        await inicializarDatosUsuario();
        
        // Esperar un poco más para que se sincronice la data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cargar y aplicar tema (después de sincronización)
        if (typeof cargarYAplicarTema === 'function') {
            await cargarYAplicarTema();
        }
        
        inicializarReferencias();
        inicializarCerrarSesion();
        
        // Intentar cargar tema nuevamente después de sincronización
        setTimeout(async () => {
            if (typeof cargarYAplicarTema === 'function') {
                await cargarYAplicarTema();
            }
        }, 2000);
    }, 500);
});

/**
 * Verifica que haya una sesión activa
 * Si no hay sesión, redirige al login
 */
async function verificarSesion() {
    let sesionValida = false;
    
    // 1. Verificar sesión en Supabase
    if (typeof getSesionActual === 'function') {
        const sesionSupabase = await getSesionActual();
        if (sesionSupabase) {
            sesionValida = true;
            console.log('✅ Sesión Supabase válida');
        }
    }
    
    // 2. Verificar sesión local en IndexedDB
    if (!sesionValida && typeof haySesionLocalActiva === 'function') {
        sesionValida = await haySesionLocalActiva();
        if (sesionValida) {
            console.log('✅ Sesión local válida');
        }
    }
    
    // 3. Fallback: localStorage
    if (!sesionValida && typeof haySesionActiva === 'function') {
        sesionValida = haySesionActiva();
        if (sesionValida) {
            console.log('✅ Sesión localStorage válida');
        }
    }
    
    if (!sesionValida) {
        console.log('❌ No hay sesión activa, redirigiendo al login...');
        navegarA(CONFIG.rutas.login);
    }
}

/**
 * Carga y muestra los datos del usuario
 */
async function inicializarDatosUsuario() {
    let usuario = null;
    
    // 1. Intentar obtener de IndexedDB
    if (typeof obtenerSesionLocal === 'function') {
        const sesionLocal = await obtenerSesionLocal();
        if (sesionLocal) {
            usuario = {
                nombreResponsable: sesionLocal.nombre,
                email: sesionLocal.email
            };
        }
    }
    
    // 2. Fallback: localStorage
    if (!usuario) {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            usuario = JSON.parse(usuarioStr);
        }
    }
    
    // Mostrar nombre del usuario
    const nombreEl = document.getElementById('nombreUsuario');
    if (nombreEl && usuario) {
        nombreEl.textContent = usuario.nombreResponsable || usuario.email || 'Usuario';
    }
}

/**
 * Inicializa las tarjetas de referencias
 */
function inicializarReferencias() {
    const referencias = document.querySelectorAll('.referencia-card');
    
    referencias.forEach(referencia => {
        referencia.addEventListener('click', function() {
            const subventana = this.dataset.subventana;
            mostrarMensajeSubventana(subventana);
        });
        
        // Accesibilidad
        referencia.setAttribute('tabindex', '0');
        referencia.setAttribute('role', 'button');
        
        referencia.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const subventana = this.dataset.subventana;
                mostrarMensajeSubventana(subventana);
            }
        });
    });
}

/**
 * Muestra mensaje indicando que la subventana está próximamente
 * @param {string} subventana - Nombre de la subventana
 */
function mostrarMensajeSubventana(subventana) {
    const nombresSubventanas = {
        categorias: 'Categorías',
        marcas: 'Marcas',
        proveedores: 'Proveedores',
        clientes: 'Clientes',
        productos: 'Productos'
    };
    
    // Si es categorías o marcas, navegar directamente
    if (subventana === 'categorias') {
        window.location.href = 'categorias.html';
        return;
    }
    
    if (subventana === 'marcas') {
        window.location.href = 'marcas.html';
        return;
    }
    
    if (subventana === 'proveedores') {
        window.location.href = 'proveedores.html';
        return;
    }
    
    if (subventana === 'clientes') {
        window.location.href = 'clientes.html';
        return;
    }
    
    if (subventana === 'productos') {
        window.location.href = 'productos.html';
        return;
    }
    
    const nombreSubventana = nombresSubventanas[subventana] || subventana;
    mostrarNotificacion(`La subventana de ${nombreSubventana} estará disponible próximamente`, 'info');
}

/**
 * Muestra una notificación temporal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación
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
 * Cierra la sesión en todos los sistemas
 */
async function cerrarSesionCompleta() {
    console.log('🚪 Cerrando sesión...');
    
    // 1. Cerrar sesión en Supabase
    if (typeof logoutUsuarioAuth === 'function') {
        try {
            await logoutUsuarioAuth();
            console.log('✅ Sesión Supabase cerrada');
        } catch (error) {
            console.error('Error cerrando sesión Supabase:', error);
        }
    }
    
    // 2. Limpiar sesión local en IndexedDB
    if (typeof eliminarSesionLocal === 'function') {
        try {
            await eliminarSesionLocal();
            console.log('✅ Sesión local eliminada');
        } catch (error) {
            console.error('Error eliminando sesión local:', error);
        }
    }
    
    // 3. Limpiar localStorage
    localStorage.removeItem('usuario');
    localStorage.removeItem('sesion');
    localStorage.removeItem('token');
    
    // 4. Redirigir al login
    navegarA(CONFIG.rutas.login);
}


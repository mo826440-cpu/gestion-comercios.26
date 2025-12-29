/* ============================================
   SERVICE WORKER - GESTIÓNKIOSCO PWA
   ============================================
   Service Worker para cache offline y 
   funcionamiento como Progressive Web App
============================================ */

const CACHE_NAME = 'gestion-kiosco-v1.0.0';
const RUNTIME_CACHE = 'gestion-kiosco-runtime-v1.0.0';

// Archivos estáticos que se cachean al instalar
// Nota: En GitHub Pages, las rutas son relativas al repositorio
const STATIC_CACHE_URLS = [
    '/sistema_kioscos/',
    '/sistema_kioscos/index.html',
    '/sistema_kioscos/login.html',
    '/sistema_kioscos/registro.html',
    '/sistema_kioscos/inicio.html',
    '/sistema_kioscos/mantenimiento.html',
    '/sistema_kioscos/configuracion.html',
    '/sistema_kioscos/css/global.css',
    '/sistema_kioscos/css/landing.css',
    '/sistema_kioscos/css/login.css',
    '/sistema_kioscos/css/registro.css',
    '/sistema_kioscos/css/inicio.css',
    '/sistema_kioscos/css/mantenimiento.css',
    '/sistema_kioscos/css/configuracion.css',
    '/sistema_kioscos/js/config.js',
    '/sistema_kioscos/js/supabase.js',
    '/sistema_kioscos/js/indexeddb.js',
    '/sistema_kioscos/js/landing.js',
    '/sistema_kioscos/js/login.js',
    '/sistema_kioscos/js/registro.js',
    '/sistema_kioscos/js/inicio.js',
    '/sistema_kioscos/js/mantenimiento.js',
    '/sistema_kioscos/js/configuracion.js',
    '/sistema_kioscos/js/sync.js',
    '/sistema_kioscos/js/pwa-install.js',
    '/sistema_kioscos/manifest.json',
    '/sistema_kioscos/service-worker.js'
];

// Estrategia: Cache First para recursos estáticos
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('Error en cacheFirst:', error);
        // Si falla, intentar devolver del cache aunque sea viejo
        return caches.match(request) || new Response('Offline', { status: 503 });
    }
}

// Estrategia: Network First para datos dinámicos
async function networkFirst(request) {
    // No cachear requests POST, PUT, DELETE, etc.
    if (request.method !== 'GET') {
        return fetch(request);
    }
    
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_CACHE_URLS.filter(url => {
                    // Filtrar URLs externas que pueden fallar
                    return !url.startsWith('https://');
                }));
            })
            .catch((error) => {
                console.error('Service Worker: Error al cachear:', error);
            })
            .then(() => {
                // Forzar activación inmediata
                return self.skipWaiting();
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Service Worker: Eliminando cache viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Tomar control de todas las páginas inmediatamente
            return self.clients.claim();
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // No cachear requests que no sean GET
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }
    
    const url = new URL(request.url);
    
    // Ignorar requests a Supabase API (siempre online, no cachear)
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Para archivos estáticos (HTML, CSS, JS)
    if (request.destination === 'document' || 
        request.destination === 'style' || 
        request.destination === 'script' ||
        request.destination === 'image') {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // Para otros recursos GET, usar network first
    event.respondWith(networkFirst(request));
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});


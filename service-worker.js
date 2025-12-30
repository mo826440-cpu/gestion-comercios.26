/* ============================================
   SERVICE WORKER - ADMINISGO PWA
   ============================================
   Service Worker para cache offline y 
   funcionamiento como Progressive Web App
============================================ */

const CACHE_NAME = 'adminisgo-v1.0.0';
const RUNTIME_CACHE = 'adminisgo-runtime-v1.0.0';

// Archivos estáticos que se cachean al instalar
// Nota: Rutas relativas (funcionan en dominio personalizado)
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/login.html',
    '/registro.html',
    '/inicio.html',
    '/mantenimiento.html',
    '/configuracion.html',
    '/css/global.css',
    '/css/landing.css',
    '/css/login.css',
    '/css/registro.css',
    '/css/inicio.css',
    '/css/mantenimiento.css',
    '/css/configuracion.css',
    '/js/config.js',
    '/js/supabase.js',
    '/js/indexeddb.js',
    '/js/landing.js',
    '/js/login.js',
    '/js/registro.js',
    '/js/inicio.js',
    '/js/mantenimiento.js',
    '/js/configuracion.js',
    '/js/sync.js',
    '/js/pwa-install.js',
    '/manifest.json',
    '/service-worker.js'
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


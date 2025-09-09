// Service Worker para Cuentas Casa PWA
// Proporciona funcionalidad offline y cache de recursos

const CACHE_NAME = 'cuentas-casa-v3.0.0';
const CACHE_URLS = [
  // Archivos locales de la aplicación
  './',
  './index.html',
  './docs.html',
  
  // Archivos JavaScript modulares
  './js/core/app.js',
  './js/core/calculator.js',
  './js/core/validation.js',
  './js/features/theme.js',
  './js/features/history.js',
  './js/features/import-export.js',
  './js/ui/modal.js',
  './js/utils/formatters.js',
  './js/utils/dom.js',
  './js/utils/storage.js',
  './js/utils/pdf.js',
  
  // Recursos externos de CDN (críticos para el funcionamiento)
  'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  
  // CDNs para docs.html
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.tailwindcss.com',
  
  // Iconos de la PWA
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-apple-touch.png',
  './icons/favicon.ico'
];

// Evento de instalación del Service Worker
// Se ejecuta una sola vez cuando se instala la PWA
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos...');
        // Pre-cachea todos los recursos críticos
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Todos los recursos cacheados exitosamente');
        // Fuerza la activación inmediata del nuevo SW
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error cacheando recursos:', error);
      })
  );
});

// Evento de activación del Service Worker
// Se ejecuta cuando el SW toma control de la página
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v3.0.0 - Network First Simple...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[SW] Limpiando caches antiguos...');
      // Elimina versiones anteriores del cache
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache anterior:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Service Worker v3.0.0 activo con estrategia Network First');
      // Toma control de todas las páginas
      return self.clients.claim();
    })
  );
});

// Función para verificar si una URL es cacheable
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Excluir esquemas no cacheables
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'chrome:' || 
      url.protocol === 'moz-extension:' ||
      url.hostname.includes('vscode-webview')) {
    return false;
  }
  
  return true;
}

// Evento fetch - intercepta todas las peticiones de red
// ESTRATEGIA SIMPLE: Network First para TODOS los recursos
self.addEventListener('fetch', (event) => {
  // Solo maneja peticiones GET de URLs cacheables
  if (event.request.method !== 'GET' || !isCacheableRequest(event.request)) {
    return;
  }
  
  event.respondWith(
    // PASO 1: Siempre intenta la red primero
    fetch(event.request)
      .then((networkResponse) => {
        // Si la red responde correctamente
        if (networkResponse && networkResponse.ok) {
          console.log('[SW] Desde red:', event.request.url);
          
          // Intenta guardar en cache para uso offline (opcional)
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone)
                .catch((error) => {
                  // Si falla guardar en cache, no pasa nada crítico
                  console.warn('[SW] No se pudo cachear (no crítico):', event.request.url);
                });
            });
          
          // Devuelve la respuesta fresca de la red
          return networkResponse;
        }
        
        // Si la red responde pero con error (404, 500, etc.)
        // Intenta buscar en cache como fallback
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Respuesta de red inválida, usando cache:', event.request.url);
              return cachedResponse;
            }
            // Si no hay cache, devuelve la respuesta de red (con su error)
            return networkResponse;
          });
      })
      .catch(() => {
        // PASO 2: Si falla la red (sin internet), busca en cache
        console.log('[SW] Sin red, buscando en cache:', event.request.url);
        
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Desde cache (offline):', event.request.url);
              return cachedResponse;
            }
            
            // Si no hay red NI cache, no hay nada que hacer
            console.error('[SW] Sin red y sin cache:', event.request.url);
            throw new Error('Recurso no disponible');
          });
      })
  );
});

// Evento para manejar actualizaciones del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Forzando actualización del Service Worker');
    self.skipWaiting();
  }
});
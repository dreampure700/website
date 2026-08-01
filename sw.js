const CACHE_NAME = 'teenspace-cache-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/schedule.html',
  '/media.html',
  '/admin.html',
  '/css/main.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/registration.js',
  '/assets/images/teenspace_app_icon_192.png',
  '/assets/images/teenspace_app_icon_512.png',
  '/assets/images/TEENSPACE LOGO.png',
  '/assets/images/hero_banner.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log("Caching failed during SW install: ", err));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fast Opening Stale-While-Revalidate Caching Strategy
self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;
  // Skip Supabase API requests to avoid caching dynamic DB data
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(e.request);
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => null);

      // Return cached asset instantly if available, fallback to network
      return cachedResponse || fetchPromise;
    })
  );
});

const CACHE_NAME = 'teenspace-cache-v10';
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
  '/assets/images/hero_banner.png',
  '/assets/images/teenspace_brochure_page1.png',
  '/assets/images/teenspace_brochure_page2.png',
  '/assets/docs/TEENSPACE_2026_Brochure.pdf'
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
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First for HTML pages, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;

  const url = new URL(e.request.url);
  const isHtmlPage = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/';

  if (isHtmlPage) {
    // Network-First: Always fetch fresh HTML from server first
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(e.request);
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

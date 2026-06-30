const APP_SHELL_CACHE = 'climateroute-shell-v2.0';
const API_CACHE = 'climateroute-api-v2.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      await cache.addAll(STATIC_ASSETS);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  // Handle navigation requests with an offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          const networkResponse = await fetch(request);
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put(request, networkResponse.clone()).catch(() => {
            // Ignore write failures (e.g., opaque responses)
          });
          return networkResponse;
        } catch {
          const cache = await caches.open(APP_SHELL_CACHE);
          const cachedResponse = await cache.match('/offline');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('You are offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
    return;
  }

  // Network first for API responses
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone()).catch(() => {});
          }
          return networkResponse;
        } catch (error) {
          const cache = await caches.open(API_CACHE);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })()
    );
    return;
  }

  // Cache-first for static assets (Next.js build output, images, fonts)
  if (
    requestUrl.pathname.startsWith('/_next/') ||
    ['style', 'script', 'image', 'font'].includes(request.destination)
  ) {
    event.respondWith(
      caches.open(APP_SHELL_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => cache.match('/offline'));
        })
      )
    );
    return;
  }
});

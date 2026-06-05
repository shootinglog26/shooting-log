// Network-first service worker - updates come through immediately
const CACHE = 'shooting-log-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first: always try the network, fall back to cache only if offline
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && resp.type !== 'opaque') {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

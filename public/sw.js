// Service worker: network-first for documents, cache-first only for immutable
// hashed assets. Cache-first on HTML served stale pages after every deploy
// (old HTML -> old JS chunks), so navigations must always hit the network and
// fall back to cache only when offline. Bump CACHE to drop a poisoned cache.
const CACHE = 'md67-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const putInCache = (res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  };

  // Immutable, content-addressed assets: cache-first is safe (name changes per build).
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(putInCache)));
    return;
  }

  // Documents and everything else: network-first, cache only as offline fallback.
  e.respondWith(fetch(req).then(putInCache).catch(() => caches.match(req)));
});

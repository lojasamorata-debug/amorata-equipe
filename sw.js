// Amorata Equipe: sempre busca a versão nova; usa a cópia guardada só quando estiver sem internet.
const CACHE = 'amorata-equipe-v1';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQS)).catch(() => {})); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // chamadas ao Apps Script passam direto
  e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});

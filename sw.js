// Amorata Equipe: sempre busca a versão nova; usa a cópia guardada só quando estiver sem internet.
const CACHE = 'amorata-equipe-v4';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQS)).catch(() => {})); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // chamadas ao Apps Script passam direto
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
// notificações (Web Push): mostra o aviso e abre o app ao tocar
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Amorata Equipe', { body: d.body || 'Você tem um aviso novo.', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'aviso', renotify: true, data: { url: './', abrir: d.abrir || '' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ab = (e.notification.data && e.notification.data.abrir) || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => { for (const c of cs) { if ('focus' in c) { c.postMessage({ tipo: ab === 'mural' ? 'abrir-mural' : 'abrir-avisos' }); return c.focus(); } } return self.clients.openWindow(ab === 'mural' ? './?mural=1' : './?avisos=1'); }));
});

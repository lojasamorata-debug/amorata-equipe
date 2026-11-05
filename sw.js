// Amorata Equipe: abre na hora com a cópia guardada e busca a versão nova por trás.
// Quando a versão nova chega, o app mostra um aviso para atualizar. Sem internet, usa a cópia guardada.
const CACHE = 'amorata-equipe-v6';
const ARQS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQS)).catch(() => {})); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const assinatura = (r) => (r && (r.headers.get('etag') || r.headers.get('last-modified') || r.headers.get('content-length'))) || '';
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // chamadas ao Apps Script passam direto
  const pagina = e.request.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname);
  if (!pagina) {
    e.respondWith(caches.match(e.request).then((c) => c || fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((ca) => ca.put(e.request, cp)); return r; })));
    return;
  }
  const chave = './index.html';
  e.respondWith(caches.open(CACHE).then((ca) => ca.match(chave).then((guardada) => {
    const rede = fetch(u.pathname + (u.search || ''), { cache: 'no-cache' }).then((r) => {
      if (r && r.ok) {
        const nova = assinatura(r) !== assinatura(guardada);
        ca.put(chave, r.clone()).then(() => { if (guardada && nova) self.clients.matchAll({ type: 'window' }).then((cs) => cs.forEach((c) => c.postMessage({ tipo: 'nova-versao' }))); });
      }
      return r;
    });
    if (guardada) { e.waitUntil(rede.catch(() => {})); return guardada; }
    return rede.catch(() => caches.match('./'));
  })));
});
// notificações (Web Push): mostra o aviso e abre o app ao tocar
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Amorata Equipe', { body: d.body || 'Você tem um aviso novo.', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'aviso', renotify: true, data: { url: './', abrir: d.abrir || '' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ab = (e.notification.data && e.notification.data.abrir) || '', mu = /^mural/.test(ab), post = mu ? (ab.split(':')[1] || '') : '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => { for (const c of cs) { if ('focus' in c) { c.postMessage({ tipo: mu ? 'abrir-mural' : 'abrir-avisos', post: post }); return c.focus(); } } return self.clients.openWindow(mu ? './?mural=' + (post || '1') : './?avisos=1'); }));
});

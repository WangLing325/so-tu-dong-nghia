/* Sổ Từ Đồng Nghĩa: keeps the app usable offline. Pages fetch fresh when online; the big dictionary and icons come from cache. */
const CACHE = 'sotu-v20';
const SHELL = ['./', './index.html', './ipa-dict.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // translation, OCR library: always network
  const cacheFirst = /\/(ipa-dict\.js|icon-[\w-]+\.png)$/.test(u.pathname);
  const fromNet = () => fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; });
  if (cacheFirst) { e.respondWith(caches.match(e.request).then(r => r || fromNet())); return; }
  e.respondWith(fromNet().catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html'))));
});

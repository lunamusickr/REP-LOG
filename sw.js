const CACHE_NAME = 'rep-log-github-pages-v26';
const APP_ROOT = self.registration.scope;
const APP_URL = new URL('./index.html', APP_ROOT).pathname;
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'].map(path => new URL(path, APP_ROOT).pathname);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(APP_URL, copy));
      return response;
    }).catch(() => caches.match(APP_URL)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
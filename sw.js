const CACHE_NAME = 'shadowcast-v6';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './icons/icon.svg',
  './i18n/ko.json',
  './i18n/en.json',
  './js/i18n.js',
  './js/storage.js',
  './js/data-loader.js',
  './js/audio-player.js',
  './js/ui-render.js',
  './js/settings.js',
  './js/app.js',
  './data/es/a1_part1.json',
  './data/es/a1_part2.json',
  './data/es/a2.json',
  './data/es/b1.json',
  './data/es/b2.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

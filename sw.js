const CACHE = 'tictactoe-v1';
const PRECACHE = [
  '/tic-tac-toe-game/',
  '/tic-tac-toe-game/index.html',
  '/tic-tac-toe-game/profile.html',
  '/tic-tac-toe-game/style.css',
  '/tic-tac-toe-game/script.js',
  '/tic-tac-toe-game/auth.js',
  '/tic-tac-toe-game/profile.js',
  '/tic-tac-toe-game/config.js',
  '/tic-tac-toe-game/favicon.svg',
  '/tic-tac-toe-game/icon-192.svg',
  '/tic-tac-toe-game/icon-512.svg',
  '/tic-tac-toe-game/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('accounts.google.com') || e.request.url.includes('googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return res;
    }))
  );
});

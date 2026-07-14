// ============================================================
// Connect8 Service Worker — KROK 1: základ pre inštalovateľnú
// appku (PWA). Zatiaľ nerieši push notifikácie (to je krok 2/3),
// len umožňuje telefónu ponúknuť appku ako nainštalovateľnú a
// beží nezávisle od otvorenej stránky.
// ============================================================

const CACHE_NAME = 'connect8-shell-v1';

self.addEventListener('install', (event) => {
  // Nová verzia sa aktivuje hneď, nečaká, kým používateľ zavrie
  // všetky otvorené záložky.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Zatiaľ jednoduchá "network-first" stratégia — appka sa vždy skúsi
// najprv stiahnuť čerstvá zo siete (nech nikdy nevidíš zastaranú
// verziu), a len ak si úplne offline, použije sa naposledy uložená
// kópia z cache (ak nejaká existuje).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ---- Miesto pripravené pre KROK 2/3 (push notifikácie na hovory) ----
// self.addEventListener('push', (event) => { ... });
// self.addEventListener('notificationclick', (event) => { ... });

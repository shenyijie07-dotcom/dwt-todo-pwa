/* ==========================================================================
 * service-worker.js
 * PWA Service Worker — Lab Part 3
 *
 * Runs in the browser background, separate from the web page. It manages
 * caching so the app can work offline and load quickly on repeat visits.
 * ========================================================================== */

const CACHE_NAME = "dwt-todo-v1";

// The "app shell": the files needed to render the app even when offline.
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-48.png",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-144.png",
  "/icons/icon-168.png",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-256.png",
  "/icons/icon-512.png",
  "/icons/icon-1024.png",
  "/icons/icon-maskable-512.png",
];

/* --------------------------------------------------------------------------
 * Step 2: install event — the first step in the service worker life cycle.
 * This is the right place to pre-cache assets for offline use.
 * ------------------------------------------------------------------------ */
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* --------------------------------------------------------------------------
 * activate event — clean up old caches when a new version activates.
 * ------------------------------------------------------------------------ */
self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* --------------------------------------------------------------------------
 * fetch event — intercept network requests and serve cached responses.
 *  - Navigation (page loads): network first, fall back to cache when offline.
 *  - Static assets (JS/CSS/images): cache first, then network + cache.
 * ------------------------------------------------------------------------ */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== "GET") return;

  // Page navigations: always try the network first so the user gets fresh
  // content, but fall back to the cached page when there is no connection.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // Other same-origin GET requests (assets): serve from cache first, then
  // fetch from the network and store a copy for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

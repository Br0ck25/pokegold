// Service worker: keeps the game shell (page, scripts, icons) so Buddymon opens and plays offline once installed.
// build.js replaces __VERSION__ with a hash of the shell, so a new worker.js refreshes the cache. Saves (/api/*) always go to the network.
const VERSION = "__VERSION__";
const SHELL = ["/", "/app.js", "/style.css", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  // Fonts come from Google: keep what we have and refresh it in the background. Everything else: the cached shell first.
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then((res) => { if (res.ok && (url.origin !== location.origin)) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});

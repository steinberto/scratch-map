// Service worker: keeps a copy of the app on your device so it opens instantly and works offline.
//
// IMPORTANT when you publish a new version: change VERSION below (e.g. to "v2", "v3"...).
// That's how installed copies notice there's an update.
const VERSION = "v3";
const CACHE = "scratch-map-" + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./firebase-config.js",
  "./firebase-sdk.js",
];

// First visit: download and store all the app's files
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

// A new version took over: delete the old stored copy
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("scratch-map-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The app asks to switch to the new version when you tap "Update"
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

// Serve files from the stored copy first; fall back to the internet
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).catch(() => req.mode === "navigate" ? caches.match("./index.html") : Response.error());
    })
  );
});

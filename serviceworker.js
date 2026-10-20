const CACHE_NAME = "pokemon-pwa-v3";
const APP_SHELL = [
    "./",
    "./index.html",
    "./detalle.html",
    "./manifest.json",
    "./css/styles.css",
    "./js/app.js",
    "./js/detalle.js",
    "./images/icons/icon-72x72.png",
    "./images/icons/icon-96x96.png",
    "./images/icons/icon-128x128.png",
    "./images/icons/icon-144x144.png",
    "./images/icons/icon-152x152.png",
    "./images/icons/icon-192x192.png",
    "./images/icons/icon-384x384.png",
    "./images/icons/icon-512x512.png"
];
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;
const API_ORIGIN = "https://pokeapi.co";
const SPRITE_ORIGIN = "https://raw.githubusercontent.com";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("pokemon-pwa-") && cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
                    .map((cacheName) => caches.delete(cacheName))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const requestUrl = new URL(request.url);
    if (request.method !== "GET" || !["http:", "https:"].includes(requestUrl.protocol)) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match(request, { ignoreSearch: true })
                    .then((cachedPage) => cachedPage || caches.match("./index.html"))
            )
        );
        return;
    }

    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isPokemonResource = requestUrl.origin === API_ORIGIN || requestUrl.origin === SPRITE_ORIGIN;
    if (!isSameOrigin && !isPokemonResource) {
        return;
    }

    // Cache First strategy for app assets and previously fetched Pokémon resources.
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {
                if (!networkResponse || !networkResponse.ok || networkResponse.type === "opaque") {
                    return networkResponse;
                }

                return caches.open(isSameOrigin ? CACHE_NAME : RUNTIME_CACHE)
                    .then((cache) => cache.put(request, networkResponse.clone()))
                    .then(() => networkResponse);
            });
        })
    );
});

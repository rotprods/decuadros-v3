const CACHE_NAME = "decuadros-v3-cache-v1"
const URLS_TO_CACHE = [
    "/",
    "/offline",
    "/manifest.json",
    "/icons/icon-192x192.png"
]

self.addEventListener("install", (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE)
        })
    )
    console.log("Service Worker Installed")
})

self.addEventListener("fetch", (event: any) => {
    // Only handle GET requests
    if (event.request.method !== "GET") return

    // Network first strategy for API, Stale-while-revalidate for assets
    if (event.request.url.includes("/api/")) {
        // API: Network only (or fallback to offline json if we wanted)
        return
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone())
                })
                return networkResponse
            })
            return cachedResponse || fetchPromise
        })
    )
})

self.addEventListener("activate", (event: any) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})

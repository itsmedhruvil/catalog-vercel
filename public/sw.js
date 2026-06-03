// PWABuilder Service Worker - https://github.com/pwa-builder/PWABuilder
// Fixed: proper redirect handling and navigation support

const CACHE_NAME = 'pwa-cache-v1';

const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'res.cloudinary.com',
    'images.unsplash.com',
    'picsum.photos'
]

self.addEventListener('install', event => {
    self.skipWaiting();
})

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clean up old cache versions
            caches.keys().then(keys => {
                return Promise.all(
                    keys.filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            })
        ])
    )
})

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    const hostname = url.hostname
    
    // Only intercept whitelisted hostnames
    if (HOSTNAME_WHITELIST.indexOf(hostname) === -1) {
        return
    }
    
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return
    }
    
    // For navigation requests (HTML pages), use network-first strategy
    // This is critical because redirects (e.g., Clerk auth middleware)
    // must be followed by the browser, not intercepted by the SW
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Only cache successful responses, NOT redirects
                    if (response.ok) {
                        const cloned = response.clone()
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, cloned)
                        })
                    }
                    return response
                })
                .catch(() => {
                    return caches.match(event.request)
                })
        )
        return
    }
    
    // For non-navigation requests (static assets, images, API calls on same origin)
    // Use cache-first strategy with network fallback
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    return cached
                }
                return fetch(event.request).then(response => {
                    // Only cache successful responses
                    if (response.ok) {
                        const cloned = response.clone()
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, cloned)
                        })
                    }
                    return response
                })
            })
            .catch(() => {
                return caches.match(event.request)
            })
    )
})
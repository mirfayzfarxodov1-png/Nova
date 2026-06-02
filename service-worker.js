// ============================================
// NOVA - SERVICE-WORKER.JS
// ============================================

const CACHE_NAME = 'nova-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/core/app.js',
    '/js/core/storage.js',
    '/js/core/utils.js',
    '/js/features/feed.js',
    '/js/features/video.js',
    '/js/features/reels.js',
    '/js/features/chat.js',
    '/js/features/stories.js',
    '/js/features/settings.js',
    '/js/social/likes.js',
    '/js/social/comments.js',
    '/js/social/follows.js',
    '/js/social/channels.js',
    '/js/monetization/coins.js',
    '/js/monetization/premium.js',
    '/js/monetization/badges.js',
    '/js/monetization/payment.js',
    '/js/ui/modal.js',
    '/js/ui/toast.js',
    '/js/ui/theme.js',
    '/js/ui/loader.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response
                const responseToCache = response.clone();
                // Update cache
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                // If network fails, serve from cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // If not in cache, return offline page
                        return caches.match('/index.html');
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-posts') {
        event.waitUntil(syncPosts());
    }
});

async function syncPosts() {
    const cache = await caches.open('nova-pending');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
            }
        } catch (error) {
            console.log('[SW] Sync failed for', request.url);
        }
    }
}

// Push notification
self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

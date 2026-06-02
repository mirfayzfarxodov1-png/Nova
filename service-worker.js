// ============================================
// NOVA - SERVICE WORKER (sw.js)
// Offline rejim, push notifications, cache
// Versiya: 2.0.0
// ============================================

const CACHE_NAME = 'nova-v2.0.0';
const OFFLINE_URL = '/offline.html';
const API_CACHE_NAME = 'nova-api-v1';

// Cache qilinadigan fayllar
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/css/main.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/core/app.js',
    '/js/core/storage.js',
    '/js/core/utils.js',
    '/js/core/i18n.js',
    '/js/features/feed.js',
    '/js/features/video.js',
    '/js/features/reels.js',
    '/js/features/stories.js',
    '/js/features/chat.js',
    '/js/features/notifications.js',
    '/js/features/search.js',
    '/js/features/settings.js',
    '/js/features/trending.js',
    '/js/features/groups.js',
    '/js/features/qr-scanner.js',
    '/js/features/backup.js',
    '/js/features/analytics.js',
    '/js/features/voice-chat.js',
    '/js/social/likes.js',
    '/js/social/comments.js',
    '/js/social/shares.js',
    '/js/social/follows.js',
    '/js/social/channels.js',
    '/js/monetization/coins.js',
    '/js/monetization/premium.js',
    '/js/monetization/badges.js',
    '/js/monetization/shop.js',
    '/js/monetization/payment.js',
    '/js/monetization/ads.js',
    '/js/ui/modal.js',
    '/js/ui/toast.js',
    '/js/ui/theme.js',
    '/js/ui/loader.js',
    '/js/admin/admin.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
                    console.log('[SW] Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim())
    );
});

// ===== FETCH EVENT - Network First, then Cache =====
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip cross-origin requests except fonts and CDN
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    // API requests - Network only
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(JSON.stringify({ 
                        error: 'Offline', 
                        message: 'Internet aloqasi yo\'q' 
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // Static assets - Cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache new responses
                        if (response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return response;
                    });
            })
            .catch(() => {
                // If offline, return offline page
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('Offline content not available', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// ===== PUSH NOTIFICATION =====
self.addEventListener('push', event => {
    let data = {};
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'NOVA', body: event.data.text() };
        }
    }
    
    const options = {
        body: data.body || 'Yangi bildirishnoma',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        vibrate: [200, 100, 200],
        sound: '/assets/sounds/notification.mp3',
        data: {
            url: data.url || '/',
            postId: data.postId || null,
            userId: data.userId || null
        },
        actions: [
            { action: 'open', title: 'Ochish' },
            { action: 'dismiss', title: 'Yopish' }
        ],
        tag: data.tag || 'nova-notification',
        renotify: true,
        requireInteraction: data.requireInteraction || false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'NOVA', options)
    );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Check if there is already a window/tab open with the target URL
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-posts') {
        event.waitUntil(syncPendingPosts());
    }
    
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncPendingMessages());
    }
    
    if (event.tag === 'sync-likes') {
        event.waitUntil(syncPendingLikes());
    }
});

async function syncPendingPosts() {
    const cache = await caches.open('nova-pending-posts');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
                console.log('[SW] Synced post:', request.url);
                
                // Send notification
                self.registration.showNotification('NOVA', {
                    body: 'Post muvaffaqiyatli yuklandi!',
                    icon: '/assets/icons/icon-192.png'
                });
            }
        } catch (error) {
            console.log('[SW] Sync failed for post:', request.url);
        }
    }
}

async function syncPendingMessages() {
    const cache = await caches.open('nova-pending-messages');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
                console.log('[SW] Synced message:', request.url);
            }
        } catch (error) {
            console.log('[SW] Sync failed for message');
        }
    }
}

async function syncPendingLikes() {
    const cache = await caches.open('nova-pending-likes');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
                console.log('[SW] Synced like:', request.url);
            }
        } catch (error) {
            console.log('[SW] Sync failed for like');
        }
    }
}

// ===== PERIODIC BACKGROUND SYNC =====
self.addEventListener('periodicsync', event => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'update-notifications') {
        event.waitUntil(updateNotifications());
    }
    
    if (event.tag === 'clean-cache') {
        event.waitUntil(cleanOldCache());
    }
});

async function updateNotifications() {
    try {
        const response = await fetch('/api/notifications/unread');
        const data = await response.json();
        
        if (data.count > 0) {
            self.registration.showNotification('NOVA', {
                body: `${data.count} ta yangi ogohlantirish`,
                icon: '/assets/icons/icon-192.png',
                tag: 'unread-notifications'
            });
        }
    } catch (error) {
        console.log('[SW] Failed to update notifications');
    }
}

async function cleanOldCache() {
    const cacheNames = await caches.keys();
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    
    for (const cacheName of cacheNames) {
        if (cacheName.includes('nova-api')) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                const cachedDate = new Date(response.headers.get('date'));
                if (now - cachedDate.getTime() > ONE_DAY) {
                    await cache.delete(request);
                }
            }
        }
    }
}

// ===== MESSAGE HANDLER =====
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(clearAllCache());
    }
    
    if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

async function clearAllCache() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All cache cleared');
}

// ===== OFFLINE ANALYTICS =====
self.addEventListener('sync', event => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    const cache = await caches.open('nova-analytics');
    const requests = await cache.keys();
    const events = [];
    
    for (const request of requests) {
        const response = await cache.match(request);
        const event = await response.json();
        events.push(event);
        await cache.delete(request);
    }
    
    if (events.length > 0) {
        try {
            await fetch('/api/analytics/batch', {
                method: 'POST',
                body: JSON.stringify({ events }),
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('[SW] Synced', events.length, 'analytics events');
        } catch (error) {
            console.log('[SW] Failed to sync analytics');
        }
    }
}

// ===== CONNECTION STATUS =====
self.addEventListener('fetch', event => {
    // Check if offline
    if (!navigator.onLine) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return new Response(JSON.stringify({
                        offline: true,
                        message: 'Siz offline rejimdasiz'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
    }
});

// Log service worker events
console.log('[SW] Service Worker loaded');

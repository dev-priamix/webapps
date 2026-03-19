const CACHE_NAME = 'magna-magna-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './script.js',
    './manifest.json',
    './logo.png'
];

// 1. Installazione: Salva i file necessari per l'offline
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Attivazione: Pulisce vecchie cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch: Serve i file dalla cache se offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// 4. Ricezione messaggi dallo script.js per inviare la notifica
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'SEND_PUSH') {
        const options = {
            body: event.data.bodyText,
            icon: 'logo.png',
            badge: 'icon.png', // Icona piccola nella barra di stato (Android)
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            // requireInteraction: true // Decommenta se vuoi che la notifica NON sparisca mai da sola
        };

        event.waitUntil(
            self.registration.showNotification(event.data.titleText, options)
        );
    }
});

// 5. GESTIONE CLICK SULLA NOTIFICA (Quello che ti serviva!)
self.addEventListener('notificationclick', (event) => {
    // CHIUDE LA NOTIFICA AL CLICK
    event.notification.close();

    // PORTA L'UTENTE DENTRO L'APP
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se l'app è già aperta in una scheda, mettila a fuoco (focus)
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Altrimenti, se l'app è chiusa, aprila
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
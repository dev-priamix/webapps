self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // Corretto: permette l'attivazione immediata
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        const title = event.data.titleText || "Magna Magna";
        const options = {
            body: event.data.bodyText,
            icon: "logo.png",
            badge: "logo.png", // Icona piccola nella barra notifiche Android
            tag: "scadenza-notifica",
            renotify: true,
            vibrate: [200, 100, 200],
            data: { priority: "high" }
        };
        self.registration.showNotification(title, options);
    }
});

// Necessario per l'installazione su Android
self.addEventListener('fetch', (event) => {
    return;
});
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        self.registration.showNotification(event.data.titleText, {
            body: event.data.bodyText,
            icon: "logo.png",
            badge: "logo.png",
            vibrate: [500, 110, 500],
            requireInteraction: true,
            actions: [ {action: 'close', title: 'Ho capito'} ]
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
});

self.addEventListener('fetch', () => {}); // Abilita installazione PWA
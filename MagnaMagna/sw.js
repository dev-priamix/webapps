self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        self.registration.showNotification(event.data.titleText, {
            body: event.data.bodyText,
            icon: "logo.png",
            vibrate: [500, 110, 500],
            requireInteraction: true,
            actions: [ {action: 'close', title: 'Ho capito'} ]
        });
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
});

self.addEventListener('fetch', () => {});
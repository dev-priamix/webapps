self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        const options = {
            body: event.data.bodyText,
            icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            badge: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            vibrate: [200, 100, 200],
            tag: "alert-scadenza",
            renotify: true,
            data: { priority: "high" }
        };
        self.registration.showNotification(event.data.titleText, options);
    }
});

self.addEventListener('fetch', () => { return; });
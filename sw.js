self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); 
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        const title = event.data.titleText || "Magna Magna";
        const options = {
            body: event.data.bodyText,
            icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            badge: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            tag: "scadenza-notifica",
            renotify: true,
            vibrate: [200, 100, 200],
            data: { priority: "high" }
        };
        self.registration.showNotification(title, options);
    }
});

// Indispensabile per Android
self.addEventListener('fetch', (event) => {
    return;
});
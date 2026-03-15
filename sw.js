let timer = null;

self.addEventListener('message', (event) => {
    if (event.data.action === 'START_TIMER') {
        if (timer) clearInterval(timer);
        
        timer = setInterval(() => {
            self.registration.showNotification("Notifica Attiva", {
                body: "Loop da 30 secondi funzionante su GitHub!",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                tag: "pwa-notif",
                renotify: true,
                vibrate: [100, 50, 100]
            });
        }, event.data.interval);
    }
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
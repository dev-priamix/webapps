self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        const title = "Inventario Frigo";
        const options = {
            body: "Notifica",
            icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            tag: "pwa-30s", // Sovrascrive la precedente
            renotify: true,  // Forza vibrazione/suono
            vibrate: [200, 100, 200]
        };
        
        self.registration.showNotification(title, options);
    }
});
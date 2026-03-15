let timer = null;

self.addEventListener('message', (event) => {
    if (event.data.action === 'START_TIMER') {
        if (timer) clearInterval(timer);
        
        timer = setInterval(() => {
            self.registration.showNotification("App Funzionante", {
                body: "Notifica ogni 30 secondi attiva!",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                tag: "check-30s",
                renotify: true
            });
        }, event.data.interval);
    }
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.registration.claim());
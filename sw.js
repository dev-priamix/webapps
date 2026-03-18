self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        // Nel tuo sw.js, dentro l'evento 'message'
        const options = {
            body: event.data.bodyText,
            icon: "logo.png",
            badge: "logo.png",
            vibrate: [500, 110, 500], // Vibrazione forte per svegliare il telefono
            tag: "alert-scadenza",
            renotify: true,
            requireInteraction: true, // La notifica non sparisce finché non la tocchi
            actions: [ {action: 'ok', title: 'Ho capito'} ] // Aggiunge un tasto (aiuta il sistema a considerarla importante)
        };
        self.registration.showNotification(event.data.titleText, options);
    }
});

self.addEventListener('fetch', () => { return; });
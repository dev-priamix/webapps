// Forza l'attivazione immediata del Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Gestione del timer ricevuto dallo script.js
self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const minuti = event.data.minuti;
        
        setInterval(() => {
            self.registration.showNotification("Notifica PWA", {
                body: "È passato un minuto! L'app funziona.",
                icon: "https://cdn-icons-png.flaticon.com/192/2523/2523159.png",
                vibrate: [200, 100, 200]
            });
        }, minuti * 60 * 1000);
    }
});
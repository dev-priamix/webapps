self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const minuti = event.data.minuti;
        
        // Usiamo un intervallo, ma aggiungiamo un log per il debug
        setInterval(() => {
            console.log("Tentativo invio notifica su Android...");
            
            const options = {
                body: "Notifica periodica attiva!",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                badge: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                vibrate: [200, 100, 200],
                // Fondamentale per Android:
                renotify: true,
                tag: "alert-timer"
            };

            self.registration.showNotification("La tua App", options);
        }, minuti * 60 * 1000);
    }
});
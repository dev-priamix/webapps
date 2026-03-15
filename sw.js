let intervalloId = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const ms = event.data.secondi * 1000;
        
        // Se c'è un timer vecchio lo resettiamo
        if (intervalloId) clearInterval(intervalloId);

        console.log("Timer avviato: " + ms + "ms");

        intervalloId = setInterval(() => {
            // Mostriamo la notifica
            self.registration.showNotification("Promemoria Fisso", {
                body: "Sono passati " + event.data.secondi + " secondi.",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                tag: "timer-30", // Importante: evita notifiche doppie
                renotify: true,
                vibrate: [200, 100, 200]
            });
        }, ms);
    }
});
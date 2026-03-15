self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const minuti = event.data.minuti;
        console.log("Timer avviato nel Service Worker");

        setInterval(() => {
            self.registration.showNotification("Nuovo Aggiornamento", {
                body: "Ecco la tua immagine periodica!",
                // Icona piccola a lato del testo
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                // Immagine grande nel corpo della notifica
                image: "https://picsum.photos/600/400", 
                badge: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                vibrate: [200, 100, 200],
                tag: "notifica-periodica" // Evita di accumulare troppe notifiche uguali
            });
        }, minuti * 60 * 1000);
    }
});
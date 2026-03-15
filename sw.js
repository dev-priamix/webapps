self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const ms = event.data.secondi * 1000; // 30000 millisecondi
        
        console.log("Timer 30 secondi avviato");

        setInterval(() => {
            self.registration.showNotification("Promemoria 30s", {
                body: "Sono passati 30 secondi!",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                image: "https://picsum.photos/600/400",
                vibrate: [200, 100, 200],
                tag: "timer-30s",
                renotify: true // Fa vibrare il telefono anche se la notifica precedente è ancora lì
            });
        }, ms);
    }
});
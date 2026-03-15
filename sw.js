let timerId = null;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'START_LOOP') {
        if (timerId) clearInterval(timerId);

        // Notifica immediata
        inviaNotifica("Loop Avviato", "Riceverai notifiche ogni 30 secondi.");

        // Avvio loop
        timerId = setInterval(() => {
            inviaNotifica("Aggiornamento", "Sono passati 30 secondi.");
        }, 30000);
    }
});

function inviaNotifica(titolo, testo) {
    // Il Service Worker usa self.registration per mostrare notifiche
    self.registration.showNotification(titolo, {
        body: testo,
        icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
        vibrate: [200, 100, 200],
        tag: "timer-notifica",
        renotify: true,
        requireInteraction: false // Su Android aiuta a non bloccare la coda
    });
}
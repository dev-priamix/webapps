// sw.js

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    // Facciamo partire il timer non appena il SW è attivo
    avviaLoopNotifiche();
});

function avviaLoopNotifiche() {
    setInterval(() => {
        // Verifica se abbiamo i permessi prima di sparare la notifica
        if (Notification.permission === 'granted') {
            self.registration.showNotification("Promemoria Automatico", {
                body: "Sono passati 30 secondi (automatici)!",
                icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
                vibrate: [200, 100, 200],
                tag: "timer-30s",
                renotify: true
            });
        }
    }, 60000); // 30 secondi
}

// Restiamo comunque in ascolto per messaggi manuali
self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        console.log("Timer ri-sollecitato manualmente");
        // Se il timer non era partito, lo forziamo qui
    }
});
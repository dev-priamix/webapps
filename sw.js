// let timer = null;

// self.addEventListener('message', (event) => {
//     if (event.data.action === 'START_TIMER') {
//         if (timer) clearInterval(timer);
        
//         timer = setInterval(() => {
//             self.registration.showNotification("Notifica Attiva", {
//                 body: "Loop da 30 secondi funzionante su GitHub!",
//                 icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
//                 tag: "pwa-notif",
//                 renotify: true,
//                 vibrate: [100, 50, 100]
//             });
//         }, event.data.interval);
//     }
// });

// self.addEventListener('install', () => self.skipWaiting());
// self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));



// ---------------------------

let timer = null;

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forza l'attivazione immediata
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'START_TIMER') {
        if (timer) clearInterval(timer);
        
        // Prima notifica immediata per conferma
        mostraNotifica("Sistema Partito!");

        timer = setInterval(() => {
            mostraNotifica("Sono passati 30 secondi");
        }, 30000);
    }
});

function mostraNotifica(testo) {
    self.registration.showNotification("Notifica Android", {
        body: testo,
        icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
        vibrate: [200, 100, 200],
        tag: "loop-30s",
        renotify: true
    });
}
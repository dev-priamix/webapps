let timerId = null;
let notificationCount = 0;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'START_LOOP') {
        if (timerId) clearInterval(timerId);

        notificationCount = 0;
        sendNote("Loop Iniziato", "Riceverai notifiche ogni 30 secondi.");

        timerId = setInterval(() => {
            notificationCount++;
            sendNote("Notifica #" + notificationCount, "Sono passati altri 30 secondi.");
        }, 30000);
    }
});

function sendNote(title, text) {
    self.registration.showNotification(title, {
        body: text,
        icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
        badge: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
        tag: "timer-30s",
        renotify: true,
        vibrate: [200, 100, 200]
    });
}
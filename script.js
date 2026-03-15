if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => console.log("SW registrato!"))
    .catch(err => console.error("Errore SW:", err));
}

document.getElementById('btnNotifiche').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            // TEST IMMEDIATO: manda subito una notifica per verificare il telefono
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("Test Immediato", {
                    body: "Se leggi questo, il telefono riceve le notifiche!",
                    icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png"
                });
            });

            // Avvio del timer da 30 secondi nel Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'START_TIMER',
                    secondi: 30
                });
            }
        } else {
            alert("Devi autorizzare le notifiche!");
        }
    });
});
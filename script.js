// Registrazione Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => console.log("SW registrato per lo scope:", reg.scope))
    .catch(err => console.error("Errore registrazione SW:", err));
}

document.getElementById('btnNotifiche').addEventListener('click', () => {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            // Notifica di test immediata
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("Sistema Attivo!", {
                    body: "Le notifiche periodiche sono partite.",
                    icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png"
                });
            });

            // Avvio timer nel Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'START_TIMER',
                    minuti: 1
                });
            }
        } else {
            alert("Devi autorizzare le notifiche!");
        }
    });
});
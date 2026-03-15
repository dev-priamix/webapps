// Registrazione Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(reg => console.log("Service Worker registrato correttamente!", reg.scope))
    .catch(err => console.error("Errore registrazione SW (controlla se il file sw.js esiste):", err));
}

document.getElementById('btnNotifiche').addEventListener('click', () => {
    // Richiesta permessi
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Permesso accordato!");
            
            // Notifica immediata di conferma
            new Notification("Sistema Attivo", { 
                body: "Le notifiche sono state attivate correttamente.",
                icon: "https://cdn-icons-png.flaticon.com/192/2523/2523159.png"
            });

            // Inviamo il comando al Service Worker per il background
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'START_TIMER',
                    minuti: 1
                });
            }
        } else {
            alert("Devi autorizzare le notifiche per testare l'app.");
        }
    });
});
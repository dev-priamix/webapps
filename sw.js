// Installazione del Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker Installato');
});

// Ascolta i messaggi inviati dallo script.js
self.addEventListener('message', (event) => {
    if (event.data.type === 'START_TIMER') {
        const minuti = event.data.minuti;
        console.log(`Timer avviato nel Service Worker: ogni ${minuti} minuti`);

        // Funzione per mostrare la notifica
        const mostraNotifica = () => {
            self.registration.showNotification("Promemoria App", {
                body: "È ora di controllare la tua applicazione!",
                icon: "https://via.placeholder.com/192",
                badge: "https://via.placeholder.com/192",
                vibrate: [200, 100, 200]
            });
        };

        // Avvia l'intervallo (Nota: i browser possono limitarlo se l'app è chiusa da molto)
        setInterval(mostraNotifica, minuti * 60 * 1000);
    }
});
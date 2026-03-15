// Funzione che invia la notifica
function inviaNotificaPeriodica() {
    if (Notification.permission === "granted") {
        new Notification("Promemoria!", {
            body: "È passato il tempo impostato! Controlla la tua app.",
            icon: "icon-192.png" // Assicurati che il percorso sia corretto
        });
    }
}

// Chiedi il permesso e avvia il timer
function avviaTimer(minuti) {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const millisecondi = minuti * 60 * 1000;
            
            // Invia la prima notifica subito
            inviaNotificaPeriodica();

            // Poi imposta l'intervallo
            setInterval(inviaNotificaPeriodica, millisecondi);
            
            console.log(`Timer avviato: riceverai una notifica ogni ${minuti} minuti.`);
        }
    });
}

// Esempio: Avvia ogni 5 minuti
avviaTimer(5);
self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        
        // Recuperiamo i dati inviati da script.js
        const title = event.data.titleText || "Notifica Default";
        const body = event.data.bodyText || "Nessun testo fornito";

        const options = {
            body: body, // Usiamo la variabile ricevuta
            icon: "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
            tag: "pwa-30s",
            renotify: true,
            vibrate: [200, 100, 200]
        };
        
        self.registration.showNotification(title, options);
    }
});
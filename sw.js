// AGGIUNGI QUESTO IN CIMA AL TUO sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.registration.claim());

self.addEventListener('message', (event) => {
    if (event.data.action === 'SEND_PUSH') {
        
        // Recuperiamo i dati inviati da script.js
        const title = event.data.titleText || "Notifica Default";
        const body = event.data.bodyText || "Nessun testo fornito";

        const options = {
        body: body,
        icon: "logo.png",
        tag: "Magna Magna",
        
        // --- QUESTE RIGHE ATTIVANO IL POPUP IN ALTO ---
        renotify: true,
        vibrate: [200, 100, 200], // La vibrazione è spesso necessaria per il popup
        priority: "high",         // Per i browser basati su Chromium
        data: {
            priority: "high"
        }
        // ----------------------------------------------
    };
        
        self.registration.showNotification(title, options);
    }
});
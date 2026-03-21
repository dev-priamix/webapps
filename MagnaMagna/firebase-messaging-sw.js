importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAyhR6Ec61n2IZ_d1CkYI1vjEFdwaFQ98Q",
    projectId: "magnamagna-d6430",
    messagingSenderId: "837560857745",
    appId: "1:837560857745:web:41208095564a51a4423b30"
});

const messaging = firebase.messaging();

// Gestione notifiche quando il browser è chiuso o in background
messaging.onBackgroundMessage((payload) => {
    console.log('Messaggio ricevuto in background:', payload);
    const notificationTitle = payload.notification.title || "Scadenza MagnaMagna";
    const notificationOptions = {
        body: payload.notification.body || "Controlla la tua dispensa!",
        icon: 'logo.png',
        badge: 'logo.png',
        vibrate: [500, 110, 500]
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
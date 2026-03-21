importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAyhR6Ec61n2IZ_d1CkYI1vjEFdwaFQ98Q",
    projectId: "magnamagna-d6430",
    messagingSenderId: "837560857745",
    appId: "1:837560857745:web:41208095564a51a4423b30"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: 'logo.png',
        vibrate: [500, 110, 500]
    });
});
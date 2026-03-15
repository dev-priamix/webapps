let cibo = [
    ['carne', new Date(2026, 2, 15)],
    ['carne', new Date(2026, 0, 17)],
    ['carne', new Date(2026, 0, 16)]
];

let scadenze = [];
let stringa_scadenze = "";

window.addEventListener("load", function() {
    console.log('load');
    const today = new Date();

    cibo.forEach(e => {
        if (
            e[1].getDate() === today.getDate() &&
            e[1].getMonth() === today.getMonth() &&
            e[1].getFullYear() === today.getFullYear()
        ) {
            scadenze.push(e[0]);
        }
    });

    if (scadenze.length > 0) {
        
        scadenze.forEach(el => {
            stringa_scadenze += el + ", ";
        });
        stringa_scadenze = stringa_scadenze.slice(0, -2); // Rimuove l'ultima virgola
        console.log('Scadenza oggi:', stringa_scadenze);
    }
});

const timerDisplay = document.getElementById('timer-display');
const logDiv = document.getElementById('log');
let timeLeft = 30;
let timerRunning = false;

// Registrazione SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Registrato"));
}

async function pushNotification() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert("Permesso negato!");
        return;
    }
    // Eseguiamo la prima notifica subito
    triggerSwNotification(stringa_scadenze);
}

function triggerSwNotification(messaggio = "Notifica generica") {
    const messaggioDinamico = `${messaggio} -> inviata alle ${new Date().toLocaleTimeString()}`;
    navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
            reg.active.postMessage({ 
                action: 'SEND_PUSH',
                bodyText: messaggioDinamico,
                titleText: "Allarme PWA"
            });
        }
    });
}

document.getElementById('btn').addEventListener('click', pushNotification);

const timerDisplay = document.getElementById('timer-display');
const logDiv = document.getElementById('log');
let timeLeft = 30;
let timerRunning = false;

function log(msg) {
    logDiv.innerHTML += "> " + msg + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Registrazione SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => log("SW Registrato"));
}

async function pushNotification() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert("Permesso negato!");
        return;
    }

    if (timerRunning) return;
    timerRunning = true;
    log("Loop avviato...");
    
    // Eseguiamo la prima notifica subito
    triggerSwNotification();
    startCountdown();
}

function startCountdown() {
    setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            timeLeft = 30;
            log("Tempo scaduto! Sveglio il SW...");
            triggerSwNotification();
        }
        timerDisplay.innerText = timeLeft;
    }, 1000);
}

function triggerSwNotification() {
    navigator.serviceWorker.ready.then(reg => {
        reg.active.postMessage({ action: 'SEND_PUSH' });
    });
}

document.getElementById('btn').addEventListener('click', pushNotification);
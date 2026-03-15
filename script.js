const debug = document.getElementById('debug');
const timerDisplay = document.getElementById('timer-display');
let timeLeft = 30;
let countdownInterval;

function log(msg) {
    debug.innerHTML += "> " + msg + "<br>";
    debug.scrollTop = debug.scrollHeight;
}

// Registrazione Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(reg => log("SW registrato con successo ✅"))
    .catch(err => log("Errore SW: " + err));
}

async function pushNotification() {
    log("Eseguo pushNotification()...");
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        log("Permesso accordato.");
        const reg = await navigator.serviceWorker.ready;
        reg.active.postMessage({ action: 'START_LOOP' });
        startVisualTimer();
    } else {
        log("Permesso NEGATO ❌");
        alert("Attiva le notifiche nelle impostazioni!");
    }
}

function startVisualTimer() {
    clearInterval(countdownInterval);
    timeLeft = 30;
    timerDisplay.innerText = timeLeft;
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) timeLeft = 30;
        timerDisplay.innerText = timeLeft;
    }, 1000);
}

document.getElementById('btn').addEventListener('click', pushNotification);
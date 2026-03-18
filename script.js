let form_add = document.getElementById('aggiungi_cibo');
let scadenzaInput = document.getElementById('scadenza');
let nomeInput = document.getElementById('nome');
let codiceInput = document.getElementById('codice');
let lista = document.getElementById('lista');

let cibo = [];
let scadenzeOggi = [];

// --- LOGICA DATI ---

function caricaCibo() {
    const dati = localStorage.getItem('cibo');
    if (dati) {
        cibo = JSON.parse(dati).map(item => [item[0], item[1], new Date(item[2])]);
    }
    aggiornaInterfaccia();
}

function salvaCibo() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
}

function aggiornaInterfaccia() {
    let html = "";
    scadenzeOggi = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    cibo.sort((a, b) => a[2] - b[2]); // Ordina per data

    cibo.forEach(item => {
        const itemDate = new Date(item[2]);
        itemDate.setHours(0,0,0,0);

        // Se scade oggi, aggiungi ai nomi per la notifica
        if (itemDate.getTime() === today.getTime()) {
            scadenzeOggi.push(item[1]);
        }

        html += `<b>${item[1]}</b> (${item[0]})<br>Scadenza: ${item[2].toLocaleDateString()}<hr>`;
    });

    lista.innerHTML = cibo.length > 0 ? html : "Nessun elemento in lista.";
}

// --- LOGICA NOTIFICHE ---

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Registrato"));
}

async function invioAutomaticoNotifica() {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted' && scadenzeOggi.length > 0) {
        triggerSwNotification("Oggi scade: " + scadenzeOggi.join(", "));
    }
}

function triggerSwNotification(messaggio) {
    navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
            reg.active.postMessage({ 
                action: 'SEND_PUSH',
                bodyText: messaggio,
                titleText: "Magna Magna - Scadenza!"
            });
        }
    });
}

// --- EVENTI ---

form_add.addEventListener('submit', function(event) {
    event.preventDefault();
    
    cibo.push([codiceInput.value, nomeInput.value, new Date(scadenzaInput.value)]);
    
    salvaCibo();
    aggiornaInterfaccia();
    invioAutomaticoNotifica(); // Parte subito la notifica se scade oggi
    
    form_add.reset();
});

// Avvio
caricaCibo();
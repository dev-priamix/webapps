let form_add = document.getElementById('aggiungi_cibo');
let btn_test = document.getElementById('test_notifica');
let cibo = [];

// 1. Registrazione Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log("Service Worker registrato con successo"))
    .catch(err => console.error("Errore registrazione SW:", err));
}

// 2. Funzione universale per inviare il messaggio al Service Worker
async function inviaMessaggioAlSW(titolo, messaggio) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        if (reg.active) {
            reg.active.postMessage({ 
                action: 'SEND_PUSH',
                bodyText: messaggio,
                titleText: titolo
            });
        }
    } else {
        alert("Permesso notifiche negato. Abilitalo nelle impostazioni del browser.");
    }
}

// 3. Funzione per aggiornare l'interfaccia grafica
function aggiornaInterfaccia() {
    const listaDiv = document.getElementById('lista');
    let html = "";
    const oggi = new Date().toLocaleDateString();

    cibo.forEach(item => {
        const dataScadenza = new Date(item[2]).toLocaleDateString();
        const alertStyle = (dataScadenza === oggi) ? "color: red; font-weight: bold;" : "";
        html += `<div style="${alertStyle}"><b>${item[1]}</b> - ${dataScadenza} (${item[0]})</div><hr>`;
    });
    listaDiv.innerHTML = html || "Nessun cibo in lista.";
}

// 4. EVENTO: Aggiunta cibo dal form
form_add.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = document.getElementById('nome').value;
    const s = document.getElementById('scadenza').value;
    const c = document.getElementById('codice').value;

    const nuovaScadenza = new Date(s);
    cibo.push([c, n, nuovaScadenza]);
    localStorage.setItem('cibo', JSON.stringify(cibo));
    
    aggiornaInterfaccia();

    // Se scade oggi, manda notifica automatica
    if (nuovaScadenza.toLocaleDateString() === new Date().toLocaleDateString()) {
        inviaMessaggioAlSW("Scadenza Rilevata!", "Oggi scade: " + n);
    }

    form_add.reset();
});

// 5. EVENTO: Pulsante di TEST (Invia sempre)
btn_test.addEventListener('click', () => {
    inviaMessaggioAlSW("Test Notifica", "Il sistema funziona correttamente! 🚀");
});

// 6. Caricamento dati iniziali
const datiSalvati = localStorage.getItem('cibo');
if (datiSalvati) {
    cibo = JSON.parse(datiSalvati).map(i => [i[0], i[1], new Date(i[2])]);
    aggiornaInterfaccia();
}
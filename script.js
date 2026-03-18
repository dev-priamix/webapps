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
    
    // Reset orario di oggi per confronto preciso
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    cibo.forEach(item => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);

        // Calcolo giorni rimanenti
        const diffTempo = dataScadenza - oggi;
        const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let alertStyle = "";
        let testoScadenza = `Scade il: ${dataScadenza.toLocaleDateString()}`;

        if (diffGiorni === 0) {
            alertStyle = "color: red; font-weight: bold;";
            testoScadenza = "SCADE OGGI!";
        } else if (diffGiorni === 1) {
            alertStyle = "color: orange; font-weight: bold;";
            testoScadenza = "Scade DOMANI!";
        } else if (diffGiorni > 1 && diffGiorni <= 7) {
            alertStyle = "color: blue;";
            testoScadenza = `Scade tra ${diffGiorni} giorni`;
        } else if (diffGiorni < 0) {
            alertStyle = "color: gray; text-decoration: line-through;";
            testoScadenza = "SCADUTO";
        }

        html += `<div style="${alertStyle}"><b>${item[1]}</b> - ${testoScadenza} (${item[0]})</div><hr>`;
    });
    listaDiv.innerHTML = html || "Nessun cibo in lista.";
}

// 4. EVENTO: Aggiunta cibo dal form
form_add.addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = document.getElementById('nome').value;
    const s = document.getElementById('scadenza').value;
    const c = document.getElementById('codice').value;

    const dataScadenza = new Date(s);
    dataScadenza.setHours(0, 0, 0, 0);
    
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // Calcolo giorni mancanti per la notifica immediata
    const diffTempo = dataScadenza - oggi;
    const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    cibo.push([c, n, dataScadenza]);
    localStorage.setItem('cibo', JSON.stringify(cibo));
    
    aggiornaInterfaccia();

    // Logica Notifiche Automatiche all'inserimento
    if (diffGiorni === 0) {
        inviaMessaggioAlSW("Attenzione!", `Il prodotto "${n}" scade proprio OGGI!`);
    } else if (diffGiorni === 1) {
        inviaMessaggioAlSW("Promemoria", `Il prodotto "${n}" scadrà DOMANI.`);
    } else if (diffGiorni === 7) {
        inviaMessaggioAlSW("Avviso Anticipato", `Il prodotto "${n}" scadrà tra 1 settimana.`);
    }

    form_add.reset();
});

// 5. EVENTO: Pulsante di TEST
btn_test.addEventListener('click', () => {
    inviaMessaggioAlSW("Test Notifica", "Il sistema Magna Magna è attivo! 🚀");
});

// 6. Caricamento dati iniziali
const datiSalvati = localStorage.getItem('cibo');
if (datiSalvati) {
    cibo = JSON.parse(datiSalvati).map(i => [i[0], i[1], new Date(i[2])]);
    aggiornaInterfaccia();
}
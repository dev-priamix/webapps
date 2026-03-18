let form_add = document.getElementById('aggiungi_cibo');
let btn_test = document.getElementById('test_notifica');
let listaDiv = document.getElementById('lista');
let cibo = [];

// 1. REGISTRAZIONE SERVICE WORKER
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log("Service Worker registrato!"))
    .catch(err => console.error("Errore SW:", err));
}

// 2. FUNZIONE PER INVIARE NOTIFICHE TRAMITE SW
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
    }
}

// 3. AGGIORNA INTERFACCIA E CALCOLA SCADENZE
function aggiornaInterfaccia() {
    let html = "";
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // Ordiniamo i cibi dal più vicino alla scadenza al più lontano
    cibo.sort((a, b) => new Date(a[2]) - new Date(b[2]));

    cibo.forEach((item, index) => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);

        const diffTempo = dataScadenza - oggi;
        const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let stile = "padding: 10px; margin-bottom: 5px; border-radius: 8px; background: #f9f9f9; border-left: 5px solid #ccc;";
        let testoTempo = `Scade il: ${dataScadenza.toLocaleDateString()}`;

        // Colori dinamici in base all'urgenza
        if (diffGiorni === 0) {
            stile += "border-left-color: red; background: #fff1f1;";
            testoTempo = "⚠️ SCADE OGGI";
        } else if (diffGiorni === 1) {
            stile += "border-left-color: orange; background: #fff7ed;";
            testoTempo = "⏳ SCADE DOMANI";
        } else if (diffGiorni > 1 && diffGiorni <= 7) {
            stile += "border-left-color: #007bff;";
            testoTempo = `Scade tra ${diffGiorni} giorni`;
        } else if (diffGiorni < 0) {
            stile += "border-left-color: gray; opacity: 0.6;";
            testoTempo = "❌ SCADUTO";
        }

        html += `
            <div style="${stile}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <b>${item[1]}</b> (${item[0]})<br>
                        <small>${testoTempo}</small>
                    </div>
                    <button onclick="eliminaCibo(${index})" style="width: auto; background: #ff4444; padding: 5px 10px; font-size: 12px;">Elimina</button>
                </div>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray'>La dispensa è vuota.</p>";
}

// 4. FUNZIONE ELIMINA
window.eliminaCibo = function(index) {
    if (confirm("Hai consumato questo prodotto?")) {
        cibo.splice(index, 1);
        salvaDati();
        aggiornaInterfaccia();
    }
};

// 5. SALVATAGGIO E CARICAMENTO
function salvaDati() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
}

function caricaDati() {
    const datiSalvati = localStorage.getItem('cibo');
    if (datiSalvati) {
        cibo = JSON.parse(datiSalvati).map(i => [i[0], i[1], new Date(i[2])]);
        aggiornaInterfaccia();
    }
}

// 6. CHECK AUTOMATICO (Controlla tutto all'apertura dell'app)
async function checkScadenzeAllAvvio() {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    let avvisi = [];

    cibo.forEach(item => {
        const d = new Date(item[2]);
        d.setHours(0, 0, 0, 0);
        const diff = Math.ceil((d - oggi) / (1000 * 60 * 60 * 24));

        if (diff === 0) avvisi.push(`${item[1]} (Oggi)`);
        if (diff === 1) avvisi.push(`${item[1]} (Domani)`);
        if (diff === 7) avvisi.push(`${item[1]} (Tra 7gg)`);
    });

    if (avvisi.length > 0) {
        inviaMessaggioAlSW("Promemoria Dispensa", "Controlla: " + avvisi.join(", "));
    }
}

// 7. EVENTI
form_add.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = document.getElementById('nome').value;
    const s = document.getElementById('scadenza').value;
    const c = document.getElementById('codice').value;

    const dataScadenza = new Date(s);
    cibo.push([c, n, dataScadenza]);
    
    salvaDati();
    aggiornaInterfaccia();

    // Notifica immediata se la data inserita scade oggi/domani/7gg
    const oggi = new Date(); oggi.setHours(0,0,0,0);
    const diff = Math.ceil((new Date(s).setHours(0,0,0,0) - oggi) / (1000*60*60*24));
    
    if ([0, 1, 7].includes(diff)) {
        inviaMessaggioAlSW("Salvato!", `Ti avviserò per ${n}`);
    }

    form_add.reset();
});

btn_test.addEventListener('click', () => {
    inviaMessaggioAlSW("Test Magna Magna", "Le notifiche funzionano alla grande! 🚀");
});

// AVVIO
caricaDati();
window.addEventListener('load', () => {
    setTimeout(checkScadenzeAllAvvio, 2000); // Controlla dopo 2 secondi dall'apertura
});
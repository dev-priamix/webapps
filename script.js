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

// 3. PULIZIA AUTOMATICA (Rimuove cibi scaduti da più di 14 giorni)
function pulisciVecchiScaduti() {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    const limiteGiorni = 14;
    
    // Filtriamo l'array tenendo solo i cibi validi o scaduti da meno di 14gg
    const ciboFiltrato = cibo.filter(item => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);
        
        const diffTempo = oggi - dataScadenza;
        const diffGiorni = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
        
        // Se la differenza è maggiore di 14 (ed è già scaduto), ritorna false (elimina)
        return diffGiorni <= limiteGiorni;
    });

    if (ciboFiltrato.length !== cibo.length) {
        console.log("Pulizia automatica eseguita: rimossi elementi vecchi.");
        cibo = ciboFiltrato;
        salvaDati();
    }
}

// 4. AGGIORNA INTERFACCIA E CALCOLA SCADENZE
function aggiornaInterfaccia() {
    pulisciVecchiScaduti(); // Pulisce prima di mostrare la lista
    
    let html = "";
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    cibo.sort((a, b) => new Date(a[2]) - new Date(b[2]));

    cibo.forEach((item, index) => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);

        const diffTempo = dataScadenza - oggi;
        const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let stile = "padding: 10px; margin-bottom: 5px; border-radius: 8px; background: #f9f9f9; border-left: 5px solid #ccc;";
        let testoTempo = `Scade il: ${dataScadenza.toLocaleDateString()}`;

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
                    <button onclick="eliminaCibo(${index})" style="width: auto; background: #ff4444; padding: 5px 10px; font-size: 12px; color:white; border:none; border-radius:5px;">Elimina</button>
                </div>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray'>La dispensa è vuota.</p>";
}

// 5. FUNZIONI DI SERVIZIO
window.eliminaCibo = function(index) {
    if (confirm("Vuoi eliminare questo prodotto?")) {
        cibo.splice(index, 1);
        salvaDati();
        aggiornaInterfaccia();
    }
};

function salvaDati() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
}

function caricaDati() {
    const datiSalvati = localStorage.getItem('cibo');
    if (datiSalvati) {
        cibo = JSON.parse(datiSalvati).map(i => [i[0], i[1], new Date(i[2])]);
    }
}

// 6. CHECK AUTOMATICO ALL'AVVIO
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

    cibo.push([c, n, new Date(s)]);
    salvaDati();
    aggiornaInterfaccia();

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
aggiornaInterfaccia();
window.addEventListener('load', () => {
    setTimeout(checkScadenzeAllAvvio, 2000);
});
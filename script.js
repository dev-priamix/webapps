let form_add = document.getElementById('aggiungi_cibo');
let btn_test = document.getElementById('test_notifica');
let btn_clear_all = document.getElementById('elimina_tutto');
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
    
    const ciboFiltrato = cibo.filter(item => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);
        const diffTempo = oggi - dataScadenza;
        const diffGiorni = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
        return diffGiorni <= limiteGiorni;
    });

    if (ciboFiltrato.length !== cibo.length) {
        cibo = ciboFiltrato;
        salvaDati();
    }
}

// 4. AGGIORNA INTERFACCIA
function aggiornaInterfaccia() {
    pulisciVecchiScaduti(); 
    let html = "";
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // Ordina per data di scadenza
    cibo.sort((a, b) => new Date(a[2]) - new Date(b[2]));

    cibo.forEach((item, index) => {
        const dataScadenza = new Date(item[2]);
        dataScadenza.setHours(0, 0, 0, 0);
        const diffTempo = dataScadenza - oggi;
        const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let stileBordo = "#ccc";
        let bgCard = "#f9f9f9";
        let testoTempo = `Scade il: ${dataScadenza.toLocaleDateString()}`;
        let opacita = "1";

        if (diffGiorni === 0) {
            stileBordo = "red"; bgCard = "#fff1f1"; testoTempo = "⚠️ SCADE OGGI";
        } else if (diffGiorni === 1) {
            stileBordo = "orange"; bgCard = "#fff7ed"; testoTempo = "⏳ SCADE DOMANI";
        } else if (diffGiorni > 1 && diffGiorni <= 7) {
            stileBordo = "#007bff"; testoTempo = `Scade tra ${diffGiorni} giorni`;
        } else if (diffGiorni < 0) {
            stileBordo = "gray"; opacita = "0.6"; testoTempo = "❌ SCADUTO";
        }

        html += `
            <div style="padding: 15px; margin-bottom: 10px; border-radius: 12px; background: ${bgCard}; 
                        border-left: 6px solid ${stileBordo}; opacity: ${opacita}; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                        display: flex; justify-content: space-between; align-items: center;">
                <div style="text-align: left;">
                    <b style="font-size: 16px;">${item[1]}</b> <small style="color:#666;">(${item[0]})</small><br>
                    <small style="color: ${stileBordo === 'gray' ? 'gray' : '#333'}; font-weight: bold;">${testoTempo}</small>
                </div>
                <button onclick="eliminaCibo(${index})" style="width: auto; background: #ff4444; color:white; border:none; padding: 8px 12px; border-radius:8px; cursor:pointer; font-weight:bold;">🗑️</button>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray; padding:20px;'>La dispensa è vuota.</p>";
}

// 5. FUNZIONI DI SERVIZIO
window.eliminaCibo = function(index) {
    if (confirm("Vuoi eliminare questo prodotto?")) {
        cibo.splice(index, 1);
        salvaDati();
        aggiornaInterfaccia();
    }
};

// Logica per il tasto Elimina Tutto
btn_clear_all.addEventListener('click', () => {
    if (confirm("Sei sicuro di voler svuotare tutta la dispensa? Questa azione non è reversibile.")) {
        cibo = [];
        salvaDati();
        aggiornaInterfaccia();
        inviaMessaggioAlSW("Dispensa Svuotata", "Hai eliminato tutti i prodotti.");
    }
});

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
        if (diff === 7) avvisi.push(`${item[1]} (Tra 1 sett)`);
    });

    if (avvisi.length > 0) {
        inviaMessaggioAlSW("Promemoria Dispensa", "Scadenze rilevate: " + avvisi.join(", "));
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

    const oggi = new Date(); oggi.setHours(0,0,0,0);
    const diff = Math.ceil((new Date(s).setHours(0,0,0,0) - oggi) / (1000*60*60*24));
    
    if ([0, 1, 7].includes(diff)) {
        inviaMessaggioAlSW("Promemoria Attivo", `Ti avviserò per la scadenza di ${n}`);
    }
    form_add.reset();
});

btn_test.addEventListener('click', () => {
    inviaMessaggioAlSW("Test Notifica", "Il sistema Magna Magna è pronto! 🚀");
});

// AVVIO
caricaDati();
aggiornaInterfaccia();
window.addEventListener('load', () => {
    // Piccolo delay per permettere al SW di stabilizzarsi
    setTimeout(checkScadenzeAllAvvio, 2000);
});
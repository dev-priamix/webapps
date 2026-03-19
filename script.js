const form_add = document.getElementById('aggiungi_cibo');
const btn_test = document.getElementById('test_notifica');
const btn_clear_all = document.getElementById('elimina_tutto');
const btn_restore = document.getElementById('ripristina_backup');
const listaDiv = document.getElementById('lista');

let cibo = [];
let backupArray = [];

// 1. SERVICE WORKER & NOTIFICHE
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => console.log("SW registrato"));
}

async function inviaNotifica(titolo, messaggio) {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        reg.active.postMessage({ action: 'SEND_PUSH', titleText: titolo, bodyText: messaggio });
    }
}

// 2. SALVATAGGIO E CARICAMENTO
function salvaDati() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
    localStorage.setItem('backup_cestino', JSON.stringify(backupArray));
}

function caricaDati() {
    const datiCibo = localStorage.getItem('cibo');
    const datiBackup = localStorage.getItem('backup_cestino');
    
    if (datiCibo) cibo = JSON.parse(datiCibo);
    if (datiBackup) backupArray = JSON.parse(datiBackup);
    
    puliSciCestinoVecchio();
    aggiornaInterfaccia();
}

// 3. LOGICA CESTINO (Reset 7 giorni)
function puliSciCestinoVecchio() {
    const ora = new Date().getTime();
    const setteGiorni = 7 * 24 * 60 * 60 * 1000;
    backupArray = backupArray.filter(item => (ora - item.dataEliminazione) < setteGiorni);
    salvaDati();
}

// 4. FUNZIONE DI CONTROLLO SCADENZE (Nuova!)
function controllaScadenze(nomeCibo, dataScadenzaStr) {
    const oggi = new Date();
    oggi.setHours(0,0,0,0);
    const dataScadenza = new Date(dataScadenzaStr);
    dataScadenza.setHours(0,0,0,0);

    const diffTempo = dataScadenza - oggi;
    const diffGiorni = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    if (diffGiorni === 0) {
        inviaNotifica("Scade OGGI!", `Attenzione, consuma subito: ${nomeCibo}`);
    } else if (diffGiorni === 1) {
        inviaNotifica("Scade DOMANI", `Ricordati di: ${nomeCibo}`);
    } else if (diffGiorni === 7) {
        inviaNotifica("Scadenza tra 7 giorni", `Manca una settimana per: ${nomeCibo}`);
    }
}

// 5. RIPRISTINO
btn_restore.addEventListener('click', () => {
    if (backupArray.length === 0) { alert("Il cestino è vuoto!"); return; }
    if (confirm(`Ripristinare ${backupArray.length} elementi?`)) {
        backupArray.forEach(item => {
            const { dataEliminazione, ...ciboOriginale } = item;
            cibo.push([ciboOriginale[0], ciboOriginale[1], ciboOriginale[2]]);
        });
        backupArray = [];
        salvaDati();
        aggiornaInterfaccia();
    }
});

// 6. INTERFACCIA
function aggiornaInterfaccia() {
    let html = "";
    const oggi = new Date(); oggi.setHours(0,0,0,0);
    cibo.sort((a, b) => new Date(a[2]) - new Date(b[2]));

    cibo.forEach((item, index) => {
        const d = new Date(item[2]); d.setHours(0,0,0,0);
        const diff = Math.ceil((d - oggi) / (1000 * 60 * 60 * 24));
        let col = "#ccc";
        if (diff === 0) col="red";
        else if (diff === 1) col="orange";
        else if (diff > 1 && diff <= 7) col="#007bff";
        else if (diff < 0) col="gray";

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; position: relative;
                        border-radius:10px; background:white; border-left:5px solid ${col}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div><b>${item[1]}</b> <small>(${item[0]})</small><br><small>${d.toLocaleDateString()}</small></div>
                <button onclick="eliminaCibo(${index})" style="width:auto; background:#ff4444; color:white; padding:5px 10px; border-radius:5px; position: absolute; right: 10px;">🗑️</button>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray; text-align:center;'>Dispensa vuota.</p>";
}

// 7. EVENTI
window.eliminaCibo = function(index) {
    const itemEliminato = cibo[index];
    backupArray.push({ 0: itemEliminato[0], 1: itemEliminato[1], 2: itemEliminato[2], dataEliminazione: new Date().getTime() });
    cibo.splice(index, 1);
    salvaDati();
    aggiornaInterfaccia();
};

btn_clear_all.addEventListener('click', () => {
    if (confirm("Spostare tutto nel cestino?")) {
        cibo.forEach(item => backupArray.push({ 0: item[0], 1: item[1], 2: item[2], dataEliminazione: new Date().getTime() }));
        cibo = []; salvaDati(); aggiornaInterfaccia();
    }
});

form_add.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const scadenza = document.getElementById('scadenza').value;
    const codice = document.getElementById('codice').value;

    cibo.push([codice, nome, scadenza]);
    
    // NOTIFICA IMMEDIATA SE SCADE OGGI/DOMANI/7GG
    controllaScadenze(nome, scadenza);

    salvaDati();
    aggiornaInterfaccia();
    form_add.reset();
});

btn_test.addEventListener('click', () => inviaNotifica("Test", "Le notifiche funzionano! 🚀"));

// AVVIO
caricaDati();

// CONTROLLO AUTOMATICO ALL'APERTURA (dopo 2 secondi)
window.addEventListener('load', () => {
    setTimeout(() => {
        cibo.forEach(item => {
            controllaScadenze(item[1], item[2]);
        });
    }, 2000);
});
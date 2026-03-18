const form_add = document.getElementById('aggiungi_cibo');
const btn_test = document.getElementById('test_notifica');
const btn_clear_all = document.getElementById('elimina_tutto');
const btn_restore = document.getElementById('ripristina_backup');
const listaDiv = document.getElementById('lista');

let cibo = [];
let backupArray = [];

// 1. SERVICE WORKER & NOTIFICHE
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

async function inviaNotifica(titolo, messaggio) {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        reg.active.postMessage({ action: 'SEND_PUSH', titleText: titolo, bodyText: messaggio });
    }
}

// 2. SALVATAGGIO E CARICAMENTO (Con Cestino/Backup)
function salvaDati() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
    localStorage.setItem('backup_cestino', JSON.stringify(backupArray));
}

function caricaDati() {
    const datiCibo = localStorage.getItem('cibo');
    const datiBackup = localStorage.getItem('backup_cestino');
    
    if (datiCibo) cibo = JSON.parse(datiCibo);
    if (datiBackup) backupArray = JSON.parse(datiBackup);
    
    pulisciCestinoVecchio(); // Svuota il cestino se sono passati 7 giorni
    aggiornaInterfaccia();
}

// 3. LOGICA CESTINO (Reset ogni 7 giorni)
function pulisciCestinoVecchio() {
    const ora = new Date().getTime();
    const setteGiorni = 7 * 24 * 60 * 60 * 1000;

    // Filtriamo il backup: teniamo solo gli item eliminati da meno di 7 giorni
    backupArray = backupArray.filter(item => {
        return (ora - item.dataEliminazione) < setteGiorni;
    });
    salvaDati();
}

// 4. RIPRISTINO
btn_restore.addEventListener('click', () => {
    if (backupArray.length === 0) {
        alert("Il cestino è vuoto!");
        return;
    }

    if (confirm(`Vuoi ripristinare ${backupArray.length} elementi eliminati negli ultimi 7 giorni?`)) {
        // Riportiamo gli oggetti dal backup alla lista principale
        backupArray.forEach(item => {
            // Rimuoviamo la proprietà dataEliminazione prima di rimetterlo in cibo
            const { dataEliminazione, ...ciboOriginale } = item;
            cibo.push([ciboOriginale[0], ciboOriginale[1], ciboOriginale[2]]);
        });

        backupArray = []; // Svuotiamo il cestino dopo il ripristino
        salvaDati();
        aggiornaInterfaccia();
        alert("Dati ripristinati con successo!");
    }
});

// 5. INTERFACCIA
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
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; 
                        border-radius:10px; background:white; border-left:5px solid ${col}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div>
                    <b>${item[1]}</b> <small>(${item[0]})</small><br>
                    <small>${d.toLocaleDateString()}</small>
                </div>
                <button onclick="eliminaCibo(${index})" style="width:auto; background:#ff4444; color:white; padding:5px 10px; border-radius:5px;">🗑️</button>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray; text-align:center;'>Dispensa vuota.</p>";
}

// 6. ELIMINAZIONE (Sposta nel backup invece di cancellare)
window.eliminaCibo = function(index) {
    const itemEliminato = cibo[index];
    
    // Aggiungiamo la data di eliminazione per il controllo dei 7 giorni
    const backupItem = {
        0: itemEliminato[0],
        1: itemEliminato[1],
        2: itemEliminato[2],
        dataEliminazione: new Date().getTime()
    };

    backupArray.push(backupItem); // Sposta nel cestino
    cibo.splice(index, 1); // Rimuovi dalla lista principale
    
    salvaDati();
    aggiornaInterfaccia();
};

btn_clear_all.addEventListener('click', () => {
    if (confirm("Spostare tutto nel cestino?")) {
        cibo.forEach(item => {
            backupArray.push({ ...item, dataEliminazione: new Date().getTime() });
        });
        cibo = [];
        salvaDati();
        aggiornaInterfaccia();
    }
});

form_add.addEventListener('submit', (e) => {
    e.preventDefault();
    cibo.push([document.getElementById('codice').value, document.getElementById('nome').value, document.getElementById('scadenza').value]);
    salvaDati();
    aggiornaInterfaccia();
    form_add.reset();
});

btn_test.addEventListener('click', () => inviaNotifica("Test", "Funziona! 🚀"));

// AVVIO
caricaDati();
let form_add = document.getElementById('aggiungi_cibo');
let cibo = [];
let scadenzeOggi = [];

// Registrazione Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log("Service Worker registrato!"))
    .catch(err => console.log("Errore SW:", err));
}

function aggiornaInterfaccia() {
    const lista = document.getElementById('lista');
    let html = "";
    scadenzeOggi = [];
    const today = new Date().toLocaleDateString();

    cibo.forEach(item => {
        const dataItem = new Date(item[2]).toLocaleDateString();
        if (dataItem === today) {
            scadenzeOggi.push(item[1]);
        }
        html += `<b>${item[1]}</b> - ${dataItem}<hr>`;
    });
    lista.innerHTML = html || "Lista vuota.";
}

async function inviaNotifica() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && scadenzeOggi.length > 0) {
        const reg = await navigator.serviceWorker.ready;
        reg.active.postMessage({ 
            action: 'SEND_PUSH',
            bodyText: "Scadono oggi: " + scadenzeOggi.join(", "),
            titleText: "Magna Magna"
        });
    }
}

form_add.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = document.getElementById('nome').value;
    const s = document.getElementById('scadenza').value;
    const c = document.getElementById('codice').value;

    cibo.push([c, n, new Date(s)]);
    localStorage.setItem('cibo', JSON.stringify(cibo));
    
    aggiornaInterfaccia();
    inviaNotifica();
    form_add.reset();
});

// Carica dati esistenti
const datiSalvati = localStorage.getItem('cibo');
if (datiSalvati) {
    cibo = JSON.parse(datiSalvati).map(i => [i[0], i[1], new Date(i[2])]);
    aggiornaInterfaccia();
}
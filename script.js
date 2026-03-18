let form_add = document.getElementById('aggiungi_cibo');
let scadenzaInput = form_add.querySelector('#scadenza');
let nomeInput = form_add.querySelector('#nome');
let codiceInput = form_add.querySelector('#codice');
let submitInput = form_add.querySelector('#invia');

let cibo = [];

let lista = document.getElementById('lista');

form_add.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // 1. Aggiungi il nuovo elemento
    cibo.push([codiceInput.value, nomeInput.value, new Date(scadenzaInput.value)]);
    
    // 2. Aggiorna i dati e salva nel localStorage
    aggiornaScadenze();
    aggiornaLista();
    salvaCibo();

    // 3. Manda la notifica automatica con quello che scade OGGI
    invioAutomaticoNotifica();
    
    // Opzionale: pulisci il form dopo l'invio
    form_add.reset();
});


function aggiornaLista() {
    let stringa_scadenze = "";
    cibo.forEach(element => {
        stringa_scadenze += `${element[0]} <br> 
        ${element[1]} - ${element[2].toLocaleDateString()}<br> <hr> <br>`;
    });
    lista.innerHTML = `<p>${stringa_scadenze}</p>`;
}

let scadenze = [];

function aggiornaScadenze() {
    scadenze = [];
    const today = new Date();
    cibo.forEach(e => {
        if (
            e[2].getDate() === today.getDate() &&
            e[2].getMonth() === today.getMonth() &&
            e[2].getFullYear() === today.getFullYear()
        ) {
            scadenze.push(e[0]);
        }
    });

    if (scadenze.length > 0) {
        let stringa_scadenze = scadenze.join(", ");
        console.log('Scadenza oggi:', stringa_scadenze);
    }
}

window.addEventListener("load", function() {
    aggiornaScadenze();
    aggiornaLista();
});



// Salva l'array cibo su localStorage come JSON
function salvaCibo() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
}

// Carica l'array cibo da localStorage
function caricaCibo() {
    const dati = localStorage.getItem('cibo');
    if (dati) {
        // Mapping per ricostruire le date
        cibo = JSON.parse(dati).map(item => [
            item[0],
            item[1],
            new Date(item[2])
        ]);
    }
}

// Carica i dati all'avvio
caricaCibo();
console.log(cibo);
aggiornaLista();
aggiornaScadenze();

// Salva i dati ogni volta che si aggiunge un elemento
form_add.addEventListener('submit', function() {
    salvaCibo();
});





// notifiche

// Registrazione SW
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Registrato"));
}

async function pushNotification() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert("Permesso negato!");
        return;
    }
    // Eseguiamo la prima notifica subito
    triggerSwNotification(scadenze.join(", "));
}

function triggerSwNotification(messaggio = "Notifica generica") {
    const messaggioDinamico = `${messaggio} -> inviata alle ${new Date().toLocaleTimeString()}`;
    navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
            reg.active.postMessage({ 
                action: 'SEND_PUSH',
                bodyText: messaggioDinamico,
                titleText: "Allarme scadenza"
            });
        }
    });
}

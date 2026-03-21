import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyAyhR6Ec61n2IZ_d1CkYI1vjEFdwaFQ98Q",
    authDomain: "magnamagna-d6430.firebaseapp.com",
    projectId: "magnamagna-d6430",
    storageBucket: "magnamagna-d6430.firebasestorage.app",
    messagingSenderId: "837560857745",
    appId: "1:837560857745:web:41208095564a51a4423b30"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// REGISTRAZIONE SERVICE WORKERS (Percorsi ottimizzati per GitHub)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log("SW Locale attivo", reg.scope))
            .catch(err => console.error("Errore SW Locale:", err));

        navigator.serviceWorker.register('./firebase-messaging-sw.js')
            .then(reg => console.log("SW Firebase attivo", reg.scope))
            .catch(err => console.error("Errore SW Firebase:", err));
    });
}

async function richiediToken() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Tua VAPID Key corretta
            const token = await getToken(messaging, { 
                vapidKey: 'BNqiQXc_uId6OtXnfKYnkqdh6zshU960OoEyIfnKy8NPRc9DGnD2YExsNHLx15nOs9z7qasKr6G_E1L9k3olWPc' 
            });
            if (token) {
                console.log("Token generato correttamente:", token);
                localStorage.setItem('fcm_token', token);
            } else {
                console.warn("Nessun token generato. Controlla i permessi.");
            }
        }
    } catch (err) { 
        console.error("Errore durante il recupero del Token:", err); 
    }
}

// LOGICA APP (LISTA CIBI)
const form_add = document.getElementById('aggiungi_cibo');
const btn_test = document.getElementById('test_notifica');
const btn_clear_all = document.getElementById('elimina_tutto');
const btn_restore = document.getElementById('ripristina_backup');
const listaDiv = document.getElementById('lista');

let cibo = [];
let backupArray = [];

function salvaDati() {
    localStorage.setItem('cibo', JSON.stringify(cibo));
    localStorage.setItem('backup_cestino', JSON.stringify(backupArray));
}

function caricaDati() {
    cibo = JSON.parse(localStorage.getItem('cibo')) || [];
    backupArray = JSON.parse(localStorage.getItem('backup_cestino')) || [];
    const ora = new Date().getTime();
    backupArray = backupArray.filter(item => (ora - item.dataEliminazione) < 604800000); // 7 giorni
    salvaDati();
    aggiornaInterfaccia();
}

function aggiornaInterfaccia() {
    let html = "";
    const oggi = new Date(); oggi.setHours(0,0,0,0);
    cibo.sort((a, b) => new Date(a[2]) - new Date(b[2]));
    
    cibo.forEach((item, index) => {
        const d = new Date(item[2]);
        const diff = Math.ceil((d - oggi) / 86400000);
        let col = diff <= 0 ? "red" : diff <= 1 ? "orange" : diff <= 7 ? "#007bff" : "#ccc";
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:8px; border-radius:10px; background:white; border-left:5px solid ${col}; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div><b>${item[1]}</b><br><small>${d.toLocaleDateString()}</small></div>
                <button onclick="eliminaCibo(${index})" style="width:auto; background:#ff4444; color:white; padding:5px 10px; border-radius:5px; border:none;">🗑️</button>
            </div>`;
    });
    listaDiv.innerHTML = html || "<p style='color:gray; padding:10px;'>Dispensa vuota.</p>";
}

window.eliminaCibo = (index) => {
    const item = cibo[index];
    backupArray.push({0: item[0], 1: item[1], 2: item[2], dataEliminazione: new Date().getTime()});
    cibo.splice(index, 1);
    salvaDati(); aggiornaInterfaccia();
};

btn_restore.onclick = () => {
    if (backupArray.length === 0) return alert("Cestino vuoto!");
    backupArray.forEach(i => cibo.push([i[0], i[1], i[2]]));
    backupArray = [];
    salvaDati(); aggiornaInterfaccia();
};

btn_clear_all.onclick = () => {
    if (confirm("Svuotare tutto?")) {
        cibo.forEach(i => backupArray.push({0: i[0], 1: i[1], 2: i[2], dataEliminazione: new Date().getTime()}));
        cibo = []; salvaDati(); aggiornaInterfaccia();
    }
};

form_add.onsubmit = (e) => {
    e.preventDefault();
    cibo.push([document.getElementById('codice').value, document.getElementById('nome').value, document.getElementById('scadenza').value]);
    salvaDati(); aggiornaInterfaccia();
    form_add.reset();
};

btn_test.onclick = async () => {
    const reg = await navigator.serviceWorker.ready;
    reg.active.postMessage({ action: 'SEND_PUSH', titleText: "Test MagnaMagna", bodyText: "Funziona alla grande! 🚀" });
};

caricaDati();
richiediToken();
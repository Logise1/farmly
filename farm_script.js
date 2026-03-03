import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- SISTEMA DE SONIDOS ZzFX ---
let zzfxX = new (window.AudioContext || window.webkitAudioContext)();
let zzfxV = 0.3;
let zzfx = (...t) => {
    let e = zzfxX.createOscillator(), n = zzfxX.createGain(), r = t[0] || 1, i = t[1] || .05, a = t[2] || 220, o = t[3] || 0, s = t[4] || 0, c = t[5] || .1, l = t[6] || 0, u = t[7] || 1, d = t[8] || 0, f = t[9] || 0, p = t[10] || 0, h = t[11] || 0, v = t[12] || 0, y = t[13] || 0, m = t[14] || 0, x = t[15] || 0, g = t[16] || 0, b = t[17] || 1, w = t[18] || 0, A = t[19] || 0, B = zzfxX.currentTime, C = B + i, D = C + o, E = D + s, F = E + c, G = n.gain;
    e.type = "sine"; e.connect(n); n.connect(zzfxX.destination); e.start(B); e.stop(F);
    G.setValueAtTime(0, B); G.linearRampToValueAtTime(r * zzfxV, C); G.linearRampToValueAtTime(r * zzfxV, D); G.exponentialRampToValueAtTime(.00001, F);
    e.frequency.setValueAtTime(a, B);
    l > 0 ? e.frequency.exponentialRampToValueAtTime(a * Math.pow(2, l), C) : l < 0 && e.frequency.exponentialRampToValueAtTime(a * Math.pow(2, l), C);
    return e;
};

const sfx = {
    click: [1, , 300, .01, .01, .01, 1, 1.1, , , , , , .1],
    plant: [1.2, , 200, .01, .06, .07, 1, 1.1, , , , , , .9, , .03],
    harvest: [2, , 500, .03, .05, .2, 1, 1.5, , , , , , .1],
    buy: [1.5, , 800, .01, .05, .15, 1, 1.8, , , , -100, .1, , .1],
    sell: [1.5, , 600, .01, .05, .15, 1, 1.8, , , , -100, .1, , .1],
    error: [1.5, , 150, .04, .1, .2, 3, 2, , , , , , .1, , .5],
    levelup: [2, , 400, .1, .2, .5, 1, 1.5, , , , -200, .1, , .1]
};
window.playSound = function (type) { if (zzfxX.state === 'suspended') zzfxX.resume(); if (sfx[type]) zzfx(...sfx[type]); }

// --- CONFIG FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCB_RiTV17ouLpPylMQs1kW_ayDqYoZKUE", authDomain: "jumper-4e0b2.firebaseapp.com",
    projectId: "jumper-4e0b2", storageBucket: "jumper-4e0b2.firebasestorage.app",
    messagingSenderId: "397169417542", appId: "1:397169417542:web:305312904eeadcd579d947", measurementId: "G-BBBHJ2T8XL"
};
const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);
const APP_ID = "super-granja-multi";

// --- 60 CULTIVOS PROGRAMÁTICOS (Nvl 1 al 60) ---
const cropDefs = [
    { n: "Trigo", i: "🌾" }, { n: "Zanahoria", i: "🥕" }, { n: "Tomate", i: "🍅" }, { n: "Cebolla", i: "🧅" }, { n: "Patata", i: "🥔" },
    { n: "Girasol", i: "🌻" }, { n: "Fresa", i: "🍓" }, { n: "Sandía", i: "🍉" }, { n: "Manzana", i: "🍎" }, { n: "Pera", i: "🍐" },
    { n: "Naranja", i: "🍊" }, { n: "Limón", i: "🍋" }, { n: "Plátano", i: "🍌" }, { n: "Uva", i: "🍇" }, { n: "Cereza", i: "🍒" },
    { n: "Melocotón", i: "🍑" }, { n: "Piña", i: "🍍" }, { n: "Kiwi", i: "🥝" }, { n: "Melón", i: "🍈" }, { n: "Coco", i: "🥥" },
    { n: "Aguacate", i: "🥑" }, { n: "Berenjena", i: "🍆" }, { n: "Pimiento", i: "🫑" }, { n: "Pepino", i: "🥒" }, { n: "Lechuga", i: "🥬" },
    { n: "Brócoli", i: "🥦" }, { n: "Ajo", i: "🧄" }, { n: "Maíz", i: "🌽" }, { n: "Calabaza", i: "🎃" }, { n: "Champiñón", i: "🍄" },
    { n: "Cacahuete", i: "🥜" }, { n: "Castaña", i: "🌰" }, { n: "Mango", i: "🥭" }, { n: "Arándano", i: "🫐" }, { n: "Aceituna", i: "🫒" },
    { n: "Frambuesa", i: "🔴" }, { n: "Mora", i: "⚫" }, { n: "Ciruela", i: "🟣" }, { n: "Higo", i: "🟤" }, { n: "Papaya", i: "🟠" },
    { n: "Granada", i: "🩸" }, { n: "Mandarina", i: "🍊" }, { n: "Pomelo", i: "🍊" }, { n: "Lima", i: "🍋" }, { n: "Maracuyá", i: "🥭" },
    { n: "Guayaba", i: "🍈" }, { n: "Lichi", i: "🥝" }, { n: "Caqui", i: "🍅" }, { n: "Níspero", i: "🟠" }, { n: "Guanábana", i: "🍈" },
    { n: "Tamarindo", i: "🟤" }, { n: "Pitaya", i: "🟣" }, { n: "Carambola", i: "🟡" }, { n: "Chirimoya", i: "🟢" }, { n: "Zapote", i: "🟤" },
    { n: "Mamey", i: "🟤" }, { n: "Lúcuma", i: "🟠" }, { n: "Nuez", i: "🌰" }, { n: "Almendra", i: "🥜" }, { n: "Pistacho", i: "🟢" }
];

const BASE_CROPS = {};
const CROP_KEYS_ORDER = []; // Para iterar en orden en el catálogo
cropDefs.forEach((c, idx) => {
    const level = idx + 1;
    const key = c.n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita tildes
    // Curva de escalado progresiva suave
    const scale = Math.pow(1.12, idx);
    BASE_CROPS[key] = {
        name: c.n, icon: c.i, minLvl: level,
        baseTime: Math.floor(10000 * Math.pow(1.08, idx)), // de 10s hasta unas horas
        baseCost: Math.max(5, Math.floor(10 * scale)),
        baseSell: Math.max(8, Math.floor(18 * scale)),
        baseXP: Math.max(5, Math.floor(12 * scale))
    };
    CROP_KEYS_ORDER.push(key);
});

const RARITIES = {
    comun: { name: 'Común', mult: 1, stock: 10, weight: 60 },
    raro: { name: 'Raro', mult: 2, stock: 5, weight: 25 },
    epico: { name: 'Épico', mult: 5, stock: 3, weight: 10 },
    mitico: { name: 'Mítico', mult: 10, stock: 2, weight: 4 },
    legendario: { name: 'Legendario', mult: 25, stock: 1, weight: 1 },
    colosal: { name: 'Colosal', mult: 180, stock: 1, weight: 0 },
    titanico: { name: 'Titánico', mult: 360, stock: 1, weight: 0 },
    ancestral: { name: 'Ancestral', mult: 1440, stock: 1, weight: 0 },
    divino: { name: 'Divino', mult: 8640, stock: 1, weight: 0 }
};

const BASE_TOOLS = {
    fert_peq: { name: 'Fertilizante Peq.', desc: '-15 Min', icon: '🧪', timeReduc: 15 * 60 * 1000, cost: 150, minLvl: 1, css: 'bg-green-100 text-green-600' },
    fert_med: { name: 'Fertilizante Med.', desc: '-1 Hora', icon: '🧪', timeReduc: 60 * 60 * 1000, cost: 500, minLvl: 5, css: 'bg-teal-100 text-teal-600' },
    regadera: { name: 'Regadera Oro', desc: '-4 Horas', icon: '🚿', timeReduc: 4 * 60 * 60 * 1000, cost: 2000, minLvl: 10, css: 'bg-yellow-100 text-yellow-600' },
    reloj: { name: 'Reloj Mágico', desc: '-12 Horas', icon: '⏳', timeReduc: 12 * 60 * 60 * 1000, cost: 8000, minLvl: 20, css: 'bg-purple-100 text-purple-600' },
    polvo: { name: 'Polvo Hada', desc: 'Instantáneo', icon: '✨', timeReduc: 999 * 60 * 60 * 1000, cost: 25000, minLvl: 30, css: 'bg-pink-100 text-pink-600' }
};

const SHOP_CYCLE_MS = 5 * 60 * 1000;
const TOOLS_CYCLE_MS = 60 * 60 * 1000;

const UPGRADES_DEF = {
    speed: { id: 'speed', name: 'Riego Veloz', desc: '-5% de tiempo de crecimiento por nivel', icon: '💧', baseCost: 1000, mult: 1.5, maxLvl: 10, css: 'text-blue-500 bg-blue-100' },
    yield: { id: 'yield', name: 'Tierra Fértil', desc: '+10% prob. de doble cultivo al cosechar', icon: '✨', baseCost: 1500, mult: 1.6, maxLvl: 10, css: 'text-green-500 bg-green-100' },
    price: { id: 'price', name: 'Negociante', desc: '+5% monedas extra al vender', icon: '💰', baseCost: 2000, mult: 1.8, maxLvl: 10, css: 'text-yellow-500 bg-yellow-100' }
};

const WEATHER_TYPES = [
    { id: 'sunny', name: 'Día Soleado', desc: 'Día perfecto.', icon: '☀️', speedMod: 1, priceMod: 1, css: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
    { id: 'rainy', name: 'Tormenta', desc: 'Crecen un 15% más rápido.', icon: '🌧️', speedMod: 0.85, priceMod: 1, css: 'text-blue-600 bg-blue-100 border-blue-200' },
    { id: 'drought', name: 'Sequía', desc: 'Ventas +15%, pero crecen lento.', icon: '🏜️', speedMod: 1.2, priceMod: 1.15, css: 'text-orange-600 bg-orange-100 border-orange-200' },
    { id: 'magic', name: 'Lluvia Estelar', desc: 'Todo crece al doble de vel.', icon: '✨', speedMod: 0.5, priceMod: 1, css: 'text-purple-600 bg-purple-100 border-purple-200' }
];

function getCurrentWeather() {
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    return WEATHER_TYPES[Math.floor(seededRandom(daySeed) * WEATHER_TYPES.length)];
}

const QUESTS_DEF = [
    { id: 'harvest_trigo', title: 'Cosecha 5 Trigos', req: 5, xp: 100, coins: 50, icon: '🌾', check: (type, k) => type === 'harvest' && k.includes('trigo') },
    { id: 'plant_10', title: 'Planta 10 semillas', req: 10, xp: 150, coins: 100, icon: '🌱', check: (type) => type === 'plant' },
    { id: 'sell_20', title: 'Vende 20 cultivos', req: 20, xp: 200, coins: 150, icon: '💰', check: (type) => type === 'sell' },
    { id: 'use_tool', title: 'Usa 3 herramientas', req: 3, xp: 50, coins: 50, icon: '🧪', check: (type) => type === 'tool' },
    { id: 'harvest_mitico', title: 'Cosecha 1 Mítico/Leyenda', req: 1, xp: 500, coins: 300, icon: '✨', check: (type, k) => type === 'harvest' && (k.includes('mitico') || k.includes('legendario')) }
];

function getDailyQuests() {
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const qs = [];
    for (let i = 0; i < 3; i++) {
        let qIdx = Math.floor(seededRandom(daySeed + i * 10) * QUESTS_DEF.length);
        qs.push({ ...QUESTS_DEF[qIdx], uniqueId: `${daySeed}_${i}` });
    }
    return qs;
}

function processQuest(type, key) {
    const qs = getDailyQuests();
    let updated = false;
    qs.forEach(q => {
        if (q.check(type, key)) {
            const curAmt = state.questProgress[q.uniqueId] || 0;
            if (curAmt < q.req) {
                state.questProgress[q.uniqueId] = curAmt + 1;
                updated = true;
                if (curAmt + 1 >= q.req) showNotification(`Misión Completada: ${q.title}! (+${q.coins}🪙)`, false);
            }
        }
    });
    if (updated) { saveState(); renderQuests(); }
}

// ESTADO GLOBAL
let currentUser = null, username = "Player";
let state = { coins: 100, level: 1, xp: 0, inventory: { 'seed_trigo_comun': 4 }, tools: {}, plots: Array(16).fill(null).map((_, i) => ({ id: i, seedItem: null, plantedAt: null })), animals: [], questProgress: {}, shopPurchases: {}, toolsPurchases: {}, longPurchases: {}, upgrades: { speed: 0, yield: 0, price: 0 } };
let saveDocRef = null;
let currentCycleId = 0, currentToolsCycleId = 0, currentLongCycleId = 0, globalShopItems = [], globalToolsItems = [], globalLongItems = [], selectedPlot = null;
const LONG_CYCLE_MS = 12 * 60 * 60 * 1000;

let pendingLevelUps = [];
let currentEventActive = false;

function formatEventTime(ms) {
    if (ms <= 0) return "00:00:00";
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatTimeRemaining(ms) {
    if (ms <= 0) return "0s";
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`; if (m > 0) return `${m}m ${s % 60}s`; return `${s}s`;
}

function generateItemData(fullId) {
    const parts = fullId.split('_'); const type = parts[0], baseId = parts[1], rarityId = parts[2];
    const base = BASE_CROPS[baseId], rarity = RARITIES[rarityId];
    if (!base || !rarity) return null;

    let finalTime = base.baseTime * rarity.mult;
    let finalSell = base.baseSell * rarity.mult;

    if (state && state.upgrades) {
        if (state.upgrades.speed > 0) finalTime = finalTime * (1 - (state.upgrades.speed * 0.05));
        if (state.upgrades.price > 0 && type === 'crop') finalSell = finalSell * (1 + (state.upgrades.price * 0.05));
    }

    const weather = getCurrentWeather();
    finalTime *= weather.speedMod;
    if (currentEventActive) finalTime = Math.max(1000, Math.floor(finalTime / 10)); // 10 veces más rápido ⚡
    if (type === 'crop') finalSell *= weather.priceMod;

    return {
        id: fullId, type, baseId, rarityId, name: `${type === 'seed' ? 'Semilla' : 'Cosecha'} ${base.name}`,
        icon: base.icon, time: finalTime, cost: base.baseCost * rarity.mult,
        sell: Math.floor(finalSell), xp: base.baseXP * rarity.mult, cssClass: `rarity-${rarityId}`,
        maxStock: rarity.stock, minLvl: base.minLvl
    };
}

function seededRandom(seed) { let x = Math.sin(seed++) * 10000; return x - Math.floor(x); }

function generateGlobalShop() {
    const cycleId = Math.floor(Date.now() / SHOP_CYCLE_MS);
    if (currentCycleId !== cycleId) {
        currentCycleId = cycleId; globalShopItems = [];
        const validBases = CROP_KEYS_ORDER.filter(k => BASE_CROPS[k].minLvl <= state.level);
        for (let i = 0; i < 6; i++) {
            let rand1 = seededRandom(cycleId * 10 + i + state.level * 100);
            let rand2 = seededRandom(cycleId * 20 + i + state.level * 100);
            let baseId = validBases[Math.floor(rand1 * validBases.length)];
            let sum = 0; for (let r in RARITIES) sum += RARITIES[r].weight;
            let rarRand = rand2 * sum; let rarityId = 'comun';
            for (let r in RARITIES) { if (rarRand < RARITIES[r].weight) { rarityId = r; break; } rarRand -= RARITIES[r].weight; }
            globalShopItems.push(generateItemData(`seed_${baseId}_${rarityId}`));
        }
        if (state.shopPurchases && state.shopPurchases[cycleId - 2]) delete state.shopPurchases[cycleId - 2];
        if (!state.shopPurchases) state.shopPurchases = {}; if (!state.shopPurchases[cycleId]) state.shopPurchases[cycleId] = {};
    }
}

function generateToolsShop() {
    const toolsCycleId = Math.floor(Date.now() / TOOLS_CYCLE_MS);
    if (currentToolsCycleId !== toolsCycleId) {
        currentToolsCycleId = toolsCycleId; globalToolsItems = [];
        const validTools = Object.keys(BASE_TOOLS).filter(k => BASE_TOOLS[k].minLvl <= state.level);
        if (validTools.length > 0) {
            for (let i = 0; i < 3; i++) {
                let r1 = seededRandom(toolsCycleId * 5 + i + state.level * 50); let r2 = seededRandom(toolsCycleId * 15 + i + state.level * 50);
                let toolId = validTools[Math.floor(r1 * validTools.length)];
                globalToolsItems.push({ id: toolId, ...BASE_TOOLS[toolId], maxStock: r2 > 0.3 ? 1 : 0 });
            }
        }
        if (state.toolsPurchases && state.toolsPurchases[toolsCycleId - 2]) delete state.toolsPurchases[toolsCycleId - 2];
        if (!state.toolsPurchases) state.toolsPurchases = {}; if (!state.toolsPurchases[toolsCycleId]) state.toolsPurchases[toolsCycleId] = {};
    }
}

function generateLongShop() {
    const longCycleId = Math.floor(Date.now() / LONG_CYCLE_MS);
    if (currentLongCycleId !== longCycleId) {
        currentLongCycleId = longCycleId; globalLongItems = [];
        const validBases = CROP_KEYS_ORDER.filter(k => BASE_CROPS[k].minLvl <= state.level + 2);
        if (validBases.length > 0) {
            for (let i = 0; i < 10; i++) {
                let rand1 = seededRandom(longCycleId * 30 + i + state.level * 10);
                let rand2 = seededRandom(longCycleId * 40 + i + state.level * 10);
                let baseId = validBases[Math.floor(rand1 * validBases.length)];
                let rars = ['colosal', 'titanico', 'ancestral', 'divino'];
                let rarityId = rars[Math.floor(rand2 * rars.length)];
                globalLongItems.push(generateItemData(`seed_${baseId}_${rarityId}`));
            }
        }
        if (state.longPurchases && state.longPurchases[longCycleId - 2]) delete state.longPurchases[longCycleId - 2];
        if (!state.longPurchases) state.longPurchases = {}; if (!state.longPurchases[longCycleId]) state.longPurchases[longCycleId] = {};
    }
}

window.handleLogin = async function () {
    playSound('click');
    const userIn = document.getElementById('auth-user').value.trim(); const passIn = document.getElementById('auth-pass').value.trim();
    if (!userIn || !passIn || userIn.length < 3) return showNotification("Usuario min 3 chars", true);
    document.getElementById('btn-login').innerText = "Conectando...";
    try {
        try { await signInWithEmailAndPassword(auth, `${userIn.toLowerCase()}@minigranja.com`, passIn); }
        catch (e) { if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') await createUserWithEmailAndPassword(auth, `${userIn.toLowerCase()}@minigranja.com`, passIn); else throw e; }
    } catch (err) {
        playSound('error');
        let msg = "Error";
        if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta";
        else if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres";
        else if (err.code === 'auth/invalid-credential') msg = "Credenciales incorrectas";
        else if (err.code === 'auth/email-already-in-use') msg = "El usuario ya existe";
        else msg = err.message || "Error al conectar";
        showNotification(msg, true);
        document.getElementById('btn-login').innerText = "Jugar";
    }
};

window.logout = function () { playSound('click'); signOut(auth); };

onAuthStateChanged(auth, async (user) => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('hidden');
    if (user) {
        currentUser = user; username = user.email.split('@')[0];
        document.getElementById('login-screen').classList.add('hidden'); document.getElementById('app-screen').classList.remove('hidden'); document.getElementById('app-screen').classList.add('flex');
        document.getElementById('player-name-display').innerText = username;
        if (zzfxX.state === 'suspended') zzfxX.resume();
        saveDocRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'saveData', 'v3');
        await loadState(); startGameLoop();
        setupTradesListeners();
    } else {
        currentUser = null; document.getElementById('login-screen').classList.remove('hidden'); document.getElementById('app-screen').classList.add('hidden'); document.getElementById('app-screen').classList.remove('flex');
    }
});

async function loadState() {
    const snap = await getDoc(saveDocRef);
    if (snap.exists()) {
        const d = snap.data();
        state.coins = d.coins ?? state.coins; state.level = d.level ?? state.level; state.xp = d.xp ?? state.xp;
        state.inventory = d.inventory ?? state.inventory; state.tools = d.tools ?? {}; state.plots = d.plots ?? state.plots;
        state.animals = d.animals ?? []; state.questProgress = d.questProgress ?? {};
        state.shopPurchases = d.shopPurchases ?? {}; state.toolsPurchases = d.toolsPurchases ?? {}; state.longPurchases = d.longPurchases ?? {};
        state.upgrades = d.upgrades ?? { speed: 0, yield: 0, price: 0 };
    } else { saveState(); }
}
function saveState() {
    if (saveDocRef) setDoc(saveDocRef, state).catch(console.error);
    if (currentUser) setDoc(doc(db, 'artifacts', APP_ID, 'leaderboard', currentUser.uid), { name: username, xp: state.xp, level: state.level, timestamp: Date.now() }, { merge: true }).catch(e => { });
}

function getRequiredXp(lvl) { return lvl * 50 + Math.pow(lvl, 2) * 15; }

function addXp(amount) {
    state.xp += amount; let leveled = false;
    while (state.xp >= getRequiredXp(state.level)) {
        state.xp -= getRequiredXp(state.level); state.level++; leveled = true;
        // Añadir a cola de notificaciones
        const unlockedKey = CROP_KEYS_ORDER.find(k => BASE_CROPS[k].minLvl === state.level);
        if (unlockedKey) pendingLevelUps.push({ lvl: state.level, crop: BASE_CROPS[unlockedKey] });
    }
    if (leveled) {
        saveState(); renderHeader(); renderPlots(); renderShopBuy(); renderShopTools(); renderCatalog();
        processLevelUpQueue();
    }
}

function processLevelUpQueue() {
    if (pendingLevelUps.length === 0) return;
    const data = pendingLevelUps.shift(); // Saca el primero
    playSound('levelup');
    document.getElementById('unlock-lvl-text').innerText = data.lvl;
    document.getElementById('unlock-icon').innerText = data.crop.icon;
    document.getElementById('unlock-name').innerText = data.crop.name;

    document.getElementById('unlock-modal').classList.remove('hidden');
    document.getElementById('unlock-modal').classList.add('flex');
}

window.closeUnlockModal = function () {
    playSound('click');
    document.getElementById('unlock-modal').classList.add('hidden');
    document.getElementById('unlock-modal').classList.remove('flex');
    // Si hay más, mostrar en medio segundo
    if (pendingLevelUps.length > 0) setTimeout(processLevelUpQueue, 500);
}

function startGameLoop() {
    generateGlobalShop(); generateToolsShop(); generateLongShop(); renderAll();
    setInterval(() => { generateGlobalShop(); generateToolsShop(); generateLongShop(); updateTimers(); }, 1000);
}

function updateTimers() {
    const now = Date.now();
    const msLeft = SHOP_CYCLE_MS - (now % SHOP_CYCLE_MS);
    document.getElementById('shop-timer').innerText = `${Math.floor(msLeft / 60000)}:${Math.floor((msLeft % 60000) / 1000).toString().padStart(2, '0')}`;
    if (msLeft > SHOP_CYCLE_MS - 2000) renderShopBuy();

    const msLeftTools = TOOLS_CYCLE_MS - (now % TOOLS_CYCLE_MS);
    document.getElementById('shop-tools-timer').innerText = `${Math.floor(msLeftTools / 3600000).toString().padStart(2, '0')}:${Math.floor((msLeftTools % 3600000) / 60000).toString().padStart(2, '0')}:${Math.floor((msLeftTools % 60000) / 1000).toString().padStart(2, '0')}`;
    if (msLeftTools > TOOLS_CYCLE_MS - 2000) renderShopTools();

    const msLeftLong = LONG_CYCLE_MS - (now % LONG_CYCLE_MS);
    const lh = Math.floor(msLeftLong / 3600000);
    const lm = Math.floor((msLeftLong % 3600000) / 60000);
    const ls = Math.floor((msLeftLong % 60000) / 1000);
    document.getElementById('shop-long-timer').innerText = `${lh.toString().padStart(2, '0')}:${lm.toString().padStart(2, '0')}:${ls.toString().padStart(2, '0')}`;
    if (msLeftLong > LONG_CYCLE_MS - 2000) renderShopLong();

    const EVENT_CYCLE = 60 * 60 * 1000;
    const EVENT_DURATION = 60 * 1000;
    const timeInCycle = now % EVENT_CYCLE;
    const eventTimeLeft = EVENT_CYCLE - timeInCycle;
    const eventLabel = document.getElementById('event-status-label');
    const eventTimer = document.getElementById('event-countdown');
    if (timeInCycle < EVENT_DURATION) {
        currentEventActive = true;
        if (eventLabel) eventLabel.innerText = "¡EVENTO ACTIVO TERMINA EN!";
        if (eventTimer) {
            eventTimer.innerText = formatEventTime(EVENT_DURATION - timeInCycle);
            eventTimer.className = "text-5xl font-black text-red-500 tabular-nums drop-shadow-sm animate-pulse";
        }
    } else {
        currentEventActive = false;
        if (eventLabel) eventLabel.innerText = "Próximo evento en:";
        if (eventTimer) {
            eventTimer.innerText = formatEventTime(eventTimeLeft);
            eventTimer.className = "text-5xl font-black text-gray-800 tabular-nums drop-shadow-sm";
        }
    }

    for (let i = 0; i < getUnlockedPlots(); i++) {
        const plot = state.plots[i];
        if (plot.seedItem && plot.plantedAt) {
            const item = generateItemData(plot.seedItem); if (!item) continue;
            const elapsed = now - plot.plantedAt; const plotEl = document.getElementById(`plot-${i}`);
            if (elapsed >= item.time) { if (plotEl && !plotEl.classList.contains('plot-ready')) renderPlots(); }
            else {
                const remaining = item.time - elapsed; const prog = Math.min(100, (elapsed / item.time) * 100);
                const txt = document.getElementById(`plot-time-${i}`); const bar = document.getElementById(`plot-bar-${i}`);
                if (txt) txt.innerText = formatTimeRemaining(remaining); if (bar) bar.style.width = `${prog}%`;
            }
        }
    }
}

function getUnlockedPlots() { if (state.level >= 15) return 16; if (state.level >= 8) return 12; if (state.level >= 4) return 8; return 4; }

function renderTradesUI() {
    const listIn = document.getElementById('trade-requests-in');
    const listOut = document.getElementById('trade-requests-out');
    listIn.innerHTML = ''; listOut.innerHTML = '';

    tradesIn.filter(t => t.status !== 'completed' && t.status !== 'cancelled').forEach(t => {
        listIn.innerHTML += `<div class="bg-gray-50 border border-gray-100 p-2 rounded-xl flex justify-between items-center shadow-sm">
                    <div><span class="font-bold text-sm text-gray-700">${t.senderName}</span> <span class="text-[10px] text-gray-400">quiere intercambiar</span></div>
                    <div class="flex gap-2">
                        ${t.status === 'pending' ? `<button onclick="acceptTrade('${t.id}')" class="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200"><i class="fa-solid fa-check"></i></button>
                        <button onclick="rejectTrade('${t.id}')" class="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200"><i class="fa-solid fa-xmark"></i></button>` :
                `<button onclick="openLiveTrade('${t.id}')" class="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200">Entrar</button>`}
                    </div>
                </div>`;
    });
    if (listIn.innerHTML === '') listIn.innerHTML = '<span class="text-xs text-gray-400">Sin peticiones.</span>';

    tradesOut.filter(t => t.status !== 'completed' && t.status !== 'cancelled').forEach(t => {
        listOut.innerHTML += `<div class="bg-gray-50 border border-gray-100 p-2 rounded-xl flex justify-between items-center shadow-sm opacity-80">
                    <div><span class="text-[10px] text-gray-400">A:</span> <span class="font-bold text-sm text-gray-700">${t.receiverName}</span> <span class="text-[10px] text-blue-400 font-bold ml-1">${t.status === 'active' ? '¡Activo!' : '(Esperando)'}</span></div>
                    <div class="flex gap-2">
                        ${t.status === 'active' ? `<button onclick="openLiveTrade('${t.id}')" class="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200">Entrar</button>` : ''}
                        <button onclick="rejectTrade('${t.id}')" class="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
    });
    if (listOut.innerHTML === '') listOut.innerHTML = '<span class="text-xs text-gray-400">Nada enviado.</span>';
}

window.changeMainTab = function (tab) {
    playSound('click');
    ['farm', 'shop', 'trade', 'catalog', 'upgrades', 'quests', 'animals', 'leaderboard', 'market', 'events'].forEach(t => {
        const sec = document.getElementById(`section-${t}`);
        if (sec) { sec.classList.add('hidden'); sec.classList.remove('flex'); }
        const btn = document.getElementById(`main-tab-${t}`);
        if (btn) {
            if (t === tab) btn.className = "bg-white p-2 min-w-[64px] rounded-2xl font-bold shadow-[0_5px_15px_rgba(236,72,153,0.15)] text-pink-500 border-2 border-pink-200 transition-all flex-1 text-center transform scale-[1.05]";
            else btn.className = "bg-white/60 p-2 min-w-[64px] rounded-2xl font-bold shadow-[0_4px_10px_rgba(0,0,0,0.03)] text-gray-500 border-2 border-transparent hover:bg-white inset-x-0 transition-all flex-1 text-center relative";
        }
    });
    const activeSec = document.getElementById(`section-${tab}`);
    if (activeSec) { activeSec.classList.remove('hidden'); activeSec.classList.add('flex'); }

    if (tab === 'farm') { renderPlots(); renderInventory(); }
    if (tab === 'shop') { renderShopBuy(); renderShopTools(); renderShopSell(); renderShopLong(); }
    if (tab === 'catalog') { renderCatalog(); }
    if (tab === 'upgrades') { renderUpgrades(); }
    if (tab === 'quests') { renderQuests(); }
    if (tab === 'animals') { renderAnimals(); }
    if (tab === 'leaderboard') { renderLeaderboardInit(); }
    if (tab === 'market') { renderMarketInit(); }
    if (tab === 'trade') { renderTradesUI(); document.getElementById('trade-notif-badge').classList.add('hidden'); }
}

window.switchShopTab = function (subtab) {
    playSound('click');
    ['buy', 'tools', 'sell', 'long'].forEach(t => {
        document.getElementById(`subtab-${t}`).className = subtab === t ? 'tab-active pb-1 text-xs whitespace-nowrap flex flex-col items-center justify-center transition flex-1' : 'tab-inactive pb-1 text-xs whitespace-nowrap flex flex-col items-center justify-center transition flex-1 opacity-70 hover:opacity-100';
        document.getElementById(`shop-${t}-container`).classList.add('hidden');
    });
    document.getElementById(`shop-${subtab}-container`).classList.remove('hidden');
    if (subtab === 'buy') renderShopBuy(); if (subtab === 'tools') renderShopTools(); if (subtab === 'sell') renderShopSell(); if (subtab === 'long') renderShopLong();
}

window.handlePlotClick = function (index) {
    const plot = state.plots[index];
    if (index >= getUnlockedPlots()) { playSound('error'); return showNotification("Sube de nivel para desbloquear", true); }
    if (!plot.seedItem) { playSound('click'); selectedPlot = index; openPlantModal(); }
    else {
        const item = generateItemData(plot.seedItem); if (!item) return;
        const elapsed = Date.now() - plot.plantedAt;
        if (elapsed >= item.time) {
            playSound('harvest');
            let amt = 1;
            if (state.upgrades.yield > 0 && Math.random() < (state.upgrades.yield * 0.1)) { amt = 2; showNotification("¡Cosecha Doble! x2", false); }
            state.inventory[plot.seedItem.replace('seed_', 'crop_')] = (state.inventory[plot.seedItem.replace('seed_', 'crop_')] || 0) + amt;
            addXp(item.xp); if (amt === 1) showNotification(`Cosechaste ${item.name}`);
            processQuest('harvest', plot.seedItem);
            state.plots[index] = { id: index, seedItem: null, plantedAt: null };
            saveState(); renderPlots(); renderInventory();
        } else { playSound('click'); selectedPlot = index; openToolModal(); }
    }
}

window.buySystemItem = function (index) {
    const item = globalShopItems[index]; const bought = (state.shopPurchases[currentCycleId]?.[index] || 0);
    if (bought >= item.maxStock) { playSound('error'); return showNotification("Sin stock", true); }
    if (state.coins < item.cost) { playSound('error'); return showNotification("Monedas insuficientes", true); }
    playSound('buy'); state.coins -= item.cost; state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
    if (!state.shopPurchases[currentCycleId]) state.shopPurchases[currentCycleId] = {}; state.shopPurchases[currentCycleId][index] = bought + 1;
    saveState(); renderHeader(); renderShopBuy(); showNotification(`Compraste ${item.name}`);
}

window.sellItemToSystem = function (fullId) {
    if (!state.inventory[fullId] || state.inventory[fullId] <= 0) return;
    const item = generateItemData(fullId); if (!item) return;
    playSound('sell'); state.inventory[fullId]--; if (state.inventory[fullId] <= 0) delete state.inventory[fullId];
    state.coins += item.sell; processQuest('sell', fullId); saveState(); renderHeader(); renderShopSell(); renderInventory(); showNotification(`Vendiste ${item.name} (+${item.sell}🪙)`);
}

function renderAll() {
    renderHeader(); renderPlots(); renderInventory(); renderShopBuy(); renderShopTools(); renderShopSell();
    renderShopLong(); renderCatalog(); renderUpgrades(); renderQuests(); renderWeather(); renderAnimals(); renderLeaderboardInit(); renderMarketInit();
}

function renderWeather() {
    const w = getCurrentWeather();
    const banner = document.getElementById('weather-banner');
    if (banner) {
        banner.innerHTML = `<i class="fa-solid fa-cloud-sun mr-1"></i>${w.icon} ${w.name}: ${w.desc}`;
        banner.className = `text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg text-center border-2 mt-1 shadow-sm ${w.css}`;
        banner.classList.remove('hidden');
    }
}

function renderHeader() {
    document.getElementById('coins-display').innerText = state.coins; document.getElementById('level-display').innerText = state.level;
    const req = getRequiredXp(state.level); document.getElementById('xp-bar').style.width = `${Math.min(100, (state.xp / req) * 100)}%`;
    document.getElementById('xp-text').innerText = `${state.xp}/${req} XP`;
}

function renderPlots() {
    const grid = document.getElementById('farm-grid'); grid.innerHTML = '';
    const unlocked = getUnlockedPlots(); const now = Date.now();
    for (let i = 0; i < 16; i++) {
        const el = document.createElement('div'); el.id = `plot-${i}`;
        if (i >= unlocked) { el.className = "rounded-xl flex items-center justify-center bg-gray-200 opacity-50 border-4 border-dashed border-gray-300"; el.innerHTML = `<i class="fa-solid fa-lock text-gray-400"></i>`; }
        else {
            const plot = state.plots[i];
            if (!plot.seedItem) { el.className = "plot-dirt rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border-4 border-amber-300/50"; el.innerHTML = `<i class="fa-solid fa-seedling text-amber-600/30 text-2xl"></i>`; }
            else {
                const item = generateItemData(plot.seedItem); const elapsed = now - plot.plantedAt; const ready = elapsed >= item.time;
                if (ready) { el.className = "rounded-xl flex flex-col items-center justify-center cursor-pointer plot-ready shadow-md relative"; el.innerHTML = `<span class="text-4xl drop-shadow-md">${item.icon}</span><span class="absolute -bottom-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">¡Recoger!</span>`; }
                else {
                    const prog = Math.min(100, (elapsed / item.time) * 100); el.className = "plot-dirt rounded-xl flex flex-col items-center justify-center cursor-pointer relative border-4 border-amber-300/50 overflow-hidden";
                    el.innerHTML = `<span class="text-3xl opacity-60 scale-75 filter blur-[1px] mb-2">${item.icon}</span><div class="absolute bottom-1 left-0 right-0 px-1 flex flex-col items-center w-full"><span id="plot-time-${i}" class="text-[9px] font-bold text-amber-900 bg-amber-100/90 px-1 rounded-sm mb-0.5">--</span><div class="w-full bg-amber-900/20 rounded-full h-1"><div id="plot-bar-${i}" class="bg-green-400 h-full rounded-full" style="width: ${prog}%"></div></div></div>`;
                }
            }
            el.onclick = () => window.handlePlotClick(i);
        }
        grid.appendChild(el);
    }
}

function renderInventory() {
    const container = document.getElementById('inventory-list'); container.innerHTML = '';
    const keys = Object.keys(state.inventory); const toolKeys = Object.keys(state.tools || {});
    if (keys.length === 0 && toolKeys.length === 0) return container.innerHTML = `<p class="text-gray-400 text-xs text-center w-full py-2">Mochila vacía.</p>`;
    keys.forEach(k => {
        const count = state.inventory[k]; const item = generateItemData(k); if (!item || count <= 0) return;
        const el = document.createElement('div'); el.className = `min-w-[60px] ${item.cssClass} p-2 rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm relative`;
        if (item.type === 'crop') el.innerHTML += `<div class="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1 rounded-full"><i class="fa-solid fa-leaf"></i></div>`;
        el.innerHTML += `<span class="text-xl drop-shadow-sm">${item.icon}</span><span class="font-bold text-xs mt-1">x${count}</span>`; container.appendChild(el);
    });
    toolKeys.forEach(k => {
        const count = state.tools[k]; const tool = BASE_TOOLS[k]; if (!tool || count <= 0) return;
        const el = document.createElement('div'); el.className = `min-w-[60px] ${tool.css} p-2 rounded-2xl flex flex-col items-center justify-center border-2 shadow-sm relative`;
        el.innerHTML += `<span class="text-xl drop-shadow-sm">${tool.icon}</span><span class="font-bold text-xs mt-1">x${count}</span>`; container.appendChild(el);
    });
}

function renderShopBuy() {
    const cont = document.getElementById('shop-list'); cont.innerHTML = '';
    globalShopItems.forEach((item, index) => {
        const bought = (state.shopPurchases[currentCycleId]?.[index] || 0); const stockLeft = item.maxStock - bought; const canBuy = state.coins >= item.cost && stockLeft > 0;
        const isEpicPlus = item.rarityId !== 'comun' && item.rarityId !== 'raro';
        const el = document.createElement('div');
        el.className = `flex justify-between items-center p-2 rounded-2xl border-2 ${item.cssClass} ${isEpicPlus ? 'shimmer-epic-plus relative overflow-hidden' : ''} ${stockLeft > 0 ? 'shadow-sm' : 'opacity-50 grayscale'}`;
        el.innerHTML = `<div class="flex items-center gap-2 w-3/4 z-10">
                        <div class="w-10 h-10 ${item.cssClass} bg-white/50 border rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner">${item.icon}</div>
                        <div class="truncate">
                            <h4 class="font-bold text-gray-800 text-xs truncate leading-tight drop-shadow-sm">${item.name}</h4>
                            <p class="text-[9px] text-gray-600 font-bold mt-0.5"><i class="fa-solid fa-hourglass-half opacity-50"></i> ${formatTimeRemaining(item.time)} <span class="ml-1 text-${stockLeft > 0 ? 'green' : 'red'}-600 bg-white/70 px-1 rounded-sm shadow-sm">Stock: x${stockLeft}</span></p>
                        </div>
                    </div>
                    <button onclick="buySystemItem(${index})" class="${canBuy ? 'bg-white hover:bg-gray-50 text-gray-800 shadow-sm border border-gray-200' : 'bg-gray-100/50 text-gray-400 border border-transparent'} px-3 py-1.5 rounded-xl font-bold text-xs transition-transform hover:scale-105 flex-shrink-0 z-10">${item.cost} 🪙</button>`;
        cont.appendChild(el);
    });
}
function renderShopTools() {
    const cont = document.getElementById('tools-list'); cont.innerHTML = '';
    globalToolsItems.forEach((item, index) => {
        const bought = (state.toolsPurchases[currentToolsCycleId]?.[index] || 0); const stockLeft = item.maxStock - bought; const canBuy = state.coins >= item.cost && stockLeft > 0;
        const el = document.createElement('div'); el.className = `flex justify-between items-center bg-white p-2 rounded-2xl border ${stockLeft > 0 ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-50 bg-gray-50'}`;
        el.innerHTML = `<div class="flex items-center gap-2 w-3/4"><div class="w-10 h-10 ${item.css} border rounded-xl flex items-center justify-center text-xl flex-shrink-0">${item.icon}</div>
                        <div class="truncate"><h4 class="font-bold text-gray-700 text-xs truncate leading-tight">${item.name}</h4><p class="text-[9px] text-gray-400 font-bold mt-0.5"><i class="fa-solid fa-bolt text-yellow-500"></i> ${item.desc} <span class="ml-1 text-${stockLeft > 0 ? 'green' : 'red'}-500 bg-${stockLeft > 0 ? 'green' : 'red'}-50 px-1 rounded">Stock: x${stockLeft}</span></p></div></div>
                    <button onclick="buyToolSystemItem(${index})" class="${canBuy ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400'} px-2 py-1.5 rounded-xl font-bold text-xs transition-colors flex-shrink-0">${item.cost} 🪙</button>`;
        cont.appendChild(el);
    });
}

window.buyToolSystemItem = function (index) {
    const item = globalToolsItems[index]; const bought = (state.toolsPurchases[currentToolsCycleId]?.[index] || 0);
    if (bought >= item.maxStock) { playSound('error'); return showNotification("Sin stock", true); }
    if (state.coins < item.cost) { playSound('error'); return showNotification("Monedas insuficientes", true); }
    playSound('buy'); state.coins -= item.cost; state.tools[item.id] = (state.tools[item.id] || 0) + 1;
    if (!state.toolsPurchases[currentToolsCycleId]) state.toolsPurchases[currentToolsCycleId] = {}; state.toolsPurchases[currentToolsCycleId][index] = bought + 1;
    saveState(); renderHeader(); renderShopTools(); renderInventory(); showNotification(`Compraste ${item.name}`);
}

function renderShopSell() {
    const cont = document.getElementById('sell-list'); cont.innerHTML = ''; let hasCrops = false;
    Object.keys(state.inventory).forEach(k => {
        if (!k.startsWith('crop_') || state.inventory[k] <= 0) return; hasCrops = true;
        const item = generateItemData(k); const count = state.inventory[k];
        const el = document.createElement('div'); el.className = `flex flex-col items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden`;
        el.innerHTML = `<div class="w-full absolute top-0 h-1 ${item.cssClass}"></div><span class="text-3xl mb-1">${item.icon}</span><span class="text-[10px] font-bold text-gray-600 truncate w-full text-center">${item.name} (x${count})</span><button onclick="sellItemToSystem('${k}')" class="mt-2 bg-green-100 text-green-700 w-full py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition">Vender (+${item.sell}🪙)</button>`;
        cont.appendChild(el);
    });
    if (!hasCrops) cont.innerHTML = `<p class="text-xs text-gray-400 col-span-2 text-center py-4">No tienes cosechas para vender. ¡Ve a plantar!</p>`;
}

window.buyLongSystemItem = function (index) {
    const item = globalLongItems[index]; const bought = (state.longPurchases[currentLongCycleId]?.[index] || 0);
    if (bought >= item.maxStock) { playSound('error'); return showNotification("Sin stock", true); }
    if (state.coins < item.cost) { playSound('error'); return showNotification("Monedas insuficientes", true); }
    playSound('buy'); state.coins -= item.cost; state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
    if (!state.longPurchases[currentLongCycleId]) state.longPurchases[currentLongCycleId] = {}; state.longPurchases[currentLongCycleId][index] = bought + 1;
    saveState(); renderHeader(); renderShopLong(); renderInventory(); showNotification(`Compraste ${item.name}`);
}

function renderShopLong() {
    const cont = document.getElementById('long-list');
    if (!cont) return;
    cont.innerHTML = '';
    globalLongItems.forEach((item, index) => {
        const bought = (state.longPurchases[currentLongCycleId]?.[index] || 0); const stockLeft = item.maxStock - bought; const canBuy = state.coins >= item.cost && stockLeft > 0;
        const isEpicPlus = item.rarityId !== 'comun' && item.rarityId !== 'raro';
        const el = document.createElement('div');
        el.className = `flex justify-between items-center p-2 rounded-2xl border-2 ${item.cssClass} ${isEpicPlus ? 'shimmer-epic-plus relative overflow-hidden' : ''} ${stockLeft > 0 ? 'shadow-sm' : 'opacity-50 grayscale'}`;
        el.innerHTML = `<div class="flex items-center gap-2 w-3/4 z-10">
                        <div class="w-10 h-10 ${item.cssClass} bg-white/50 border rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner">${item.icon}</div>
                        <div class="truncate">
                            <h4 class="font-bold text-gray-800 text-xs truncate leading-tight drop-shadow-sm">${item.name}</h4>
                            <p class="text-[9px] text-gray-600 font-bold mt-0.5"><i class="fa-solid fa-hourglass-end opacity-50"></i> ${formatTimeRemaining(item.time)} <span class="ml-1 text-${stockLeft > 0 ? 'green' : 'red'}-600 bg-white/70 px-1 rounded-sm shadow-sm">Stock: x${stockLeft}</span></p>
                        </div>
                    </div>
                    <button onclick="buyLongSystemItem(${index})" class="${canBuy ? 'bg-white hover:bg-gray-50 text-gray-800 shadow-sm border border-gray-200' : 'bg-gray-100/50 text-gray-400 border border-transparent'} px-3 py-1.5 rounded-xl font-bold text-xs transition-transform hover:scale-105 flex-shrink-0 z-10">${item.cost} 🪙</button>`;
        cont.appendChild(el);
    });
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    let unlockedCount = 0;

    CROP_KEYS_ORDER.forEach(key => {
        const crop = BASE_CROPS[key];
        const isUnlocked = crop.minLvl <= state.level;
        if (isUnlocked) unlockedCount++;

        const el = document.createElement('div');
        el.className = `flex flex-col items-center p-2 rounded-2xl border ${isUnlocked ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-200 item-locked'}`;

        el.innerHTML = `
                    <span class="text-3xl mb-1 ${isUnlocked ? 'drop-shadow-sm' : 'opacity-40'}">${isUnlocked ? crop.icon : '❓'}</span>
                    <span class="text-[10px] font-bold text-center w-full truncate ${isUnlocked ? 'text-indigo-800' : 'text-gray-500'}">${isUnlocked ? crop.name : 'Desconocido'}</span>
                    <span class="text-[8px] font-black mt-1 px-1.5 py-0.5 rounded ${isUnlocked ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-500'}">Nvl ${crop.minLvl}</span>
                `;
        grid.appendChild(el);
    });

    document.getElementById('catalog-count').innerText = `${unlockedCount}/60`;
}

function renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    if (!list) return;
    list.innerHTML = '';

    Object.keys(UPGRADES_DEF).forEach(k => {
        const upg = UPGRADES_DEF[k]; const lvl = state.upgrades[k] || 0;
        const isMax = lvl >= upg.maxLvl;
        const cost = Math.floor(upg.baseCost * Math.pow(upg.mult, lvl));
        const canBuy = state.coins >= cost && !isMax;

        let bars = ''; for (let i = 0; i < upg.maxLvl; i++) { bars += `<div class="h-1.5 flex-1 rounded-sm ${i < lvl ? 'bg-orange-400' : 'bg-orange-100'}"></div>`; }

        const el = document.createElement('div');
        el.className = `p-3 rounded-2xl border-2 flex justify-between items-center ${isMax ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 shadow-sm'}`;
        el.innerHTML = `
                    <div class="flex items-center gap-3 w-3/4">
                        <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center text-2xl rounded-full ${upg.css}">${upg.icon}</div>
                        <div class="w-full">
                            <h4 class="font-bold text-gray-800 text-sm">${upg.name} <span class="text-xs bg-orange-100 text-orange-600 px-1 rounded ml-1">Lvl ${lvl}</span></h4>
                            <p class="text-[10px] text-gray-500 font-bold mb-1 w-full truncate">${upg.desc}</p>
                            <div class="flex gap-0.5 w-full">${bars}</div>
                        </div>
                    </div>
                    <button onclick="buyUpgrade('${k}')" ${!canBuy ? 'disabled' : ''} class="${canBuy ? 'bg-orange-400 hover:bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'} font-bold px-3 py-2 rounded-xl text-xs transition-transform hover:scale-105 shadow-sm whitespace-nowrap">
                        ${isMax ? 'MAX' : `${cost} 🪙`}
                    </button>
                `;
        list.appendChild(el);
    });
}

window.buyUpgrade = function (key) {
    playSound('click');
    const upg = UPGRADES_DEF[key]; const lvl = state.upgrades[key] || 0;
    if (lvl >= upg.maxLvl) return;
    const cost = Math.floor(upg.baseCost * Math.pow(upg.mult, lvl));
    if (state.coins < cost) return showNotification("No tienes monedas", true);
    playSound('buy');
    state.coins -= cost;
    state.upgrades[key] = lvl + 1;
    saveState(); renderHeader(); renderUpgrades(); showNotification(`Mejora de ${upg.name} subida al nivel ${lvl + 1}!`);
}

window.openPlantModal = function () {
    playSound('click');
    const list = document.getElementById('modal-seeds-list'); list.innerHTML = ''; let hasSeeds = false;
    Object.keys(state.inventory).forEach(k => {
        if (!k.startsWith('seed_') || state.inventory[k] <= 0) return; hasSeeds = true;
        const item = generateItemData(k);
        const el = document.createElement('button'); el.className = `${item.cssClass} p-2 rounded-2xl flex flex-col items-center justify-center border-2 hover:scale-105 transition`;
        el.innerHTML = `<span class="text-3xl">${item.icon}</span><span class="font-bold text-[10px] mt-1 text-center leading-tight">${item.name}</span><span class="text-xs font-black opacity-60">x${state.inventory[k]}</span>`;
        el.onclick = () => {
            playSound('plant'); state.inventory[k]--; if (state.inventory[k] <= 0) delete state.inventory[k];
            state.plots[selectedPlot] = { id: selectedPlot, seedItem: k, plantedAt: Date.now() };
            processQuest('plant', k);
            saveState(); renderPlots(); renderInventory(); closeModal('plant-modal');
        }; list.appendChild(el);
    });
    if (!hasSeeds) list.innerHTML = `<p class="col-span-3 text-center text-gray-400 text-sm">No tienes semillas.</p>`;
    document.getElementById('plant-modal').classList.remove('hidden'); document.getElementById('plant-modal').classList.add('flex');
}

window.openToolModal = function () {
    const list = document.getElementById('modal-tools-list');
    list.innerHTML = '';
    let hasTools = false;
    Object.keys(state.tools || {}).forEach(k => {
        if (state.tools[k] <= 0) return;
        hasTools = true;
        const tool = BASE_TOOLS[k];
        if (!tool) return;
        const el = document.createElement('button');
        el.className = `${tool.css} p-2 rounded-2xl flex flex-col items-center justify-center border-2 hover:scale-105 transition`;
        el.innerHTML = `<span class="text-3xl">${tool.icon}</span><span class="font-bold text-[10px] mt-1 text-center leading-tight">${tool.name}</span><span class="text-[9px]">${tool.desc}</span><span class="text-xs font-black opacity-60">x${state.tools[k]}</span>`;
        el.onclick = () => {
            applyToolToPlot(selectedPlot, k);
            closeModal('tool-modal');
        };
        list.appendChild(el);
    });
    if (!hasTools) list.innerHTML = `<p class="col-span-2 text-center text-gray-400 text-sm">No tienes herramientas.</p>`;
    document.getElementById('tool-modal').classList.remove('hidden');
    document.getElementById('tool-modal').classList.add('flex');
}

window.applyToolToPlot = function (plotIndex, toolKey) {
    const plot = state.plots[plotIndex];
    const tool = BASE_TOOLS[toolKey];
    if (!plot || !plot.plantedAt || !tool || !state.tools[toolKey] || state.tools[toolKey] <= 0) return;

    playSound('plant');
    state.tools[toolKey]--;
    if (state.tools[toolKey] <= 0) delete state.tools[toolKey];

    plot.plantedAt -= tool.timeReduc;
    processQuest('tool', toolKey);

    saveState();
    renderPlots();
    renderInventory();
    showNotification(`¡Usaste ${tool.name}!`);
}

window.closeModal = function (id) { playSound('click'); document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex'); }
window.toggleFullscreen = function () { if (!document.fullscreenElement) document.getElementById('game-container').requestFullscreen().catch(e => { }); else document.exitFullscreen(); }
function showNotification(text, isError = false) {
    const container = document.getElementById('notification-container'); const el = document.createElement('div');
    el.className = `px-4 py-3 rounded-2xl shadow-lg font-bold text-sm transform transition-all duration-500 translate-y-[20px] opacity-0 text-center ${isError ? 'bg-red-500 text-white' : 'bg-white text-gray-800 border-2 border-pink-200'}`;
    el.innerText = text; container.appendChild(el);
    setTimeout(() => el.classList.remove('translate-y-[20px]', 'opacity-0'), 10);
    setTimeout(() => { el.classList.add('translate-y-[20px]', 'opacity-0'); setTimeout(() => el.remove(), 500); }, 2000);
}

let tradesIn = [], tradesOut = [];
function setupTradesListeners() {
    onSnapshot(query(collection(db, 'artifacts', APP_ID, 'trades'), where('receiverName', '==', username)), (snap) => {
        tradesIn = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!document.getElementById('section-trade').classList.contains('hidden')) renderTradesUI();
        else if (tradesIn.some(t => t.status === 'pending' || t.status === 'active')) document.getElementById('trade-notif-badge').classList.remove('hidden');
    });
    onSnapshot(query(collection(db, 'artifacts', APP_ID, 'trades'), where('senderName', '==', username)), (snap) => {
        tradesOut = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!document.getElementById('section-trade').classList.contains('hidden')) renderTradesUI();
        else if (tradesOut.some(t => t.status === 'active')) document.getElementById('trade-notif-badge').classList.remove('hidden');
    });
}

window.sendTradeRequest = async function () {
    playSound('click');
    const target = document.getElementById('trade-friend-name').value.trim().toLowerCase();
    if (!target || target === username) return showNotification("Nombre inválido", true);
    await addDoc(collection(db, 'artifacts', APP_ID, 'trades'), { senderName: username, receiverName: target, status: 'pending', createdAt: Date.now() });
    document.getElementById('trade-friend-name').value = '';
    showNotification("Solicitud enviada");
};

window.acceptTrade = async function (id) { playSound('click'); await updateDoc(doc(db, 'artifacts', APP_ID, 'trades', id), { status: 'active', senderOffer: {}, receiverOffer: {} }); }
window.rejectTrade = async function (id) { playSound('click'); await deleteDoc(doc(db, 'artifacts', APP_ID, 'trades', id)); }

// Live Trade Logic
let activeTradeId = null, activeTradeUnsub = null;
window.openLiveTrade = function (id) {
    playSound('click');
    activeTradeId = id; document.getElementById('live-trade-modal').classList.remove('hidden'); document.getElementById('live-trade-modal').classList.add('flex');
    activeTradeUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'trades', id), (snap) => {
        if (!snap.exists() || snap.data().status === 'cancelled') { closeLiveTrade(); return showNotification("Trade cancelado", true); }
        renderLiveTrade(snap.data());
    });
}

window.closeLiveTrade = function () {
    if (activeTradeUnsub) activeTradeUnsub(); activeTradeId = null;
    document.getElementById('live-trade-modal').classList.add('hidden'); document.getElementById('live-trade-modal').classList.remove('flex');
}

function renderLiveTrade(trade) {
    try {
        if (!trade) return;
        if (trade.status === 'completed') { closeLiveTrade(); return showNotification("¡Trade Completado!"); }
        const isSender = trade.senderName === username;
        const myOffer = (isSender ? trade.senderOffer : trade.receiverOffer) || {};
        const theirOffer = (isSender ? trade.receiverOffer : trade.senderOffer) || {};
        const theirName = isSender ? trade.receiverName : trade.senderName;
        const myConfirmed = isSender ? trade.senderConfirmed : trade.receiverConfirmed;
        const theirConfirmed = isSender ? trade.receiverConfirmed : trade.senderConfirmed;

        const getItemNameUI = (k) => {
            if (k === '_coins') return `<span class="text-base mr-1 drop-shadow-sm">💰</span>Monedas`;
            let i = generateItemData(k); if (i) return `<span class="text-base mr-1">${i.icon}</span>${i.name}`;
            const t = BASE_TOOLS[k]; if (t) return `<span class="text-base mr-1">${t.icon}</span>${t.name}`;
            return k;
        };

        let html = `
            <div class="bg-white p-6 rounded-3xl max-w-sm w-full relative h-[80vh] flex flex-col shadow-2xl modal-enter border-4 border-blue-200">
                <button onclick="closeLiveTrade()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"><i class="fa-solid fa-times"></i></button>
                <h3 class="text-xl font-black text-blue-500 mb-4 text-center border-b pb-2"><i class="fa-solid fa-handshake mr-2"></i>Trade con ${theirName}</h3>
                
                <div class="flex-1 overflow-y-auto mb-4 flex flex-col gap-4">
                    <!-- MI LADO -->
                    <div class="flex-1 bg-blue-50 p-4 rounded-xl border-2 border-blue-200 flex flex-col relative">
                        <span class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white font-black text-[10px] px-3 py-0.5 rounded-full z-10 uppercase tracking-widest shadow-sm">Tú ofreces</span>
                        <button onclick="clearMyTrade()" class="absolute -top-3 right-2 bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full z-10 shadow-sm hover:focus-visible hover:bg-red-600 focus:outline-none" title="Limpiar"><i class="fa-solid fa-trash"></i></button>
                        <div class="flex-1 overflow-y-auto bg-white/70 rounded-lg p-2 mb-2">
                            ${Object.keys(myOffer).map(k => `<div class="text-[11px] font-bold p-1 bg-white border border-blue-100 rounded mb-1 flex items-center shadow-sm">x${myOffer[k]} ${getItemNameUI(k)}</div>`).join('') || '<div class="text-gray-400 text-xs text-center h-full flex items-center justify-center italic">Vacío</div>'}
                        </div>
                        <div class="mt-auto flex gap-2">
                            <select id="trade-item-select" class="flex-1 text-xs px-2 py-1.5 rounded-lg border border-blue-300 font-bold outline-none text-blue-800 bg-white">
                                <option value="">Elegir Item o Monedas...</option>
                                <option value="_coins_50" class="text-yellow-600">💰 50 Monedas</option>
                                <option value="_coins_250" class="text-yellow-600">💰 250 Monedas</option>
                                <option value="_coins_1000" class="text-yellow-600">💰 1000 Monedas</option>
                                ${Object.keys(state.inventory).map(k => state.inventory[k] > 0 ? `<option value="${k}">x${state.inventory[k]} Cos/Sem</option>` : '').join('')}
                                ${Object.keys(state.tools || {}).map(k => state.tools[k] > 0 ? `<option value="${k}">x${state.tools[k]} Herr</option>` : '').join('')}
                            </select>
                            <button onclick="addTradeItem()" class="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-600 shadow-sm" ${myConfirmed ? 'disabled' : ''}><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    
                    <div class="flex justify-center -my-2 z-10 text-xl text-gray-400"><i class="fa-solid fa-arrow-right-arrow-left rotate-90 bg-white p-2 rounded-full shadow-md"></i></div>

                    <!-- SU LADO -->
                    <div class="flex-1 bg-red-50 p-4 rounded-xl border-2 border-red-200 flex flex-col relative">
                        <span class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white font-black text-[10px] px-3 py-0.5 rounded-full z-10 uppercase tracking-widest shadow-sm">${theirName} ofrece</span>
                        <div class="flex-1 overflow-y-auto bg-white/70 rounded-lg p-2 mb-2">
                            ${Object.keys(theirOffer).map(k => `<div class="text-[11px] font-bold p-1 bg-white border border-red-100 rounded mb-1 flex items-center shadow-sm">x${theirOffer[k]} ${getItemNameUI(k)}</div>`).join('') || '<div class="text-gray-400 text-xs text-center h-full flex items-center justify-center italic">Vacío</div>'}
                        </div>
                        <div class="mt-auto text-center font-bold text-xs ${theirConfirmed ? 'text-green-500 bg-green-100 border border-green-200 py-1 rounded-lg shadow-sm' : 'text-gray-400 border border-transparent py-1'}">
                            ${theirConfirmed ? '<i class="fa-solid fa-check-circle mr-1"></i> ¡Aceptado!' : '<i class="fa-solid fa-hourglass-half mr-1 animate-pulse"></i> Modificando...'}
                        </div>
                    </div>
                </div>
                
                <button onclick="toggleTradeConfirm()" class="w-full ${myConfirmed ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-500 hover:bg-green-600'} text-white font-black py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] text-lg active:scale-95 flex items-center justify-center gap-2">
                    ${myConfirmed ? '<i class="fa-solid fa-pause"></i> Esperando...' : '<i class="fa-solid fa-handshake"></i> Sellar Trato'}
                </button>
            </div>
            `;
        document.getElementById('live-trade-modal').innerHTML = html;

        if (trade.senderConfirmed && trade.receiverConfirmed && trade.status !== 'completed') executeTrade(trade);
    } catch (e) {
        console.error("Error rendering trade: ", e);
        showNotification("Error visualizando trade", true);
    }
}

window.addTradeItem = async function () {
    const select = document.getElementById('trade-item-select');
    const item = select.value; if (!item) return; playSound('click');

    const docRef = doc(db, 'artifacts', APP_ID, 'trades', activeTradeId);
    const trade = (await getDoc(docRef)).data();
    const isSender = trade.senderName === username;
    const field = isSender ? 'senderOffer' : 'receiverOffer';
    const offer = trade[field] || {};

    if (item.startsWith('_coins_')) {
        const amount = parseInt(item.replace('_coins_', ''));
        const currentCoins = offer['_coins'] || 0;
        if (currentCoins + amount > state.coins) return showNotification("No tienes tantas monedas", true);
        offer['_coins'] = currentCoins + amount;
    } else {
        const currentAdded = offer[item] || 0;
        const hasAmt = state.inventory[item] || state.tools[item] || 0;
        if (currentAdded >= hasAmt) return showNotification("No tienes más cantidad", true);
        offer[item] = currentAdded + 1;
    }

    await updateDoc(docRef, { [field]: offer, senderConfirmed: false, receiverConfirmed: false });
}

window.toggleTradeConfirm = async function () {
    playSound('click');
    const docRef = doc(db, 'artifacts', APP_ID, 'trades', activeTradeId);
    const trade = (await getDoc(docRef)).data();
    const isSender = trade.senderName === username;
    const confirmField = isSender ? 'senderConfirmed' : 'receiverConfirmed';
    await updateDoc(docRef, { [confirmField]: !trade[confirmField] });
}

window.clearMyTrade = async function () {
    playSound('click');
    const docRef = doc(db, 'artifacts', APP_ID, 'trades', activeTradeId);
    const trade = (await getDoc(docRef)).data();
    const field = (trade.senderName === username) ? 'senderOffer' : 'receiverOffer';
    await updateDoc(docRef, { [field]: {}, senderConfirmed: false, receiverConfirmed: false });
}

// ================= NEW FEATURES =================

// --- MISIONES DIARIAS ---
window.claimQuest = function (qId) {
    const qs = getDailyQuests();
    const q = qs.find(x => x.uniqueId === qId);
    if (!q) return;
    const curAmt = state.questProgress[qId] || 0;
    if (curAmt >= q.req && curAmt < q.req + 999) {
        playSound('win');
        state.coins += q.coins;
        addXp(q.xp);
        state.questProgress[qId] = q.req + 999; // Marcado como reclamado
        saveState(); renderHeader(); renderQuests();
        showNotification("¡Recompensa Reclamada!");
    }
}

window.renderQuests = function () {
    const list = document.getElementById('quests-list');
    if (!list) return;
    list.innerHTML = '';
    const qs = getDailyQuests();
    qs.forEach(q => {
        const curAmt = state.questProgress[q.uniqueId] || 0;
        const isCompleted = curAmt >= q.req;
        const isClaimed = curAmt >= q.req + 999;
        const p = Math.min(100, (curAmt / q.req) * 100);

        let actBtn = `<button disabled class="bg-gray-100 text-gray-400 font-bold px-3 py-1 text-[10px] rounded-lg border border-transparent shadow-sm whitespace-nowrap">${curAmt}/${q.req}</button>`;
        if (isClaimed) actBtn = `<button disabled class="bg-gray-200 text-gray-500 font-bold px-3 py-1 text-[10px] rounded-lg shadow-sm whitespace-nowrap"><i class="fa-solid fa-check"></i></button>`;
        else if (isCompleted) actBtn = `<button onclick="claimQuest('${q.uniqueId}')" class="bg-emerald-400 hover:bg-emerald-500 text-white font-bold px-3 py-1 text-[10px] rounded-lg shadow-sm animate-pulse whitespace-nowrap flex-shrink-0">¡Cobrar!</button>`;

        list.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-emerald-50 shadow-sm flex items-center justify-between gap-3 ${isClaimed ? 'opacity-50' : ''}">
                <div class="flex items-center gap-3 w-full">
                    <div class="w-10 h-10 bg-emerald-100 text-2xl flex items-center justify-center rounded-xl flex-shrink-0">${q.icon}</div>
                    <div class="w-full">
                        <div class="font-bold text-gray-700 text-xs mb-0.5">${q.title}</div>
                        <div class="text-[9px] font-bold text-emerald-600 mb-1">+${q.xp} XP | +${q.coins} 🪙</div>
                        <div class="w-full bg-emerald-100 h-1.5 rounded-full"><div class="bg-emerald-400 h-full rounded-full transition-all" style="width: ${p}%"></div></div>
                    </div>
                </div>
                ${actBtn}
            </div>
        `;
    });
}

// --- ANIMALES ---
const ANIMALS_DEF = {
    chicken: { id: 'chicken', name: 'Gallina', icon: '🐔', cost: 1000, food: 'crop_maiz', foodName: 'Maíz', gives: 'huevo', givesName: 'Huevo', givesIcon: '🥚', time: 60 * 60 * 1000, sell: 150 },
    cow: { id: 'cow', name: 'Vaca', icon: '🐮', cost: 5000, food: 'crop_trigo', foodName: 'Trigo', gives: 'leche', givesName: 'Leche', givesIcon: '🥛', time: 4 * 60 * 60 * 1000, sell: 800 },
    pig: { id: 'pig', name: 'Cerdo', icon: '🐷', cost: 15000, food: 'crop_zanahoria', foodName: 'Zanahoria', gives: 'trufa', givesName: 'Trufa', givesIcon: '🍄', time: 12 * 60 * 60 * 1000, sell: 3000 }
};

window.buyAnimal = function (id) {
    const a = ANIMALS_DEF[id];
    if (state.coins < a.cost) return showNotification("Monedas insuficientes", true);
    if (state.animals.length >= 6) return showNotification("Límite de animales alcanzado (6)", true);
    playSound('buy');
    state.coins -= a.cost;
    state.animals.push({ type: id, fedAt: null });
    saveState(); renderHeader(); renderAnimals();
    showNotification(`Compraste una ${a.name}`);
}

window.feedAnimal = function (idx) {
    const a = state.animals[idx];
    const def = ANIMALS_DEF[a.type];
    if (state.inventory[def.food] && state.inventory[def.food] > 0) {
        playSound('plant');
        state.inventory[def.food]--;
        if (state.inventory[def.food] <= 0) delete state.inventory[def.food];
        a.fedAt = Date.now();
        saveState(); renderAnimals(); renderInventory(); showNotification(`Alimentaste a la ${def.name}`);
    } else {
        playSound('error');
        showNotification(`Necesitas ${def.foodName} para alimentarla`, true);
    }
}

window.collectAnimal = function (idx) {
    const a = state.animals[idx];
    const def = ANIMALS_DEF[a.type];
    if (a.fedAt && (Date.now() - a.fedAt) >= def.time) {
        playSound('harvest');
        a.fedAt = null;
        state.coins += def.sell; // Direct sell for simplicity
        addXp(50);
        saveState(); renderHeader(); renderAnimals(); showNotification(`Recogiste ${def.givesName} (+${def.sell}🪙)`);
    }
}

window.renderAnimals = function () {
    const grid = document.getElementById('animals-grid');
    const shop = document.getElementById('animals-shop');
    if (!grid || !shop) return;

    // Render Farm Animals
    grid.innerHTML = '';
    if (state.animals.length === 0) grid.innerHTML = '<p class="text-xs text-gray-400 text-center col-span-2">No tienes animales.</p>';
    state.animals.forEach((a, i) => {
        const def = ANIMALS_DEF[a.type];
        const elapsed = a.fedAt ? Date.now() - a.fedAt : 0;
        const ready = a.fedAt && elapsed >= def.time;

        let statusHtml = '';
        if (!a.fedAt) statusHtml = `<button onclick="feedAnimal(${i})" class="bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg text-[10px] w-full mt-2 hover:bg-amber-200">Dar 1 ${def.foodName}</button>`;
        else if (ready) statusHtml = `<button onclick="collectAnimal(${i})" class="bg-green-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] w-full mt-2 animate-pulse hover:bg-green-600">Recoger ${def.givesName}</button>`;
        else {
            const p = Math.min(100, (elapsed / def.time) * 100);
            statusHtml = `<div class="mt-2 text-center w-full"><span class="text-[9px] font-bold text-gray-500 mb-0.5 block">${formatTimeRemaining(def.time - elapsed)}</span><div class="w-full bg-gray-200 h-1.5 rounded-full"><div class="bg-amber-400 h-full rounded-full" style="width: ${p}%"></div></div></div>`;
        }

        grid.innerHTML += `
            <div class="bg-white p-3 rounded-2xl border-2 border-amber-100 shadow-sm flex flex-col items-center">
                <span class="text-4xl relative ${ready ? 'animate-bounce' : ''}">${def.icon} ${ready ? `<span class="absolute -top-2 -right-2 text-xl drop-shadow-md">${def.givesIcon}</span>` : ''}</span>
                <span class="font-bold text-xs mt-1 text-gray-700">${def.name}</span>
                ${statusHtml}
            </div>
        `;
    });

    // Render Shop
    shop.innerHTML = '';
    Object.values(ANIMALS_DEF).forEach(def => {
        shop.innerHTML += `
            <div class="bg-gray-50 p-2 rounded-xl flex items-center justify-between border border-gray-200">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${def.icon}</span>
                    <div>
                        <div class="font-bold text-[10px] text-gray-700">${def.name}</div>
                        <div class="text-[9px] text-gray-500">Da: ${def.givesName}</div>
                    </div>
                </div>
                <button onclick="buyAnimal('${def.id}')" class="bg-white border text-gray-700 font-bold px-2 py-1 rounded-lg text-[10px] shadow-sm hover:bg-gray-100">${def.cost} 🪙</button>
            </div>
        `;
    });
}

// --- LEADERBOARDS ---
let leaderboardUnsub = null;
window.renderLeaderboardInit = function () {
    if (leaderboardUnsub) leaderboardUnsub();
    const list = document.getElementById('leaderboard-list');
    if (!list) return;

    // Sub to top 10 players based on xp
    leaderboardUnsub = onSnapshot(query(collection(db, 'artifacts', APP_ID, 'leaderboard')), (snap) => {
        let players = snap.docs.map(d => d.data());
        players.sort((a, b) => b.xp - a.xp);
        players = players.slice(0, 10);

        list.innerHTML = '';
        if (players.length === 0) list.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Sin datos todavía.</p>';
        players.forEach((p, i) => {
            const isMe = p.name === username;
            let medal = `<span class="font-black text-gray-400 w-6 text-center">#${i + 1}</span>`;
            if (i === 0) medal = `<span class="text-xl w-6 text-center">🏆</span>`;
            if (i === 1) medal = `<span class="text-xl w-6 text-center">🥈</span>`;
            if (i === 2) medal = `<span class="text-xl w-6 text-center">🥉</span>`;

            list.innerHTML += `
                <div class="bg-white p-3 rounded-xl border ${isMe ? 'border-yellow-400 bg-yellow-50 shadow-md transform scale-[1.02]' : 'border-gray-100 shadow-sm'} flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                        ${medal}
                        <div>
                            <div class="text-[11px] font-black ${isMe ? 'text-yellow-600' : 'text-gray-700'}">${p.name}</div>
                            <div class="text-[9px] font-bold text-gray-400">Nivel ${p.level || 1}</div>
                        </div>
                    </div>
                    <div class="bg-blue-100 text-blue-600 font-black text-[10px] px-2 py-1 rounded-lg border border-blue-200 shadow-inner">${p.xp} XP</div>
                </div>
            `;
        });
    });
}

// --- MERCADO (AUCTIONS) ---
let marketUnsub = null;
window.renderMarketInit = function () {
    if (marketUnsub) marketUnsub();
    const list = document.getElementById('market-list');
    if (!list) return;

    marketUnsub = onSnapshot(collection(db, 'artifacts', APP_ID, 'auctions'), (snap) => {
        let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.innerHTML = '';
        if (items.length === 0) list.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">El mercado está vacío. ¡Publica algo!</p>';
        items.forEach(a => {
            const isMy = a.sellerName === username;
            const itemDef = generateItemData(a.item);
            if (!itemDef) return;

            list.innerHTML += `
                <div class="bg-white p-3 rounded-2xl border-2 ${isMy ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'} shadow-sm flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 w-3/4">
                        <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center text-3xl ${itemDef.cssClass} bg-white border rounded-xl shadow-inner relative">
                            ${itemDef.icon}
                        </div>
                        <div class="truncate w-full">
                            <div class="font-bold text-gray-800 text-xs truncate drop-shadow-sm">${itemDef.name}</div>
                            <div class="font-bold text-[9px] text-gray-400 mt-0.5"><i class="fa-solid fa-user mr-1"></i>${a.sellerName}</div>
                        </div>
                    </div>
                    <button onclick="${isMy ? `cancelAuction('${a.id}')` : `buyAuction('${a.id}', ${a.price}, '${a.sellerName}', '${a.item}')`}" 
                        class="${isMy ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-indigo-500 text-white hover:bg-indigo-600'} font-bold px-3 py-2 rounded-xl text-xs transition-transform hover:scale-105 shadow-sm whitespace-nowrap flex-shrink-0">
                        ${isMy ? '<i class="fa-solid fa-trash"></i>' : `${a.price} 🪙`}
                    </button>
                </div>
            `;
        });

        // Also check if I have earnings from sold items
        checkMarketEarnings();
    });
}

async function checkMarketEarnings() {
    if (!currentUser) return;
    const snap = await collection(db, 'artifacts', APP_ID, 'users', currentUser.uid, 'earnings');
    onSnapshot(snap, (s) => {
        s.docs.forEach(async doc => {
            const data = doc.data();
            playSound('win');
            state.coins += data.coins;
            saveState(); renderHeader();
            showNotification(`¡Alguien compró tu oferta! (+${data.coins}🪙)`, false);
            await deleteDoc(doc.ref);
        });
    });
}

window.openPublishAuctionModal = function () {
    playSound('click');
    const list = document.getElementById('auction-items-list');
    const form = document.getElementById('auction-form');
    list.innerHTML = '';

    let hasHighTier = false;
    Object.keys(state.inventory).forEach(k => {
        if (!k.startsWith('crop_')) return;
        const item = generateItemData(k);
        // Sólo dejar subir épico o superior
        if (item.rarityId === 'comun' || item.rarityId === 'raro') return;
        hasHighTier = true;

        const count = state.inventory[k];
        list.innerHTML += `
            <div onclick="selectAuctionItem('${k}', ${item.sell})" id="auction-item-${k}" class="auction-select-item cursor-pointer bg-white p-2 rounded-xl border-2 border-transparent hover:border-indigo-300 flex items-center justify-between gap-2 shadow-sm transition">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <span class="text-xl">${item.icon}</span> ${item.name}
                </div>
                <div class="text-[10px] bg-gray-100 px-2 py-1 rounded-lg">Tienes: ${count}</div>
            </div>
        `;
    });

    if (!hasHighTier) {
        list.innerHTML = '<p class="text-xs text-gray-400 text-center p-2">No tienes cultivos Épicos o superiores para vender.</p>';
        form.style.display = 'none';
    } else {
        form.style.display = 'none';
    }

    window.selectedAuctionItem = null;
    document.getElementById('auction-modal').classList.remove('hidden');
    document.getElementById('auction-modal').classList.add('flex');
}

window.selectAuctionItem = function (k, suggPrice) {
    playSound('click');
    document.querySelectorAll('.auction-select-item').forEach(e => e.classList.remove('border-indigo-500', 'bg-indigo-50'));
    document.getElementById(`auction-item-${k}`).classList.add('border-indigo-500', 'bg-indigo-50');
    window.selectedAuctionItem = k;
    document.getElementById('auction-form').style.display = 'flex';
    document.getElementById('auction-price').value = suggPrice * 2; // Suggest 2x base price
}

window.publishAuction = async function () {
    if (!window.selectedAuctionItem || !state.inventory[window.selectedAuctionItem]) return;
    const price = parseInt(document.getElementById('auction-price').value);
    if (!price || isNaN(price) || price <= 0) return showNotification("Precio inválido", true);

    playSound('click');
    document.getElementById('auction-publish-btn').innerText = "Publicando...";

    state.inventory[window.selectedAuctionItem]--;
    if (state.inventory[window.selectedAuctionItem] <= 0) delete state.inventory[window.selectedAuctionItem];
    saveState(); renderInventory();

    await addDoc(collection(db, 'artifacts', APP_ID, 'auctions'), {
        item: window.selectedAuctionItem,
        price: price,
        sellerName: username,
        sellerUid: currentUser.uid,
        createdAt: Date.now()
    });

    document.getElementById('auction-publish-btn').innerText = "Publicar";
    closeModal('auction-modal');
    showNotification("¡Oferta publicada exitosamente!");
}

window.buyAuction = async function (auctionId, price, sellerName, itemKey) {
    if (state.coins < price) return showNotification("Monedas insuficientes", true);
    playSound('buy');

    // Optimistic local update
    state.coins -= price;
    state.inventory[itemKey.replace('crop_', 'seed_')] = (state.inventory[itemKey.replace('crop_', 'seed_')] || 0) + 1; // Wait, buying a seed or crop? We put crop in market, so buy gets crop.

    // correction: items in market are crops. Add crop.
    state.inventory[itemKey] = (state.inventory[itemKey] || 0) + 1;
    saveState(); renderHeader(); renderInventory(); renderMarketInit();

    showNotification(`¡Compraste de ${sellerName}!`);

    // Cloud update
    const aDoc = await getDoc(doc(db, 'artifacts', APP_ID, 'auctions', auctionId));
    if (aDoc.exists()) {
        const d = aDoc.data();
        await deleteDoc(aDoc.ref);
        // Pay seller
        const earningsRef = collection(db, 'artifacts', APP_ID, 'users', d.sellerUid, 'earnings');
        await addDoc(earningsRef, { coins: d.price, timestamp: Date.now() });
    }
}

window.cancelAuction = async function (auctionId) {
    playSound('click');
    const aDoc = await getDoc(doc(db, 'artifacts', APP_ID, 'auctions', auctionId));
    if (aDoc.exists()) {
        const d = aDoc.data();
        state.inventory[d.item] = (state.inventory[d.item] || 0) + 1;
        saveState(); renderInventory();
        await deleteDoc(aDoc.ref);
        showNotification("Subasta cancelada, objeto recuperado.");
    }
}

async function executeTrade(trade) {
    const isSender = trade.senderName === username;
    const myOffer = (isSender ? trade.senderOffer : trade.receiverOffer) || {};
    const theirOffer = (isSender ? trade.receiverOffer : trade.senderOffer) || {};

    let valid = true;
    for (let k in myOffer) {
        if (k === '_coins') { if (myOffer[k] > state.coins) valid = false; }
        else if (!(state.inventory[k] >= myOffer[k] || state.tools[k] >= myOffer[k])) valid = false;
    }
    if (!valid) { await updateDoc(doc(db, 'artifacts', APP_ID, 'trades', activeTradeId), { status: 'cancelled' }); return showNotification("Faltan items/monedas", true); }

    for (let k in myOffer) {
        if (k === '_coins') { state.coins -= myOffer[k]; }
        else if (state.inventory[k]) { state.inventory[k] -= myOffer[k]; if (state.inventory[k] <= 0) delete state.inventory[k]; }
        else if (state.tools[k]) { state.tools[k] -= myOffer[k]; if (state.tools[k] <= 0) delete state.tools[k]; }
    }
    for (let k in theirOffer) {
        if (k === '_coins') { state.coins += theirOffer[k]; }
        else if (k.startsWith('seed_') || k.startsWith('crop_')) state.inventory[k] = (state.inventory[k] || 0) + theirOffer[k];
        else state.tools[k] = (state.tools[k] || 0) + theirOffer[k];
    }
    saveState(); renderHeader(); renderInventory();

    if (isSender) await updateDoc(doc(db, 'artifacts', APP_ID, 'trades', activeTradeId), { status: 'completed' });
    closeLiveTrade(); showNotification("¡Trade Exitoso!");
}
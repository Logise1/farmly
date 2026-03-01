import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- SISTEMA SONIDO ---
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

const sfx = { click: [1, , 300, .01, .01, .01, 1, 1.1, , , , , , .1], win: [2, , 400, .1, .2, .5, 1, 1.5, , , , -200, .1, , .1], lose: [1.5, , 150, .04, .1, .2, 3, 2, , , , , , .1, , .5], hit: [1.2, , 200, .01, .06, .07, 1, 1.1, , , , , , .9, , .03], merge: [2, , 500, .03, .05, .2, 1, 1.5, , , , , , .1], slide: [1.5, , 300, .01, .03, .03, 1, 1.5, , , , , , .1, , .1], jump: [1.2, , 400, .02, .05, .05, 1, 1.2, , , , , , .1] };
window.playSound = function (type) { if (zzfxX.state === 'suspended') zzfxX.resume(); if (sfx[type]) zzfx(...sfx[type]); }

// --- CONFIG FIREBASE Y DATOS ---
const firebaseConfig = { apiKey: "AIzaSyCB_RiTV17ouLpPylMQs1kW_ayDqYoZKUE", authDomain: "jumper-4e0b2.firebaseapp.com", projectId: "jumper-4e0b2", storageBucket: "jumper-4e0b2.firebasestorage.app", messagingSenderId: "397169417542", appId: "1:397169417542:web:305312904eeadcd579d947", measurementId: "G-BBBHJ2T8XL" };
const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getFirestore(app);
const APP_ID = "super-granja-multi";
const REWARD_CYCLE_MS = 5 * 60 * 1000;

// Diccionarios base compartidos
const CROP_ICONS = { trigo: '🌾', zanahoria: '🥕', tomate: '🍅', cebolla: '🧅', patata: '🥔', girasol: '🌻', fresa: '🍓', sandia: '🍉', pera: '🍐', uva: '🍇', cereza: '🍒', melon: '🍈', limon: '🍋', pimiento: '🫑', berenjena: '🍆' };
const TOOL_ICONS = { fert_peq: '🧪', fert_med: '🧪', regadera_oro: '🚿', reloj_magico: '⏳', polvo_hada: '✨' };

let currentUser = null, state = { coins: 0, level: 1, inventory: {}, tools: {}, gameClaims: {} }, saveDocRef = null;
let currentCycleId = 0, gameRewards = {}, activeGame = null;

function seededRandom(seed) { let x = Math.sin(seed++) * 10000; return x - Math.floor(x); }

function updateRewardCycle() {
    const now = Date.now(); const cycleId = Math.floor(now / REWARD_CYCLE_MS);
    const msPassed = now % REWARD_CYCLE_MS; const msLeft = REWARD_CYCLE_MS - msPassed;
    document.getElementById('reward-timer').innerText = `${Math.floor(msLeft / 60000)}:${Math.floor((msLeft % 60000) / 1000).toString().padStart(2, '0')}`;

    if (currentCycleId !== cycleId) {
        currentCycleId = cycleId; generateAllGameRewards(cycleId); updateGameStatuses();
    }
}

function generateSpecificReward(cId, gameKey, multiplier) {
    const gameSeedVal = (cId * 100) + gameKey.charCodeAt(0) + gameKey.charCodeAt(1);
    const randType = seededRandom(gameSeedVal);

    if (gameKey === '2048') {
        if (randType < 0.3) return { type: 'coins', amount: Math.floor(seededRandom(gameSeedVal + 1) * 3000) + 2000, icon: '💰', name: 'Saco Monedas', css: 'text-yellow-500' };
        else if (randType < 0.7) {
            const crop = seededRandom(gameSeedVal + 2) > 0.6 ? 'sandia' : 'fresa';
            const rarity = crop === 'sandia' ? 'legendario' : 'mitico';
            return { type: 'seed', id: `seed_${crop}_${rarity}`, amount: 1, icon: CROP_ICONS[crop], name: `Semilla ${crop} (${rarity})`, css: 'text-amber-500' };
        } else {
            const tool = seededRandom(gameSeedVal + 3) > 0.5 ? 'polvo_hada' : 'reloj_magico';
            return { type: 'tool', id: tool, amount: 1, icon: TOOL_ICONS[tool], name: tool === 'polvo_hada' ? 'Polvo de Hada' : 'Reloj Mágico', css: 'text-pink-500' };
        }
    }

    if (randType < 0.5) return { type: 'coins', amount: Math.floor((Math.floor(seededRandom(gameSeedVal + 1) * 50) + 20) * multiplier), icon: '🪙', name: 'Monedas', css: 'text-yellow-500' };
    else {
        const crops = ['trigo', 'zanahoria', 'tomate', 'cebolla', 'patata'];
        const crop = crops[Math.floor(seededRandom(gameSeedVal + 2) * crops.length)];
        let rarity = 'comun', amt = 1; const rRand = seededRandom(gameSeedVal + 3);
        if (multiplier >= 3) { if (rRand < 0.4) rarity = 'epico'; else if (rRand < 0.8) rarity = 'raro'; amt = rarity === 'comun' ? 5 : (rarity === 'raro' ? 2 : 1); }
        else if (multiplier >= 1.5) { if (rRand < 0.3) rarity = 'raro'; amt = rarity === 'comun' ? 3 : 1; }
        else amt = 2;
        return { type: 'seed', id: `seed_${crop}_${rarity}`, amount: amt, icon: CROP_ICONS[crop], name: `${crop} (${rarity})`, css: rarity === 'comun' ? 'text-gray-500' : 'text-blue-500' };
    }
}

function generateAllGameRewards(cId) {
    gameRewards['clicker'] = generateSpecificReward(cId, 'clicker', 1);
    gameRewards['whack'] = generateSpecificReward(cId, 'whack', 1.5);
    gameRewards['flappy'] = generateSpecificReward(cId, 'flappy', 2.5);
    gameRewards['memory'] = generateSpecificReward(cId, 'memory', 3);
    gameRewards['2048'] = generateSpecificReward(cId, '2048', 50);

    ['clicker', 'whack', 'flappy', 'memory', '2048'].forEach(g => {
        const r = gameRewards[g];
        document.getElementById(`reward-${g}`).innerHTML = `<span class="${r.css} text-base">${r.icon}</span> <span class="truncate">${r.amount > 1 ? `x${r.amount} ` : ''}${r.name}</span>`;
    });
}

function updateGameStatuses() {
    if (!state.gameClaims) state.gameClaims = {};
    ['memory', 'whack', '2048', 'flappy', 'clicker'].forEach(game => {
        const el = document.getElementById(`status-${game}`);
        if (state.gameClaims[game] === currentCycleId) { el.className = "text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full"; el.innerText = "¡Cobrado!"; }
        else { el.className = "text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full animate-pulse"; el.innerText = "¡Listo!"; }
    });
}

// --- AUTH ---
window.handleLogin = async function () {
    playSound('click');
    const userIn = document.getElementById('auth-user').value.trim(); const passIn = document.getElementById('auth-pass').value.trim();
    if (!userIn || !passIn || userIn.length < 3) return showNotification("Usuario min 3 caracteres", true);
    document.getElementById('btn-login').innerText = "Conectando...";
    try {
        try { await signInWithEmailAndPassword(auth, `${userIn.toLowerCase()}@minigranja.com`, passIn); }
        catch (e) { if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') await createUserWithEmailAndPassword(auth, `${userIn.toLowerCase()}@minigranja.com`, passIn); else throw e; }
    } catch (err) { playSound('error'); showNotification("Error", true); document.getElementById('btn-login').innerText = "Jugar"; }
};

async function loadState() {
    const snap = await getDoc(saveDocRef);
    if (snap.exists()) {
        const d = snap.data();
        state.coins = d.coins ?? 0;
        state.level = d.level ?? 1;
        state.inventory = d.inventory ?? {};
        state.tools = d.tools ?? {};
        state.gameClaims = d.gameClaims ?? {};
    } else {
        state.gameClaims = {};
    }
    document.getElementById('coins-display').innerText = state.coins;
    document.getElementById('level-display').innerText = state.level;
    updateRewardCycle();
    setInterval(updateRewardCycle, 1000);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('flex');
        document.getElementById('player-name-display').innerText = user.email.split('@')[0];
        if (zzfxX.state === 'suspended') zzfxX.resume();
        saveDocRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'saveData', 'v3');
        await loadState();
    } else {
        currentUser = null;
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('flex');
    }
});

function saveState() {
    if (saveDocRef) setDoc(saveDocRef, { coins: state.coins, inventory: state.inventory, tools: state.tools, gameClaims: state.gameClaims }, { merge: true });
    document.getElementById('coins-display').innerText = state.coins;
}

// --- HUB CONTROL ---
let gameLoopInt = null, gameFrameReq = null;

window.openGame = function (id) {
    playSound('click');
    if (state.gameClaims[id] === currentCycleId) return showNotification("Premio ya reclamado. Espera a la próxima rotación.", true);

    activeGame = id; document.getElementById('games-hub').classList.add('hidden'); document.getElementById('game-view').classList.remove('hidden'); document.getElementById('game-view').classList.add('flex');
    ['memory', 'whack', '2048', 'flappy', 'clicker'].forEach(g => document.getElementById(`canvas-${g}`).classList.add('hidden'));
    document.getElementById(`canvas-${id}`).classList.remove('hidden'); document.getElementById(`canvas-${id}`).classList.add('flex');
    document.getElementById('game-overlay').classList.remove('hidden'); document.getElementById('game-overlay').classList.add('flex');

    const titles = { memory: 'Memoria', whack: 'Aplasta-Topos', '2048': '2048 Cosecha', flappy: 'Flappy', clicker: 'Clicker' };
    const descs = { memory: 'Encuentra las parejas para ganar premios.', whack: '¡Tiempo infinito si aciertas! 15 pts = premio', '2048': 'Llega a grandes números.', flappy: 'Pasa 10 tuberías para ganar un premio.', clicker: 'Haz 50 clics para ganar un premio.' };
    const r = gameRewards[id];

    document.getElementById('active-game-title').innerText = titles[id]; document.getElementById('overlay-title').innerText = titles[id]; document.getElementById('overlay-desc').innerText = descs[id];
    document.getElementById('overlay-reward').innerHTML = `<span class="text-4xl ${r.css}">${r.icon}</span><div class="text-left"><span class="block text-[10px] font-bold text-violet-500 uppercase tracking-widest">Premio Recurrente</span><span class="font-black text-gray-800 text-lg leading-none">${r.amount > 1 ? `x${r.amount} ` : ''}${r.name}</span></div>`;
    document.getElementById('overlay-btn').innerText = "¡Empezar!";
    document.getElementById('overlay-btn').onclick = window.startGameLogic;
}

window.exitGame = function () { playSound('click'); clearInterval(gameLoopInt); cancelAnimationFrame(gameFrameReq); document.getElementById('games-hub').classList.remove('hidden'); document.getElementById('game-view').classList.add('hidden'); document.getElementById('game-view').classList.remove('flex'); activeGame = null; updateGameStatuses(); }
window.startGameLogic = function () {
    playSound('click');
    document.getElementById('game-overlay').classList.add('hidden'); document.getElementById('game-overlay').classList.remove('flex');
    if (activeGame === 'memory') initMemory(); if (activeGame === 'whack') initWhack(); if (activeGame === '2048') init2048(); if (activeGame === 'flappy') initFlappy(); if (activeGame === 'clicker') initClicker();
}

window.winGame = function (msg) {
    clearInterval(gameLoopInt); cancelAnimationFrame(gameFrameReq);
    state.gameClaims[activeGame] = currentCycleId;
    saveState();
    updateGameStatuses();

    const r = gameRewards[activeGame];
    document.getElementById('reward-modal-item').innerHTML = `<span class="text-4xl ${r.css}">${r.icon}</span><span class="font-bold text-gray-700 text-lg ml-2">${r.amount > 1 ? `x${r.amount} ` : ''}${r.name}</span>`;
    document.getElementById('reward-modal').classList.remove('hidden');
    document.getElementById('reward-modal').classList.add('flex');
}

function grantGameReward(gameId) {
    const r = gameRewards[gameId];
    if (!r) return;
    playSound('win');
    if (r.type === 'coins') state.coins += r.amount;
    if (r.type === 'seed') state.inventory[r.id] = (state.inventory[r.id] || 0) + r.amount;
    if (r.type === 'tool') state.tools[r.id] = (state.tools[r.id] || 0) + r.amount;
    saveState();
    showNotification(`¡Ganaste ${r.amount > 1 ? `x${r.amount} ` : ''}${r.name}!`, false);
}

function endGameScore(msg) {
    playSound('lose'); clearInterval(gameLoopInt); cancelAnimationFrame(gameFrameReq);
    document.getElementById('game-overlay').classList.remove('hidden'); document.getElementById('game-overlay').classList.add('flex');
    document.getElementById('overlay-title').innerText = "¡Fin del juego!";
    document.getElementById('overlay-desc').innerText = msg;
    document.getElementById('overlay-btn').innerText = "Salir";
    document.getElementById('overlay-btn').onclick = window.exitGame;
}
window.closeRewardModal = function () { playSound('click'); document.getElementById('reward-modal').classList.add('hidden'); document.getElementById('reward-modal').classList.remove('flex'); exitGame(); }

// ==========================================
// 2048 ANIMADO PERFECTO (LÓGICA MEJORADA)
// ==========================================
let board2048 = [], nextTileId = 0, isAnimating2048 = false;

function init2048() {
    board2048 = []; nextTileId = 0; isAnimating2048 = false;
    addTile2048(); addTile2048(); render2048Board(); setupSwipe2048();
}

function addTile2048() {
    let cells = [];
    for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) if (!board2048.find(t => t.x === x && t.y === y)) cells.push({ x, y });
    if (cells.length > 0) {
        let cell = cells[Math.floor(Math.random() * cells.length)];
        board2048.push({ id: nextTileId++, val: Math.random() > 0.9 ? 4 : 2, x: cell.x, y: cell.y, isNew: true });
    }
}

function render2048Board() {
    const container = document.getElementById('grid-2048-tiles'); container.innerHTML = '';
    board2048.forEach(t => {
        const el = document.createElement('div'); el.className = `tile-2048 tile-${t.val}`;
        if (t.isNew) el.classList.add('tile-new'); if (t.merged) el.classList.add('tile-merged');
        // Posición calculada exactamente al 25% del grid
        el.style.left = `calc(${t.x * 25}% + 0.25rem)`; el.style.top = `calc(${t.y * 25}% + 0.25rem)`;
        el.innerText = t.val; container.appendChild(el);
        t.isNew = false; t.merged = false;
    });
}

function move2048(dir) { // 0: Up, 1: Right, 2: Down, 3: Left
    if (isAnimating2048) return;
    let grid = Array(4).fill(null).map(() => Array(4).fill(null));
    board2048.forEach(t => grid[t.x][t.y] = t);

    let moved = false, mergedThisTurn = [];

    const moveTile = (x, y, dx, dy) => {
        let t = grid[x][y]; if (!t) return;
        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 4 && ny >= 0 && ny < 4) {
            let target = grid[nx][ny];
            if (!target) {
                grid[nx][ny] = t; grid[nx - dx][ny - dy] = null; t.x = nx; t.y = ny; moved = true;
            } else if (target.val === t.val && !mergedThisTurn.includes(target.id)) {
                target.val *= 2; target.merged = true; mergedThisTurn.push(target.id);
                if (target.val === 512) { grantGameReward('2048'); setTimeout(() => winGame('¡Increíble 512!'), 500); }
                t.x = nx; t.y = ny; t.toDelete = true; grid[x][y] = null; moved = true; break;
            } else break;
            nx += dx; ny += dy;
        }
    };

    if (dir === 0) for (let x = 0; x < 4; x++) for (let y = 1; y < 4; y++) moveTile(x, y, 0, -1);
    else if (dir === 1) for (let y = 0; y < 4; y++) for (let x = 2; x >= 0; x--) moveTile(x, y, 1, 0);
    else if (dir === 2) for (let x = 0; x < 4; x++) for (let y = 2; y >= 0; y--) moveTile(x, y, 0, 1);
    else if (dir === 3) for (let y = 0; y < 4; y++) for (let x = 1; x < 4; x++) moveTile(x, y, -1, 0);

    if (moved) {
        isAnimating2048 = true; playSound('slide');
        if (mergedThisTurn.length > 0) setTimeout(() => playSound('merge'), 100);
        render2048Board();
        setTimeout(() => {
            board2048 = board2048.filter(t => !t.toDelete);
            addTile2048(); render2048Board();
            isAnimating2048 = false;
        }, 160);
    }
}

let touchStartX = 0, touchStartY = 0;
function setupSwipe2048() {
    const el = document.getElementById('grid-2048-main');
    el.ontouchstart = (e) => { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; };
    el.ontouchend = (e) => {
        let dx = e.changedTouches[0].screenX - touchStartX, dy = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) { if (dx > 30) move2048(1); else if (dx < -30) move2048(3); }
        else { if (dy > 30) move2048(2); else if (dy < -30) move2048(0); }
    };
}
document.addEventListener('keydown', (e) => {
    if (activeGame !== '2048') return;
    if (e.key === 'ArrowUp') move2048(0); if (e.key === 'ArrowRight') move2048(1);
    if (e.key === 'ArrowDown') move2048(2); if (e.key === 'ArrowLeft') move2048(3);
});

// ==========================================
// RESTO DE MINIJUEGOS (COMPACTADOS)
// ==========================================
let memCards = [], memFlipped = [], memMatched = 0, memTime = 30;
function initMemory() {
    const grid = document.getElementById('canvas-memory'); grid.innerHTML = '';
    const icons = ['🌾', '🥕', '🍅', '🧅', '🥔', '🌻', '🍓', '🍉'];
    memCards = [...icons, ...icons].sort(() => Math.random() - 0.5); memFlipped = []; memMatched = 0; memTime = 30;
    grid.innerHTML = `<div class="col-span-4 text-center text-lg font-black text-violet-500 mb-1">Tiempo: <span id="mem-time">30</span>s</div>`;
    memCards.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = "memory-card w-full h-full relative cursor-pointer rounded-xl bg-violet-200 border-2 border-violet-300 shadow-sm flex items-center justify-center text-3xl font-black";
        card.style.aspectRatio = "1/1";
        card.dataset.idx = i; card.dataset.icon = icon; card.onclick = () => flipMemCard(card);
        card.innerHTML = `<span class="opacity-0 transition-opacity">${icon}</span>`;
        grid.appendChild(card);
    });
    gameLoopInt = setInterval(() => { memTime--; document.getElementById('mem-time').innerText = memTime; if (memTime <= 0) endGameScore('¡Tiempo agotado!'); }, 1000);
}
function flipMemCard(c) { if (memFlipped.length >= 2 || c.classList.contains('flipped') || c.classList.contains('matched') || memTime <= 0) return; playSound('hit'); c.classList.add('flipped', 'bg-white'); c.classList.remove('bg-violet-200'); c.querySelector('span').classList.remove('opacity-0'); memFlipped.push(c); if (memFlipped.length === 2) { setTimeout(() => { if (memFlipped[0].dataset.icon === memFlipped[1].dataset.icon) { playSound('merge'); memFlipped[0].classList.add('matched', 'border-green-400', 'bg-green-50'); memFlipped[1].classList.add('matched', 'border-green-400', 'bg-green-50'); memMatched += 2; if (memMatched === memCards.length) { grantGameReward('memory'); winGame('¡Gran Memoria!'); } } else { memFlipped[0].classList.remove('flipped', 'bg-white'); memFlipped[0].classList.add('bg-violet-200'); memFlipped[0].querySelector('span').classList.add('opacity-0'); memFlipped[1].classList.remove('flipped', 'bg-white'); memFlipped[1].classList.add('bg-violet-200'); memFlipped[1].querySelector('span').classList.add('opacity-0'); } memFlipped = []; }, 800); } }

let whackScore = 0, whackTime = 15;
function initWhack() { const grid = document.getElementById('whack-grid'); grid.innerHTML = ''; whackScore = 0; whackTime = 15; document.getElementById('whack-score').innerText = whackScore; document.getElementById('whack-time').innerText = Math.floor(whackTime) + "s"; for (let i = 0; i < 9; i++) grid.innerHTML += `<div class="mole-hole"><div class="mole" id="mole-${i}" onclick="hitMole(${i})">🌿</div></div>`; gameLoopInt = setInterval(() => { whackTime--; document.getElementById('whack-time').innerText = Math.floor(whackTime) + "s"; if (whackTime <= 0) { endGameScore(`¡Tiempo! Topos: ${whackScore}/15`); } }, 1000); showRandomMole(); }
function showRandomMole() { if (whackTime <= 0 || activeGame !== 'whack') return; document.querySelectorAll('.mole').forEach(m => m.classList.remove('up')); const id = Math.floor(Math.random() * 9); const mole = document.getElementById(`mole-${id}`); if (mole) { mole.classList.add('up'); let duration = Math.max(200, 600 - whackScore * 30) + Math.random() * Math.max(100, 400 - whackScore * 20); setTimeout(() => { mole.classList.remove('up'); showRandomMole(); }, duration); } }
window.hitMole = function (id) { const mole = document.getElementById(`mole-${id}`); if (mole.classList.contains('up')) { playSound('hit'); whackScore++; whackTime += 0.5; document.getElementById('whack-time').innerText = Math.floor(whackTime) + "s"; document.getElementById('whack-score').innerText = whackScore; mole.classList.remove('up'); if (whackScore >= 15) { grantGameReward('whack'); winGame('¡Topos Aplastados!'); } } }

let clickScore = 0, clickTime = 10.0;
function initClicker() { clickScore = 0; clickTime = 10.0; document.getElementById('clicker-score').innerText = clickScore; document.getElementById('clicker-time').innerText = clickTime.toFixed(1); const btn = document.getElementById('btn-clicker-main'); btn.style.transform = 'none'; btn.style.marginLeft = '0px'; btn.style.marginTop = '0px'; gameLoopInt = setInterval(() => { clickTime -= 0.1; document.getElementById('clicker-time').innerText = Math.max(0, clickTime).toFixed(1); if (clickTime <= 0) { endGameScore(`¡Tiempo! Clics: ${clickScore}/60`); } }, 100); }
window.clickerHit = function () { if (clickTime <= 0) return; playSound('hit'); clickScore++; document.getElementById('clicker-score').innerText = clickScore; const btn = document.getElementById('btn-clicker-main'); let scaleBase = Math.max(0.5, 1 - (clickScore / 100)); btn.style.transform = `scale(${scaleBase + Math.random() * 0.1}) rotate(${Math.random() * 10 - 5}deg)`; btn.style.marginLeft = `${(Math.random() - 0.5) * clickScore * 1.5}px`; btn.style.marginTop = `${(Math.random() - 0.5) * clickScore * 1.5}px`; setTimeout(() => btn.style.transform = `scale(${scaleBase})`, 50); if (clickScore >= 60) { grantGameReward('clicker'); winGame('¡Frenesí Completado!'); } }

let cvs, ctx, bird, pipes, flappyScore, frames;
function initFlappy() { cvs = document.getElementById('flappyCanvas'); ctx = cvs.getContext('2d'); cvs.width = 300; cvs.height = 400; bird = { x: 50, y: 150, v: 0, g: 0.4, jump: -6 }; pipes = []; flappyScore = 0; frames = 0; cvs.ontouchstart = cvs.onmousedown = (e) => { e.preventDefault(); bird.v = bird.jump; playSound('jump'); }; cancelAnimationFrame(gameFrameReq); loopFlappy(); }
function loopFlappy() { if (activeGame !== 'flappy') return; ctx.clearRect(0, 0, cvs.width, cvs.height); bird.v += bird.g; bird.y += bird.v; ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(bird.x, bird.y, 12, 0, Math.PI * 2); ctx.fill(); let spawnRate = Math.floor(Math.max(50, 100 - flappyScore * 4)); if (frames % spawnRate === 0) { let gapPos = Math.random() * 150 + 50; let gapSize = Math.max(80, 120 - flappyScore * 3); pipes.push({ x: cvs.width, y: gapPos, w: 40, gap: gapSize, passed: false }); } let speed = 2 + flappyScore * 0.2; ctx.fillStyle = '#4ade80'; for (let i = 0; i < pipes.length; i++) { let p = pipes[i]; p.x -= speed; ctx.fillRect(p.x, 0, p.w, p.y); ctx.fillRect(p.x, p.y + p.gap, p.w, cvs.height - p.y - p.gap); if (bird.x + 12 > p.x && bird.x - 12 < p.x + p.w && (bird.y - 12 < p.y || bird.y + 12 > p.y + p.gap)) return endGameScore(`¡Chocaste! Flaps: ${flappyScore}/10`); if (bird.y + 12 > cvs.height || bird.y - 12 < 0) return endGameScore(`¡Caíste! Flaps: ${flappyScore}/10`); if (p.x + p.w < bird.x && !p.passed) { p.passed = true; flappyScore++; playSound('hit'); if (flappyScore >= 10) { grantGameReward('flappy'); winGame('¡Dominaste los Cielos!'); return; } } } if (pipes.length > 0 && pipes[0].x < -50) pipes.shift(); ctx.fillStyle = '#0891b2'; ctx.font = 'bold 30px Nunito'; ctx.fillText(flappyScore + "/10", cvs.width / 2 - 25, 50); frames++; gameFrameReq = requestAnimationFrame(loopFlappy); }

function showNotification(text, isError = false) { const container = document.getElementById('notification-container'); const el = document.createElement('div'); el.className = `px-4 py-3 rounded-2xl shadow-lg font-bold text-sm transform transition-all duration-500 translate-y-[20px] opacity-0 text-center ${isError ? 'bg-red-500 text-white' : 'bg-white text-gray-800 border-2 border-violet-200'}`; el.innerText = text; container.appendChild(el); setTimeout(() => el.classList.remove('translate-y-[20px]', 'opacity-0'), 10); setTimeout(() => { el.classList.add('translate-y-[20px]', 'opacity-0'); setTimeout(() => el.remove(), 500); }, 2000); }
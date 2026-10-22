"use strict";

const WB = WasmBoy.WasmBoy;

const SAVE_SIZE = 0x8000;
const SYNC_INTERVAL_MS = 30000;

const $ = (id) => document.getElementById(id);
const canvas = $("screen");
const statusEl = $("status");
const syncBtn = $("sync");

let game = null;
let lastSynced = null; // hash of the last RAM we sent to / got from the cloud
let syncing = false;

const setStatus = (text) => (statusEl.textContent = text);

async function api(path, options = {}) {
  return fetch(path, { credentials: "same-origin", ...options });
}

function hash(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619);
  return h >>> 0;
}

async function ensurePlayer() {
  const res = await api("/api/me");
  if (!res.ok) throw new Error("Could not reach the save server");
  return (await res.json()).code;
}

// The emulator only refreshes its copy of cartridge RAM when paused.
async function readRam() {
  const wasPlaying = WB.isPlaying();
  if (wasPlaying) await WB.pause();
  try {
    const info = await WB._getCartridgeInfo();
    return info.RAM ? new Uint8Array(info.RAM) : null;
  } finally {
    if (wasPlaying) await WB.play();
  }
}

// Inject a battery save by loading it into a fresh-boot save state.
async function writeRam(ram) {
  await WB.pause();
  const state = await WB.saveState();
  state.wasmboyMemory.cartridgeRam = ram;
  await WB.loadState(state);
}

async function pushToCloud({ force = false } = {}) {
  if (!game || syncing) return;
  syncing = true;
  try {
    const ram = await readRam();
    if (!ram || ram.length !== SAVE_SIZE) return;
    const h = hash(ram);
    if (!force && h === lastSynced) return;
    const res = await api(`/api/save/${game}`, { method: "PUT", body: ram });
    if (!res.ok) throw new Error(`server said ${res.status}`);
    lastSynced = h;
    setStatus(`Saved to cloud at ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    setStatus(`Cloud save failed: ${err.message}`);
  } finally {
    syncing = false;
  }
}

async function start() {
  game = $("game").value;
  $("play").disabled = true;
  setStatus("Loading…");
  try {
    await ensurePlayer();
    const rom = await (await fetch(`roms/poke${game}.gbc`)).arrayBuffer();

    await WB.config(
      {
        isGbcEnabled: true,
        isAudioEnabled: true,
        headless: false,
        isGbcColorizationEnabled: false,
        enableBootROMIfAvailable: false,
        gameboyFrameRate: 60,
        maxNumberOfAutoSaveStates: 0,
      },
      canvas
    );
    await WB.loadROM(new Uint8Array(rom));

    const res = await api(`/api/save/${game}`);
    if (res.ok) {
      const cloud = new Uint8Array(await res.arrayBuffer());
      const local = await readRam();
      lastSynced = hash(cloud);
      const differs = !local || hash(local) !== lastSynced;
      const localEmpty = !local || local.every((b) => b === 0 || b === 0xff);
      if (differs && (localEmpty || confirm("A cloud save exists and differs from this device's save.\nOK = use the cloud save, Cancel = keep this device's save."))) {
        await writeRam(cloud);
      }
    }

    await WB.play();
    HD.start(WB, $("hd"), Scenes);
    $("start").hidden = true;
    $("pad").hidden = false;
    syncBtn.disabled = false;
    setStatus("Playing");
    setInterval(pushToCloud, SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => document.hidden && pushToCloud());
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${err.message}`);
    $("play").disabled = false;
  }
}

$("play").addEventListener("click", start);
syncBtn.addEventListener("click", () => pushToCloud({ force: true }));

$("code").addEventListener("click", async () => {
  const code = await ensurePlayer();
  const entered = prompt(
    "Your recovery code (keep it private). Paste a code from another device here to switch to that player's saves:",
    code
  );
  if (entered && entered.trim() !== code) {
    const res = await api("/api/me", { method: "POST", body: JSON.stringify({ code: entered.trim() }) });
    setStatus(res.ok ? "Switched player; reload to load their save" : "Invalid code");
  }
});

// On-screen pad. WasmBoy re-applies its own input state every frame, so pad presses are
// merged into that state with a plugin (calling setJoypadState directly gets overwritten
// next frame). A press is held at least MIN_HOLD_MS so a tap can't fall between frames.
const MIN_HOLD_MS = 110;
const PAD_KEYS = ["UP", "DOWN", "LEFT", "RIGHT", "A", "B", "START", "SELECT"];
const held = {}, pressedAt = {}, releaseTimer = {};

WB.ResponsiveGamepad.addPlugin({
  name: "touch-pad",
  onGetState(state) {
    for (const k of PAD_KEYS) state[k] = state[k] || !!held[k];
    return state;
  },
});

function setKey(key, down) {
  if (down) {
    clearTimeout(releaseTimer[key]);
    if (held[key]) return;
    held[key] = true;
    pressedAt[key] = performance.now();
  } else if (held[key]) {
    const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - pressedAt[key]));
    releaseTimer[key] = setTimeout(() => { held[key] = false; }, wait);
  }
}

for (const btn of document.querySelectorAll("#pad [data-key]")) {
  const key = btn.dataset.key;
  const up = () => { btn.classList.remove("down"); setKey(key, false); };
  btn.addEventListener("pointerdown", (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); btn.classList.add("down"); setKey(key, true); });
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointercancel", up);
}

// One touch surface for the D-pad so a thumb can roll between directions.
const dpad = $("dpad");
let dpadDir = null;
function setDpad(dir) {
  if (dir === dpadDir) return;
  if (dpadDir) setKey(dpadDir, false);
  dpad.className = dir || "";
  dpadDir = dir;
  if (dir) setKey(dir, true);
}
function dpadFromEvent(e) {
  const r = dpad.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < r.width * 0.12) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "LEFT" : "RIGHT") : (dy < 0 ? "UP" : "DOWN");
}
dpad.addEventListener("pointerdown", (e) => { e.preventDefault(); dpad.setPointerCapture(e.pointerId); setDpad(dpadFromEvent(e)); });
dpad.addEventListener("pointermove", (e) => { if (dpad.hasPointerCapture(e.pointerId)) setDpad(dpadFromEvent(e)); });
dpad.addEventListener("pointerup", () => setDpad(null));
dpad.addEventListener("pointercancel", () => setDpad(null));
document.addEventListener("contextmenu", (e) => e.preventDefault());

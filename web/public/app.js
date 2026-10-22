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

// WasmBoy keeps battery saves in IndexedDB ("wasmboy"/"keyval"), keyed by ROM bytes 0x134-0x14E, and
// loads them in loadROM. Writing the chosen cloud save there *before* loadROM means the game sees it at boot
// (restoring after boot would miss the save check the game does in GameInit).
// The game clock follows the device: the ROM keeps a "DEVT" marker, then day of week (0 = Sunday), hours, minutes, seconds.
function setDeviceTime(rom) {
  const at = rom.subarray(0, 0x4000).findIndex((_, i) => rom[i] === 0x44 && rom[i + 1] === 0x45 && rom[i + 2] === 0x56 && rom[i + 3] === 0x54);
  const now = new Date();
  if (at >= 0) rom.set([now.getDay(), now.getHours(), now.getMinutes(), now.getSeconds()], at + 4);
}

const saveKey = (rom) => rom.slice(0x134, 0x134 + 27);

const wasmboyDb = () => new Promise((ok, fail) => {
  const req = indexedDB.open("wasmboy", 1);
  req.onupgradeneeded = () => req.result.createObjectStore("keyval");
  req.onsuccess = () => ok(req.result);
  req.onerror = () => fail(req.error);
});

async function localSaveEntry(key) {
  const store = (await wasmboyDb()).transaction("keyval").objectStore("keyval");
  return new Promise((ok) => { const q = store.get(key); q.onsuccess = () => ok(q.result || {}); });
}

async function storeLocalSave(key, ram) {
  const entry = await localSaveEntry(key);
  entry.cartridgeRam = ram;
  const tx = (await wasmboyDb()).transaction("keyval", "readwrite");
  tx.objectStore("keyval").put(entry, key);
  return new Promise((ok, fail) => { tx.oncomplete = ok; tx.onerror = () => fail(tx.error); });
}

// On page unload WasmBoy stashes the running RAM in localStorage and replays it over IndexedDB at the
// next init, which would overwrite whatever we choose below. Replay it ourselves first, then drop it.
async function flushUnloadStash() {
  const raw = localStorage.getItem("WASMBOY_UNLOAD_STORAGE");
  if (!raw) return;
  localStorage.removeItem("WASMBOY_UNLOAD_STORAGE");
  const { header, cartridgeRam } = JSON.parse(raw);
  await storeLocalSave(new Uint8Array(header), new Uint8Array(cartridgeRam));
}

async function restoreCloudSave(key) {
  await flushUnloadStash();
  const res = await api(`/api/save/${game}`);
  if (!res.ok) return;
  const cloud = new Uint8Array(await res.arrayBuffer());
  const local = (await localSaveEntry(key)).cartridgeRam;
  lastSynced = hash(cloud);
  const differs = !local || hash(local) !== lastSynced;
  const localEmpty = !local || local.every((b) => b === 0 || b === 0xff);
  if (differs && (localEmpty || confirm("A cloud save exists and differs from this device's save.\nOK = use the cloud save, Cancel = keep this device's save."))) {
    await storeLocalSave(key, cloud);
  }
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
    const rom = new Uint8Array(await (await fetch(`roms/poke${game}.gbc`)).arrayBuffer());
    await restoreCloudSave(saveKey(rom));

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
    setDeviceTime(rom);
    await WB.loadROM(rom);

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

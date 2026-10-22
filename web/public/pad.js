"use strict";
// Touch input: on-screen pad and gesture mode. Needs WB and $ from app.js.

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

// Gesture mode: the whole game screen is the controller and the pad is hidden.
//   drag / hold = walk that way (relative to where the finger went down), tap = A,
//   two-finger tap = B, long-press = Start.
const GESTURE = { dead: 16, tapMs: 250, longMs: 600 };
const stage = $("screen-wrap");
const fingers = new Map();
let gestureDir = null, twoFinger = false;

function setGestureDir(dir) {
  if (dir === gestureDir) return;
  if (gestureDir) setKey(gestureDir, false);
  gestureDir = dir;
  if (dir) setKey(dir, true);
}
const tapOnce = (key) => { setKey(key, true); setKey(key, false); };

stage.addEventListener("pointerdown", (e) => {
  if (!document.body.classList.contains("gestures") || !$("start").hidden) return;
  e.preventDefault();
  stage.setPointerCapture(e.pointerId);
  const f = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, long: false, used: false };
  f.timer = setTimeout(() => { if (!f.moved && fingers.size === 1) { f.long = true; tapOnce("START"); } }, GESTURE.longMs);
  fingers.set(e.pointerId, f);
  if (fingers.size === 2) { twoFinger = true; fingers.forEach((g) => clearTimeout(g.timer)); }
});

stage.addEventListener("pointermove", (e) => {
  const f = fingers.get(e.pointerId);
  if (!f || twoFinger) return;
  const dx = e.clientX - f.x, dy = e.clientY - f.y;
  if (Math.hypot(dx, dy) < GESTURE.dead) return;
  f.moved = true;
  clearTimeout(f.timer);
  setGestureDir(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "LEFT" : "RIGHT") : (dy < 0 ? "UP" : "DOWN"));
});

function endFinger(e) {
  const f = fingers.get(e.pointerId);
  if (!f) return;
  clearTimeout(f.timer);
  fingers.delete(e.pointerId);
  const quick = !f.moved && performance.now() - f.t < GESTURE.tapMs;
  if (f.moved) setGestureDir(null);
  else if (twoFinger) { if (quick && !f.used) { tapOnce("B"); fingers.forEach((g) => (g.used = true)); } }
  else if (quick && !f.long) tapOnce("A");
  if (!fingers.size) twoFinger = false;
}
stage.addEventListener("pointerup", endFinger);
stage.addEventListener("pointercancel", endFinger);

// Controls setting: "pad" (on-screen buttons) or "gestures"; remembered per device.
const controlsBtn = $("controls");
function applyControls(mode) {
  document.body.classList.toggle("gestures", mode === "gestures");
  controlsBtn.textContent = mode === "gestures" ? "Gesture" : "Pad";
  try { localStorage.setItem("controls", mode); } catch {}
}
let savedControls = "pad";
try { savedControls = localStorage.getItem("controls") || "pad"; } catch {}
applyControls(savedControls);
controlsBtn.addEventListener("click", () => {
  const next = document.body.classList.contains("gestures") ? "pad" : "gestures";
  applyControls(next);
  if (next === "gestures") setStatus("Drag = walk · tap = A · two fingers = B · hold = Start");
});

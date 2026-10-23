// Player input for the native engine: pad and gesture presses (`held` from pad.js) plus the keyboard.
const Input = (() => {
  const KEYS = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT", z: "B", x: "A", Enter: "START", Shift: "SELECT" };
  const down = {}, prev = {}, edge = {};
  let last = null; // the direction pressed most recently wins when several are held
  addEventListener("keydown", (e) => { const k = KEYS[e.key]; if (k && !(e.target instanceof HTMLInputElement)) { down[k] = true; e.preventDefault(); } });
  addEventListener("keyup", (e) => { const k = KEYS[e.key]; if (k) down[k] = false; });
  const isDown = (k) => !!down[k] || (typeof held !== "undefined" && !!held[k]);
  const DIRS = ["DOWN", "UP", "LEFT", "RIGHT"]; // same order as `dir` (0 down, 1 up, 2 left, 3 right)
  return {
    // Call once per frame: turns level into presses.
    poll() {
      for (const k of Object.values(KEYS)) {
        const now = isDown(k);
        if (now && !prev[k]) { edge[k] = true; if (DIRS.includes(k)) last = k; }
        prev[k] = now;
      }
    },
    pressed(k) { const v = !!edge[k]; edge[k] = false; return v; },
    clear() { for (const k in edge) edge[k] = false; },
    dir() {
      if (last && isDown(last)) return DIRS.indexOf(last);
      const d = DIRS.findIndex(isDown);
      return d < 0 ? null : d;
    },
  };
})();

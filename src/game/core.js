// The game engine: grid movement like Gold's (docs/ENGINE.md). Its `state` is what the HD scenes draw.
// Map module: { room: {art, cols, rows, label}, solid: [rows of "#"/"."], warps: [{x,y,to,tx,ty,dir}],
//   npcs: [{id, name, x, y, dir, script, hideIf}], signs: [{x, y, script}], coords: [{x, y, script}] (run when stepped on), enter: async (s) => {} }
// Outdoor maps give `world: {label, cols, rows, cells, buildings}` instead of `room`; buildings carry their door's warp (to, tx, ty).
const Game = (() => {
  const STEP = 16, TURN = 6; // frames per step (~0.27s at 60 fps), frames spent turning on the spot
  const DX = [0, 0, -1, 1], DY = [1, -1, 0, 0]; // down, up, left, right
  const maps = {};
  const G = {
    maps, root: null, running: false, player: null, script: null,
    state: { screen: "splash", map: { key: "" }, x: 0, y: 0, dir: 0, objects: [], dialogue: null, boxes: [], menu: null, prof: null, pic: null },
  };
  let moving = 0, turning = 0;

  const here = () => maps[G.state.map.key];
  const npcAt = (x, y) => G.state.objects.find((o) => o.x === x && o.y === y);
  const blocked = (x, y) => {
    const m = here();
    return x < 0 || y < 0 || y >= m.solid.length || x >= m.solid[0].length || m.solid[y][x] === "#" || !!npcAt(x, y);
  };

  // Outdoor maps give `world` (see art/world.js); solid cells and building doors are derived from it.
  const BLOCKING = "TcrwSv";
  const fromWorld = (w) => {
    const solid = w.cells.map((row) => [...row].map((k) => (BLOCKING.includes(k) ? "#" : ".")));
    const warps = [];
    for (const b of w.buildings || []) {
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) solid[y][x] = "#";
      const dx = b.x + b.door, dy = b.y + b.h - 1;
      solid[dy][dx] = ".";
      warps.push({ x: dx, y: dy, to: b.to, tx: b.tx, ty: b.ty, dir: b.dir ?? 1 });
    }
    return { solid: solid.map((r) => r.join("")), warps };
  };
  G.newPlayer = () => ({ name: "", flags: {}, bag: {}, party: [] });
  G.register = (key, def) => {
    if (def.world) {
      Object.assign(def, fromWorld(def.world), { warps: [...fromWorld(def.world).warps, ...(def.warps || [])] });
      WORLDS[key] = def.world;
    } else ROOMS[key] = def.room;
    maps[key] = def;
  };

  G.step = (a, d) => { a.x += DX[d]; a.y += DY[d]; };

  // Shortest walk (list of directions) from (x, y) to (tx, ty) through free cells; used by scripts to send people to the player.
  G.path = (x, y, tx, ty) => {
    const free = (cx, cy) => !blocked(cx, cy) && !(cx === G.state.x && cy === G.state.y);
    const from = new Map([[`${x},${y}`, null]]), queue = [[x, y]];
    while (queue.length) {
      const [cx, cy] = queue.shift();
      if (cx === tx && cy === ty) break;
      for (let d = 0; d < 4; d++) {
        const nx = cx + DX[d], ny = cy + DY[d], k = `${nx},${ny}`;
        if (!from.has(k) && (free(nx, ny) || (nx === tx && ny === ty))) { from.set(k, [cx, cy, d]); queue.push([nx, ny]); }
      }
    }
    const out = [];
    for (let at = from.get(`${tx},${ty}`); at; at = from.get(`${at[0]},${at[1]}`)) out.unshift(at[2]);
    return out;
  };

  // People that wander when idle: wander "spin" turns on the spot, "vertical" paces one cell up and down from where it stands.
  function wander() {
    for (const o of G.state.objects) {
      if (!o.wander) continue;
      o.home ||= { x: o.x, y: o.y };
      o.wait = (o.wait ?? 40 + Math.random() * 120) - 1;
      if (o.wait > 0) continue;
      o.wait = 60 + Math.random() * 180;
      if (o.wander === "spin") { o.dir = Math.floor(Math.random() * 4); continue; }
      const d = Math.random() < 0.5 ? 0 : 1, ny = o.y + DY[d];
      if (Math.abs(ny - o.home.y) <= 1 && !blocked(o.x, ny) && !(o.x === G.state.x && ny === G.state.y)) { o.dir = d; o.y = ny; }
    }
  }

  G.warp = async (key, x, y, dir) => {
    const def = maps[key];
    Object.assign(G.state, { map: { key }, x, y, dir, boxes: [], objects: (def.npcs || []).filter((n) => !n.hideIf || !G.player.flags[n.hideIf]).map((n) => ({ ...n })) });
    moving = turning = 0;
    if (def.enter) await G.run(def.enter);
  };

  G.run = async (fn) => {
    if (G.script) return;
    G.script = fn;
    try { await fn(scriptApi(G)); } finally { G.state.dialogue = null; G.state.boxes = []; G.script = null; Input.clear(); }
  };

  function interact() {
    const { x, y, dir } = G.state, tx = x + DX[dir], ty = y + DY[dir];
    const npc = npcAt(tx, ty);
    if (npc) {
      if (npc.faces !== false) npc.dir = [1, 0, 3, 2][dir]; // look back at the player
      if (npc.script) G.run(npc.script);
      return;
    }
    const sign = (here().signs || []).find((g) => g.x === tx && g.y === ty);
    if (sign) G.run(sign.script);
  }

  function tick() {
    Input.poll();
    if (G.script || G.state.screen) return;
    const { state } = G;
    wander();
    if (moving) {
      if (--moving > 0) return;
      const m = here(), w = (m.warps || []).find((g) => g.x === state.x && g.y === state.y);
      if (w) G.warp(w.to, w.tx, w.ty, w.dir);
      else { const c = (m.coords || []).find((g) => g.x === state.x && g.y === state.y); if (c) G.run(c.script); }
      return;
    }
    if (Input.pressed("A")) return interact();
    const d = Input.dir();
    if (d === null) return;
    if (d !== state.dir) { state.dir = d; turning = TURN; return; }
    if (turning > 0) { turning--; return; }
    const nx = state.x + DX[d], ny = state.y + DY[d];
    if (blocked(nx, ny)) return;
    G.step(state, d);
    moving = STEP;
  }

  // Starts the frame loop and the renderer. Screens before the first map (splash, title...) are driven by game/flow.js.
  G.start = (rootEl, player) => {
    G.root = rootEl;
    G.player = player;
    if (G.running) return;
    G.running = true;
    let last = performance.now(), acc = 0;
    const loop = (now) => {
      acc += Math.min(now - last, 100); last = now;
      for (; acc >= 1000 / 60; acc -= 1000 / 60) tick();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    HD.start(rootEl, Scenes, () => G.state);
  };
  return G;
})();

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
    state: { screen: "splash", map: { key: "" }, x: 0, y: 0, dir: 0, objects: [], dialogue: null, boxes: [], menu: null, prof: null, pic: null, panel: null },
  };
  let moving = 0, turning = 0;
  G.msgMs = 900; // how long battle messages stay up (tests shorten it)
  G.picked = null; // set by tapping a menu button (see scenes/battle.js)
  G.pick = (i) => { G.picked = i; };

  const here = () => maps[G.state.map.key];
  const kindAt = (x, y) => { const w = here().world; return w && y >= 0 && y < w.rows && x >= 0 && x < w.cols ? w.cells[y][x] : null; };
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
  // Money is "BUDS" (Gold starts you with 3000, so do we).
  G.CURRENCY = "BUDS";
  G.newPlayer = () => ({ name: "", id: 10000 + rand(90000), money: 3000, play: 0, options: { speed: "mid" }, flags: {}, bag: {}, party: [], box: [] });
  G.register = (key, def) => {
    if (def.world) {
      Object.assign(def, fromWorld(def.world), { warps: [...fromWorld(def.world).warps, ...(def.warps || [])] });
      WORLDS[key] = def.world;
    } else ROOMS[key] = def.room;
    for (const n of def.npcs || []) if (n.trainer && !n.script) n.script = G.trainerScript(n);
    maps[key] = def;
  };

  // A script that says each line in turn (a line may be a function of the script API, e.g. to use the player's name).
  G.talk = (...lines) => async (s) => { for (const l of lines) await s.say(typeof l === "function" ? l(s) : l); };

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

  // People that wander when idle: wander "spin" turns on the spot, "vertical" / "horizontal" pace one cell either way from where they stand.
  function wander() {
    for (const o of G.state.objects) {
      if (!o.wander) continue;
      o.home ||= { x: o.x, y: o.y };
      o.wait = (o.wait ?? 40 + Math.random() * 120) - 1;
      if (o.wait > 0) continue;
      o.wait = 60 + Math.random() * 180;
      if (o.wander === "spin") { o.dir = Math.floor(Math.random() * 4); continue; }
      const d = (o.wander === "horizontal" ? 2 : 0) + (Math.random() < 0.5 ? 0 : 1), nx = o.x + DX[d], ny = o.y + DY[d];
      if (Math.abs(nx - o.home.x) <= 1 && Math.abs(ny - o.home.y) <= 1 && !blocked(nx, ny) && !(nx === G.state.x && ny === G.state.y)) { o.dir = d; o.x = nx; o.y = ny; }
    }
  }

  G.warp = async (key, x, y, dir) => {
    const def = maps[key];
    Object.assign(G.state, { map: { key }, x, y, dir, boxes: [], objects: (def.npcs || []).filter((n) => (!n.hideIf || !G.player.flags[n.hideIf]) && (!n.showIf || G.player.flags[n.showIf])).map((n) => ({ ...n })) });
    moving = turning = 0;
    if (def.enter) await G.run(def.enter);
  };

  G.run = async (fn) => {
    if (G.script) return;
    G.script = fn;
    try { await fn(scriptApi(G)); } finally { G.state.dialogue = null; G.state.boxes = []; G.script = null; Input.clear(); }
  };

  // Wild encounters, as in Gold: on tall grass each step rolls against the map's rate for the time of day; the species comes
  // from 7 slots weighted 30/30/20/10/5/4/1 %, and the level is bumped by 0-4.
  const PROBS = [30, 60, 80, 90, 95, 99, 100];
  function encounter(m) {
    const wild = m.wild;
    if (!wild || kindAt(G.state.x, G.state.y) !== "g" || rand(256) >= Math.floor((wild.rate * 256) / 100)) return;
    const roll = rand(100) + 1, [level, species] = wild[timeOfDay()][PROBS.findIndex((p) => roll <= p)];
    const r = rand(256), bump = r < 89 ? 0 : r < 166 ? 1 : r < 217 ? 2 : r < 242 ? 3 : 4; // 35 / 65 / 85 / 95 percent of 256
    G.run(async (s) => {
      if ((await Game.battle(s, makeMon(species, level + bump))) === "lost") await Game.whiteout(s);
    });
  }
  // Out of usable buddymon: lose half your money, everyone is healed, and you wake up at home.
  G.whiteout = async (s) => {
    await s.say(`${G.player.name} is out of usable BUDDYMON!`);
    G.player.money = Math.floor(G.player.money / 2);
    await s.say(`${G.player.name} panicked and dropped half of their ${G.CURRENCY}...`);
    for (const m of G.player.party) { m.hp = statsFor(m).hp; for (const mv of m.moves) mv.pp = MOVES[mv.id].pp; }
    const home = G.player.lastCenter || { map: "livingroom", x: 7, y: 6, dir: 1 }; // the last Center you healed at, else home
    G.state.map = { key: home.map };
    Object.assign(G.state, { x: home.x, y: home.y, dir: home.dir, objects: (maps[home.map].npcs || []).map((n) => ({ ...n })) });
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
      else { const c = (m.coords || []).find((g) => g.x === state.x && g.y === state.y), t = !c && G.trainerSees(); if (c) G.run(c.script); else if (t) G.run(t.script); else encounter(m); }
      return;
    }
    if (Input.pressed("START")) return G.run(Game.startMenu);
    if (Input.pressed("A")) return interact();
    const d = Input.dir();
    if (d === null) return;
    if (d !== state.dir) { state.dir = d; turning = TURN; return; }
    if (turning > 0) { turning--; return; }
    const nx = state.x + DX[d], ny = state.y + DY[d];
    // A ledge is jumped one way only (down): you land two cells on, past the lip.
    if (d === 0 && kindAt(nx, ny) === "v" && !blocked(nx, ny + 1)) { state.x = nx; state.y = ny + 1; moving = STEP + 8; return; }
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

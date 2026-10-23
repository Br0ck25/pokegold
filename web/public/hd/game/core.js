// The native game engine: grid movement like Gold's (docs/ENGINE.md). Emits the same `state` the HD scenes read.
// Map module: { room: {art, cols, rows, label}, solid: [rows of "#"/"."], warps: [{x,y,to,tx,ty,dir}],
//   npcs: [{id, name, x, y, dir, script}], signs: [{x, y, script}], enter: async (s) => {} }
const Game = (() => {
  const STEP = 16, TURN = 6; // frames per step (~0.27s at 60 fps), frames spent turning on the spot
  const DX = [0, 0, -1, 1], DY = [1, -1, 0, 0]; // down, up, left, right
  const maps = {};
  const G = {
    maps, root: null, running: false, player: null, script: null,
    state: { scene: 0, map: { key: "" }, x: 0, y: 0, dir: 0, objects: [], dialogue: null, boxes: [], battle: null, naming: null, rows: [], tiles: [] },
  };
  let moving = 0, turning = 0;

  const here = () => maps[G.state.map.key];
  const npcAt = (x, y) => G.state.objects.find((o) => o.x === x && o.y === y);
  const blocked = (x, y) => {
    const m = here();
    return x < 0 || y < 0 || y >= m.solid.length || x >= m.solid[0].length || m.solid[y][x] === "#" || !!npcAt(x, y);
  };

  G.register = (key, def) => {
    maps[key] = def;
    ROOMS[key] = def.room;
    Scenes.room.maps = Object.keys(ROOMS);
  };

  G.step = (a, d) => { a.x += DX[d]; a.y += DY[d]; };

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
    if (G.script) return;
    const { state } = G;
    if (moving) {
      if (--moving > 0) return;
      const m = here(), w = (m.warps || []).find((g) => g.x === state.x && g.y === state.y);
      if (w) G.warp(w.to, w.tx, w.ty, w.dir);
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
    HD.startNative(rootEl, Scenes, () => G.state);
  };
  return G;
})();

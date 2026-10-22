// Single-screen rooms. Cell (x, y) is 100 art units; the hero and other people are positioned from game state.
const ROOMS = {
  7: { art: "room", cols: 8, rows: 6, label: "Home · Your Room" }, // PLAYERS_HOUSE_2F
  6: { art: "room1F", cols: 10, rows: 8, label: "Home · Living Room" }, // PLAYERS_HOUSE_1F
};
const NPC_ART = { 12: "momSprite" }; // SPRITE_* id -> Art function (see constants/sprite_constants.asm)

Scenes.room = function (root) {
  const el = h(`<div class="scene room"><div class="vignette"></div><div class="room-wrap"></div><div class="loc"></div></div>`);
  root.appendChild(el);
  const wrap = el.querySelector(".room-wrap"), loc = el.querySelector(".loc");
  const dlg = dialogue(el);
  let room = null, map = null, hero = null, actors = new Map();

  const build = (number) => {
    map = number;
    room = ROOMS[number];
    wrap.innerHTML = Art[room.art]();
    loc.textContent = room.label;
    hero = newActor("hero");
    actors = new Map();
  };
  const newActor = (cls) => {
    const a = h(`<div class="actor ${cls}"></div>`);
    a.style.width = `${(117 / (room.cols * 100 + 40)) * 100}%`;
    wrap.appendChild(a);
    return a;
  };
  const place = (a, x, y) => {
    a.style.left = `${((x * 100 + 50 + 20) / (room.cols * 100 + 40)) * 100}%`;
    a.style.top = `${((y * 100 + 92 + 20) / (room.rows * 100 + 40)) * 100}%`;
  };
  // Keep an actor's sprite, glide and walk flag in step with its game position.
  const sync = (a, draw, x, y, dir) => {
    if (a.dataset.dir !== String(dir)) { a.dataset.dir = dir; a.innerHTML = draw(dir); }
    if (a.dataset.x !== String(x) || a.dataset.y !== String(y)) {
      if (a.dataset.x !== undefined) a.walkUntil = performance.now() + 400;
      a.dataset.x = x; a.dataset.y = y;
      place(a, x, y);
    }
    a.classList.toggle("walk", performance.now() < (a.walkUntil || 0));
  };

  return {
    update(state) {
      if (state.map.number !== map) build(state.map.number);
      sync(hero, Art.heroSprite, state.x, state.y, state.dir);
      const seen = new Set();
      for (const o of state.objects) {
        const draw = Art[NPC_ART[o.sprite]];
        if (!draw) continue;
        seen.add(o.id);
        if (!actors.has(o.id)) actors.set(o.id, newActor("npc"));
        sync(actors.get(o.id), draw, o.x, o.y, o.dir);
      }
      for (const [id, a] of actors) if (!seen.has(id)) { a.remove(); actors.delete(id); }
      dlg.update(state.dialogue);
    },
  };
};
Scenes.room.maps = Object.keys(ROOMS).map(Number);

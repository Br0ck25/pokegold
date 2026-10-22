// The hero and other people drawn over a room or world, kept in step with game state.
// box = { w, h, ox, oy }: art units across/down and the origin offset; cell (x, y) is 100 units.
function actorLayer(wrap, box) {
  const spriteName = Object.fromEntries(Object.entries(HD_SPRITE).map(([name, id]) => [id, name]));
  const npcs = new Map();
  const spawn = (cls) => {
    const a = h(`<div class="actor ${cls}"></div>`);
    a.style.width = `${(117 / box.w) * 100}%`;
    wrap.appendChild(a);
    return a;
  };
  const person = (look) => (dir) => Art.person(dir, look);
  const sync = (a, draw, x, y, dir) => {
    if (a.dataset.dir !== String(dir)) { a.dataset.dir = dir; a.innerHTML = draw(dir); }
    if (a.dataset.x !== String(x) || a.dataset.y !== String(y)) {
      if (a.dataset.x !== undefined) a.walkUntil = performance.now() + 400;
      a.dataset.x = x; a.dataset.y = y;
      a.style.left = `${((x * 100 + 50 + box.ox) / box.w) * 100}%`;
      a.style.top = `${((y * 100 + 92 + box.oy) / box.h) * 100}%`;
    }
    a.classList.toggle("walk", performance.now() < (a.walkUntil || 0));
  };
  const hero = spawn("hero");
  return {
    hero,
    update(state) {
      sync(hero, person(Art.looks.HERO), state.x, state.y, state.dir);
      const seen = new Set();
      for (const o of state.objects) {
        seen.add(o.id);
        if (!npcs.has(o.id)) npcs.set(o.id, spawn("npc"));
        const name = spriteName[o.sprite];
        sync(npcs.get(o.id), Art.props[name] || person(Art.looks[name] || Art.looks.OTHER), o.x, o.y, o.dir);
      }
      for (const [id, a] of npcs) if (!seen.has(id)) { a.remove(); npcs.delete(id); }
    },
  };
}

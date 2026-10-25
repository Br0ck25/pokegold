// The hero and other people drawn over a room or world, kept in step with game state.
// box = { w, h, ox, oy }: art units across/down and the origin offset; cell (x, y) is 100 units.
function actorLayer(wrap, box) {
  const npcs = new Map();
  const spawn = (cls) => {
    const a = h(`<div class="actor ${cls}"><div class="sprite"></div><i class="emote">!</i></div>`);
    a.style.width = `${(104 / box.w) * 100}%`;
    wrap.appendChild(a);
    return a;
  };
  const person = (look) => (dir) => Art.person(dir, look);
  const sync = (a, draw, x, y, dir) => {
    if (a.dataset.dir !== String(dir)) { a.dataset.dir = dir; a.querySelector(".sprite").innerHTML = draw(dir); }
    if (a.dataset.x !== String(x) || a.dataset.y !== String(y)) {
      const first = a.dataset.x === undefined;
      if (!first) a.walkUntil = performance.now() + 400;
      else a.style.transition = "none"; // appear in place instead of gliding in from the corner
      a.dataset.x = x; a.dataset.y = y;
      a.style.zIndex = y * 2 + (a.classList.contains("hero") ? 1 : 0); // whoever stands lower is drawn in front
      a.style.left = `${((x * 100 + 50 + box.ox) / box.w) * 100}%`;
      a.style.top = `${((y * 100 + 92 + box.oy) / box.h) * 100}%`;
      if (first) { a.offsetWidth; a.style.transition = ""; }
    }
    a.classList.toggle("walk", performance.now() < (a.walkUntil || 0));
  };
  const shout = (a, on) => a.classList.toggle("shout", !!on);
  const hero = spawn("hero");
  return {
    hero,
    update(state) {
      sync(hero, person(Art.heroLook()), state.x, state.y, state.dir);
      const seen = new Set();
      for (const o of state.objects) {
        seen.add(o.id);
        if (!npcs.has(o.id)) npcs.set(o.id, spawn("npc"));
        const a = npcs.get(o.id);
        const name = o.name;
        if (a.dataset.look !== String(name)) { a.dataset.look = name; delete a.dataset.dir; }
        shout(a, o.emote);
        sync(a, Art.props[name] || person(Art.look(name, o.id, state.map.key)), o.x, o.y, o.dir);
      }
      for (const [id, a] of npcs) if (!seen.has(id)) { a.remove(); npcs.delete(id); }
    },
  };
}

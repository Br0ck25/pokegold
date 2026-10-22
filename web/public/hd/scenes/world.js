// Outdoor maps (HD_MAPS in maps.js, made by gen-maps.py). One cell = 10cqw; the camera keeps the hero centred.
const WORLD_MARGIN = 3; // blocks of border drawn around the map

Scenes.world = function (root) {
  const el = h(`<div class="scene world"><div class="world-map"></div><div class="loc"></div></div>`);
  root.appendChild(el);
  const world = el.querySelector(".world-map"), loc = el.querySelector(".loc");
  const dlg = dialogue(el);
  const menus = popups(el);
  let map = null, people = null;

  const build = (number) => {
    const m = HD_MAPS[`${HD_GROUP}:${number}`];
    map = number;
    world.innerHTML = Art.world(m, WORLD_MARGIN);
    world.style.width = `${(m.w + WORLD_MARGIN * 2) * 20}cqw`;
    loc.textContent = m.label;
    const edge = WORLD_MARGIN * 200;
    people = actorLayer(world, { w: (m.w + WORLD_MARGIN * 2) * 200, h: (m.h + WORLD_MARGIN * 2) * 200, ox: edge, oy: edge });
    world.style.transition = "none"; // no glide on the first placement
    requestAnimationFrame(() => requestAnimationFrame(() => (world.style.transition = "")));
  };

  return {
    update(state) {
      if (state.map.number !== map) build(state.map.number);
      const cell = (n) => (n + WORLD_MARGIN * 2 + 0.5) * 10; // hero cell centre, in cqw from the map's top-left
      world.style.transform = `translate(calc(50cqw - ${cell(state.x)}cqw), calc(44cqh - ${cell(state.y)}cqw))`;
      people.update(state);
      dlg.update(state.dialogue);
      menus.update(state.boxes);
    },
  };
};
Scenes.world.maps = Object.keys(HD_MAPS).filter((k) => k.startsWith(`${HD_GROUP}:`)).map((k) => +k.split(":")[1]);

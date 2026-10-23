// Outdoor maps (WORLDS, filled by Game.register). One cell = 10cqw; the camera keeps the hero centred.
const WORLDS = {};
const WORLD_MARGIN = 6; // cells of forest drawn around the map

Scenes.world = function (root) {
  const el = h(`<div class="scene world"><div class="world-map"></div><div class="loc"></div></div>`);
  root.appendChild(el);
  const view = el.querySelector(".world-map"), loc = el.querySelector(".loc");
  const dlg = dialogue(el);
  const menus = popups(el);
  const pic = picLayer(el);
  let map = null, people = null;

  const build = (key) => {
    const w = WORLDS[key];
    map = key;
    view.innerHTML = Art.world(w, WORLD_MARGIN);
    view.style.width = `${(w.cols + WORLD_MARGIN * 2) * 10}cqw`;
    loc.textContent = w.label;
    const edge = WORLD_MARGIN * 100;
    people = actorLayer(view, { w: (w.cols + WORLD_MARGIN * 2) * 100, h: (w.rows + WORLD_MARGIN * 2) * 100, ox: edge, oy: edge });
    view.style.transition = "none"; // no glide on the first placement
    requestAnimationFrame(() => requestAnimationFrame(() => (view.style.transition = "")));
  };

  return {
    update(state) {
      if (state.map.key !== map) build(state.map.key);
      const cell = (n) => (n + WORLD_MARGIN + 0.5) * 10; // cell centre, in cqw from the map's top-left
      view.style.transform = `translate(calc(50cqw - ${cell(state.x)}cqw), calc(44cqh - ${cell(state.y)}cqw))`;
      people.update(state);
      dlg.update(state.dialogue);
      menus.update(state.boxes);
      pic.update(state.pic);
    },
  };
};

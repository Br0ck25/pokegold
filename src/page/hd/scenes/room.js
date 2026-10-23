// Single-screen rooms, keyed by map key. Cell (x, y) is 100 art units; people are positioned from game state (ui/actors.js).
// Rooms by map key; each game/ map file adds its own entry through Game.register (see game/core.js).
const ROOMS = {};

Scenes.room = function (root) {
  const el = h(`<div class="scene room"><div class="vignette"></div><div class="room-wrap"></div><div class="loc"></div></div>`);
  root.appendChild(el);
  const wrap = el.querySelector(".room-wrap"), loc = el.querySelector(".loc");
  const dlg = dialogue(el);
  const menus = popups(el);
  const pic = picLayer(el);
  const panel = panelLayer(el);
  let map = null, people = null, snap = true;

  const build = (key) => {
    const room = ROOMS[key];
    map = key;
    snap = true; // no glide on the first placement
    wrap.innerHTML = Art[room.art](room);
    loc.textContent = room.label;
    people = actorLayer(wrap, { w: room.cols * 100 + 40, h: room.rows * 100 + 40, ox: 20, oy: 20 });
  };

  return {
    update(state) {
      if (state.map.key !== map) build(state.map.key);
      people.update(state);
      const stageH = el.clientHeight, stageW = el.clientWidth, room = ROOMS[map];
      // A wide stage draws rooms with the same tile as the world (8cqw) and the same camera: centred when it fits, else following the hero.
      if (stageW > stageH * 1.1) {
        const w = stageW * 0.08 * (room.cols + 0.4), h = w * (room.rows + 0.4) / (room.cols + 0.4);
        const hx = (parseFloat(people.hero.style.left) / 100) * w, hy = (parseFloat(people.hero.style.top) / 100) * h;
        const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
        wrap.style.width = `${w}px`;
        wrap.style.transform = "none";
        wrap.style.left = `${w <= stageW ? (stageW - w) / 2 : clamp(stageW / 2 - hx, stageW - w, 0)}px`;
        wrap.style.top = `${h <= stageH ? (stageH - h) / 2 : clamp(stageH * 0.45 - hy, stageH - h, 0)}px`;
        wrap.style.transition = snap ? "none" : "";
        snap = false;
        dlg.update(state.dialogue); menus.update(state.boxes); pic.update(state.pic); panel.update(state.panel);
        return;
      }
      wrap.style.left = "";
      wrap.style.width = "";
      const roomH = wrap.offsetHeight, view = stageH * 0.68;
      // Rooms taller than the stage scroll to keep the hero in view.
      if (roomH > view) {
        const heroY = (parseFloat(people.hero.style.top) / 100) * roomH;
        wrap.style.transform = "translateX(-50%)";
        wrap.style.top = `${Math.min(stageH * 0.04, Math.max(view - roomH + stageH * 0.04, stageH * 0.34 - heroY))}px`;
      } else { wrap.style.transform = ""; wrap.style.top = ""; }
      dlg.update(state.dialogue);
      menus.update(state.boxes);
      pic.update(state.pic);
      panel.update(state.panel);
    },
  };
};

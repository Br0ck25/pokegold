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
  let map = null, people = null;

  const build = (key) => {
    const room = ROOMS[key];
    map = key;
    wrap.innerHTML = Art[room.art](room);
    loc.textContent = room.label;
    people = actorLayer(wrap, { w: room.cols * 100 + 40, h: room.rows * 100 + 40, ox: 20, oy: 20 });
  };

  return {
    update(state) {
      if (state.map.key !== map) build(state.map.key);
      people.update(state);
      const stageH = el.clientHeight, stageW = el.clientWidth, room = ROOMS[map];
      // A wide stage draws rooms at least as big as the world's tiles (the whole room when it fits, else scrolling with the hero).
      if (stageW > stageH * 1.1) {
        const fit = (stageH * 0.9) / (room.rows + 0.4), big = Math.min(stageW * 0.075, (stageW * 0.98) / (room.cols + 0.4));
        wrap.style.width = `${Math.min(Math.max(fit, big) * (room.cols + 0.4), stageW * 0.98)}px`;
        const roomH = wrap.offsetHeight;
        if (roomH > stageH * 0.94) {
          const heroY = (parseFloat(people.hero.style.top) / 100) * roomH;
          wrap.style.transform = "translateX(-50%)";
          wrap.style.top = `${Math.min(stageH * 0.03, Math.max(stageH * 0.97 - roomH, stageH * 0.45 - heroY))}px`;
        } else { wrap.style.transform = ""; wrap.style.top = "50%"; }
        dlg.update(state.dialogue); menus.update(state.boxes); pic.update(state.pic); panel.update(state.panel);
        return;
      }
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

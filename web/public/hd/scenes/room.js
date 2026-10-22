// Single-screen rooms, keyed "group:number". Cell (x, y) is 100 art units; people are positioned from game state (ui/actors.js).
const ROOMS = {
  "24:7": { art: "room", cols: 8, rows: 6, label: "Home · Your Room" }, // PLAYERS_HOUSE_2F
  "24:6": { art: "room1F", cols: 10, rows: 8, label: "Home · Living Room" }, // PLAYERS_HOUSE_1F
  "24:5": { art: "elmsLab", cols: 10, rows: 12, label: "New Bark Town · Willow's Lab" }, // ELMS_LAB
  "24:8": { art: "neighborHouse", cols: 8, rows: 8, label: "New Bark Town · Neighbor's House" }, // PLAYERS_NEIGHBORS_HOUSE
  "24:9": { art: "elmsHouse", cols: 8, rows: 8, label: "New Bark Town · Willow's House" }, // ELMS_HOUSE
};

Scenes.room = function (root) {
  const el = h(`<div class="scene room"><div class="vignette"></div><div class="room-wrap"></div><div class="loc"></div></div>`);
  root.appendChild(el);
  const wrap = el.querySelector(".room-wrap"), loc = el.querySelector(".loc");
  const dlg = dialogue(el);
  const menus = popups(el);
  let map = null, people = null;

  const build = (key) => {
    const room = ROOMS[key];
    map = key;
    wrap.innerHTML = Art[room.art]();
    loc.textContent = room.label;
    people = actorLayer(wrap, { w: room.cols * 100 + 40, h: room.rows * 100 + 40, ox: 20, oy: 20 });
  };

  return {
    update(state) {
      if (state.map.key !== map) build(state.map.key);
      people.update(state);
      // Rooms taller than the stage scroll to keep the hero in view.
      const stageH = el.clientHeight, roomH = wrap.offsetHeight, view = stageH * 0.68;
      if (roomH > view) {
        const heroY = (parseFloat(people.hero.style.top) / 100) * roomH;
        wrap.style.transform = "translateX(-50%)";
        wrap.style.top = `${Math.min(stageH * 0.04, Math.max(view - roomH + stageH * 0.04, stageH * 0.34 - heroY))}px`;
      } else { wrap.style.transform = ""; wrap.style.top = ""; }
      dlg.update(state.dialogue);
      menus.update(state.boxes);
    },
  };
};
Scenes.room.maps = Object.keys(ROOMS);

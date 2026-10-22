Scenes.room = function (root) {
  const el = h(`<div class="scene room">
    <div class="vignette"></div>
    <div class="room-wrap">${Art.room()}<div class="hero"></div></div>
    <div class="loc">Home · Your Room</div>
  </div>`);
  root.appendChild(el);
  const hero = el.querySelector(".hero");
  const dlg = dialogue(el);
  let dir = -1, px = null, py = null, walkUntil = 0;
  const place = (x, y) => {
    hero.style.left = `${((x * 100 + 50 + 20) / 840) * 100}%`;
    hero.style.top = `${((y * 100 + 92 + 20) / 640) * 100}%`;
  };
  return {
    update(state) {
      if (state.dir !== dir) { dir = state.dir; hero.innerHTML = Art.heroSprite(dir); }
      if (state.x !== px || state.y !== py) {
        if (px !== null) walkUntil = performance.now() + 400;
        px = state.x; py = state.y;
        place(px, py);
      }
      hero.classList.toggle("walk", performance.now() < walkUntil);
      dlg.update(state.dialogue);
    },
  };
};

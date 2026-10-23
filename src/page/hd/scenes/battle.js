// Battle screen. state.battle = { foe, me: { species, name, level, hp, max }, menu: { kind, cols, items: [{label, sel}] } | null, net: { shakes, caught } | null }.
// Menu buttons answer taps through Game.pick(index); messages use the shared dialogue box.
Scenes.battle = function (root) {
  const el = h(`<div class="scene battle">
    <div class="bt-bg"></div>
    <div class="bt-side foe"><i class="plat"></i><div class="mon"></div><div class="bt-net" hidden>${Art.net()}</div></div>
    <div class="bt-side me"><i class="plat"></i><div class="mon"></div></div>
    <div class="bt-card foe"><b class="nm"></b><i class="gd"></i><span class="lv"></span><div class="hp"><i></i></div></div>
    <div class="bt-card me"><b class="nm"></b><i class="gd"></i><span class="lv"></span><div class="hp"><i></i></div><span class="num"></span></div>
    <div class="bt-menu" hidden></div>
  </div>`);
  root.appendChild(el);
  const dlg = dialogue(el);
  const menus = popups(el);
  const side = (cls) => ({ mon: el.querySelector(`.bt-side.${cls} .mon`), card: el.querySelector(`.bt-card.${cls}`), species: null, hp: null });
  const sides = { foe: side("foe"), me: side("me") };
  const menu = el.querySelector(".bt-menu"), net = el.querySelector(".bt-net"), foeMon = sides.foe.mon;
  let lastMenu = "", lastNet = null;
  menu.addEventListener("pointerdown", (e) => { const b = e.target.closest("button"); if (b) Game.pick(+b.dataset.i); });

  const update = (who, mon) => {
    const s = sides[who];
    if (mon.species !== s.species) {
      s.species = mon.species;
      s.mon.innerHTML = Art.creature(mon.species);
      s.mon.classList.remove("enter"); void s.mon.offsetWidth; s.mon.classList.add("enter");
    }
    if (s.hp !== null && mon.hp < s.hp) { s.mon.classList.remove("hit"); void s.mon.offsetWidth; s.mon.classList.add("hit"); }
    s.hp = mon.hp;
    s.mon.classList.toggle("faint", mon.hp === 0);
    s.card.querySelector(".nm").textContent = mon.name;
    const gd = s.card.querySelector(".gd");
    gd.textContent = mon.gender === "F" ? "♀" : mon.gender === "M" ? "♂" : "";
    gd.className = `gd ${mon.gender === "F" ? "f" : "m"}`;
    s.card.querySelector(".lv").textContent = `Lv ${mon.level}`;
    const pct = mon.max ? Math.round((mon.hp / mon.max) * 100) : 0, bar = s.card.querySelector(".hp i");
    bar.style.width = `${pct}%`;
    bar.dataset.level = pct > 50 ? "ok" : pct > 20 ? "warn" : "low";
    const num = s.card.querySelector(".num");
    if (num) num.textContent = `${mon.hp} / ${mon.max}`;
  };

  return {
    update(state) {
      const b = state.battle;
      if (!b) return;
      update("foe", b.foe);
      update("me", b.me);
      dlg.update(state.dialogue);
      menus.update(state.boxes);
      const nkey = JSON.stringify(b.net);
      if (nkey !== lastNet) {
        lastNet = nkey;
        net.hidden = !b.net;
        foeMon.classList.toggle("netted", !!b.net);
        if (b.net) { net.style.setProperty("--shakes", b.net.shakes + 1); net.classList.remove("go"); void net.offsetWidth; net.classList.add("go"); }
      }
      const key = JSON.stringify(b.menu);
      if (key === lastMenu) return;
      lastMenu = key;
      menu.hidden = !b.menu;
      if (b.menu) {
        menu.className = `bt-menu ${b.menu.kind} cols${b.menu.cols}`;
        menu.innerHTML = b.menu.items.map((i, n) => `<button data-i="${n}" class="${i.sel ? "sel" : ""}">${esc(i.label)}</button>`).join("");
      }
    },
  };
};

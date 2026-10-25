// Battle screen. Moves animate from state.battle.fx = { n, who, type, anim, hurts, kind } (the move's own effect from battleFx.js, then stat arrows);
// the player's card shows an EXP bar from me.xp (0..1). state.battle = { foe, me: { species, name, level, hp, max }, menu: { kind, cols, items: [{label, sel}] } | null, net: { shakes, caught } | null }.
// Menu buttons answer taps through Game.pick(index); messages use the shared dialogue box.
Scenes.battle = function (root) {
  const el = h(`<div class="scene battle">
    <div class="bt-bg"></div>
    <div class="bt-side foe"><i class="plat"></i><div class="mon"></div><div class="bt-net" hidden>${Art.net()}</div><div class="fx"></div></div>
    <div class="bt-side me"><i class="plat"></i><div class="mon"></div><div class="fx"></div></div>
    <div class="bt-card foe"><b class="nm"></b><i class="gd"></i><span class="lv"></span><em class="st"></em><div class="hp"><i></i></div></div>
    <div class="bt-card me"><b class="nm"></b><i class="gd"></i><span class="lv"></span><em class="st"></em><div class="hp"><i></i></div><span class="num"></span><div class="xp" title="EXP"><i></i></div><span class="xpn"></span></div>
    <div class="bt-menu" hidden></div>
  </div>`);
  root.appendChild(el);
  const dlg = dialogue(el);
  const menus = popups(el);
  const side = (cls) => ({ mon: el.querySelector(`.bt-side.${cls} .mon`), card: el.querySelector(`.bt-card.${cls}`), fx: el.querySelector(`.bt-side.${cls} .fx`), species: null, hp: null });
  const sides = { foe: side("foe"), me: side("me") };
  const menu = el.querySelector(".bt-menu"), net = el.querySelector(".bt-net"), foeMon = sides.foe.mon;
  let lastMenu = "", lastNet = null, lastFx = 0, lastLevel = 0;
  const COLORS = { normal: "#e8e0d0", fire: "#ff7a3c", water: "#4fb6ff", grass: "#6fd35a", electric: "#ffe03c", dark: "#7a5aa8", flying: "#a8c8ff", poison: "#b45ad9", ground: "#d9a860", rock: "#b8a078", bug: "#a8d83c", ghost: "#8a6ac8", psychic: "#ff7ab8", ice: "#9fe8ff", fighting: "#e0523c", steel: "#b8c4d8", dragon: "#6a5aff" };
  const arrows = (c, up) => `<svg viewBox="0 0 100 100" class="${up ? "up" : "down"}"><g fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${[26, 52, 78].map((y) => `<path d="M26 ${up ? y + 10 : y - 10} L50 ${up ? y - 10 : y + 10} L74 ${up ? y + 10 : y - 10}"/>`).join("")}</g></svg>`;
  const show = (box, html) => { box.innerHTML = html; box.classList.remove("go"); void box.offsetWidth; box.classList.add("go"); };
  const play = (fx) => {
    const att = sides[fx.who], tgt = sides[fx.who === "me" ? "foe" : "me"];
    // Clear every animation class on both sprites first: a class left behind replays its animation when another one is removed.
    for (const side of [att, tgt]) side.mon.classList.remove("lunge-me", "lunge-foe", "wiggle", "hurt");
    void att.mon.offsetWidth;
    if (fx.kind === "move") {
      const how = Art.moveFxHow[fx.anim] || {}, draw = Art.moveFx[fx.anim] || Art.moveFx.tackle;
      if (how.contact) att.mon.classList.add(`lunge-${fx.who}`);
      if (how.wiggle) att.mon.classList.add("wiggle");
      if (fx.hurts) setTimeout(() => tgt.mon.classList.add("hurt"), how.contact ? 220 : 380);
      const box = (how.self ? att : tgt).fx;
      box.dataset.dir = fx.who; box.dataset.anim = fx.anim;
      show(box, `<svg viewBox="0 0 100 100" class="a-${fx.anim}">${draw(COLORS[fx.type] || "#fff")}</svg>`);
      return;
    }
    const box = (fx.kind === "up" ? att : tgt).fx;
    delete box.dataset.anim;
    show(box, arrows(fx.kind === "up" ? "#46c26f" : "#ff6b5e", fx.kind === "up"));
  };
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
    const nm = s.card.querySelector(".nm");
    if (nm.textContent !== mon.name) { // a long name shrinks until it fits instead of being cut off
      nm.textContent = mon.name; nm.style.fontSize = "";
      const full = parseFloat(getComputedStyle(nm).fontSize);
      for (let f = full; nm.scrollWidth > nm.clientWidth && f > full * 0.5; f -= full * 0.04) nm.style.fontSize = `${f}px`;
    }
    const gd = s.card.querySelector(".gd");
    gd.textContent = mon.gender === "F" ? "♀" : mon.gender === "M" ? "♂" : "";
    gd.className = `gd ${mon.gender === "F" ? "f" : "m"}`;
    s.card.querySelector(".lv").textContent = `Lv ${mon.level}`;
    const pct = mon.max ? Math.round((mon.hp / mon.max) * 100) : 0, bar = s.card.querySelector(".hp i");
    bar.style.width = `${pct}%`;
    bar.dataset.level = pct > 50 ? "ok" : pct > 20 ? "warn" : "low";
    const xp = s.card.querySelector(".xp i");
    if (xp) {
      xp.style.transition = mon.level !== s.level ? "none" : ""; // the bar jumps back to empty on a level-up, it does not drain
      xp.style.width = `${Math.round((mon.xp || 0) * 100)}%`;
    }
    s.level = mon.level;
    const xn = s.card.querySelector(".xpn");
    if (xn) xn.textContent = `EXP ${mon.exp}`;
    const st = s.card.querySelector(".st");
    st.textContent = mon.status ? { slp: "SLP", psn: "PSN", brn: "BRN", par: "PAR", frz: "FRZ" }[mon.status] : "";
    st.dataset.k = mon.status || "";
    const num = s.card.querySelector(".num");
    if (num) num.textContent = `${mon.hp} / ${mon.max}`;
  };

  return {
    update(state) {
      const b = state.battle;
      if (!b) return;
      if (b.fx && b.fx.n !== lastFx) { lastFx = b.fx.n; play(b.fx); }
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
        menu.innerHTML = b.menu.items.map((i, n) => {
          const [name, pp] = b.menu.kind === "moves" ? i.label.split("  ") : [i.label]; // move buttons: name over PP, always the same size
          return `<button data-i="${n}" class="${i.sel ? "sel" : ""}">${esc(name)}${pp ? `<small>${esc(pp)}</small>` : ""}</button>`;
        }).join("");
      }
    },
  };
};

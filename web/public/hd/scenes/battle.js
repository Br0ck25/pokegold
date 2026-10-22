// Battle screen. Names, levels and HP come from RAM (state.battle); the command and move menus are read from the
// tilemap (rows 13-16 / 9-11); battle text uses the shared dialogue box.
Scenes.battle = function (root) {
  const el = h(`<div class="scene battle">
    <div class="bt-bg"></div>
    <div class="bt-side foe"><i class="plat"></i><div class="mon"></div></div>
    <div class="bt-side me"><i class="plat"></i><div class="mon"></div></div>
    <div class="bt-card foe"><b class="nm"></b><span class="lv"></span><div class="hp"><i></i></div></div>
    <div class="bt-card me"><b class="nm"></b><span class="lv"></span><div class="hp"><i></i></div><span class="num"></span></div>
    <div class="cmds" hidden></div>
    <div class="moves" hidden></div>
  </div>`);
  root.appendChild(el);
  const dlg = dialogue(el);
  const side = (cls) => ({ el: el.querySelector(`.bt-side.${cls}`), mon: el.querySelector(`.bt-side.${cls} .mon`), card: el.querySelector(`.bt-card.${cls}`), species: null, hp: null });
  const sides = { foe: side("foe"), me: side("me") };
  const cmds = el.querySelector(".cmds"), moves = el.querySelector(".moves");
  let last = "";

  // Contiguous letters on a tilemap row, with where each word starts, plus the cursor column.
  const words = (state, row) => {
    const out = []; let cursor = -1, prev = -9;
    for (const { col, ch } of HD.cells(state, row)) {
      if (ch === "▶") { cursor = col; prev = -9; continue; }
      if (col === prev + 1 && out.length) out[out.length - 1].text += ch; else out.push({ text: ch, col });
      prev = col;
    }
    return { words: out, cursor };
  };
  const NICE = { FIGHT: "Fight", PACK: "Pack", PKMN: "Buddymon", RUN: "Run" };

  const update = (who, mon, gender) => {
    const s = sides[who];
    s.el.style.visibility = s.card.style.visibility = mon.species ? "" : "hidden"; // nothing sent out yet
    if (mon.species && mon.species !== s.species) {
      s.species = mon.species;
      s.mon.innerHTML = Art.creature(mon.species);
      s.mon.classList.remove("enter"); void s.mon.offsetWidth; s.mon.classList.add("enter");
    }
    const pct = mon.max ? Math.round((mon.hp / mon.max) * 100) : 0;
    if (s.hp !== null && mon.hp < s.hp) { s.mon.classList.remove("hit"); void s.mon.offsetWidth; s.mon.classList.add("hit"); }
    s.hp = mon.hp;
    s.mon.classList.toggle("faint", mon.hp === 0);
    s.card.querySelector(".nm").textContent = mon.name;
    s.card.querySelector(".lv").textContent = `Lv ${mon.level}${gender || ""}`;
    const bar = s.card.querySelector(".hp i");
    bar.style.width = `${pct}%`;
    bar.dataset.level = pct > 50 ? "ok" : pct > 20 ? "warn" : "low";
    const num = s.card.querySelector(".num");
    if (num) num.textContent = `${mon.hp} / ${mon.max}`;
  };

  return {
    update(state) {
      const b = state.battle;
      if (!b) return;
      update("foe", b.enemy, (state.rows[1].match(/[♂♀]/) || [""])[0]);
      update("me", b.player, (state.rows[8].match(/[♂♀]/) || [""])[0]);
      dlg.update(state.dialogue);

      const top = words(state, 14), bottom = words(state, 16);
      const menuOpen = top.words.some((w) => w.text === "FIGHT");
      const key = JSON.stringify([menuOpen, top, bottom, [13, 14, 15, 16].map((r) => state.rows[r]), state.rows[9], state.rows[10], state.rows[11]]);
      if (key === last) return;
      last = key;

      cmds.hidden = !menuOpen;
      if (menuOpen) {
        cmds.innerHTML = [...top.words, ...bottom.words].map((w) => {
          const row = top.words.includes(w) ? top : bottom;
          return `<button class="${row.cursor + 1 === w.col ? "sel" : ""}">${NICE[w.text] || w.text}</button>`;
        }).join("");
      }
      const moveRows = [13, 14, 15, 16].map((r) => ({ r, ...words(state, r) })).filter((m) => m.words.length);
      const inMoves = /TYPE/.test(state.rows[9] || "") && moveRows.length > 0;
      moves.hidden = !inMoves;
      if (inMoves) {
        const type = (words(state, 10).words[0] || { text: "" }).text, pp = (words(state, 11).words[0] || { text: "" }).text;
        moves.innerHTML = `<ul>${moveRows.map((m) => `<li class="${m.cursor >= 0 ? "sel" : ""}">${m.words[0].text === "-" ? "—" : m.words[0].text}</li>`).join("")}</ul>
          <p><b>${type}</b><span>PP ${pp}</span></p>`;
      }
    },
  };
};

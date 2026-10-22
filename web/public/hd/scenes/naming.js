Scenes.naming = function (root) {
  const el = h(`<div class="scene naming">
    <div class="portrait">${Art.hero()}</div>
    <div class="entry"><h2>Your name?</h2><div class="slots"></div></div>
    <div class="kb"></div>
  </div>`);
  el.prepend(h(`<div class="sky warm"></div>`));
  root.appendChild(el);
  const slots = el.querySelector(".slots"), kb = el.querySelector(".kb");
  let last = "";
  return {
    update(state) {
      const firstCol = Math.min(...HD.cells(state, 8).map((c) => c.col));
      const grid = [8, 10, 12, 14].map((r) => {
        const row = Array(9).fill("");
        for (const { col, ch } of HD.cells(state, r)) {
          const i = Math.round((col - firstCol) / 2);
          if (i >= 0 && i < 9) row[i] = ch;
        }
        return row;
      });
      const bottom = HD.text(state, 16, 1, 19);
      const typed = HD.text(state, 6, 3, 19).replace(/\s+/g, "");
      const cur = state.naming || { col: -1, row: -1, max: 7 };
      const key = JSON.stringify([grid, bottom, typed, cur]);
      if (key === last) return;
      last = key;
      slots.innerHTML = Array.from({ length: cur.max || 7 }, (_, i) =>
        `<span class="${i === typed.length ? "on" : ""}">${typed[i] || ""}</span>`).join("");
      const bottomSel = cur.row === 4 ? (cur.col < 3 ? 0 : cur.col < 6 ? 1 : 2) : -1;
      const lower = /^\s*upper/i.test(bottom) ? "ABC" : "abc";
      kb.innerHTML = grid.map((row, r) => row.map((ch, c) =>
        ch ? `<b class="${cur.row === r && cur.col === c ? "sel" : ""}">${ch}</b>` : `<b class="gap"></b>`).join("")).join("") +
        [lower === "abc" ? "abc" : "ABC", "Delete", "Done"].map((t, i) => `<em class="wide ${bottomSel === i ? "sel" : ""}">${t}</em>`).join("");
    },
  };
};

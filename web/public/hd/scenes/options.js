// Options screen: label row + ":VALUE" row pairs on tilemap rows 2-15, CANCEL on row 16.
Scenes.options = function (root) {
  const el = h(`<div class="scene options"><div class="panel"><h2>Options</h2><ul></ul></div></div>`);
  el.prepend(sky());
  el.querySelector(".sky").classList.add("dim");
  root.appendChild(el);
  const ul = el.querySelector("ul");
  const nice = (t) => t.toLowerCase().replace(/(^|\s)\w/g, (c) => c.toUpperCase());
  let last = "";
  return {
    update(state) {
      const items = [];
      for (let r = 2; r <= 16; r += 2) {
        const label = state.rows[r].replace("▶", "").trim();
        if (!label) continue;
        const value = (state.rows[r + 1] || "").replace(":", "").trim();
        items.push({ label: nice(label), value: nice(value), selected: state.rows[r].startsWith("▶") });
      }
      const key = JSON.stringify(items);
      if (key === last) return;
      last = key;
      ul.innerHTML = items.map((i) => i.value
        ? `<li class="${i.selected ? "sel" : ""}"><span>${i.label}</span><b>${i.selected ? "◀ " : ""}${i.value}${i.selected ? " ▶" : ""}</b></li>`
        : `<li class="back ${i.selected ? "sel" : ""}">${i.label === "Cancel" ? "Back" : i.label}</li>`).join("");
    },
  };
};

const MENU_LABELS = { "CONTINUE": "Continue", "NEW GAME": "New Game", "OPTION": "Options", "MYSTERY GIFT": "Mystery Gift" };

Scenes.menu = function (root) {
  const el = h(`<div class="scene menu">
    <div class="logo small">${Art.logo()}</div>
    <ul class="menu-list"></ul>
    <div class="chip" hidden></div>
  </div>`);
  el.prepend(sky());
  root.appendChild(el);
  const list = el.querySelector("ul"), chip = el.querySelector(".chip");
  let last = "";
  return {
    update(state) {
      const items = listItems(state, 2, 14, 1, 10);
      const info = [13, 14, 15, 16, 17].map((r) => HD.text(state, r, 1, 19).replace(/[┌─┐│└┘]/g, "").trim()).filter(Boolean);
      const key = JSON.stringify([items, info]);
      if (key === last) return;
      last = key;
      list.innerHTML = items.map((i) => `<li class="${i.selected ? "sel" : ""}"><b></b>${MENU_LABELS[i.label] || i.label}</li>`).join("");
      chip.hidden = !info.length;
      chip.textContent = info.join("  ");
    },
  };
};

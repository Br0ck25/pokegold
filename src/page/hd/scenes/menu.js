// Title menu: New Game / Continue. state.menu = { items: [{label, selected}], info }.
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
      const key = JSON.stringify(state.menu);
      if (key === last) return;
      last = key;
      list.innerHTML = state.menu.items.map((i) => `<li class="${i.selected ? "sel" : ""}"><b></b>${i.label}</li>`).join("");
      chip.hidden = !state.menu.info;
      chip.textContent = state.menu.info || "";
    },
  };
};

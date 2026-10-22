Scenes.names = function (root) {
  const el = h(`<div class="scene names">
    <div class="portrait">${Art.hero()}</div>
    <div class="panel"><h2>What's your name?</h2><ul></ul></div>
  </div>`);
  el.prepend(h(`<div class="sky warm"></div>`));
  root.appendChild(el);
  const ul = el.querySelector("ul");
  let last = "";
  return {
    update(state) {
      const items = listItems(state, 2, 10, 1, 11);
      const key = JSON.stringify(items);
      if (key === last) return;
      last = key;
      ul.innerHTML = items.map((i) => `<li class="${i.selected ? "sel" : ""}">${i.label === "NEW NAME" ? "New name…" : i.label}</li>`).join("");
    },
  };
};

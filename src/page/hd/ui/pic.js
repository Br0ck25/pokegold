// The big buddymon picture shown while the game introduces one (state.pic = species name), like Gold's pokepic.
function picLayer(parent) {
  const el = h(`<div class="pic" hidden></div>`);
  parent.appendChild(el);
  let shown = null;
  return {
    update(species) {
      if (species === shown) return;
      shown = species;
      el.hidden = !species;
      el.innerHTML = species ? `<div class="pic-art">${Art.creature(species)}</div><div class="pic-name">${species.toUpperCase()}</div>` : "";
    },
  };
}

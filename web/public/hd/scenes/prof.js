// Species shown on the pixel screen -> HD art.
const SPECIES_ART = { 152: "bramblet", 155: "sparkit", 158: "chomplet" };

Scenes.prof = function (root, flags) {
  const el = h(`<div class="scene prof">
    <div class="lab"></div>
    <div class="portrait"></div>
    <div class="creature" hidden></div>
  </div>`);
  el.prepend(h(`<div class="sky warm"></div>`));
  root.appendChild(el);
  const dlg = dialogue(el, "PROF. WILLOW");
  const portrait = el.querySelector(".portrait"), creature = el.querySelector(".creature");
  let who = null, shown = null;
  return {
    update(state) {
      const nextWho = flags.seenNaming ? "hero" : "professor";
      if (nextWho !== who) {
        who = nextWho;
        portrait.innerHTML = Art[who]();
        dlg.setTag(who === "hero" ? (state.name || "YOU") : "PROF. WILLOW");
      }
      dlg.update(state.dialogue);
      const art = SPECIES_ART[state.species] || null;
      if (art !== shown) {
        shown = art;
        creature.hidden = !art;
        creature.innerHTML = art ? Art[art]() : "";
      }
    },
  };
};

// Professor Willow's welcome talk. state.prof = { who: "professor" | "hero", species?: number }; text comes from state.dialogue.
Scenes.prof = function (root) {
  const el = h(`<div class="scene prof">
    <div class="lab"></div>
    <div class="portrait full"></div>
    <div class="creature" hidden></div>
  </div>`);
  el.prepend(h(`<div class="sky warm"></div>`));
  root.appendChild(el);
  const dlg = dialogue(el, "PROF. WILLOW");
  const menus = popups(el);
  const portrait = el.querySelector(".portrait"), creature = el.querySelector(".creature");
  let who = null, shown = null;
  return {
    update(state) {
      const { who: nextWho, species } = state.prof;
      if (nextWho !== who) {
        who = nextWho;
        portrait.innerHTML = Art.person(0, who === "hero" ? Art.heroLook() : Art.looks.WILLOW); // full body, standing, like Gold's intro
        dlg.setTag(who === "hero" ? (Game.player.name || "YOU") : "PROF. WILLOW");
      }
      dlg.update(state.dialogue);
      menus.update(state.boxes);
      if (species !== shown) {
        shown = species;
        creature.hidden = !shown;
        creature.innerHTML = shown ? Art.creature(shown) : "";
      }
    },
  };
};

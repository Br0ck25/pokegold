// The renderer: 30 times a second asks the game for its state and shows the matching scene.
// state.screen names a full-screen scene ("splash", "intro", "title", "menu", "prof"); otherwise the current map's room is shown.
const HD = (() => {
  let root, scenes, current = null, currentId = null;

  const pick = (state) => state.screen || (ROOMS[state.map.key] ? "room" : WORLDS[state.map.key] ? "world" : null);

  function show(id) {
    if (id === currentId) return;
    if (current && current.destroy) current.destroy();
    for (const el of root.querySelectorAll(":scope > .scene")) el.remove(); // keep overlays such as the text-entry form
    current = id ? scenes[id](root) : null;
    currentId = id;
    root.dataset.scene = id || "";
  }

  return {
    last: null,
    start(rootEl, sceneTable, getState) {
      root = rootEl; scenes = sceneTable;
      setInterval(() => {
        const state = getState();
        show(pick(state));
        if (current) current.update(state);
        HD.last = state;
      }, 1000 / 30);
    },
  };
})();

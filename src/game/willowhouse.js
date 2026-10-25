// Willow's house (cells match art/willowHouse.js): PC (0,1), TV (4,1), shelves (6..7,1), table (3..4,3..4). Her husband paces; her son dreams of the lab.
// Gold: ElmsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
(() => {
  const talk = Game.talk;
  Game.indoor("willowhouse", "ElmsHouse", {
    art: "willowHouse", label: "New Bark Town · Willow's House",
    npcs: [
      { id: 1, name: "COOLTRAINER_M", x: 1, y: 5, dir: 0, wander: "vertical", script: Game.said("ElmsHouse", "ElmsWifeText") },
      { id: 2, name: "BUG_CATCHER", x: 5, y: 4, dir: 1, script: Game.said("ElmsHouse", "ElmsSonText") },
    ],
    signs: [
      { x: 0, y: 1, script: Game.said("ElmsHouse", "ElmsHousePCText") },
      { x: 6, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
      { x: 7, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
    ],
  });
})();

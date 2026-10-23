// Willow's house (cells match art/willowHouse.js): PC (0,1), TV (4,1), shelves (6..7,1), table (3..4,3..4). Her husband paces; her son dreams of the lab.
// Gold: ElmsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
(() => {
  const talk = Game.talk;
  Game.indoor("willowhouse", "ElmsHouse", {
    art: "willowHouse", label: "New Bark Town · Willow's House",
    npcs: [
      { id: 1, name: "COOLTRAINER_M", x: 1, y: 5, dir: 0, wander: "vertical", script: talk((s) => `Hi, ${s.name}! My wife's always so busy. I hope she's OK.`, "When she's caught up in her BUDDYMON research, she even forgets to eat.") },
      { id: 2, name: "BUG_CATCHER", x: 5, y: 4, dir: 1, script: talk("When I grow up, I'm going to help my Mom! I'm going to be a great BUDDYMON professor!") },
    ],
    signs: [
      { x: 0, y: 1, script: talk("BUDDYMON. Where do they come from? Where are they going?", "Why has no one ever witnessed a BUDDYMON's birth? I will dedicate my life to finding out!", "...It's part of PROF. WILLOW's research papers.") },
      { x: 6, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
      { x: 7, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
    ],
  });
})();

// Willow's house (cells match art/willowHouse.js): PC (0,1), TV (4,1), shelves (6..7,1), table (3..4,3..4). His wife paces; his son dreams of the lab.
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const blocked = new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 0, 1), ...rect(4, 1, 5, 1), ...rect(6, 1, 7, 1), ...rect(3, 3, 4, 4)]);
  const talk = Game.talk;
  Game.register("willowhouse", {
    room: { art: "willowHouse", cols: 8, rows: 8, label: "New Bark Town · Willow's House" },
    solid: Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join("")),
    warps: [2, 3].map((x) => ({ x, y: 7, to: "newbark", tx: 16, ty: 16, dir: 0 })),
    npcs: [
      { id: 1, name: "TEACHER", x: 1, y: 5, dir: 0, wander: "vertical", script: talk((s) => `Hi, ${s.name}! My husband's always so busy. I hope he's OK.`, "When he's caught up in his BUDDYMON research, he even forgets to eat.") },
      { id: 2, name: "BUG_CATCHER", x: 5, y: 4, dir: 1, script: talk("When I grow up, I'm going to help my Dad! I'm going to be a great BUDDYMON professor!") },
    ],
    signs: [
      { x: 0, y: 1, script: talk("BUDDYMON. Where do they come from? Where are they going?", "Why has no one ever witnessed a BUDDYMON's birth? I will dedicate my life to finding out!", "...It's part of PROF. WILLOW's research papers.") },
      { x: 6, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
      { x: 7, y: 1, script: talk("Shelves of thick BUDDYMON books. They look difficult.") },
    ],
  });
})();

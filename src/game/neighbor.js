// The neighbor's house (cells match art/neighborHouse.js): shelves (0..1,1), TV (2,1), radio (7,1), table (3..4,3..4).
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const blocked = new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 2, 1), ...rect(7, 1, 7, 1), ...rect(3, 3, 4, 4)]);
  Game.register("neighbor", {
    room: { art: "neighborHouse", cols: 8, rows: 8, label: "New Bark Town · Neighbor's House" },
    solid: Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join("")),
    warps: [2, 3].map((x) => ({ x, y: 7, to: "newbark", tx: 16, ty: 7, dir: 0 })),
    npcs: [{ id: 1, name: "TEACHER", x: 6, y: 4, dir: 2, script: async (s) => { await s.say("PROF. WILLOW is a kind man, but his desk is a mountain of notes!"); } }],
    signs: [
      { x: 2, y: 1, script: async (s) => { await s.say("The TV is on a program about faraway BUDDYMON."); } },
      { x: 0, y: 1, script: async (s) => { await s.say("Shelves of research books."); } },
    ],
  });
})();

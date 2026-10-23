// New Bark Town (outdoors): your house, the neighbor's house, Willow's lab, a pond, and the road west to Route 29. 22 x 16 cells, original layout.
(() => {
  const cols = 22, rows = 16;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("."));
  const put = (kind, ...pts) => pts.forEach(([x, y]) => (cells[y][x] = kind));
  for (let x = 0; x < cols; x++) put("T", [x, 0], [x, 1], [x, rows - 1]);
  for (let y = 0; y < rows; y++) { put("T", [cols - 1, y]); if (y < 7 || y > 10) put("T", [0, y]); } // the road west is open at rows 7-10
  for (let y = 10; y < 15; y++) for (let x = 17; x < 21; x++) put("w", [x, y]);
  put("f", [2, 8], [3, 9], [18, 7], [19, 8], [15, 12], [6, 13], [2, 3], [20, 4]);
  put("S", [8, 7], [7, 14]);
  put("T", [1, 14], [2, 14], [1, 13]);

  const talk = (...lines) => async (s) => { for (const l of lines) await s.say(l); };
  const roadWest = async (s) => {
    await s.say(s.flag("GOT_STARTER") ? "ROUTE 29 is not open yet. Come back soon!" : "You can't leave yet. PROF. WILLOW wants to see you first.");
    await s.move("player", [3]);
  };
  Game.register("newbark", {
    world: {
      label: "New Bark Town", cols, rows, cells: cells.map((r) => r.join("")),
      buildings: [
        { x: 3, y: 3, w: 5, h: 4, door: 2, to: "livingroom", tx: 7, ty: 6, dir: 1 },
        { x: 14, y: 3, w: 5, h: 4, door: 2, to: "neighbor", tx: 3, ty: 6, dir: 1, roof: "#3a8fd9" },
        { x: 8, y: 9, w: 7, h: 5, door: 3, to: "willowlab", tx: 5, ty: 10, dir: 1, roof: "#5aa860", wall: "#eaf3ff", label: "LAB" },
      ],
    },
    npcs: [
      { id: 1, name: "YOUNGSTER", x: 12, y: 7, dir: 0, script: talk("This is NEW BARK TOWN. The wind here always carries a fresh start!") },
      { id: 2, name: "TEACHER", x: 16, y: 9, dir: 2, script: async (s) => { await s.say(s.flag("GOT_STARTER") ? "Your BUDDYMON looks happy. Keep it that way!" : "PROF. WILLOW has been asking about you. His lab is the green building."); } },
    ],
    signs: [
      { x: 8, y: 7, script: async (s) => { await s.say(`NEW BARK TOWN. A town where the wind brings a fresh start.`); } },
      { x: 7, y: 14, script: talk("WILLOW BUDDYMON LAB") },
    ],
    coords: [7, 8, 9, 10].map((y) => ({ x: 0, y, script: roadWest })),
  });
})();

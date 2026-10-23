// New Bark Town: four buildings (your house, the neighbor's, Willow's lab and Willow's house), a pond, and the road west to Route 29.
// Same beats as Gold's town: a teacher who stops you leaving without a buddymon, a villager who paces, and a rival lurking by the lab.
// 22 x 18 cells, original layout.
(() => {
  const cols = 22, rows = 18;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("."));
  const put = (kind, ...pts) => pts.forEach(([x, y]) => (cells[y][x] = kind));
  for (let x = 0; x < cols; x++) put("T", [x, 0], [x, 1], [x, rows - 1]);
  for (let y = 0; y < rows; y++) { put("T", [cols - 1, y]); if (y !== 9 && y !== 10) put("T", [0, y]); } // the road west is open at rows 9-10
  for (let y = 13; y <= 15; y++) for (let x = 9; x <= 11; x++) put("w", [x, y]);
  put("f", [2, 7], [9, 5], [20, 9], [18, 13], [12, 16], [6, 3], [1, 15]);
  put("S", [10, 9], [7, 9], [12, 5], [13, 16], [7, 16]); // town sign, your house, lab, Willow's house, (7,16) is the neighbor's door sign
  put("T", [1, 14], [2, 14], [1, 13]);

  const talk = (...lines) => async (s) => { for (const l of lines) await s.say(typeof l === "function" ? l(s) : l); };
  const hasMon = (s) => s.flag("GOT_STARTER");

  // Without a buddymon the teacher runs over, scolds you, and walks you back into town.
  const teacherStops = async (s) => {
    if (hasMon(s)) return;
    const t = 1;
    await s.say("Wait, " + s.name + "!");
    await s.approach(t, 3);
    s.turn("player", 3);
    await s.say("What do you think you're doing?");
    await s.walk([[t, [3, 3, 3, 3]], ["player", [3, 3, 3, 3]]]);
    s.turn(t, 2);
    await s.say("It's dangerous to go out without a BUDDYMON! Wild BUDDYMON jump out of the grass on the way to the next town.");
  };
  const roadWest = async (s) => {
    await s.say("ROUTE 29 is not open yet. Come back soon!");
    await s.move("player", [3]);
  };

  // The rival lurks beside the lab, grumbles, and shoves you away.
  const rival = async (s) => {
    await s.say("...So this is the famous WILLOW BUDDYMON LAB...");
    s.turn(3, 2);
    await s.say("...What are you staring at?");
    s.turn(3, 0);
    const away = [1, 0, 3, 2][s.G.state.dir]; // shoved straight back from where you stood
    await s.move("player", [away, away], s.G.state.dir);
    s.turn(3, 3);
  };

  Game.register("newbark", {
    world: {
      label: "New Bark Town", cols, rows, cells: cells.map((r) => r.join("")),
      buildings: [
        { x: 13, y: 2, w: 7, h: 5, door: 3, to: "willowlab", tx: 4, ty: 11, dir: 1, roof: "#5aa860", wall: "#eaf3ff", label: "LAB" },
        { x: 3, y: 5, w: 5, h: 4, door: 2, to: "livingroom", tx: 7, ty: 6, dir: 1 },
        { x: 3, y: 12, w: 5, h: 4, door: 2, to: "neighbor", tx: 3, ty: 6, dir: 1, roof: "#3a8fd9" },
        { x: 14, y: 12, w: 5, h: 4, door: 2, to: "willowhouse", tx: 3, ty: 6, dir: 1, roof: "#9a6ad9" },
      ],
    },
    npcs: [
      {
        id: 1, name: "TEACHER", x: 7, y: 11, dir: 2, wander: "spin",
        script: async (s) => { await s.say(hasMon(s) ? "Oh! Your BUDDYMON is adorable! I wish I had one!" : "Wow, your BUDDYGEAR is impressive! Did your mom get it for you?"); },
      },
      { id: 2, name: "FISHER", x: 11, y: 9, dir: 0, wander: "vertical", script: talk((s) => `Yo, ${s.name}! I hear PROF. WILLOW discovered some new BUDDYMON.`) },
      { id: 3, name: "RIVAL", x: 12, y: 4, dir: 3, script: rival },
    ],
    signs: [
      { x: 10, y: 9, script: talk("NEW BARK TOWN. The town where the winds of a new beginning blow.") },
      { x: 7, y: 9, script: talk((s) => `${s.name}'s house`) },
      { x: 12, y: 5, script: talk("WILLOW BUDDYMON LAB") },
      { x: 13, y: 16, script: talk("WILLOW'S HOUSE") },
      { x: 7, y: 16, script: talk("The neighbors' house") },
    ],
    coords: [
      ...[9, 10].map((y) => ({ x: 1, y, script: teacherStops })),
      ...[9, 10].map((y) => ({ x: 0, y, script: roadWest })),
    ],
  });
})();

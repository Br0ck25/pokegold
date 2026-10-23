// Route 29: the road west of New Bark Town to Cherrygrove. Tall grass with wild buddymon (Gold's table), a ledge, an item,
// Gold: Route29.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// a berry tree, a gate north to Route 46, and travellers to talk to. 56 x 16 cells, original layout.
(() => {
  const cols = 56, rows = 16;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("."));
  const put = (kind, ...pts) => pts.forEach(([x, y]) => (cells[y][x] = kind));
  const fill = (kind, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cells[y][x] = kind; };
  for (let x = 0; x < cols; x++) put("T", [x, 0], [x, 1], [x, rows - 1], [x, rows - 2]);
  for (let y = 0; y < rows; y++) put("T", [0, y], [cols - 1, y]);
  // Two lanes. West-bound you walk the south lane, and it is all tall grass. East-bound you can walk the north lane (no grass) and hop
  // the ledge at its east end back down to the New Bark side. The ledge only goes down, so from the south lane you cannot get up to it.
  fill("T", 8, 7, 40, 7); fill("v", 41, 7, 46, 7);
  fill("T", 47, 7, 54, 7);
  fill("g", 8, 8, 40, 13);
  fill("p", 47, 9, 55, 10); fill("p", 0, 9, 7, 10); // dirt road at both ends, running out of the map
  put("T", [24, 10], [25, 10], [24, 11], [16, 12], [31, 8], [10, 4], [11, 4], [34, 5], [3, 3], [4, 3], [3, 4], [50, 12], [51, 12], [45, 11], [46, 11], [46, 12]);
  put("f", [4, 11], [20, 3], [48, 11], [53, 12], [2, 5], [28, 6]);
  put("S", [52, 8], [3, 8]);

  const talk = Game.talk;
  const wild = (a, b, c, d, e, f, g) => [a, b, c, d, e, f, g];
  const MORN = wild([2, "chirplet"], [3, "peekat"], [3, "chirplet"], [2, "peekat"], [4, "nibblet"], [4, "chirplet"], [4, "chirplet"]);
  const NITE = wild([2, "hootling"], [3, "hootling"], [3, "hootling"], [2, "nibblet"], [4, "nibblet"], [4, "hootling"], [4, "hootling"]);

  // Gold's catching lesson: after the egg errand the dude at the New Bark end walks over and shows you how, in a scripted battle.
  const lesson = async (s) => {
    if (!s.flag("GAVE_EGG") || s.flag("LEARNED_TO_CATCH")) return;
    const DUDE = 1, dude = () => s.G.state.objects.find((o) => o.id === DUDE);
    await s.emote(DUDE);
    await s.approach(DUDE, 1);
    s.turn("player", 1);
    await s.say("I've seen you a couple times. How many BUDDYMON have you caught? Would you like me to show you how to catch BUDDYMON?");
    if ((await s.ask()) !== 0) return s.say("Oh. Fine, then. Anyway, if you want to catch BUDDYMON, you have to walk a lot.");
    await s.say("OK, watch closely! Follow me.");
    await s.follow(DUDE, s.G.path(dude().x, dude().y, 44, 10));
    await Game.battle(s, makeMon("nibblet", 5), { tutorial: { lines: ["DUDE: First, weaken the BUDDYMON by battling it. A weak BUDDYMON is easier to catch.", "DUDE: Now! Throw a BUDDY NET at it!"] } });
    s.turn(DUDE, 1);
    await s.say("That's how you do it. If you weaken them first, BUDDYMON are easier to catch.");
    s.flag("LEARNED_TO_CATCH", true);
  };

  Game.register("route29", {
    world: {
      label: "Route 29", cols, rows, cells: cells.map((r) => r.join("")),
      buildings: [{ x: 24, y: 2, w: 5, h: 3, door: 2, to: "gate29", tx: 4, ty: 6, dir: 1, roof: "#8a6ad9" }],
    },
    wild: { rate: 10, morn: MORN, day: MORN, nite: NITE }, // Gold's Route 29 table: day is the same as morning
    warps: [9, 10].map((y) => ({ x: 55, y, to: "newbark", tx: 1, ty: y, dir: 3 })).concat([9, 10].map((y) => ({ x: 0, y, to: "cherrygrove", tx: 34, ty: y, dir: 2 }))),
    coords: [9, 10].map((y) => ({ x: 53, y, script: lesson })),
    npcs: [
      { id: 1, name: "COOLTRAINER_M", x: 50, y: 11, dir: 0, wander: "spin", script: async (s) => { if (s.flag("GAVE_EGG") && !s.flag("LEARNED_TO_CATCH")) return lesson(s); await s.say("BUDDYMON hide in the grass. Who knows when they'll pop out..."); } },
      { id: 2, name: "YOUNGSTER", x: 27, y: 11, dir: 0, wander: "vertical", script: talk("Yo. How are your BUDDYMON? If they're weak and not ready for battle, keep out of the grass.") },
      { id: 3, name: "TEACHER", x: 38, y: 5, dir: 3, wander: "horizontal", script: talk("See those ledges? It's scary to jump off them. But you can get back to NEW BARK without walking through the grass.") },
      { id: 4, name: "FRUIT_TREE", x: 12, y: 3, dir: 0, faces: false, script: Game.berryTree("TREE_R29") },
      { id: 5, name: "FISHER", x: 29, y: 5, dir: 1, script: talk("I wanted to take a break, so I saved my game to record my progress.") },
      {
        id: 6, name: "COOLTRAINER_M", x: 20, y: 5, dir: 0,
        script: async (s) => { await s.say(`I'm waiting for BUDDYMON that appear only at ${timeOfDay() === "nite" ? "dawn" : "night"}.`); },
      },
      {
        id: 7, name: "SACK", x: 44, y: 3, dir: 0, faces: false, hideIf: "GOT_R29_TONIC",
        script: async (s) => { s.hide(7); s.flag("GOT_R29_TONIC", true); s.give("tonic"); await s.say(`${s.name} found a TONIC!`); },
      },
    ],
    signs: [
      { x: 52, y: 8, script: talk("ROUTE 29. CHERRYGROVE CITY - NEW BARK TOWN") },
      { x: 3, y: 8, script: talk("ROUTE 29. CHERRYGROVE CITY - NEW BARK TOWN") },
    ],
  });

  // The gate house on the road: leads north to Route 46 (not open yet).
  const walls = new Set(); for (let x = 0; x < 10; x++) if (x !== 4 && x !== 5) walls.add(`${x},0`); walls.add("0,6"); walls.add("9,6");
  Game.register("gate29", {
    room: { art: "gate", cols: 10, rows: 8, label: "Route 29 · Gate" },
    solid: Array.from({ length: 8 }, (_, y) => Array.from({ length: 10 }, (_, x) => (walls.has(`${x},${y}`) ? "#" : ".")).join("")),
    warps: [4, 5].map((x) => ({ x, y: 7, to: "route29", tx: 26, ty: 5, dir: 0 })),
    coords: [4, 5].map((x) => ({ x, y: 0, script: async (s) => { await s.say("ROUTE 46 is closed for now."); await s.move("player", [0]); } })),
    npcs: [
      { id: 1, name: "OFFICER", x: 0, y: 4, dir: 3, script: talk("This gate leads north to ROUTE 46. Anyone heading that way should have a BUDDYMON ready!") },
      { id: 2, name: "YOUNGSTER", x: 6, y: 4, dir: 0, wander: "vertical", script: talk("I'm waiting for my friend. He's late again!") },
    ],
  });
})();

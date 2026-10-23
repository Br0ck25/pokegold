// Cherrygrove City: the Mart, the Buddymon Center, the Guide Gent's house and two talk houses around a sea front. 36 x 18 cells, original layout.
// Gold: CherrygroveCity.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// Gold's beats: the Guide Gent shows you around (and gives a MAP CARD), your rival jumps you at the entrance, and you can't leave west or north yet.
(() => {
  const cols = 36, rows = 18;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("."));
  const put = (kind, ...pts) => pts.forEach(([x, y]) => (cells[y][x] = kind));
  const fill = (kind, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cells[y][x] = kind; };
  for (let x = 0; x < cols; x++) put("T", [x, 0], [x, 1], [x, rows - 1]);
  for (let y = 0; y < rows; y++) put("T", [0, y], [cols - 1, y]);
  for (let x = 28; x < cols; x++) put("p", [x, 9], [x, 10]); // dirt road east to Route 29
  for (let x = 0; x <= 5; x++) put("p", [x, 9], [x, 10]); // dirt road west (Route 31, not open yet)
  for (let y = 0; y <= 6; y++) put("p", [15, y], [16, y]); // dirt road north to Route 30
  fill("w", 5, 12, 17, 16); // the sea: wide, with a west bank across it where the fisher stands (Gold puts him on the far shore)
  put("f", [12, 9], [14, 4], [33, 5], [2, 8], [26, 16], [4, 11]);
  put("S", [17, 9], [23, 7], [23, 15], [27, 7]);
  put("T", [3, 3], [4, 3], [3, 2], [33, 13], [34, 13], [33, 14]);

  const talk = Game.talk;
  const G = Game;

  // The Guide Gent walks you around town, then gives you a MAP CARD and goes home.
  const gent = async (s) => {
    await s.say("You're a rookie trainer, aren't you? I can tell! That's OK! Everyone is a rookie at some point! If you'd like, I can teach you a few things.");
    if ((await s.ask()) !== 0) return s.say("Oh... Fine. Anyway, if you need help, come find me.");
    await s.say("OK, then! Follow me!");
    const GENT = 1, who = () => s.G.state.objects.find((o) => o.id === GENT), at = (x, y) => G.path(who().x, who().y, x, y);
    await s.follow(GENT, at(29, 8));
    s.turn("player", 1);
    await s.say("This is a BUDDYMON CENTER. They heal your BUDDYMON in no time at all. You'll be relying on them a lot, so you better learn about them.");
    await s.follow(GENT, at(22, 8));
    s.turn("player", 1);
    await s.say("This is a BUDDYMON MART. They sell NETS for catching wild BUDDYMON and other useful items.");
    await s.follow(GENT, at(16, 3));
    s.turn("player", 1);
    await s.say("ROUTE 30 is out this way. Trainers will be battling their prized BUDDYMON there.");
    await s.follow(GENT, at(12, 11));
    s.turn("player", 2);
    await s.say("This is the sea, as you can see. Some BUDDYMON are found only in water.");
    await s.follow(GENT, at(22, 15));
    s.turn(GENT, 2); s.turn("player", 3);
    await s.say("Here, I'll give you something for your trip.");
    s.flag("GOT_MAP_CARD", true);
    await s.say(`${s.name} got a MAP CARD!`);
    await s.say("It adds a map to your BUDDYGEAR. Now you can find your way around!");
    s.turn("player", 1);
    await s.move(GENT, [...at(21, 15), 1]); // home through his front door
    s.hide(GENT);
    s.flag("GENT_GONE_HOME", true);
  };

  // Your rival ambushes you at the east entrance with his own starter, then shoves past.
  const RIVAL = 6;
    const rival = async (s) => {
    if (!s.flag("GOT_EGG") || s.flag("RIVAL_CHERRYGROVE_DONE")) return; // he waits for you on the way back from the errand
    s.G.state.objects.push({ id: RIVAL, name: "RIVAL", x: 35, y: s.G.state.y, dir: 2 });
    s.turn("player", 3);
    await s.approach(RIVAL, 3);
    await s.say(`${Game.rivalName(s.G.player)}: ...Hold it. You got a BUDDYMON at the LAB. What a waste. A wimp like you with a BUDDYMON? ...Let's see how good you are.`);
    const result = await Game.battle(s, makeMon(Game.rivalSpecies(s.G.player), 6), { trainer: { name: Game.rivalName(s.G.player), money: 60, win: "...Humph. You got lucky. Don't get cocky." } });
    if (result === "lost") {
      for (const m of s.G.player.party) { m.hp = statsFor(m).hp; for (const mv of m.moves) mv.pp = MOVES[mv.id].pp; }
      await s.say(`${Game.rivalName(s.G.player)}: Ha! I knew it. Weaklings like you don't deserve BUDDYMON.`);
    }
    for (const m of s.G.player.party) { m.hp = statsFor(m).hp; for (const mv of m.moves) mv.pp = MOVES[mv.id].pp; }
    await s.move("player", [1], 3); // he barges past, shoving you aside, and walks off into town
    await s.move(RIVAL, [2, 2, 2, 2, 2, 2, 2, 2]);
    s.hide(RIVAL);
    s.flag("RIVAL_CHERRYGROVE_DONE", true);
  };

  Game.register("cherrygrove", {
    world: {
      label: "Cherrygrove City", cols, rows, cells: cells.map((r) => r.join("")),
      buildings: [
        { x: 20, y: 3, w: 5, h: 4, door: 2, to: "cgmart", tx: 2, ty: 6, dir: 1, roof: "#3a8fd9", label: "MART" },
        { x: 27, y: 3, w: 5, h: 4, door: 2, to: "cgcenter", tx: 3, ty: 6, dir: 1, roof: "#e04a5a", label: "HEAL" },
        { x: 6, y: 4, w: 5, h: 4, door: 2, to: "cggym", tx: 2, ty: 6, dir: 1, roof: "#9a6ad9" },
        { x: 19, y: 11, w: 5, h: 4, door: 2, to: "cggent", tx: 2, ty: 6, dir: 1, roof: "#d9a03a" },
        { x: 28, y: 11, w: 5, h: 4, door: 2, to: "cgevo", tx: 2, ty: 6, dir: 1, roof: "#5aa860" },
      ],
    },
    warps: [9, 10].map((y) => ({ x: 35, y, to: "route29", tx: 1, ty: y, dir: 2 })).concat([15, 16].map((x) => ({ x, y: 0, to: "route30", tx: x, ty: 38, dir: 1 }))),
    coords: [
      ...[9, 10].map((y) => ({ x: 33, y, script: rival })),
      ...[9, 10].map((y) => ({ x: 0, y, script: async (s) => { await s.say("ROUTE 31 is not open yet. Come back soon!"); await s.move("player", [3]); } })),
    ],
    npcs: [
      { id: 1, name: "GRAMPS", x: 31, y: 8, dir: 0, hideIf: "GENT_GONE_HOME", script: gent },
      { id: 2, name: "TEACHER", x: 26, y: 12, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GOT_MAP_CARD") ? "Did you get a MAP CARD? It makes finding your way around much easier." : "Did you meet the old man? He's a bit of a talker, but he knows the town.")) },
      { id: 3, name: "YOUNGSTER", x: 22, y: 9, dir: 3, wander: "horizontal", script: talk((s) => (s.flag("GOT_BUDDYDEX") ? "I see you have a BUDDYDEX. You must be good!" : "I'm going to be a great trainer! I just need a BUDDYDEX first, they say.")) },
      {
        id: 4, name: "FISHER", x: 3, y: 13, dir: 3,
        script: async (s) => {
          if (s.flag("GOT_TIDE_CHARM")) return s.say("That TIDE CHARM is a keepsake from the sea. Water BUDDYMON love it.");
          await s.say("You're a trainer too? Collecting them, eh? I like your style! Here, take this. It's a TIDE CHARM from the deep sea.");
          s.give("tide_charm");
          s.flag("GOT_TIDE_CHARM", true);
          await s.say(`${s.name} got a TIDE CHARM!`);
        },
      },
    ],
    signs: [
      { x: 17, y: 9, script: talk("CHERRYGROVE CITY. A city of sea breezes and blooming cherries.") },
      { x: 23, y: 7, script: talk("BUDDYMON MART") },
      { x: 27, y: 7, script: talk("BUDDYMON CENTER") },
      { x: 23, y: 15, script: talk("GUIDE GENT'S HOUSE") },
    ],
  });
})();

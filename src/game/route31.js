// Route 31: the road west from Route 30 to Violet City, with the Dark Cave mouth, a 1-wide path down to a grass patch, and the Violet gate house.
// Gold: Route31.asm, Route31VioletGate.asm (shape from tools/goldmap.py Route31; ledges there are scenery above cliffs, so they stay solid)
// 40 x 18 cells. Not built yet: the sleepy man's MAIL quest (needs MAIL), Wade's phone number and rematches (need the BuddyGear phone), Mom's worried call.
(() => {
  const cells = ["TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT......T",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT......T",
    "TTTTTTTTTTTTTTTTwwwwwwTTTTTTTTTTT......T",
    "TTTTTTTTTTTTTTTTwwwwwwTTTTTTTTTTT......T",
    "TTTTTT.......TTTwwwwwwwwwwTT....T......T",
    "TTTTTT.S.....T..wwwwwwwwwwTT...STTTTTTTT",
    "TTTTp.....f.TT......wwwwwwTT..........TT",
    "TTTTp.......TT......wwwwwwTT..........TT",
    "TTTTTTvvv.vvTT.......................TTT",
    "TTTTTTTTT.TTTTf......................TTT",
    "TTTTTTggggggggTTvvv.vvTTTTTTTTTTgg...TTT",
    "TTTTTTggggggggTTTTT.TTTT..TTTTTTgg..TTTT",
    "TTTTTTTTgggggg..gg....TT..fTTTTTggggTTTT",
    "TTTTTTTTgggggg..gg....TT...TTTTTggggTTTT",
    "TTTTTTTTTTgg..gg.....TTT....ggggggTTTTTT",
    "TTTTTTTTTTgg..gg.....TTT....ggggggTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTppppTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTppppTTTTTTTTTTTT"];
  const talk = Game.talk;
  const trainer = (cls, name, party, seen, beaten, after, flag, sight = 4) => ({ name, cls, party, seen, beaten, after, flag, sight });
  const MORN = [[3, "chirplet"], [4, "grublet"], [3, "vinebud"], [5, "cocoonet"], [5, "grublet"], [5, "cocoonet"], [5, "cocoonet"]];
  const DAY = [[3, "chirplet"], [4, "grublet"], [3, "vinebud"], [5, "cocoonet"], [5, "grublet"], [6, "cocoonet"], [6, "cocoonet"]];
  const NITE = [[4, "spinlet"], [4, "nibblet"], [3, "vinebud"], [5, "nibblet"], [5, "hootling"], [5, "hootling"], [5, "hootling"]];
  const ball = (id, x, y, flag, item, name) => ({ id, name: "SACK", x, y, dir: 0, faces: false, hideIf: flag,
    script: async (s) => { s.hide(id); s.flag(flag, true); s.give(item); await s.say(`${s.name} found a ${name}!`); } });

  Game.register("route31", {
    world: {
      label: "Route 31", cols: 40, rows: 18, cells,
      buildings: [
        { x: 0, y: 4, w: 4, h: 4, door: -1, roof: "#8a6ad9", label: "GATE" },
        { x: 32, y: 3, w: 5, h: 3, door: 2, roof: "#5a5a6a", wall: "#8a8a98", label: "DARK CAVE" },
      ],
    },
    wild: { rate: 10, morn: MORN, day: DAY, nite: NITE },
    warps: [6, 7].map((y) => ({ x: 4, y, to: "gate31", tx: 8, ty: y - 2, dir: 2 })).concat([24, 25, 26, 27].map((x) => ({ x, y: 17, to: "route30", tx: x < 26 ? 15 : 16, ty: 1, dir: 0 }))),
    coords: [{ x: 34, y: 5, script: async (s) => { await s.say("DARK CAVE. It's pitch black inside! Better come back when you have a light."); await s.move("player", [0]); } }],
    npcs: [
      { id: 1, name: "FISHER", x: 17, y: 7, dir: 0, script: talk((s) => `... Hnuurg... Huh? I walked too far today looking for BUDDYMON. My feet hurt and I'm sleepy... If I were a wild BUDDYMON, I'd be easy to catch... ...Zzzz...`) },
      { id: 2, name: "YOUNGSTER", x: 9, y: 5, dir: 3, wander: "spin", script: talk("I found a good BUDDYMON in DARK CAVE. I'm going to raise it to take on FALKNER. He's the leader of VIOLET CITY's GYM.") },
      { id: 3, name: "BUG_CATCHER", x: 18, y: 15, dir: 1, trainer: trainer("BUG CATCHER", "WADE", [["grublet", 2], ["grublet", 2], ["stinglet", 3], ["grublet", 2]], "I caught a bunch of BUDDYMON. Let me battle with you!", "Awwwww...", "You can catch BUDDYMON even if you have six with you. If you catch one, it'll go to your BOX automatically.", "BEAT_WADE", 3) },
      { id: 4, name: "COOLTRAINER_M", x: 33, y: 8, dir: 2, wander: "spin", script: talk("DARK CAVE... If BUDDYMON could light it up, I'd explore it.") },
      { id: 5, name: "FRUIT_TREE", x: 16, y: 7, dir: 0, faces: false, script: Game.berryTree("TREE_R31") },
      ball(6, 29, 5, "GOT_R31_REMEDY", "remedy", "REMEDY"),
      ball(7, 21, 13, "GOT_R31_NET", "buddy_net", "BUDDY NET"),
    ],
    signs: [
      { x: 7, y: 5, script: talk("ROUTE 31. VIOLET CITY - CHERRYGROVE CITY") },
      { x: 31, y: 5, script: talk("DARK CAVE") },
    ],
  });

  // The Violet gate house: doors on its west and east walls. Gold: officer (5,2) and a lost cooltrainer (1,2) who spins.
  const walls = new Set();
  for (let x = 0; x < 10; x++) { walls.add(`${x},0`); walls.add(`${x},7`); }
  for (let y = 0; y < 8; y++) if (y !== 4 && y !== 5) { walls.add(`0,${y}`); walls.add(`9,${y}`); }
  Game.register("gate31", {
    room: { art: "gateEW", cols: 10, rows: 8, label: "Route 31 · Gate" },
    solid: Array.from({ length: 8 }, (_, y) => Array.from({ length: 10 }, (_, x) => (walls.has(`${x},${y}`) ? "#" : ".")).join("")),
    warps: [4, 5].map((y) => ({ x: 0, y, to: "violet", tx: 38, ty: y + 20, dir: 2 })).concat([4, 5].map((y) => ({ x: 9, y, to: "route31", tx: 5, ty: y + 2, dir: 3 }))),
    npcs: [
      { id: 1, name: "OFFICER", x: 5, y: 2, dir: 1, script: talk("Hi, guy! Did you visit SPROUT TOWER?") },
      { id: 2, name: "COOLTRAINER_F", x: 1, y: 2, dir: 1, wander: "spin", script: talk("I came too far out. I'd better phone home!") },
    ],
  });
})();

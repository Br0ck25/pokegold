// Route 31: the road west from Route 30 to Violet City, with the Dark Cave mouth, a 1-wide path down to a grass patch, and the Violet gate house.
// Gold: Route31.asm, Route31VioletGate.asm (shape from tools/goldmap.py Route31; ledges there are scenery above cliffs, so they stay solid)
// 40 x 18 cells. Not built yet: the sleepy man's MAIL quest (needs MAIL), Wade's phone number and rematches (need the BuddyGear phone), Mom's worried call.
(() => {
  const talk = Game.talk;
  const trainer = (cls, name, party, seen, beaten, after, flag, sight = 4) => ({ name, cls, party, seen, beaten, after, flag, sight });
  const MORN = [[3, "chirplet"], [4, "grublet"], [3, "vinebud"], [5, "cocoonet"], [5, "grublet"], [5, "cocoonet"], [5, "cocoonet"]];
  const DAY = [[3, "chirplet"], [4, "grublet"], [3, "vinebud"], [5, "cocoonet"], [5, "grublet"], [6, "cocoonet"], [6, "cocoonet"]];
  const NITE = [[4, "spinlet"], [4, "nibblet"], [3, "vinebud"], [5, "nibblet"], [5, "hootling"], [5, "hootling"], [5, "hootling"]];
  const ball = (id, x, y, flag, item, name) => ({ id, name: "SACK", x, y, dir: 0, faces: false, hideIf: flag,
    script: async (s) => { s.hide(id); s.flag(flag, true); s.give(item); await s.say(`${s.name} found a ${name}!`); } });

  Game.outdoor("route31", "Route31", {
    label: "Route 31",
    style: { "4,6": { roof: "#8a6ad9", label: "GATE" } },
    wild: { rate: 10, morn: MORN, day: DAY, nite: NITE },
    npcs: [
      { id: 1, name: "FISHER", x: 17, y: 7, dir: 0, script: Game.said("Route31", "Text_Route31SleepyMan") },
      { id: 2, name: "YOUNGSTER", x: 9, y: 5, dir: 3, wander: "spin", script: Game.said("Route31", "Route31YoungsterText") },
      { id: 3, name: "BUG_CATCHER", x: 18, y: 15, dir: 1, trainer: trainer("BUG CATCHER", "WADE", [["grublet", 2], ["grublet", 2], ["stinglet", 3], ["grublet", 2]], Game.line("Route31", "BugCatcherWade1SeenText"), Game.line("Route31", "BugCatcherWade1BeatenText"), Game.line("Route31", "BugCatcherWade1AfterText"), "BEAT_WADE", 3) },
      { id: 4, name: "COOLTRAINER_M", x: 33, y: 8, dir: 2, wander: "spin", script: Game.said("Route31", "Route31CooltrainerMText") },
      { id: 5, name: "FRUIT_TREE", x: 16, y: 7, dir: 0, faces: false, script: Game.berryTree("TREE_R31") },
      ball(6, 29, 5, "GOT_R31_REMEDY", "remedy", "REMEDY"),
      ball(7, 21, 13, "GOT_R31_NET", "buddy_net", "BUDDY NET"),
    ],
    signs: [
      { x: 7, y: 5, script: Game.said("Route31", "Route31SignText") },
      { x: 31, y: 5, script: Game.said("Route31", "DarkCaveSignText") },
    ],
  });

  // The Violet gate house: doors on its west and east walls. Gold: officer (5,2) and a lost cooltrainer (1,2) who spins.
  Game.indoor("gate31", "Route31VioletGate", {
    label: "Route 31 · Gate",
    npcs: [
      { id: 1, name: "OFFICER", x: 5, y: 2, dir: 0, script: talk("Hi, guy! Did you visit SPROUT TOWER?") },
      { id: 2, name: "COOLTRAINER_F", x: 1, y: 2, dir: 0, wander: "spin", script: talk("I came too far out. I'd better phone home!") },
    ],
  });
})();

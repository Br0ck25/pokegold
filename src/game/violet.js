// Violet City: Mart, Buddymon Center, the Gym, Earl's Academy, a talk house and Sprout Tower around a lake, with the Route 31 gate on the east edge.
// Gold: VioletCity.asm (shape from tools/goldmap.py VioletCity; every building and NPC sits where Gold has it)
// 40 x 36 cells. Closed for now (a message pushes you back): Sprout Tower (needs its 3 floors), Route 32 south, Route 36 west.
// Surf-only items (PP UP at (4,1), RARE CANDY at (35,5)) stand where Gold has them. The hidden HYPER TONIC at (37,14) sits behind a Cut tree at (36,19): not placed until Cut exists. Kyle's trade house and the aide's EGG are not built (see docs/TODO.md).
(() => {
  const talk = Game.talk;
  const EARL = 1, ACADEMY_DOOR = [30, 17];
  const ball = (id, x, y, flag, item, name) => ({ id, name: "SACK", x, y, dir: 0, faces: false, hideIf: flag,
    script: async (s) => { s.hide(id); s.flag(flag, true); s.give(item); await s.say(`${s.name} found a ${name}!`); } });

  // Earl asks if you beat the Gym Leader; if not he walks you to his Academy (the door below (30,17)), spinning with joy, and goes in.
  const earl = async (s) => {
    const me = () => s.G.state.objects.find((o) => o.id === EARL);
    await s.say("Hello! You are trainer? Battle GYM LEADER, win you did?");
    if ((await s.ask()) === 0) return s.say("Ooh, la la! Very indeed nice!");
    await s.say("Is that so? Then study shall you! Follow me!");
    await s.follow(EARL, s.G.path(me().x, me().y, ACADEMY_DOOR[0], ACADEMY_DOOR[1] + 1));
    s.turn("player", 1);
    await s.say("Here, teacher I am. Good it is you study here!");
    await s.move(EARL, [1]);
    s.hide(EARL);
    s.flag("EARL_IN_ACADEMY", true);
  };

  Game.outdoor("violet", "VioletCity", {
    label: "Violet City",
    style: {
      "9,17": { roof: "#3a8fd9", label: "MART" }, "18,17": { roof: "#9a6ad9", label: "GYM" }, "30,17": { roof: "#5aa860", label: "ACADEMY" },
      "3,15": { roof: "#d9a03a" }, "31,25": { roof: "#e04a5a", label: "HEAL" }, "21,29": { roof: "#3a8fd9" }, "23,5": { roof: "#8a5a2b", wall: "#e0c890", label: "TOWER" },
    },
    closed: {
      SPROUT_TOWER_1F: "SPROUT TOWER: the doors are shut for now.",
      VIOLET_KYLES_HOUSE: "KYLE'S HOUSE: nobody's home right now.",
      ROUTE36: "ROUTE 36 is not open yet. Come back soon!", Route36: "ROUTE 36 is not open yet. Come back soon!", Route32: "ROUTE 32 is not open yet. Come back soon!",
    },
    npcs: [
      { id: EARL, name: "FISHER", x: 13, y: 16, dir: 0, wander: "spin", hideIf: "EARL_IN_ACADEMY", script: earl },
      { id: 2, name: "LASS", x: 28, y: 28, dir: 0, wander: "horizontal", script: talk("Ghosts are rumored to appear in SPROUT TOWER. They said normal-type BUDDYMON moves had no effect on ghosts.") },
      { id: 3, name: "SUPER_NERD", x: 24, y: 14, dir: 0, wander: "vertical", script: talk("Hey, you're a BUDDYMON trainer? If you beat the GYM LEADER here, you'll be ready for prime time!") },
      { id: 4, name: "GRAMPS", x: 17, y: 20, dir: 2, wander: "horizontal", script: talk("FALKNER, from the VIOLET BUDDYMON GYM, is a fine trainer! He inherited his father's gym and has done a great job with it.") },
      { id: 5, name: "YOUNGSTER", x: 5, y: 18, dir: 0, wander: "spin", script: talk("I saw a wiggly tree up ahead! If you touch it, it squirms and dances! Cool!") },
      { id: 6, name: "FRUIT_TREE", x: 14, y: 29, dir: 0, faces: false, script: Game.berryTree("TREE_VIOLET") },
      ball(7, 4, 1, "GOT_VIOLET_PP_UP", "pp_up", "PP UP"),
      ball(8, 35, 5, "GOT_VIOLET_CANDY", "rare_candy", "RARE CANDY"),
    ],
    signs: [
      { x: 24, y: 20, script: talk("VIOLET CITY. The City of Nostalgic Scents") },
      { x: 15, y: 17, script: talk("VIOLET CITY BUDDYMON GYM. LEADER: FALKNER. The Elegant Master of Flying BUDDYMON") },
      { x: 24, y: 8, script: talk("SPROUT TOWER. Experience the Way of BUDDYMON") },
      { x: 27, y: 17, script: talk("EARL'S BUDDYMON ACADEMY") },
      { x: 32, y: 25, script: talk("The BUDDYMON CENTER: heal your BUDDYMON!") },
      { x: 10, y: 17, script: talk("The BUDDYMON MART: items for trainers!") },
      { x: 37, y: 14, needs: "cut", script: Game.hiddenItem("VIOLET_HYPER", "hyper_tonic") }, // behind a Cut tree at (36,19)
    ],
  });
})();

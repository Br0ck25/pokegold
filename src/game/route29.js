// Route 29: the road west of New Bark Town to Cherrygrove. Tall grass with wild buddymon (Gold's table), a ledge, an item,
// Gold: Route29.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// a berry tree, a gate north to Route 46, and travellers to talk to. 60 x 18 cells (Gold's shape).
(() => {
  const talk = Game.talk;
  const wild = (a, b, c, d, e, f, g) => [a, b, c, d, e, f, g];
  const MORN = wild([2, "chirplet"], [3, "peekat"], [3, "chirplet"], [2, "peekat"], [4, "nibblet"], [4, "chirplet"], [4, "chirplet"]);
  const NITE = wild([2, "hootling"], [3, "hootling"], [3, "hootling"], [2, "nibblet"], [4, "nibblet"], [4, "hootling"], [4, "hootling"]);

  // Gold's catching lesson (Route29Tutorial1/2): once the egg is delivered, stepping onto (53,8) or (53,9) makes the dude run up beside you,
  // lead you back to his post (you follow), and show you a catch in a scripted fight. Refusing sends him home and ends the scene.
  const DUDE = 1;
  const lesson = (row) => async (s) => {
    if (!s.flag("GAVE_EGG") || s.flag("LEARNED_TO_CATCH") || s.flag("DUDE_DECLINED")) return;
    const up = row === 8 ? 4 : 3, back = [2, 2, ...Array(up).fill(0)];
    s.turn(DUDE, 1);
    await s.emote(DUDE);
    await s.move(DUDE, [...Array(up).fill(1), 3, 3]);
    s.turn("player", 2);
    await s.say("I've seen you a couple times. How many BUDDYMON have you caught?");
    await s.say("Would you like me to show you how to catch BUDDYMON?");
    if ((await s.ask()) !== 0) {
      await s.say("Oh. Fine, then.");
      await s.say("Anyway, if you want to catch BUDDYMON, you have to walk a lot.");
      s.flag("DUDE_DECLINED", true);
      return s.move(DUDE, back);
    }
    await s.follow(DUDE, back);
    await tutorial(s);
  };
  const tutorial = async (s) => {
    await Game.battle(s, makeMon("nibblet", 5), { tutorial: { lines: ["DUDE: First, weaken the BUDDYMON by battling it. A weak BUDDYMON is easier to catch.", "DUDE: Now! Throw a BUDDY NET at it!"] } });
    s.turn(DUDE, 1);
    await s.say("That's how you do it.");
    await s.say("If you weaken them first, BUDDYMON are easier to catch.");
    s.flag("LEARNED_TO_CATCH", true);
  };
  // Talking to him (CatchingTutorialDudeScript): before the egg, or after the lesson, he only says the box-full line.
  const dudeTalk = async (s) => {
    if (!s.flag("GAVE_EGG") || s.flag("LEARNED_TO_CATCH")) return s.say("BUDDYMON hide in the grass. Who knows when they'll pop out…");
    await s.say("Huh? You want me to show you how to catch BUDDYMON?");
    if ((await s.ask()) !== 0) { await s.say("Oh. Fine, then."); return s.say("Anyway, if you want to catch BUDDYMON, you have to walk a lot."); }
    await tutorial(s);
  };

  const tuscany = async (s) => {
    const T = (label) => s.text("Route29", label), tue = new Date().getDay() === 2;
    if (s.flag("GOT_PINK_BOW")) return T("TuscanyTuesdayText");
    if (!tue) return T("TuscanyNotTuesdayText");
    if (!s.flag("MET_TUSCANY")) { await T("MeetTuscanyText"); s.flag("MET_TUSCANY", true); }
    await T("TuscanyGivesGiftText");
    s.give("pink_bow");
    s.flag("GOT_PINK_BOW", true);
    await s.say(`${s.name} received PINK BOW!`);
    await T("TuscanyGaveGiftText");
  };

  Game.outdoor("route29", "Route29", {
    label: "Route 29",
    style: { "27,1": { roof: "#8a6ad9", label: "GATE" } },
    wild: { rate: 10, morn: MORN, day: MORN, nite: NITE }, // Gold's Route 29 table: day is the same as morning
    coords: [8, 9].map((y) => ({ x: 53, y, script: lesson(y) })),
    npcs: [
      { id: DUDE, name: "COOLTRAINER_M", x: 50, y: 12, dir: 0, wander: "spin", script: dudeTalk },
      { id: 2, name: "YOUNGSTER", x: 27, y: 16, dir: 0, wander: "vertical", script: Game.said("Route29", "Route29YoungsterText") },
      { id: 3, name: "TEACHER", x: 15, y: 11, dir: 2, wander: "horizontal", script: Game.said("Route29", "Route29TeacherText") },
      { id: 4, name: "FRUIT_TREE", x: 12, y: 2, dir: 0, faces: false, script: Game.berryTree("TREE_R29") },
      { id: 5, name: "FISHER", x: 25, y: 3, dir: 1, script: Game.said("Route29", "Route29FisherText") },
      {
        id: 6, name: "COOLTRAINER_M", x: 13, y: 4, dir: 0,
        script: async (s) => s.text("Route29", timeOfDay() === "nite" ? "Route29CooltrainerMText_WaitingForMorning" : "Route29CooltrainerMText_WaitingForNight"),
      },
      // Tuscany of Tuesday (Gold): only on Tuesdays and only once you have the ZEPHYRBADGE; the PINK BOW is her gift.
      { id: 8, name: "TEACHER", x: 29, y: 12, dir: 0, wander: "spin", when: (P) => (P.badges || []).includes("ZEPHYRBADGE") && new Date().getDay() === 2, script: tuscany },
      {
        id: 7, name: "SACK", x: 48, y: 2, dir: 0, faces: false, hideIf: "GOT_R29_TONIC",
        script: async (s) => { s.hide(7); s.flag("GOT_R29_TONIC", true); s.give("tonic"); await s.say(`${s.name} found a TONIC!`); },
      },
    ],
    signs: [
      { x: 51, y: 7, script: Game.said("Route29", "Route29Sign1Text") },
      { x: 3, y: 5, script: Game.said("Route29", "Route29Sign2Text") },
    ],
  });

  // The gate house on the road: leads north to Route 46 (not open yet). Gold: officer (0,4), a youngster pacing (6,4).
  Game.indoor("gate29", "Route29Route46Gate", {
    label: "Route 29 · Gate", theme: "house",
    closed: { default: "ROUTE 46 is closed for now." },
    npcs: [
      { id: 1, name: "OFFICER", x: 0, y: 4, dir: 3, script: Game.said("Route29Route46Gate", "Route29Route46GateOfficerText") },
      { id: 2, name: "YOUNGSTER", x: 6, y: 4, dir: 0, wander: "vertical", script: Game.said("Route29Route46Gate", "Route29Route46GateYoungsterText") },
    ],
  });
})();

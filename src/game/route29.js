// Route 29: the road west of New Bark Town to Cherrygrove. Tall grass with wild buddymon (Gold's table), a ledge, an item,
// Gold: Route29.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// a berry tree, a gate north to Route 46, and travellers to talk to. 60 x 18 cells (Gold's shape).
(() => {
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
    await s.follow(DUDE, s.G.path(dude().x, dude().y, 47, 8));
    await Game.battle(s, makeMon("nibblet", 5), { tutorial: { lines: ["DUDE: First, weaken the BUDDYMON by battling it. A weak BUDDYMON is easier to catch.", "DUDE: Now! Throw a BUDDY NET at it!"] } });
    s.turn(DUDE, 1);
    await s.say("That's how you do it. If you weaken them first, BUDDYMON are easier to catch.");
    s.flag("LEARNED_TO_CATCH", true);
  };

  Game.outdoor("route29", "Route29", {
    label: "Route 29",
    style: { "27,1": { roof: "#8a6ad9", label: "GATE" } },
    wild: { rate: 10, morn: MORN, day: MORN, nite: NITE }, // Gold's Route 29 table: day is the same as morning
    coords: [8, 9].map((y) => ({ x: 53, y, script: lesson })),
    npcs: [
      { id: 1, name: "COOLTRAINER_M", x: 50, y: 12, dir: 0, wander: "spin", script: async (s) => { if (s.flag("GAVE_EGG") && !s.flag("LEARNED_TO_CATCH")) return lesson(s); await s.say("BUDDYMON hide in the grass. Who knows when they'll pop out..."); } },
      { id: 2, name: "YOUNGSTER", x: 27, y: 16, dir: 0, wander: "vertical", script: talk("Yo. How are your BUDDYMON? If they're weak and not ready for battle, keep out of the grass.") },
      { id: 3, name: "TEACHER", x: 15, y: 11, dir: 2, wander: "horizontal", script: talk("See those ledges? It's scary to jump off them. But you can get back to NEW BARK without walking through the grass.") },
      { id: 4, name: "FRUIT_TREE", x: 12, y: 2, dir: 0, faces: false, script: Game.berryTree("TREE_R29") },
      { id: 5, name: "FISHER", x: 25, y: 3, dir: 1, script: talk("I wanted to take a break, so I saved my game to record my progress.") },
      {
        id: 6, name: "COOLTRAINER_M", x: 13, y: 4, dir: 0,
        script: async (s) => { await s.say(`I'm waiting for BUDDYMON that appear only at ${timeOfDay() === "nite" ? "dawn" : "night"}.`); },
      },
      {
        id: 7, name: "SACK", x: 48, y: 2, dir: 0, faces: false, hideIf: "GOT_R29_TONIC",
        script: async (s) => { s.hide(7); s.flag("GOT_R29_TONIC", true); s.give("tonic"); await s.say(`${s.name} found a TONIC!`); },
      },
    ],
    signs: [
      { x: 51, y: 7, script: talk("ROUTE 29. CHERRYGROVE CITY - NEW BARK TOWN") },
      { x: 3, y: 5, script: talk("ROUTE 29. CHERRYGROVE CITY - NEW BARK TOWN") },
    ],
  });

  // The gate house on the road: leads north to Route 46 (not open yet). Gold: officer (0,4), a youngster pacing (6,4).
  Game.indoor("gate29", "Route29Route46Gate", {
    label: "Route 29 · Gate", theme: "house",
    closed: { default: "ROUTE 46 is closed for now." },
    npcs: [
      { id: 1, name: "OFFICER", x: 0, y: 4, dir: 3, script: talk("This gate leads north to ROUTE 46. Anyone heading that way should have a BUDDYMON ready!") },
      { id: 2, name: "YOUNGSTER", x: 6, y: 4, dir: 0, wander: "vertical", script: talk("I'm waiting for my friend. He's late again!") },
    ],
  });
})();

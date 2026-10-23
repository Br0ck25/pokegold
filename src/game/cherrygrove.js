// Cherrygrove City: the Mart, the Buddymon Center, the Guide Gent's house and two talk houses, with the big sea across the west and south. 40 x 18 cells.
// Gold: CherrygroveCity.asm (shape from tools/goldmap.py CherrygroveCity; the Mystic Water fisher stands on the island at (7,12), which needs Surf)
// Gold's beats: the Guide Gent shows you around (and gives a MAP CARD), your rival jumps you at the entrance, 
(() => {
  const cols = 40, rows = 18;
  const cells = [
    "TTTTTTTTTTTTTTTTppTTTTTTTTTTTTTTTTwwwwTT",
    "TTTTTTTTTTTTTTTTppTTTTTTTTTTTTTTTTwwwwTT",
    "TTTTTTTTTTTTTTTTppTTTTTTTTTTTTTTTTT...TT",
    "TTTTTTTTTTTTTTTTppTTTTTTTTTTTTTTTTTT..TT",
    "wwTTwwwwTTTT....................TTTTTTTT",
    "wwTTwwwwTTTT..f.................TTTTTTTT",
    "wwwTwwwwww......TTTT..f...........pppppp",
    "wwwTwwwwww......TTTT..............pppppp",
    "TTTTwwwwww..............TTTT..S...TTTTTT",
    "TTwwwwwwww.............TTTTT......TTTTTT",
    "TwwwTTwwwwwwfw................TTTTTTTTTT",
    "TwwwTTwwwwwwww................TTTTTTTTTT",
    "Twww....wwwwwwwwTTTTTT............TTTTTT",
    "Twww....wwwwwwwwTTTTTT........f...TTTTTT",
    "TwwwwwwwwwwwTTTTwwTTTTTTTTTTTTTTTTTTTTTT",
    "TwwwwwwwwwwwTwTTwwTTTTTTTTTTTTTTTTTTTTTT",
    "TTwwTTTTwwwwTwwwwwTTTTTTTTTTTTTTTTTTTTTT",
    "wTTTTwwTTTTTTwwwwwTTTTTTTTTTTTTTTTTTTTTT",
  ];
  const talk = Game.talk;
  const G = Game;

  // The Guide Gent walks you around town, then gives you a MAP CARD and goes home.
  const gent = async (s) => {
    await s.say("You're a rookie trainer, aren't you? I can tell! That's OK! Everyone is a rookie at some point! If you'd like, I can teach you a few things.");
    if ((await s.ask()) !== 0) return s.say("Oh... Fine. Anyway, if you need help, come find me.");
    await s.say("OK, then! Follow me!");
    const GENT = 1, who = () => s.G.state.objects.find((o) => o.id === GENT), at = (x, y) => G.path(who().x, who().y, x, y);
    await s.follow(GENT, at(29, 4));
    s.turn("player", 1);
    await s.say("This is a BUDDYMON CENTER. They heal your BUDDYMON in no time at all. You'll be relying on them a lot, so you better learn about them.");
    await s.follow(GENT, at(23, 4));
    s.turn("player", 1);
    await s.say("This is a BUDDYMON MART. They sell NETS for catching wild BUDDYMON and other useful items.");
    await s.follow(GENT, at(16, 4));
    s.turn("player", 1);
    await s.say("ROUTE 30 is out this way. Trainers will be battling their prized BUDDYMON there.");
    await s.follow(GENT, at(14, 10));
    s.turn("player", 2);
    await s.say("This is the sea, as you can see. Some BUDDYMON are found only in water.");
    await s.follow(GENT, at(25, 10));
    s.turn(GENT, 2); s.turn("player", 3);
    await s.say("Here, I'll give you something for your trip.");
    s.flag("GOT_MAP_CARD", true);
    await s.say(`${s.name} got a MAP CARD!`);
    await s.say("It adds a map to your BUDDYGEAR. Now you can find your way around!");
    s.turn("player", 1);
    await s.move(GENT, [...at(25, 10), 1]); // home through his front door
    s.hide(GENT);
    s.flag("GENT_GONE_HOME", true);
  };

  // Your rival ambushes you at the east entrance with his own starter, then shoves past.
  const RIVAL = 6;
    const rival = async (s) => {
    if (!s.flag("GOT_EGG") || s.flag("RIVAL_CHERRYGROVE_DONE")) return; // he waits for you on the way back from the errand
    s.G.state.objects.push({ id: RIVAL, name: "RIVAL", x: 39, y: s.G.state.y, dir: 2 });
    s.turn("player", 3);
    await s.approach(RIVAL, 3);
    await s.say(`${Game.rivalName(s.G.player)}: ...Hold it. You got a BUDDYMON at the LAB. What a waste. A wimp like you with a BUDDYMON? ...Let's see how good you are.`);
    const result = await Game.battle(s, makeMon(Game.rivalSpecies(s.G.player), 6), { trainer: { name: Game.rivalName(s.G.player), money: 60, win: "...Humph. You got lucky. Don't get cocky." } });
    if (result === "lost") {
      for (const m of s.G.player.party) healMon(m);
      await s.say(`${Game.rivalName(s.G.player)}: Ha! I knew it. Weaklings like you don't deserve BUDDYMON.`);
    }
    for (const m of s.G.player.party) healMon(m);
    await s.move("player", [1], 3); // he barges past, shoving you aside, and walks off into town
    await s.move(RIVAL, [2, 2, 2, 2, 2, 2, 2, 2]);
    s.hide(RIVAL);
    s.flag("RIVAL_CHERRYGROVE_DONE", true);
  };

  Game.register("cherrygrove", {
    world: {
      label: "Cherrygrove City", cols, rows, cells,
      buildings: [
        { x: 21, y: 0, w: 5, h: 4, door: 2, to: "cgmart", tx: 2, ty: 6, dir: 1, roof: "#3a8fd9", label: "MART" },
        { x: 27, y: 0, w: 5, h: 4, door: 2, to: "cgcenter", tx: 3, ty: 6, dir: 1, roof: "#e04a5a", label: "HEAL" },
        { x: 16, y: 6, w: 4, h: 2, door: 1, to: "cggym", tx: 2, ty: 6, dir: 1, roof: "#9a6ad9" },
        { x: 23, y: 8, w: 5, h: 2, door: 2, to: "cggent", tx: 2, ty: 6, dir: 1, roof: "#d9a03a" },
        { x: 30, y: 10, w: 4, h: 2, door: 1, to: "cgevo", tx: 2, ty: 6, dir: 1, roof: "#5aa860" },
      ],
    },
    warps: [6, 7].map((y) => ({ x: 39, y, to: "route29", tx: 1, ty: y + 3, dir: 3 })).concat([16, 17].map((x) => ({ x, y: 0, to: "route30", tx: x - 1, ty: 38, dir: 1 }))),
    coords: [6, 7].map((y) => ({ x: 33, y, script: rival })),
    npcs: [
      { id: 1, name: "GRAMPS", x: 32, y: 6, dir: 0, hideIf: "GENT_GONE_HOME", script: gent },
      { id: 2, name: "TEACHER", x: 27, y: 12, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GOT_MAP_CARD") ? "Did you get a MAP CARD? It makes finding your way around much easier." : "Did you meet the old man? He's a bit of a talker, but he knows the town.")) },
      { id: 3, name: "YOUNGSTER", x: 23, y: 7, dir: 3, wander: "horizontal", script: talk((s) => (s.flag("GOT_BUDDYDEX") ? "I see you have a BUDDYDEX. You must be good!" : "I'm going to be a great trainer! I just need a BUDDYDEX first, they say.")) },
      {
        id: 4, name: "FISHER", x: 7, y: 12, dir: 3, surf: true, // on an island in the sea: reachable only with Surf, as in Gold
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
      { x: 30, y: 8, script: talk("CHERRYGROVE CITY. A city of sea breezes and blooming cherries.") },
      { x: 24, y: 3, script: talk("BUDDYMON MART") },
      { x: 30, y: 3, script: talk("BUDDYMON CENTER") },
      { x: 23, y: 9, script: talk("GUIDE GENT'S HOUSE") },
    ],
  });
})();

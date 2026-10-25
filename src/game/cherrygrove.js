// Cherrygrove City: the Mart, the Buddymon Center, the Guide Gent's house and two talk houses, with the big sea across the west and south. 40 x 18 cells.
// Gold: CherrygroveCity.asm (shape from tools/goldmap.py CherrygroveCity; the Mystic Water fisher stands on the island at (7,12), which needs Surf)
// Gold's beats: the Guide Gent shows you around (and gives a MAP CARD), your rival jumps you at the entrance, 
(() => {
  const talk = Game.talk;
  const G = Game;

  // CherrygroveCityGuideGent: he walks you round town by Gold's own movement lists (Game.moves), stopping to explain, then gives a MAP CARD.
  const gent = async (s) => {
    const GENT = 1, T = (label) => s.text("CherrygroveCity", label), M = (n) => Game.moves.CherrygroveCity[`GuideGentMovement${n}`];
    await T("GuideGentIntroText");
    if ((await s.ask()) !== 0) return T("GuideGentNoText");
    await T("GuideGentTourText1");
    await s.follow(GENT, M(1)); await T("GuideGentPokecenterText");
    await s.follow(GENT, M(2)); s.turn("player", 1); await T("GuideGentMartText");
    await s.follow(GENT, M(3)); s.turn("player", 1); await T("GuideGentRoute30Text");
    await s.follow(GENT, M(4)); s.turn("player", 2); await T("GuideGentSeaText");
    await s.follow(GENT, M(5)); s.turn("player", 1);
    await s.wait(60);
    s.turn(GENT, 2); s.turn("player", 3);
    await T("GuideGentGiftText");
    s.flag("GOT_MAP_CARD", true);
    await s.say(`${s.name} received MAP CARD!`);
    await T("GotMapCardText");
    await T("GuideGentPokegearText");
    s.turn("player", 1);
    await s.move(GENT, M(6));
    s.hide(GENT);
    s.flag("GENT_GONE_HOME", true);
  };

  // Gold's CherrygroveRivalSceneNorth/South: stepping on (33,6) or (33,7) after Mr. Buddymon's house, your rival walks up from the east edge (39,y),
  // you fight his level 5 starter, he gives half his name, shoves you one step down and leaves. Win or lose, your party is healed.
  const RIVAL = 6;
  const rival = async (s) => {
    if (!s.flag("GOT_EGG") || s.flag("RIVAL_CHERRYGROVE_DONE")) return;
    s.G.state.objects.push({ id: RIVAL, name: "RIVAL", x: 39, y: s.G.state.y, dir: 2 });
    s.turn("player", 3);
    await s.emote("player");
    await s.wait(15);
    await s.move(RIVAL, [2, 2, 2, 2, 2]);
    s.turn("player", 3);
    for (const line of ["…", "You got a BUDDYMON at the LAB.", "What a waste. A wimp like you.", "…", "Don't you get what I'm saying?", "Well, I too, have a good BUDDYMON.", "I'll show you what I mean!"]) await s.say(line);
    const result = await Game.battle(s, makeMon(Game.rivalSpecies(s.G.player), 5), { trainer: { look: "RIVAL", name: Game.rivalName(s.G.player), money: 60, win: "Humph. Are you happy you won?" } });
    if (result === "lost") await s.say("Humph. That was a waste of time.");
    for (const line of ["…", `My name's ${Game.rivalName(s.G.player)}.`, "I'm going to be the world's greatest BUDDYMON trainer."]) await s.say(line);
    for (const m of s.G.player.party) healMon(m);
    await s.move("player", [0], 1); // he shoves you one step down
    s.turn("player", 2);
    await s.move(RIVAL, [2, 2, 2, 2, 1, 1, 2, 2]);
    s.hide(RIVAL);
    s.flag("RIVAL_CHERRYGROVE_DONE", true);
  };

  Game.outdoor("cherrygrove", "CherrygroveCity", {
    label: "Cherrygrove City",
    style: {
      "23,3": { roof: "#3a8fd9", label: "MART" }, "29,3": { roof: "#e04a5a", label: "HEAL" }, "17,7": { roof: "#9a6ad9" },
      "25,9": { roof: "#d9a03a" }, "31,11": { roof: "#5aa860" },
    },
    coords: [6, 7].map((y) => ({ x: 33, y, script: rival })),
    npcs: [
      { id: 1, name: "GRAMPS", x: 32, y: 6, dir: 0, hideIf: "GENT_GONE_HOME", script: gent },
      { id: 2, name: "TEACHER", x: 27, y: 12, dir: 2, wander: "horizontal", script: async (s) => s.text("CherrygroveCity", s.flag("GOT_MAP_CARD") ? "CherrygroveTeacherText_HaveMapCard" : "CherrygroveTeacherText_NoMapCard") },
      { id: 3, name: "YOUNGSTER", x: 23, y: 7, dir: 3, wander: "horizontal", script: async (s) => s.text("CherrygroveCity", s.flag("GOT_BUDDYDEX") ? "CherrygroveYoungsterText_HavePokedex" : "CherrygroveYoungsterText_NoPokedex") },
      {
        id: 4, name: "FISHER", x: 7, y: 12, dir: 3, surf: true, // on an island in the sea: reachable only with Surf, as in Gold
        script: async (s) => { // MysticWaterGuy
          if (s.flag("GOT_TIDE_CHARM")) return s.text("CherrygroveCity", "MysticWaterGuyTextAfter");
          await s.text("CherrygroveCity", "MysticWaterGuyTextBefore");
          s.give("tide_charm");
          s.flag("GOT_TIDE_CHARM", true);
          await s.say(`${s.name} received TIDE CHARM!`);
          await s.text("CherrygroveCity", "MysticWaterGuyTextAfter");
        },
      },
    ],
    signs: [
      { x: 30, y: 8, script: Game.said("CherrygroveCity", "CherrygroveCitySignText") },
      { x: 23, y: 9, script: Game.said("CherrygroveCity", "GuideGentsHouseSignText") },
      { x: 24, y: 3, script: talk("BUDDYMON MART") },
      { x: 30, y: 3, script: talk("BUDDYMON CENTER") },
    ],
  });
})();

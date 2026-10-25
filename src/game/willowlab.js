// Willow's lab, scripted like Gold's: you walk up to the professor on your own, can't leave until you have a buddymon, pick one
// Gold: ElmsLab.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// (big picture first), she explains the machine and Mr. Buddymon, and her aide hands you a tonic as you head for the door.
// Cells match art/willowLab.js. 10 x 12.
(() => {
  const WILLOW = 1, AIDE = 2;
  const talk = Game.talk;
  const TIPS = ["ElmsLabTravelTip1Text", "ElmsLabTravelTip2Text", "ElmsLabTravelTip3Text", "ElmsLabTravelTip4Text"];
  const tip = (n) => async (s) => s.text("ElmsLab", TIPS[n - 1]);

  const STARTERS = [
    { id: 11, species: "bandit", x: 6, kind: "dark" },
    { id: 12, species: "chomplet", x: 7, kind: "water" },
    { id: 13, species: "bramblet", x: 8, kind: "grass" },
  ];
  // Gold's CyndaquilPokeBallScript etc.: the professor turns to you, the picture of the buddymon shows, she asks, you answer.
  const TAKE = { dark: "TakeCyndaquilText", water: "TakeTotodileText", grass: "TakeChikoritaText" };
  const choose = (st) => async (s) => {
    if (s.flag("GOT_STARTER")) return s.text("ElmsLab", "ElmPokeBallText");
    const name = st.species.toUpperCase();
    s.turn(WILLOW, 0);
    s.pic(st.species);
    const ask = Game.text.ElmsLab[TAKE[st.kind]][0].replace(/SPARKIT|CHOMPLET|BRAMBLET/, name).replace(/the (fire|water|grass) BUDDYMON/, `the ${st.kind} BUDDYMON`);
    await s.say(ask);
    const yes = (await s.ask()) === 0;
    s.unpic();
    if (!yes) return s.text("ElmsLab", "DidntChooseStarterText");
    s.hide(st.id);
    s.flag(`TOOK_${st.species}`, true);
    await s.text("ElmsLab", "ChoseStarterText");
    s.addBuddy(st.species, 5);
    await s.say(`${s.name} received ${name}!`);
    s.flag("GOT_STARTER", true);
    await s.move("player", [...Array(Math.max(0, s.G.state.x - 5)).fill(2), 1]); // step over to the professor, as Gold does
    s.turn("player", 1);
    await s.text("ElmsLab", "ElmDirectionsText1");
    s.turn(WILLOW, 2);
    await s.text("ElmsLab", "ElmDirectionsText2");
    s.turn(WILLOW, 0);
    await s.text("ElmsLab", "ElmDirectionsText3");
    await s.text("ElmsLab", "GotElmsNumberText");
    s.flag("GOT_WILLOW_NUMBER", true);
  };

  // The aide walks over to hand you something as you head for the door: a tonic after your first buddymon, five nets after the egg errand.
  const aide = async (s) => {
    const first = s.flag("GOT_STARTER") && !s.flag("GOT_TONIC"), second = s.flag("GAVE_EGG") && !s.flag("GOT_NETS");
    if (!first && !second) return;
    const x = s.G.state.x; // the aide stands at (2,9) and walks right until he is just below the player
    await s.move(AIDE, Array(x - 2).fill(3));
    s.turn(AIDE, 1);
    s.turn("player", 0);
    if (first) {
      await s.text("ElmsLab", "AideText_GiveYouPotion");
      s.give("tonic");
      s.flag("GOT_TONIC", true);
      await s.say(`${s.name} received a TONIC!`);
      await s.text("ElmsLab", "AideText_AlwaysBusy");
    } else {
      await s.text("ElmsLab", "AideText_GiveYouBalls");
      s.give("buddy_net", 5);
      s.flag("GOT_NETS", true);
      await s.say(`${s.name} received 5 BUDDY NETS!`);
      await s.text("ElmsLab", "AideText_ExplainBalls");
    }
    await s.move(AIDE, Array(x - 2).fill(2));
    s.turn(AIDE, 0);
  };

  // The officer is here about the theft; he asks for your rival's name (typed on your phone's keyboard) and leaves.
  const officer = async (s) => {
    if (!s.flag("COP_IN_LAB") || s.flag("COP_GONE")) return;
    const COP = 3, x = s.G.state.x;
    await s.move("player", x === 4 ? [1, 1] : [2, 1, 1]);
    s.turn("player", 3);
    s.turn(COP, 2);
    await s.text("ElmsLab", "ElmsLabOfficerText1");
    s.G.player.rival = await s.prompt("What was his name?", 7);
    await s.text("ElmsLab", "ElmsLabOfficerText2");
    await s.move(COP, [0, 0, 0, 0, 0]);
    s.hide(COP);
    s.flag("COP_GONE", true);
  };

  // Willow with the egg (ElmAfterTheftScript): she takes it, is amazed by the BUDDYDEX, and sends you off to see your mom.
  const afterTheft = async (s) => {
    await s.text("ElmsLab", "ElmAfterTheftText1");
    if (!s.G.player.bag.mystery_egg) return;
    s.G.player.bag.mystery_egg--;
    await s.text("ElmsLab", "ElmAfterTheftText2");
    await s.text("ElmsLab", "ElmAfterTheftText3");
    await s.text("ElmsLab", "ElmAfterTheftText4");
    await s.text("ElmsLab", "ElmAfterTheftText5");
    s.flag("GAVE_EGG", true);
    await s.text("ElmsLab", "ElmAfterTheftText6");
  };

  Game.indoor("willowlab", "ElmsLab", {
    art: "willowLab", label: "New Bark Town · Willow's Lab",
    npcs: [
      {
        id: WILLOW, name: "WILLOW", x: 5, y: 2, dir: 0,
        script: async (s) => { // ProfElmScript, for the parts of the story we have
          if ((s.G.player.badges || []).includes("ZEPHYRBADGE")) return s.text("ElmsLab", "ElmAideHasEggText");
          if (s.flag("GAVE_EGG")) return s.text("ElmsLab", "ElmStudyingEggText");
          if (s.flag("GOT_EGG")) return afterTheft(s);
          if (s.flag("GOT_STARTER")) return s.text("ElmsLab", "ElmDescribesMrPokemonText");
          return s.text("ElmsLab", "ElmText_LetYourMonBattleIt");
        },
      },
      {
        id: AIDE, name: "SCIENTIST", x: 2, y: 9, dir: 0, wander: "spin", 
        script: async (s) => { // ElmsAideScript
          if (s.flag("GAVE_EGG")) return s.text("ElmsLab", "AideText_ExplainBalls");
          if (s.flag("GOT_EGG")) return s.text("ElmsLab", "AideText_TheftTestimony");
          return s.text("ElmsLab", "AideText_AlwaysBusy");
        },
      },
      { id: 3, name: "OFFICER", x: 5, y: 3, dir: 1, showIf: "COP_IN_LAB", hideIf: "COP_GONE", script: talk("I heard a BUDDYMON was stolen here…") },
      ...STARTERS.map((st) => ({ id: st.id, name: "BUDDY_NET", x: st.x, y: 3, dir: 0, faces: false, hideIf: `TOOK_${st.species}`, script: choose(st) })),
    ],
    signs: [
      {
        x: 2, y: 1,
        script: async (s) => {
          if (!s.flag("GOT_STARTER")) return s.text("ElmsLab", "ElmsLabHealingMachineText1");
          await s.text("ElmsLab", "ElmsLabHealingMachineText2");
          if ((await s.ask()) === 0) { for (const m of s.G.player.party) healMon(m); await s.wait(30); }
        },
      },
      { x: 5, y: 0, script: async (s) => s.text("ElmsLab", s.flag("COP_IN_LAB") && !s.flag("COP_GONE") ? "ElmsLabWindowText2" : "ElmsLabWindowText1") },
      ...[6, 7, 8, 9].flatMap((x) => [1, 7].map((y) => ({ x, y, script: talk("It's full of difficult BUDDYMON books.") }))),
      { x: 9, y: 3, script: async (s) => s.text("ElmsLab", "ElmsLabTrashcanText") },
      { x: 0, y: 7, script: tip(1) },
      { x: 1, y: 7, script: tip(2) },
      { x: 2, y: 7, script: tip(3) },
      { x: 3, y: 7, script: tip(4) },
    ],
    coords: [
      ...[4, 5].map((x) => ({
        x, y: 6,
        script: async (s) => {
          if (s.flag("GOT_STARTER")) return;
          s.turn(WILLOW, 0);
          await s.text("ElmsLab", "LabWhereGoingText");
          await s.move("player", [1]);
        },
      })),
      ...[4, 5].map((x) => ({ x, y: 8, script: aide })),
      ...[4, 5].map((x) => ({ x, y: 5, script: officer })),
    ],
    // Like Gold: the first time in, you walk straight up to the professor and she explains the favor.
    enter: async (s) => {
      if (s.flag("MET_WILLOW")) return;
      await s.move("player", Array(9).fill(1));
      s.turn("player", 3);
      s.turn(WILLOW, 2);
      await s.text("ElmsLab", "ElmText_Intro");
      s.flag("MET_WILLOW", true);
    },
  });
})();

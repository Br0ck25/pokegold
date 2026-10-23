// Willow's lab, scripted like Gold's: you walk up to the professor on your own, can't leave until you have a buddymon, pick one
// Gold: ElmsLab.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// (big picture first), he explains the machine and Mr. Buddymon, and his aide hands you a tonic as you head for the door.
// Cells match art/willowLab.js. 10 x 12.
(() => {
  const WILLOW = 1, AIDE = 2;
  const talk = Game.talk;
  const tip = (n, text) => talk((s) => `${s.name} opened a book.`, `Travel Tip ${n}: ${text}`);

  const STARTERS = [
    { id: 11, species: "bandit", x: 6, kind: "dark" },
    { id: 12, species: "chomplet", x: 7, kind: "water" },
    { id: 13, species: "bramblet", x: 8, kind: "grass" },
  ];
  const choose = (st) => async (s) => {
    if (s.flag("GOT_STARTER")) return s.say("It holds a BUDDYMON that PROF. WILLOW caught.");
    const name = st.species.toUpperCase();
    s.turn(WILLOW, 0);
    s.pic(st.species);
    await s.say(`WILLOW: You'll take ${name}, the ${st.kind} BUDDYMON?`);
    const yes = (await s.ask()) === 0;
    s.unpic();
    if (!yes) return s.say("WILLOW: Think it over carefully. Your partner is important.");
    s.hide(st.id);
    s.flag(`TOOK_${st.species}`, true);
    await s.say("WILLOW: I think that's a great BUDDYMON too!");
    s.addBuddy(st.species, 5);
    await s.say(`${s.name} received ${name}!`);
    s.flag("GOT_STARTER", true);
    await s.move("player", [...Array(Math.max(0, s.G.state.x - 5)).fill(2), 1]); // step over to the professor, as Gold does
    s.turn("player", 1);
    await s.say("WILLOW: MR. BUDDYMON lives a little past CHERRYGROVE, the next town. It's almost a straight road from here.");
    s.turn(WILLOW, 2);
    await s.say("WILLOW: If your BUDDYMON gets hurt, heal it with this machine. Feel free to use it any time.");
    s.turn(WILLOW, 0);
    await s.say("WILLOW: Oh, here's my phone number. Call me if something comes up.");
    await s.say(`${s.name} got WILLOW's phone number.`);
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
      await s.say(`${s.name}, I want you to have this for your errand.`);
      s.give("tonic");
      s.flag("GOT_TONIC", true);
      await s.say(`${s.name} got a TONIC!`);
      await s.say("There are only two of us, so we're always busy.");
    } else {
      await s.say(`${s.name}! Use these on your BUDDYDEX quest!`);
      s.give("buddy_net", 5);
      s.flag("GOT_NETS", true);
      await s.say(`${s.name} received 5 BUDDY NETS!`);
      await s.say("To add to your BUDDYDEX, you have to catch BUDDYMON. Throw BUDDY NETS at wild BUDDYMON to get them.");
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
    await s.say("I heard a BUDDYMON was stolen here... I was just getting some information from PROF. WILLOW. Apparently, it was a young male with long, red hair...");
    await s.say("What? You battled a trainer like that? Did you happen to get his name?");
    s.G.player.rival = await s.prompt("What was his name?", 7);
    await s.say(`OK! So ${s.G.player.rival} was his name. Thanks for helping my investigation!`);
    await s.move(COP, [0, 0, 0, 0, 0]);
    s.hide(COP);
    s.flag("COP_GONE", true);
  };

  // Willow with the egg: he takes it, is amazed by the BUDDYDEX, and sends you off to see your mom.
  const afterTheft = async (s) => {
    await s.say(`WILLOW: ${s.name}, this is terrible... Oh, yes, what was MR. BUDDYMON's big discovery?`);
    if (!s.G.player.bag.mystery_egg) return;
    s.G.player.bag.mystery_egg--;
    await s.say(`${s.name} handed the MYSTERY EGG to PROF. WILLOW.`);
    await s.say("WILLOW: This? But... Is it a BUDDYMON EGG? If it is, it is a great discovery!");
    await s.say(`WILLOW: What?! PROF. ASPEN gave you a BUDDYDEX? ${s.name}, is that true? Th-that's incredible! He is superb at seeing the potential of people as trainers.`);
    await s.say(`WILLOW: Wow, ${s.name}. You may have what it takes to become the CHAMPION. You seem to be getting on great with BUDDYMON too. You should take the BUDDYMON GYM challenge. The closest GYM would be the one in VIOLET CITY.`);
    s.flag("GAVE_EGG", true);
    await s.say(`WILLOW: ...${s.name}. The road to the championship will be a long one. Before you leave, make sure that you talk to your mom.`);
  };

  Game.indoor("willowlab", "ElmsLab", {
    art: "willowLab", label: "New Bark Town · Willow's Lab",
    npcs: [
      {
        id: WILLOW, name: "WILLOW", x: 5, y: 2, dir: 0,
        script: async (s) => {
          if (!s.flag("GOT_STARTER")) return s.say("WILLOW: If a wild BUDDYMON appears, let your BUDDYMON battle it!");
          if (s.flag("GAVE_EGG")) return s.say("WILLOW: Don't give up! I'll call if I learn anything about that EGG!");
          if (s.flag("GOT_EGG")) return afterTheft(s);
          await s.say("WILLOW: MR. BUDDYMON goes everywhere and finds rarities. Too bad they're usually rare and not very useful... " + s.name + ", I'm counting on you!");
        },
      },
      {
        id: AIDE, name: "SCIENTIST", x: 2, y: 9, dir: 0, wander: "spin", 
        script: talk("There are only two of us, so we're always busy."),
      },
      { id: 3, name: "OFFICER", x: 5, y: 3, dir: 1, showIf: "COP_IN_LAB", hideIf: "COP_GONE", script: talk("I'm investigating the break-in. Please don't touch anything.") },
      ...STARTERS.map((st) => ({ id: st.id, name: "BUDDY_NET", x: st.x, y: 3, dir: 0, faces: false, hideIf: `TOOK_${st.species}`, script: choose(st) })),
    ],
    signs: [
      {
        x: 2, y: 1,
        script: async (s) => {
          if (!s.flag("GOT_STARTER")) return s.say("I wonder what this does?");
          await s.say("Heal your BUDDYMON?");
          if ((await s.ask()) === 0) await s.say("Your BUDDYMON were restored to full health!");
        },
      },
      { x: 5, y: 0, script: talk("The window's open. A pleasant breeze is blowing in.") },
      ...[6, 7, 8, 9].flatMap((x) => [1, 7].map((y) => ({ x, y, script: talk("Shelves of thick BUDDYMON books. They look difficult.") }))),
      { x: 9, y: 3, script: talk("The wrapper from the snack PROF. WILLOW ate is in there...") },
      { x: 0, y: 7, script: tip(1, "Press START to open the MENU.") },
      { x: 1, y: 7, script: tip(2, "Record your trip with SAVE!") },
      { x: 2, y: 7, script: tip(3, "Open your PACK to use items.") },
      { x: 3, y: 7, script: tip(4, "Check your BUDDYMON's moves in the party screen.") },
    ],
    coords: [
      ...[4, 5].map((x) => ({
        x, y: 6,
        script: async (s) => {
          if (s.flag("GOT_STARTER")) return;
          s.turn(WILLOW, 0);
          await s.say("WILLOW: Wait! Where are you going?");
          await s.move("player", [1]);
        },
      })),
      ...[4, 5].map((x) => ({ x, y: 8, script: aide })),
      ...[4, 5].map((x) => ({ x, y: 5, script: officer })),
    ],
    // Like Gold: the first time in, you walk straight up to the professor and he explains the favor.
    enter: async (s) => {
      if (s.flag("MET_WILLOW")) return;
      await s.move("player", Array(9).fill(1));
      s.turn("player", 3);
      s.turn(WILLOW, 2);
      await s.say(`WILLOW: ${s.name}! There you are! I needed to ask you a favor.`);
      await s.say("WILLOW: I have an acquaintance called MR. BUDDYMON. He keeps finding weird things and raving about his discoveries.");
      await s.say("WILLOW: Anyway, I just got a message from him saying that this time it's real. It's intriguing, but we're busy with our BUDDYMON research.");
      await s.say("WILLOW: Could you look into it for us? I'll give you a BUDDYMON for a partner. They're all rare BUDDYMON that we just found.");
      await s.say("WILLOW: Go on. Pick one!");
      s.flag("MET_WILLOW", true);
    },
  });
})();

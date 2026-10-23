// Mr. Buddymon's house: Willow's errand. He hands you the MYSTERY EGG, PROF. ASPEN drops in and gives you the BUDDYDEX, and your
// Gold: MrPokemonsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// buddymon get a rest. Then BuddyGear rings: someone broke into the lab. (Same beats as Gold; the rival "steals" the starter you didn't pick.)
(() => {
  const talk = Game.talk;
  const MR = 1, ASPEN = 2;

  const errand = async (s) => {
    if (s.flag("GOT_EGG")) return;
    await s.emote(MR);
    s.turn(MR, 0);
    await s.say(`Hello, hello! You must be ${s.name}. PROF. WILLOW said that you would visit.`);
    await s.move("player", [3]);
    s.turn("player", 1);
    await s.say("This is what I want PROF. WILLOW to examine.");
    s.give("mystery_egg");
    await s.say(`${s.name} received the MYSTERY EGG.`);
    s.flag("GOT_EGG", true);
    s.G.player.lastCenter = { map: "cgcenter", x: 3, y: 6, dir: 1 }; // blackouts now bring you back to Cherrygrove
    await s.say("I know a couple who run a BUDDYMON DAY-CARE service. They gave me that EGG. I was intrigued, so I sent mail to PROF. WILLOW.");
    await s.say("For BUDDYMON evolution, PROF. WILLOW is the authority.");
    s.turn(MR, 3);
    await s.say("Even PROF. ASPEN here recognizes that.");
    s.turn(MR, 0);
    s.turn(ASPEN, 2);
    await s.say("If my assumption is correct, PROF. WILLOW will know it.");
    await s.move(ASPEN, [0, 2, 2]);
    s.turn("player", 3);
    await s.say(`ASPEN: Aha! So you're ${s.name}! I'm ASPEN! A BUDDYMON researcher. I was just visiting my old friend MR. BUDDYMON.`);
    await s.say("I heard you were running an errand for PROF. WILLOW, so I waited here. Oh! What's this? A rare BUDDYMON egg!");
    await s.say("Hm, I see! I understand why PROF. WILLOW gave you a BUDDYMON for this errand. To researchers like PROF. WILLOW and I, BUDDYMON are our friends. He saw that you would treat your BUDDYMON with love and care.");
    await s.say("...Ah! You seem to be dependable. How would you like to help me out? See? This is the latest version of BUDDYDEX. It automatically records data on BUDDYMON you've seen or caught. It's a hi-tech encyclopedia!");
    s.flag("GOT_BUDDYDEX", true);
    await s.say(`${s.name} received BUDDYDEX!`);
    await s.say(`Go meet many kinds of BUDDYMON and complete that BUDDYDEX! But I've stayed too long. I have to get to GOLDENROD for my usual radio show. ${s.name}, I'm counting on you!`);
    s.turn("player", 0);
    await s.move(ASPEN, [0, 2]);
    s.hide(ASPEN);
    await s.wait(15);
    s.turn("player", 1);
    await s.say("You are returning to PROF. WILLOW? Here. Your BUDDYMON should have some rest.");
    s.G.state.dialogue = null;
    for (const m of s.G.player.party) healMon(m);
    await s.wait(60);
    await s.say("I'm depending on you!");
    // Back at the lab someone has broken in and taken the starter you did not choose... the one your rival picked.
    s.flag("TOOK_" + Game.rivalSpecies(s.G.player), true);
    s.flag("RIVAL_NEWBARK_GONE", true);
    s.flag("COP_IN_LAB", true);
    await s.say("BUDDYGEAR is ringing...");
    await s.say(`PROF. WILLOW: ${s.name}, it's WILLOW! Something terrible has happened! Someone broke into the lab and stole a BUDDYMON! I'd like you to come back to the lab as soon as you can.`);
  };

  Game.indoor("mrbuddy", "MrPokemonsHouse", {
    label: "Route 30 · Mr. Buddymon's House",
    npcs: [
      {
        id: MR, name: "GENTLEMAN", x: 3, y: 5, dir: 3,
        script: talk((s) => (s.flag("GAVE_EGG") ? "Life is delightful! Always, new discoveries to be made!" : "I'm depending on you!")),
      },
      { id: ASPEN, name: "ASPEN", x: 6, y: 5, dir: 1, hideIf: "GOT_EGG", script: talk("...") },
    ],
    signs: [
      ...[0, 1].map((x) => ({ x, y: 1, script: talk("It's packed with foreign magazines. Can't even read their titles...") })),
      ...[6, 7].map((x) => ({ x, y: 1, script: talk("It's a big computer. Hmm. It's broken.") })),
      { x: 6, y: 4, script: talk("A whole pile of strange coins! Maybe they're from another country...") },
    ],
    enter: errand,
  });
})();

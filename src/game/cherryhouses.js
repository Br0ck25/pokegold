// Cherrygrove's interiors: the Mart (a clerk behind the counter), the Buddymon Center (the nurse), and three small houses.
// Gold: CherrygroveMart.asm, CherrygrovePokecenter1F.asm, GuideGentsHouse.asm, CherrygroveGymSpeechHouse.asm, CherrygroveEvolutionSpeechHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// Counter cells act as the clerk/nurse: face them and press A, as in Gold.
(() => {
  const talk = Game.talk;
  const books = (n) => [0, 1].map((x) => ({ x, y: 1, script: talk(n) }));

  // --- Mart: clerk (1,3) behind the counter; the counter is a COUNTER tile, so talking across it works
  const clerk = async (s) => { await Game.shop(s, s.flag("GAVE_EGG") ? ["tonic", "remedy", "buddy_net"] : ["tonic", "remedy"]); };
  Game.indoor("cgmart", "CherrygroveMart", {
    art: "roomGrid", theme: "lab", label: "Cherrygrove · Mart",
    npcs: [
      { id: 1, name: "CLERK", x: 1, y: 3, dir: 3, faces: false, script: clerk },
      { id: 2, name: "COOLTRAINER_M", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GAVE_EGG") ? "BUDDY NETS are in stock! Now I can catch BUDDYMON!" : "They're fresh out of BUDDY NETS. Maybe the delivery is late.")) },
      { id: 3, name: "YOUNGSTER", x: 2, y: 5, dir: 0, script: talk("When I was walking in the grass, a bug BUDDYMON poisoned my BUDDYMON! I just kept going, but then my BUDDYMON fainted. You should keep a REMEDY with you.") },
    ],
  });

  // --- Center: nurse (3,1), PC tile (9,1); the stairs door (0,7) to the 2F is shut
  const nurse = (s) => Game.nurse(s, { map: "cgcenter", x: 3, y: 6, dir: 1 });
  Game.indoor("cgcenter", "CherrygrovePokecenter1F", {
    art: "pokecenter", label: "Cherrygrove · Buddymon Center", tiles: { P: Game.pc },
    closed: { POKECENTER_2F: "The COMMUNICATION CENTER upstairs is not open yet." },
    npcs: [
      { id: 1, name: "NURSE", x: 3, y: 1, dir: 0, faces: false, script: nurse },
      { id: 2, name: "FISHER", x: 2, y: 3, dir: 1, script: talk("It's great. I can store any number of BUDDYMON, and it's all free.") },
      { id: 3, name: "GENTLEMAN", x: 8, y: 6, dir: 1, script: talk("That PC is free for any trainer to use.") },
      { id: 4, name: "TEACHER", x: 1, y: 6, dir: 3, script: talk((s) => (s.flag("GAVE_EGG") ? "The COMMUNICATION CENTER upstairs was just built. It should open soon." : "The COMMUNICATION CENTER upstairs is under construction.")) },
    ],
  });

  // --- Small houses (8 x 8)
  const house = (key, gold, label, npcs) => Game.indoor(key, gold, { art: "neighborHouse", label: `Cherrygrove · ${label}`, npcs, signs: books("A shelf of BUDDYMON books and magazines.") });
  house("cggent", "GuideGentsHouse", "Guide Gent's House", [
    { id: 1, name: "GRAMPS", x: 2, y: 3, dir: 3, script: talk("When I was a wee lad, I was a hotshot trainer! Here's a word of advice: Catch lots of BUDDYMON! Treat them all with kindness!") },
  ]);
  house("cggym", "CherrygroveGymSpeechHouse", "Gym Talk House", [
    { id: 1, name: "POKEFAN_M", x: 2, y: 3, dir: 0, script: talk("You're trying to see how good you are as a BUDDYMON trainer? You better visit the BUDDYMON GYMS all over JOHTO and collect BADGES.") },
    { id: 2, name: "BUG_CATCHER", x: 5, y: 5, dir: 2, wander: "horizontal", script: talk("When I get older, I'm going to be a GYM LEADER! I make my BUDDYMON battle with my friend's to make them tougher!") },
  ]);
  house("cgevo", "CherrygroveEvolutionSpeechHouse", "Evolution Talk House", [
    { id: 1, name: "LASS", x: 3, y: 5, dir: 2, script: talk("BUDDYMON change? I would be shocked if one did that!") },
    { id: 2, name: "YOUNGSTER", x: 2, y: 5, dir: 3, script: talk("BUDDYMON gain experience in battle and change their form.") },
  ]);
})();

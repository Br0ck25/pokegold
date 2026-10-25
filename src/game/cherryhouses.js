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
      { id: 2, name: "COOLTRAINER_M", x: 7, y: 6, dir: 2, wander: "horizontal", script: async (s) => s.text("CherrygroveMart", s.flag("GAVE_EGG") ? "CherrygroveMartCooltrainerMText_PokeBallsInStock" : "CherrygroveMartCooltrainerMText") },
      { id: 3, name: "YOUNGSTER", x: 2, y: 5, dir: 0, script: Game.said("CherrygroveMart", "CherrygroveMartYoungsterText") },
    ],
  });

  // --- Center: nurse (3,1), PC tile (9,1); the stairs door (0,7) to the 2F is shut
  const nurse = (s) => Game.nurse(s, { map: "cgcenter", x: 3, y: 6, dir: 1 });
  Game.indoor("cgcenter", "CherrygrovePokecenter1F", {
    art: "pokecenter", label: "Cherrygrove · Buddymon Center", tiles: { P: Game.pc },
    closed: { POKECENTER_2F: "The COMMUNICATION CENTER upstairs is not open yet." },
    npcs: [
      { id: 1, name: "NURSE", x: 3, y: 1, dir: 0, faces: false, script: nurse },
      { id: 2, name: "FISHER", x: 2, y: 3, dir: 1, script: Game.said("CherrygrovePokecenter1F", "CherrygrovePokecenter1FFisherText") },
      { id: 3, name: "GENTLEMAN", x: 8, y: 6, dir: 1, script: Game.said("CherrygrovePokecenter1F", "CherrygrovePokecenter1FGentlemanText") },
      { id: 4, name: "TEACHER", x: 1, y: 6, dir: 3, script: async (s) => s.text("CherrygrovePokecenter1F", s.flag("GAVE_EGG") ? "CherrygrovePokecenter1FTeacherText_CommCenterOpen" : "CherrygrovePokecenter1FTeacherText") },
    ],
  });

  // --- Small houses (8 x 8)
  const house = (key, gold, label, npcs) => Game.indoor(key, gold, { art: "neighborHouse", label: `Cherrygrove · ${label}`, npcs, signs: books("A shelf of BUDDYMON books and magazines.") });
  house("cggent", "GuideGentsHouse", "Guide Gent's House", [
    { id: 1, name: "GRAMPS", x: 2, y: 3, dir: 3, script: Game.said("GuideGentsHouse", "GuideGentsHouseGuideGentText") },
  ]);
  house("cggym", "CherrygroveGymSpeechHouse", "Gym Talk House", [
    { id: 1, name: "POKEFAN_M", x: 2, y: 3, dir: 0, script: Game.said("CherrygroveGymSpeechHouse", "CherrygroveGymSpeechHousePokefanMText") },
    { id: 2, name: "BUG_CATCHER", x: 5, y: 5, dir: 2, wander: "horizontal", script: Game.said("CherrygroveGymSpeechHouse", "CherrygroveGymSpeechHouseBugCatcherText") },
  ]);
  house("cgevo", "CherrygroveEvolutionSpeechHouse", "Evolution Talk House", [
    { id: 1, name: "LASS", x: 3, y: 5, dir: 2, script: Game.said("CherrygroveEvolutionSpeechHouse", "CherrygroveEvolutionSpeechHouseLassText") },
    { id: 2, name: "YOUNGSTER", x: 2, y: 5, dir: 3, script: Game.said("CherrygroveEvolutionSpeechHouse", "CherrygroveEvolutionSpeechHouseYoungsterText") },
  ]);
})();

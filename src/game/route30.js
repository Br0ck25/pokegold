// Route 30: the road north from Cherrygrove to Mr. Buddymon's house. Three trainers watch the road, grass with Gold's wild table,
// Gold: Route30.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// berry trees and a hidden tonic. 20 x 54 cells (Gold's shape).
(() => {
  const talk = Game.talk;
  const mon = (species, level) => [species, level];
  const trainer = (cls, name, party, seen, beaten, after, flag, sight = 4) => ({ name, cls, party, seen, beaten, after, flag, sight });
  const MORN = [[2, "chirplet"], [3, "grublet"], [4, "grublet"], [4, "cocoonet"], [4, "chirplet"], [4, "chirplet"], [4, "chirplet"]];
  const DAY = [[2, "chirplet"], [3, "grublet"], [4, "chirplet"], [4, "cocoonet"], [4, "grublet"], [5, "cocoonet"], [5, "cocoonet"]];
  const NITE = [[3, "spinlet"], [3, "nibblet"], [4, "hootling"], [4, "nibblet"], [4, "hootling"], [4, "hootling"], [4, "hootling"]];

  const bigBattle = async (s) => {
    await s.say("Go, NIBBLET! TACKLE!");
    await s.wait(30);
    await s.say("What? This is a big battle! Leave me alone!");
    s.turn(8, 1);
    await s.wait(30);
  };

  Game.outdoor("route30", "Route30", {
    label: "Route 30",
    style: { "17,5": { roof: "#e0a03a" }, "7,39": { roof: "#d96a3a" } },
    closed: { ROUTE_30_BERRY_HOUSE: "The BERRY house is closed right now." },
    wild: { rate: 10, morn: MORN, day: DAY, nite: NITE },
    npcs: [
      { id: 1, name: "YOUNGSTER", x: 6, y: 29, dir: 2, showIf: "GAVE_EGG", trainer: trainer("YOUNGSTER", "JOEY", [mon("nibblet", 4)], Game.line("Route30", "YoungsterJoey1SeenText"), Game.line("Route30", "YoungsterJoey1BeatenText"), Game.line("Route30", "YoungsterJoey1AfterText"), "BEAT_JOEY", 4) },
      { id: 2, name: "YOUNGSTER", x: 5, y: 23, dir: 0, trainer: trainer("YOUNGSTER", "MIKEY", [mon("chirplet", 2), mon("nibblet", 4)], Game.line("Route30", "YoungsterMikeySeenText"), Game.line("Route30", "YoungsterMikeyBeatenText"), Game.line("Route30", "YoungsterMikeyAfterText"), "BEAT_MIKEY", 1) },
      { id: 3, name: "BUG_CATCHER", x: 4, y: 7, dir: 0, wander: "spin", trainer: trainer("BUG CATCHER", "DON", [mon("grublet", 3), mon("grublet", 3)], Game.line("Route30", "BugCatcherDonSeenText"), Game.line("Route30", "BugCatcherDonBeatenText"), Game.line("Route30", "BugCatcherDonAfterText"), "BEAT_DON", 3) },
      { id: 4, name: "YOUNGSTER", x: 7, y: 31, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GAVE_EGG") ? "Everyone's having fun battling! You should too!" : "MR. BUDDYMON's house? It's a bit farther ahead.")) },
      { id: 5, name: "COOLTRAINER_F", x: 2, y: 13, dir: 0, script: talk("I'm not a trainer. But if you look one in the eyes, prepare to battle.") },
      // Until the egg is delivered, Joey and Mikey are in the middle of a battle that blocks the road (Gold: YoungsterJoey_ImportantBattleScript).
      { id: 8, name: "YOUNGSTER", x: 5, y: 26, dir: 1, hideIf: "GAVE_EGG", script: bigBattle },
      { id: 9, name: "MONSTER", x: 5, y: 24, dir: 0, faces: false, hideIf: "GAVE_EGG", script: talk("…") },
      { id: 10, name: "MONSTER", x: 5, y: 25, dir: 1, faces: false, hideIf: "GAVE_EGG", script: talk("…") },
      { id: 6, name: "FRUIT_TREE", x: 5, y: 39, dir: 0, faces: false, script: Game.berryTree("TREE_R30_A") },
      { id: 7, name: "FRUIT_TREE", x: 11, y: 5, dir: 0, faces: false, script: Game.berryTree("TREE_R30_B") },
    ],
    signs: [
      { x: 9, y: 43, script: talk("ROUTE 30. VIOLET CITY - CHERRYGROVE CITY") },
      { x: 13, y: 29, script: talk("MR. BUDDYMON'S HOUSE straight ahead!") },
      { x: 15, y: 5, script: talk("MR. BUDDYMON'S HOUSE") },
      { x: 3, y: 21, script: talk("TRAINER TIPS: No stealing other people's BUDDYMON! BUDDY NETS are to be thrown only at wild BUDDYMON!") },
      { x: 14, y: 9, script: Game.hiddenItem("R30_TONIC", "tonic") },
    ],
  });
})();

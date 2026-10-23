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

  Game.outdoor("route30", "Route30", {
    label: "Route 30",
    style: { "17,5": { roof: "#e0a03a" }, "7,39": { roof: "#d96a3a" } },
    closed: { ROUTE_30_BERRY_HOUSE: "The BERRY house is closed right now." },
    wild: { rate: 10, morn: MORN, day: DAY, nite: NITE },
    npcs: [
      { id: 1, name: "YOUNGSTER", x: 6, y: 29, dir: 2, trainer: trainer("YOUNGSTER", "JOEY", [mon("nibblet", 4)], "I just lost, so I'm trying to find more BUDDYMON. Wait! You look weak! Come on, let's battle!", "Ugh. I don't have any more BUDDYMON.", "I have to have more BUDDYMON for battles. I'm going to catch some more!", "BEAT_JOEY", 4) },
      { id: 2, name: "YOUNGSTER", x: 5, y: 23, dir: 0, trainer: trainer("YOUNGSTER", "MIKEY", [mon("chirplet", 2), mon("nibblet", 4)], "You're a BUDDYMON trainer, right? Then you have to battle!", "That's strange. I won before.", "Becoming a good trainer is really tough. I'm going to battle other people to get better.", "BEAT_MIKEY", 1) },
      { id: 3, name: "BUG_CATCHER", x: 4, y: 7, dir: 0, wander: "spin", trainer: trainer("BUG CATCHER", "DON", [mon("grublet", 3), mon("grublet", 3)], "Instead of a bug BUDDYMON, I found a trainer!", "Argh! You're too strong!", "I ran out of BUDDY NETS while I was catching BUDDYMON. I should've bought some more...", "BEAT_DON", 3) },
      { id: 4, name: "YOUNGSTER", x: 7, y: 31, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GAVE_EGG") ? "Everyone's having fun battling! You should too!" : "MR. BUDDYMON's house? It's a bit farther ahead.")) },
      { id: 5, name: "COOLTRAINER_F", x: 2, y: 13, dir: 0, script: talk("I'm not a trainer. But if you look one in the eyes, prepare to battle.") },
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

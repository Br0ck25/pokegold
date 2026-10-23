// Route 30: the road north from Cherrygrove to Mr. Buddymon's house. Three trainers watch the road, grass with Gold's wild table,
// Gold: Route30.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// berry trees and a hidden tonic. 32 x 40 cells, original layout.
(() => {
  const cols = 32, rows = 40;
  const cells = Array.from({ length: rows }, () => Array(cols).fill("."));
  const put = (kind, ...pts) => pts.forEach(([x, y]) => (cells[y][x] = kind));
  const fill = (kind, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cells[y][x] = kind; };
  fill("T", 0, 0, 31, 1); fill("T", 0, 0, 7, 39); fill("T", 26, 0, 31, 39); fill("T", 0, 39, 31, 39);
  fill("p", 15, 35, 16, 39); // south: Cherrygrove
  fill("p", 15, 0, 16, 3); // north: Route 31
  fill("g", 8, 24, 13, 30); fill("g", 20, 14, 25, 20); fill("g", 8, 6, 12, 10); fill("g", 20, 34, 25, 37);
  fill("T", 8, 16, 11, 19); fill("T", 21, 25, 25, 28); fill("T", 8, 33, 11, 36);
  put("f", [14, 9], [18, 22], [13, 32], [24, 30], [10, 12], [24, 11]);
  put("S", [14, 22], [13, 6], [14, 36], [20, 34]);
  put("T", [22, 4], [23, 4], [9, 3], [10, 3]);

  const talk = Game.talk;
  const mon = (species, level) => [species, level];
  const trainer = (cls, name, party, seen, beaten, after, flag, sight = 4) => ({ name, cls, party, seen, beaten, after, flag, sight });
  const MORN = [[2, "chirplet"], [3, "grublet"], [4, "grublet"], [4, "cocoonet"], [4, "chirplet"], [4, "chirplet"], [4, "chirplet"]];
  const DAY = [[2, "chirplet"], [3, "grublet"], [4, "chirplet"], [4, "cocoonet"], [4, "grublet"], [5, "cocoonet"], [5, "cocoonet"]];
  const NITE = [[3, "spinlet"], [3, "nibblet"], [4, "hootling"], [4, "nibblet"], [4, "hootling"], [4, "hootling"], [4, "hootling"]];

  Game.register("route30", {
    world: {
      label: "Route 30", cols, rows, cells: cells.map((r) => r.join("")),
      buildings: [{ x: 14, y: 3, w: 5, h: 4, door: 2, to: "mrbuddy", tx: 2, ty: 6, dir: 1, roof: "#e0a03a" }],
    },
    wild: { rate: 10, morn: MORN, day: DAY, nite: NITE },
    warps: [15, 16].map((x) => ({ x, y: 39, to: "cherrygrove", tx: x, ty: 1, dir: 0 })).concat([15, 16].map((x) => ({ x, y: 0, to: "route31", tx: x + 10, ty: 16, dir: 1 }))),
    npcs: [
      { id: 1, name: "YOUNGSTER", x: 19, y: 30, dir: 2, trainer: trainer("YOUNGSTER", "JOEY", [mon("nibblet", 4)], "I just lost, so I'm trying to find more BUDDYMON. Wait! You look weak! Come on, let's battle!", "Ugh. I don't have any more BUDDYMON.", "I have to have more BUDDYMON for battles. I'm going to catch some more!", "BEAT_JOEY") },
      { id: 2, name: "YOUNGSTER", x: 12, y: 21, dir: 3, trainer: trainer("YOUNGSTER", "MIKEY", [mon("chirplet", 2), mon("nibblet", 4)], "You're a BUDDYMON trainer, right? Then you have to battle!", "That's strange. I won before.", "Becoming a good trainer is really tough. I'm going to battle other people to get better.", "BEAT_MIKEY", 6) },
      { id: 3, name: "BUG_CATCHER", x: 19, y: 12, dir: 2, trainer: trainer("BUG CATCHER", "DON", [mon("grublet", 3), mon("grublet", 3)], "Instead of a bug BUDDYMON, I found a trainer!", "Argh! You're too strong!", "I ran out of BUDDY NETS while I was catching BUDDYMON. I should've bought some more...", "BEAT_DON", 5) },
      { id: 4, name: "YOUNGSTER", x: 16, y: 34, dir: 0, wander: "horizontal", script: talk((s) => (s.flag("GAVE_EGG") ? "Everyone's having fun battling! You should too!" : "MR. BUDDYMON's house? It's a bit farther ahead.")) },
      { id: 5, name: "COOLTRAINER_F", x: 21, y: 8, dir: 0, script: talk("I'm not a trainer. But if you look one in the eyes, prepare to battle.") },
      { id: 6, name: "FRUIT_TREE", x: 10, y: 9, dir: 0, faces: false, script: Game.berryTree("TREE_R30_A") },
      { id: 7, name: "FRUIT_TREE", x: 21, y: 31, dir: 0, faces: false, script: Game.berryTree("TREE_R30_B") },
    ],
    signs: [
      { x: 14, y: 36, script: talk("ROUTE 30. VIOLET CITY - CHERRYGROVE CITY") },
      { x: 14, y: 22, script: talk("MR. BUDDYMON'S HOUSE straight ahead!") },
      { x: 13, y: 6, script: talk("MR. BUDDYMON'S HOUSE") },
      { x: 20, y: 34, script: talk("TRAINER TIPS: No stealing other people's BUDDYMON! BUDDY NETS are to be thrown only at wild BUDDYMON!") },
      { x: 24, y: 5, script: Game.hiddenItem("R30_TONIC", "tonic") },
    ],
  });
})();

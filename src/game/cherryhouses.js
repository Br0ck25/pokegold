// Cherrygrove's interiors: the Mart (a clerk behind the counter), the Buddymon Center (the nurse), and three small houses.
// Gold: CherrygroveMart.asm, CherrygrovePokecenter1F.asm, GuideGentsHouse.asm, CherrygroveGymSpeechHouse.asm, CherrygroveEvolutionSpeechHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// Counter cells act as the clerk/nurse: face them and press A, as in Gold.
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const grid = (w, h, blocked) => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join(""));
  const talk = Game.talk;
  const exit = (xs, to, tx, ty, y = 7) => xs.map((x) => ({ x, y, to, tx, ty, dir: 0 }));

  // --- Mart (12 x 8): shelves along the back wall, counter at (0..2,4), clerk behind it
  const clerk = async (s) => { await Game.shop(s, s.flag("GAVE_EGG") ? ["tonic", "buddy_net"] : ["tonic"]); };
  Game.register("cgmart", {
    room: { art: "cherrygroveMart", cols: 12, rows: 8, label: "Cherrygrove · Mart" },
    solid: grid(12, 8, new Set([...rect(0, 0, 11, 0), ...rect(3, 1, 11, 1), ...rect(0, 4, 2, 4)])),
    warps: exit([2, 3], "cherrygrove", 22, 7),
    npcs: [
      { id: 1, name: "CLERK", x: 1, y: 3, dir: 0, faces: false, script: clerk },
      { id: 2, name: "COOLTRAINER_M", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk((s) => (s.flag("GAVE_EGG") ? "BUDDY NETS are in stock! Now I can catch BUDDYMON!" : "They're fresh out of BUDDY NETS! When will they get more of them?")) },
      { id: 3, name: "YOUNGSTER", x: 2, y: 5, dir: 0, script: talk("When I was walking in the grass, a bug BUDDYMON poisoned my BUDDYMON! I just kept going, but then my BUDDYMON fainted. You should keep an ANTIDOTE with you.") },
    ],
    signs: [0, 1, 2].map((x) => ({ x, y: 4, script: clerk })),
  });

  // --- Center (10 x 8): counter (0..5,2), nurse at (3,1), machine and PC against the wall
  const nurse = (s) => Game.nurse(s, { map: "cgcenter", x: 3, y: 6, dir: 1 });
  Game.register("cgcenter", {
    room: { art: "pokecenter", cols: 10, rows: 8, label: "Cherrygrove · Buddymon Center" },
    solid: grid(10, 8, new Set([...rect(0, 0, 9, 0), ...rect(0, 1, 2, 1), ...rect(5, 1, 5, 1), ...rect(9, 1, 9, 1), ...rect(0, 2, 5, 2), ...rect(7, 5, 8, 5), ...rect(7, 7, 8, 7)])),
    warps: exit([3, 4], "cherrygrove", 29, 7),
    npcs: [
      { id: 1, name: "NURSE", x: 3, y: 1, dir: 0, faces: false, script: nurse },
      { id: 2, name: "FISHER", x: 2, y: 3, dir: 1, script: talk("It's great. I can store any number of BUDDYMON, and it's all free.") },
      { id: 3, name: "GENTLEMAN", x: 8, y: 6, dir: 1, script: talk("That PC is free for any trainer to use.") },
      { id: 4, name: "TEACHER", x: 1, y: 6, dir: 3, script: talk((s) => (s.flag("GAVE_EGG") ? "The COMMUNICATION CENTER upstairs was just built. It should open soon." : "The COMMUNICATION CENTER upstairs was just built. But they're still finishing it up.")) },
    ],
    signs: [
      ...[0, 1, 2, 3, 4, 5].map((x) => ({ x, y: 2, script: nurse })),
      { x: 9, y: 1, script: talk((s) => `${s.name} turned on the PC.`, "The BUDDYMON storage system is not online yet.") },
    ],
  });

  // --- Small houses: all share the 8 x 8 living room art (shelves (0..1,1), TV (2,1), table (3..4,3..4), radio (7,1))
  const house = (key, out, label, npcs, signs = []) => Game.register(key, {
    room: { art: "neighborHouse", cols: 8, rows: 8, label: `Cherrygrove · ${label}` },
    solid: grid(8, 8, new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 2, 1), ...rect(7, 1, 7, 1), ...rect(3, 3, 4, 4), ...rect(0, 6, 0, 7), ...rect(7, 6, 7, 7)])),
    warps: exit([2, 3], "cherrygrove", out[0], out[1]),
    npcs,
    signs: [0, 1].map((x) => ({ x, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") })).concat(signs),
  });
  house("cggent", [21, 15], "Guide Gent's House", [
    { id: 1, name: "GRAMPS", x: 2, y: 3, dir: 3, script: talk("When I was a wee lad, I was a hotshot trainer! Here's a word of advice: Catch lots of BUDDYMON! Treat them all with kindness!") },
  ]);
  house("cggym", [8, 8], "Gym Talk House", [
    { id: 1, name: "POKEFAN_M", x: 2, y: 3, dir: 0, script: talk("You're trying to see how good you are as a BUDDYMON trainer? You better visit the BUDDYMON GYMS all over JOHTO and collect BADGES.") },
    { id: 2, name: "BUG_CATCHER", x: 5, y: 5, dir: 2, wander: "horizontal", script: talk("When I get older, I'm going to be a GYM LEADER! I make my BUDDYMON battle with my friend's to make them tougher!") },
  ]);
  house("cgevo", [30, 15], "Evolution Talk House", [
    { id: 1, name: "LASS", x: 3, y: 5, dir: 2, script: talk("BUDDYMON change? I would be shocked if one did that!") },
    { id: 2, name: "YOUNGSTER", x: 2, y: 5, dir: 3, script: talk("BUDDYMON gain experience in battle and change their form.") },
  ]);
})();

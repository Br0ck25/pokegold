// The neighbor's house (cells match art/neighborHouse.js): shelves (0..1,1), TV (2,1), radio (7,1), table (3..4,3..4). The neighbor's daughter is the only one home.
// Gold: PlayersNeighborsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const blocked = new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 2, 1), ...rect(7, 1, 7, 1), ...rect(3, 3, 4, 4), ...rect(0, 6, 0, 7), ...rect(7, 6, 7, 7)]);
  const talk = Game.talk;
  Game.register("neighbor", {
    room: { art: "neighborHouse", cols: 8, rows: 8, label: "New Bark Town · Neighbors' House" },
    solid: Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join("")),
    warps: [2, 3].map((x) => ({ x, y: 7, to: "newbark", tx: 5, ty: 16, dir: 0 })),
    npcs: [{
      id: 1, name: "COOLTRAINER_F", x: 2, y: 3, dir: 3,
      script: talk("A buddymon that evolves is a wonder. I was amazed by PROF. WILLOW's findings.", "He's so famous for his research on BUDDYMON evolution. ...sigh... I wish I could be a researcher like him..."),
    }],
    signs: [
      { x: 0, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      { x: 1, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      {
        x: 7, y: 1,
        script: async (s) => {
          await s.say("Tuning in to BUDDYMON TALK with PROF. ASPEN...");
          await s.say("...BUDDYMON CHANNEL!");
        },
      },
    ],
  });
})();

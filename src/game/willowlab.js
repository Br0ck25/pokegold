// Willow's lab: meet the professor, then pick your first buddymon from the three on the table (cells match art/willowLab.js).
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const blocked = new Set([...rect(0, 0, 9, 0), ...rect(0, 1, 3, 2), ...rect(6, 1, 9, 1), ...rect(6, 3, 9, 3), ...rect(0, 6, 3, 7), ...rect(6, 6, 9, 7)]);
  const solid = Array.from({ length: 12 }, (_, y) => Array.from({ length: 10 }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join(""));
  const STARTERS = [{ id: 11, species: "bramblet", x: 6, kind: "grass" }, { id: 12, species: "sparkit", x: 7, kind: "fire" }, { id: 13, species: "chomplet", x: 8, kind: "water" }];

  const choose = (st) => async (s) => {
    if (s.flag("GOT_STARTER")) return s.say("Don't be greedy! You already have your partner.");
    if (!s.flag("MET_WILLOW")) return s.say("Talk to PROF. WILLOW first.");
    const name = st.species.toUpperCase();
    await s.say(`PROF. WILLOW: So you'd like ${name}, the ${st.kind} buddymon?`);
    if (await s.ask() !== 0) return s.say("PROF. WILLOW: Think it over carefully.");
    s.hide(st.id);
    s.flag(`TOOK_${st.species}`, true);
    s.addBuddy(st.species, 5);
    s.flag("GOT_STARTER", true);
    await s.say(`${s.name} chose ${name}!`);
    await s.say(`PROF. WILLOW: ${name} seems to like you already. Take good care of it!`);
    s.give("buddy_net", 5);
    await s.say("PROF. WILLOW: To make friends with wild BUDDYMON, throw a BUDDY NET at them. Here, take a few.");
    await s.say(`${s.name} got 5 BUDDY NETS!`);
  };

  Game.register("willowlab", {
    room: { art: "willowLab", cols: 10, rows: 12, label: "New Bark Town · Willow's Lab" },
    solid,
    warps: [4, 5].map((x) => ({ x, y: 11, to: "newbark", tx: 11, ty: 14, dir: 0 })),
    npcs: [
      {
        id: 1, name: "WILLOW", x: 5, y: 3, dir: 0,
        script: async (s) => {
          await s.say(s.flag("GOT_STARTER") ? "PROF. WILLOW: How is your BUDDYMON doing? Come back whenever you like." : "PROF. WILLOW: Pick one of the three BUDDYMON on the table. Face it and press A.");
        },
      },
      ...STARTERS.map((st) => ({ id: st.id, name: "BUDDY_NET", x: st.x, y: 3, dir: 0, faces: false, hideIf: `TOOK_${st.species}`, script: choose(st) })),
    ],
    enter: async (s) => {
      if (s.flag("MET_WILLOW")) return;
      await s.say(`PROF. WILLOW: Ah, ${s.name}! There you are. I have a favor to ask.`);
      await s.say("PROF. WILLOW: I'm studying how BUDDYMON grow when they travel with someone. I need a partner to help me.");
      await s.say("PROF. WILLOW: The three BUDDYMON on that table are volunteers. Choose the one you like best!");
      s.flag("MET_WILLOW", true);
    },
  });
})();

// Trainer card, BuddyGear (the clock) and Options.
Game.cardScreen = async (s) => {
  const P = s.G.player, owned = new Set([...P.party, ...P.boxes.flat()].map((m) => m.species)).size;
  const mins = Math.floor(P.play / 60), time = `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
  await s.panel({
    title: "TRAINER CARD", rows: [],
    lines: [`NAME  ${P.name}`, `ID NO.  ${String(P.id).padStart(5, "0")}`, `${Game.CURRENCY}  ${P.money}`, `BUDDYDEX  ${owned} caught`, `PLAY TIME  ${time}`, `BADGES  0 / 8`],
  });
};

// BuddyGear shows the device's own clock and date.
Game.gearScreen = async (s) => {
  const now = new Date(), day = now.toLocaleDateString(undefined, { weekday: "long" });
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const contacts = ["MOM", ...(s.flag("GOT_WILLOW_NUMBER") ? ["PROF. WILLOW"] : [])];
  await s.panel({ title: "BUDDYGEAR", rows: [], lines: [time, day, "", `Phone: ${contacts.join(", ")}`] });
};

// Options: text speed (how long battle messages stay up). Left/right changes the value.
Game.SPEEDS = { slow: 2000, mid: 1200, fast: 600 };
Game.applyOptions = () => { Game.msgMs = Game.SPEEDS[Game.player.options.speed] ?? 1200; };
Game.optionsScreen = async (s) => {
  const o = s.G.player.options, names = Object.keys(Game.SPEEDS);
  for (;;) {
    const r = await s.panel({ title: "OPTION", rows: [{ label: "TEXT SPEED", right: `◀ ${o.speed.toUpperCase()} ▶` }], hint: "Left / right to change" });
    if (r.key === "B") return;
    if (r.key === "L" || r.key === "R" || r.key === "A") {
      o.speed = names[(names.indexOf(o.speed) + (r.key === "L" ? names.length - 1 : 1)) % names.length];
      Game.applyOptions();
    }
  }
};

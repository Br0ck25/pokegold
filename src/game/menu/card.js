// Trainer card, BuddyGear (the clock) and Options.
Game.cardScreen = async (s) => {
  const P = s.G.player, owned = new Set([...P.party, ...P.boxes.flat()].map((m) => m.species)).size;
  const mins = Math.floor(P.play / 60), time = `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
  await s.panel({
    title: "TRAINER CARD", rows: [],
    lines: [`NAME  ${P.name}`, `ID NO.  ${String(P.id).padStart(5, "0")}`, `${Game.CURRENCY}  ${P.money}`, `BUDDYDEX  ${owned} caught`, `PLAY TIME  ${time}`, `BADGES  ${(P.badges || []).length} / 8`],
  });
};

// BuddyGear shows the device's own clock and date.
Game.gearScreen = async (s) => {
  for (;;) {
    const now = new Date(), day = now.toLocaleDateString(undefined, { weekday: "long" });
    const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const contacts = ["MOM", ...(s.flag("GOT_WILLOW_NUMBER") ? ["PROF. WILLOW"] : [])];
    const rows = [...(s.flag("GOT_MAP_CARD") ? [{ label: "MAP", right: "▶" }] : []), { label: "PHONE", right: contacts.join(", ") }];
    const r = await s.panel({ title: "BUDDYGEAR", rows, lines: [`${time}  ${day}`], hint: s.flag("GOT_MAP_CARD") ? "" : "Get a MAP CARD from the GUIDE GENT to see the map." });
    if (r.key !== "A") return;
    if (rows[r.i].label === "MAP") await Game.townMap(s);
    else await s.say("Phone calls aren't connected yet. Your contacts will call you when they have news.");
  }
};

// The map from the MAP CARD: Johto as far as we have built it, with a blinking dot where you are. (Art.townMap in art/townmap.js)
Game.townMap = async (s) => {
  const here = s.G.state.map.key, name = Art.townMapPlace(here);
  await s.panel({ title: "MAP", townmap: here, rows: [], lines: [name ? `You are in ${name}.` : "You are somewhere unmarked."], hint: "Press B to close." });
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

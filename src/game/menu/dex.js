// BUDDYDEX: every species in order, "-----" until you have seen it; a dot for seen, a ball of net for caught.
Game.dexScreen = async (s) => {
  const dex = s.G.player.dex || {}, keys = Object.keys(SPECIES);
  let at = 0;
  for (;;) {
    const seen = keys.filter((k) => dex[k]).length, caught = keys.filter((k) => dex[k] === "caught").length;
    const r = await s.panel({
      title: "BUDDYDEX", lines: [`Seen ${seen}   Caught ${caught}`],
      rows: keys.map((k, n) => ({ label: `No.${String(n + 1).padStart(3, "0")}  ${dex[k] ? SPECIES[k].name : "-----"}`, right: dex[k] === "caught" ? "caught" : dex[k] ? "seen" : "", dim: !dex[k] })),
    }, at);
    if (r.key === "B") return;
    if (r.key !== "A" || !dex[keys[r.i]]) continue;
    at = r.i;
    const sp = SPECIES[keys[at]];
    await s.panel({ title: sp.name, art: keys[at], rows: [], lines: [`No.${String(at + 1).padStart(3, "0")}  ·  ${sp.types.join(" / ").toUpperCase()}`, dex[keys[at]] === "caught" ? "You have caught this BUDDYMON." : "You have only seen this BUDDYMON so far."] });
  }
};

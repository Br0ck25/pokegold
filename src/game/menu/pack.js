// Pack screen: three pockets (Items, Nets, Key items) switched with left/right or the tabs; a chosen item offers USE.
Game.packScreen = async (s) => {
  const P = s.G.player, POCKETS = ["items", "nets", "key"], LABELS = ["ITEMS", "NETS", "KEY ITEMS"];
  let tab = 0, at = 0;
  const keyItems = () => [
    ...(s.flag("GOT_BUDDYGEAR") ? [{ key: "buddygear", name: "BUDDYGEAR", count: 0 }] : []),
    ...(s.flag("GOT_MAP_CARD") ? [{ key: "mapcard", name: "MAP CARD", count: 0 }] : []),
    ...Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].pocket === "key").map((k) => ({ key: k, name: ITEMS[k].name, count: 0 })),
  ];
  const entries = (pocket) => (pocket === "key"
    ? keyItems()
    : Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].pocket === pocket).map((k) => ({ key: k, name: ITEMS[k].name, count: P.bag[k] })));
  for (;;) {
    const list = entries(POCKETS[tab]);
    const r = await s.panel({
      title: "PACK", tabs: LABELS.map((label, n) => ({ label, sel: n === tab })), rows: list.map((e) => ({ label: e.name, right: e.count ? `x${e.count}` : "" })),
      lines: list.length ? [] : ["Nothing here yet."], hint: "Left / right to change pocket",
    }, at);
    if (r.key === "B") return;
    if (r.key === "L" || r.key === "R") { tab = (tab + (r.key === "R" ? 1 : 2)) % 3; at = 0; continue; }
    at = r.i;
    const item = list[r.i];
    if ((await s.choose(["USE", "CANCEL"], { c0: 13, r0: 5, cancel: 1 })) !== 0) continue;
    if (item.key === "buddygear") await Game.gearScreen(s);
    else if (item.key === "mapcard" || ITEMS[item.key].pocket === "key") await s.say("It can't be used here.");
    else if (ITEMS[item.key].net) await s.say("Nets are for throwing at wild BUDDYMON in battle.");
    else {
      const who = await s.panel({ title: `Use ${ITEMS[item.key].name} on...`, rows: P.party.map((m) => { const max = statsFor(m).hp; return { label: m.nick, g: m.gender, sub: `Lv ${m.level}${m.status ? "  " + STATUS_TAG[m.status] : ""}`, right: `${m.hp}/${max}`, bar: m.hp / max, art: m.species }; }) });
      if (who.key === "A") await Game.useOn(s, item.key, P.party[who.i]);
    }
  }
};

// Pack screen: three pockets (Items, Nets, Key items) switched with left/right or the tabs; a chosen item offers USE.
// SELECT on an item picks it up, SELECT on another swaps them (Gold). A key item can be REGISTERED: SELECT on the map then uses it.
Game.packScreen = async (s) => {
  const P = s.G.player, POCKETS = ["items", "nets", "key"], LABELS = ["ITEMS", "NETS", "KEY ITEMS"];
  let tab = 0, at = 0, held = null;
  const order = (P.bagOrder ||= []), rank = (k) => (order.indexOf(k) < 0 ? 999 : order.indexOf(k));
  const keyItems = () => [
    ...(s.flag("GOT_BUDDYGEAR") ? [{ key: "buddygear", name: "BUDDYGEAR", count: 0 }] : []),
    ...(s.flag("GOT_MAP_CARD") ? [{ key: "mapcard", name: "MAP CARD", count: 0 }] : []),
    ...Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].pocket === "key").map((k) => ({ key: k, name: ITEMS[k].name, count: 0 })),
  ];
  const sorted = (list) => list.map((e, n) => [e, n]).sort((a, b) => rank(a[0].key) - rank(b[0].key) || a[1] - b[1]).map((x) => x[0]);
  const entries = (pocket) => sorted(pocket === "key"
    ? keyItems()
    : Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].pocket === pocket).map((k) => ({ key: k, name: ITEMS[k].name, count: P.bag[k] })));
  for (;;) {
    const list = entries(POCKETS[tab]);
    const r = await s.panel({
      title: "PACK", tabs: LABELS.map((label, n) => ({ label, sel: n === tab })), rows: list.map((e) => ({ label: e.name, right: e.count ? `x${e.count}` : "" })),
      lines: list.length ? [] : ["Nothing here yet."], hint: held ? `Moving ${ITEMS[held] ? ITEMS[held].name : held.toUpperCase()}: SELECT on another item swaps them` : "Left / right to change pocket. SELECT moves items.",
    }, at);
    if (r.key === "B") return;
    if (r.key === "L" || r.key === "R") { tab = (tab + (r.key === "R" ? 1 : 2)) % 3; at = 0; continue; }
    at = r.i;
    const item = list[r.i];
    if (r.key === "S") {
      if (!held || !list.some((e) => e.key === held)) held = item.key;
      else {
        const keys = list.map((e) => e.key), a = keys.indexOf(held), b = r.i;
        [keys[a], keys[b]] = [keys[b], keys[a]];
        P.bagOrder = order.filter((k) => !keys.includes(k)).concat(keys);
        held = null;
      }
      continue;
    }
    held = null;
    const key = POCKETS[tab] === "key", reg = P.registered === item.key;
    const pick = await s.choose(key ? ["USE", reg ? "UNREGISTER" : "REGISTER", "CANCEL"] : ["USE", "CANCEL"], { c0: 12, r0: 5, cancel: key ? 2 : 1 });
    if (key && pick === 1) { P.registered = reg ? null : item.key; await s.say(reg ? `${item.name} is no longer registered.` : `${item.name} is registered. Press SELECT on the map to use it.`); continue; }
    if (pick !== 0) continue;
    if (item.key === "buddygear") await Game.gearScreen(s);
    else if (item.key === "mapcard") await Game.townMap(s);
    else if (ITEMS[item.key].pocket === "key") await s.say("It can't be used here.");
    else if (ITEMS[item.key].net) await s.say("Nets are for throwing at wild BUDDYMON in battle.");
    else {
      const who = await s.panel({ title: `Use ${ITEMS[item.key].name} on...`, rows: P.party.map((m) => { const max = statsFor(m).hp; return { label: m.nick, g: m.gender, sub: `Lv ${m.level}${m.status ? "  " + STATUS_TAG[m.status] : ""}`, right: `${m.hp}/${max}`, bar: m.hp / max, art: m.species }; }) });
      if (who.key === "A") await Game.useOn(s, item.key, P.party[who.i]);
    }
  }
};

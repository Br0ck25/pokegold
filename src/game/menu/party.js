// Party screen: the list with HP bars; a chosen buddymon offers STATS, SWITCH, ITEM, CANCEL (as in Gold).
// Using a healing item is shared with the Pack: Game.useOn(s, itemKey, mon).
Game.useOn = async (s, key, mon) => {
  const it = ITEMS[key], max = statsFor(mon).hp;
  if (!it.heal || mon.hp <= 0 || mon.hp >= max) return s.say("It won't have any effect.");
  const gain = Math.min(it.heal, max - mon.hp);
  mon.hp += gain;
  s.G.player.bag[key]--;
  await s.say(`${mon.nick} regained ${gain} HP.`);
};

Game.partyScreen = async (s) => {
  const P = s.G.player, partyRows = () => P.party.map((m) => { const max = statsFor(m).hp; return { label: m.nick, sub: `Lv ${m.level}`, right: `${m.hp}/${max}`, bar: m.hp / max, art: m.species, dim: m.hp <= 0 }; });
  const summary = async (m) => {
    const st = statsFor(m), sp = SPECIES[m.species], next = growthExp(sp.growth, m.level + 1) - m.exp;
    await s.panel({
      title: m.nick, art: m.species, rows: [],
      lines: [`Lv ${m.level}  ·  ${sp.types.join(" / ").toUpperCase()}`, `HP ${m.hp}/${st.hp}  ATK ${st.atk}  DEF ${st.def}`, `SP.ATK ${st.spa}  SP.DEF ${st.spd}  SPEED ${st.spe}`, `EXP ${m.exp}  ·  ${next} to next level`, ...m.moves.map((x) => `${MOVES[x.id].name}  ${x.pp}/${MOVES[x.id].pp}`)],
    });
  };
  let at = 0;
  for (;;) {
    const r = await s.panel({ title: "BUDDYMON", rows: partyRows(), hint: "Pick one" }, at);
    if (r.key === "B") return;
    if (r.key !== "A") continue;
    at = r.i;
    const mon = P.party[at], pick = await s.choose(["STATS", "SWITCH", "ITEM", "CANCEL"], { c0: 12, r0: 5, cancel: 3 });
    if (pick === 0) await summary(mon);
    else if (pick === 1 && P.party.length > 1) {
      const to = await s.panel({ title: `Switch ${mon.nick} with...`, rows: partyRows() }, at);
      if (to.key === "A" && to.i !== at) { [P.party[at], P.party[to.i]] = [P.party[to.i], P.party[at]]; at = to.i; }
    } else if (pick === 2) {
      const keys = Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].heal);
      if (!keys.length) { await s.say("You have nothing to use."); continue; }
      const it = await s.choose([...keys.map((k) => `${ITEMS[k].name} x${P.bag[k]}`), "CANCEL"], { c0: 8, r0: 5, cancel: keys.length });
      if (it < keys.length) await Game.useOn(s, keys[it], mon);
    }
  }
};

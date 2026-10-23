// After a win: experience, level-ups and new moves (Gold: exp = base exp * foe level / 7, shared by buddymon that fought).
// xpBar: how far through the current level a buddymon is, 0..1 (the thin bar under the HP bar on the battle screen).
const xpBar = (mon) => { const g = SPECIES[mon.species].growth, a = growthExp(g, mon.level), b = growthExp(g, mon.level + 1); return Math.max(0, Math.min(1, (mon.exp - a) / (b - a || 1))); };

// xpText: "into the level / needed for the next" as numbers, shown beside the bar.
const xpText = (mon) => { const g = SPECIES[mon.species].growth, a = growthExp(g, mon.level); return `${mon.exp - a} / ${growthExp(g, mon.level + 1) - a}`; };

async function awardExp(s, party, fought, foe, wild, refresh, leveled) {
  const gain = Math.max(1, Math.floor(expGain(foe, wild) / fought.size));
  for (const mon of [...fought]) {
    if (mon.hp <= 0) continue;
    mon.exp += gain;
    await s.msg(`${mon.nick} gained ${gain} EXP. Points!`);
    refresh(); // then the bar fills (to the brim when a level is earned) and we let you watch it
    await s.wait(75);
    const growth = SPECIES[mon.species].growth;
    while (mon.level < 100 && levelFor(growth, mon.exp) > mon.level) {
      const before = statsFor(mon).hp;
      mon.level++; leveled?.add(mon);
      mon.hp += statsFor(mon).hp - before;
      refresh();
      await s.msg(`${mon.nick} grew to level ${mon.level}!`);
      await s.wait(20);
      for (const id of SPECIES[mon.species].moves[mon.level] || []) await learn(s, mon, id);
    }
  }
}

// A new move: takes a free slot, otherwise asks which old move to forget.
async function learn(s, mon, id) {
  if (mon.moves.some((m) => m.id === id)) return;
  if (mon.moves.length < 4) { mon.moves.push({ id, pp: MOVES[id].pp }); return s.msg(`${mon.nick} learned ${MOVES[id].name}!`); }
  await s.say(`${mon.nick} wants to learn ${MOVES[id].name}, but it already knows four moves. Forget one?`);
  const pick = await s.menu([...mon.moves.map((m) => MOVES[m.id].name), `Don't learn it`], 1, "forget");
  if (pick < 0 || pick >= mon.moves.length) return s.say(`${mon.nick} did not learn ${MOVES[id].name}.`);
  await s.say(`${mon.nick} forgot ${MOVES[mon.moves[pick].id].name} and learned ${MOVES[id].name}!`);
  mon.moves[pick] = { id, pp: MOVES[id].pp };
}

// After a win: experience, level-ups and new moves (Gold: exp = base exp * foe level / 7, shared by buddymon that fought).
async function awardExp(s, party, fought, foe, wild) {
  const gain = Math.max(1, Math.floor(expGain(foe, wild) / fought.size));
  for (const mon of [...fought]) {
    if (mon.hp <= 0) continue;
    mon.exp += gain;
    await s.msg(`${mon.nick} gained ${gain} EXP. Points!`);
    const growth = SPECIES[mon.species].growth;
    while (mon.level < 100 && levelFor(growth, mon.exp) > mon.level) {
      const before = statsFor(mon).hp;
      mon.level++;
      mon.hp += statsFor(mon).hp - before;
      await s.msg(`${mon.nick} grew to level ${mon.level}!`);
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

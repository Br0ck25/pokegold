// Evolution after a battle (Gold: engine/pokemon/evolve.asm): a buddymon that levelled up and reached its species' evolve level changes form,
// unless you press B ("stopped evolving"; it asks again after the next level-up). Stats are recalculated and HP keeps its gap.
Game.evolve = async (s, mon) => {
  const sp = SPECIES[mon.species], evo = sp.evolve;
  if (!evo || mon.level < evo.level || mon.hp <= 0) return false;
  s.pic(mon.species);
  s.G.state.dialogue = { text: `What? ${mon.nick} is evolving!`, more: false };
  Input.clear();
  let stopped = false;
  for (let i = 0; i < 150 && !stopped; i++) { Input.poll(); if (Input.pressed("B")) stopped = true; await s.wait(1); }
  if (stopped) { await s.msg(`Huh? ${mon.nick} stopped evolving!`); s.unpic(); return false; }
  const before = statsFor(mon).hp, oldName = sp.name;
  s.pic(null);
  await s.wait(20);
  mon.species = evo.to;
  if (mon.nick === oldName) mon.nick = SPECIES[evo.to].name;
  mon.hp += statsFor(mon).hp - before;
  (s.G.player.dex ||= {})[evo.to] = "caught";
  s.pic(evo.to);
  await s.msg(`Congratulations! Your ${oldName} evolved into ${SPECIES[evo.to].name}!`, 2200);
  s.unpic();
  return true;
};

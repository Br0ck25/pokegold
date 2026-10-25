// Trainers: an NPC with `trainer: { name, cls, party: [[species, level]...], money, sight, seen, beaten, after, flag }`.
// They spot you down their line of sight (`sight` cells), shout, walk up, and battle; talking to one you beat gives its `after` line.
// A party list [[species, level, optional move ids]...] -> mons (moves given = Gold's TRAINERTYPE_MOVES).
Game.mkParty = (list) => list.map(([species, level, moves]) => { const m = makeMon(species, level); if (moves) m.moves = moves.map((id) => ({ id, pp: MOVES[id].pp })); return m; });
Game.trainerScript = (n) => async (s) => {
  const t = n.trainer, flags = s.G.player.flags, me = () => s.G.state.objects.find((o) => o.id === n.id);
  if (flags[t.flag]) return s.say(t.after);
  const p = s.G.state, o = me();
  await s.emote(n.id);
  // Face the player and close the distance along the line between you.
  o.dir = o.x === p.x ? (o.y < p.y ? 0 : 1) : o.x < p.x ? 3 : 2;
  await s.approach(n.id, [1, 0, 3, 2][o.dir]);
  await s.say(t.seen);
  const result = await Game.battle(s, Game.mkParty(t.party), { trainer: { look: n.name, id: n.id, map: s.G.state.map.key, name: `${t.cls} ${t.name}`, money: t.money ?? 16, win: t.beaten } });
  if (result === "lost") return Game.whiteout(s);
  flags[t.flag] = true;
  s.G.state.dialogue = null;
};

// After each step: does a trainer who has not been beaten see the player down their line of sight?
Game.trainerSees = () => {
  const { state, player } = Game, DX = [0, 0, -1, 1], DY = [1, -1, 0, 0];
  const m = Game.maps[state.map.key];
  const solid = (x, y) => y < 0 || x < 0 || y >= m.solid.length || x >= m.solid[0].length || m.solid[y][x] === "#";
  return state.objects.find((o) => {
    if (!o.trainer || player.flags[o.trainer.flag]) return false;
    for (let k = 1; k <= (o.trainer.sight ?? 4); k++) {
      const x = o.x + DX[o.dir] * k, y = o.y + DY[o.dir] * k;
      if (x === state.x && y === state.y) return true;
      if (solid(x, y) || state.objects.some((q) => q !== o && q.x === x && q.y === y)) return false;
    }
    return false;
  });
};

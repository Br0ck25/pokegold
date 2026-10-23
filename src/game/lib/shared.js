// Small scripts maps share: berry trees (one berry a day) and hidden items (found once).
Game.berryTree = (flag) => async (s) => {
  const today = new Date().toDateString(), flags = s.G.player.flags;
  if (flags[flag] === today) return s.say("The tree has no more berries today.");
  flags[flag] = today;
  s.give("berry");
  await s.say(`${s.name} picked a SWEET BERRY from the tree!`);
};
Game.hiddenItem = (flag, item) => async (s) => {
  if (s.flag(flag)) return;
  s.flag(flag, true);
  s.give(item);
  await s.say(`${s.name} found a ${ITEMS[item].name}!`);
};

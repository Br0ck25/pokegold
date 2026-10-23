// New game / continue for the native engine. Saves are JSON (local for now; cloud later through /api/save).
Game.SAVE_KEY = "buddymon-native";
Game.save = () => {
  const { player, state } = Game;
  try { localStorage.setItem(Game.SAVE_KEY, JSON.stringify({ player, map: state.map.key, x: state.x, y: state.y, dir: state.dir })); } catch {}
};
Game.boot = async (root) => {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(Game.SAVE_KEY)); } catch {}
  const player = saved ? saved.player : { name: "", flags: {}, bag: {} };
  Game.start(root, player);
  setInterval(Game.save, 5000);
  addEventListener("pagehide", Game.save);
  if (saved) return Game.warp(saved.map, saved.x, saved.y, saved.dir);
  Game.state.map = { key: "bedroom" };
  await Game.warp("bedroom", 3, 3, 0);
  await Game.run(async (s) => { player.name = await s.prompt("What is your name?", 7); });
};

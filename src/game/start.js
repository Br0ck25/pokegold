// Boot and saves. A save is JSON ({ at, player, map, x, y, dir }) kept on the device and, when the server is reachable, in the cloud (/api/save).
Game.SAVE_KEY = "buddymon-save";
const saveText = () => {
  const { player, state } = Game;
  return JSON.stringify({ at: Date.now(), player, map: state.map.key, x: state.x, y: state.y, dir: state.dir });
};
let lastCloud = 0;
Game.save = (force) => {
  if (Game.state.screen || !Game.state.map.key) return;
  const text = saveText();
  try { localStorage.setItem(Game.SAVE_KEY, text); } catch {}
  if (force || Date.now() - lastCloud > 15000) { lastCloud = Date.now(); api("/api/save", { method: "PUT", body: text }).catch(() => {}); }
};
// The newer of the device save and the cloud save.
Game.loadSave = async () => {
  let local = null, cloud = null;
  try { local = JSON.parse(localStorage.getItem(Game.SAVE_KEY)); } catch {}
  try { const res = await api("/api/save"); if (res.ok) cloud = await res.json(); } catch {}
  return [local, cloud].filter(Boolean).sort((a, b) => b.at - a.at)[0] || null;
};
Game.boot = async (root) => {
  const saved = await Game.loadSave();
  Game.start(root, saved ? { ...Game.newPlayer(), ...saved.player } : Game.newPlayer());
  const resume = await Game.flow(saved);
  setInterval(Game.save, 5000);
  setInterval(() => { if (!Game.state.screen && Game.state.map.key) Game.player.play++; }, 1000); // play time, in seconds
  Game.applyOptions();
  addEventListener("pagehide", () => { lastCloud = 0; Game.save(); });
  Game.state.screen = null;
  if (resume) return Game.warp(resume.map, resume.x, resume.y, resume.dir);
  await Game.warp("bedroom", 3, 3, 0);
};

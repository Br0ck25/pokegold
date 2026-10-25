// Dark Cave, the Violet City entrance: a big cave with three mouths (west to Route 31, north to Blackthorn, south-east to Route 46), items and rocks.
// Gold: DarkCaveVioletEntrance.asm (positions from tools/goldmap.py DarkCaveVioletEntrance). Not built: wild buddymon (Gold's table has species we do not have yet),
// the dark (FLASH), ROCK SMASH, Blackthorn and Route 46.
(() => {
  const ball = (id, x, y, flag, item, name) => ({ id, name: "SACK", x, y, dir: 0, faces: false, hideIf: flag,
    script: async (s) => { s.hide(id); s.flag(flag, true); s.give(item); await s.say(`${s.name} found a ${name}!`); } });
  Game.outdoor("darkcave", "DarkCaveVioletEntrance", {
    label: "Dark Cave", theme: "cave",
    closed: { DARK_CAVE_BLACKTHORN_ENTRANCE: "The way on is too dark to see. Maybe a light would help.", ROUTE_46: "ROUTE 46 is not open yet. Come back soon!" },
    npcs: [
      ball(1, 6, 8, "GOT_DC_TONIC", "tonic", "TONIC"),
      ball(2, 36, 22, "GOT_DC_REMEDY", "remedy", "REMEDY"),
      ball(3, 35, 9, "GOT_DC_HYPER", "hyper_tonic", "HYPER TONIC"),
      ...[[16, 14], [27, 6], [7, 14], [36, 31]].map(([x, y], i) => ({ id: 4 + i, name: "ROCK", x, y, dir: 0, faces: false, script: Game.talk("It's a rock. Maybe something could smash it.") })),
    ],
    signs: [{ x: 26, y: 3, script: Game.hiddenItem("DC_ELIXIR", "elixir") }],
  });
})();

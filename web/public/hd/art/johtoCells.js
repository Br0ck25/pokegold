// Generic outdoor terrain, drawn per cell (100 x 100 units) from the kinds gen-maps.py derives from the game's
// collision data: . floor, g tall grass, T tree, c cut tree, r rock, w water, v < > L R ledges. Doors are overlays.
Art.johtoCell = (() => {
  const { o, tree, bush } = Art.johto;
  const tufts = [
    [[18, 30], [64, 22], [80, 70], [30, 78]],
    [[40, 26], [84, 40], [22, 66], [66, 82]],
    [[24, 20], [58, 54], [86, 82], [14, 84]],
  ];
  const ground = (v = 0) => `<rect x="-1" y="-1" width="102" height="102" fill="#86dc6f"/><g stroke="#4fae57" stroke-width="3.5" stroke-linecap="round" fill="none">${
    tufts[v % 3].map(([x, y]) => `<path d="M${x} ${y} l-5 -8 M${x} ${y} l0 -11 M${x} ${y} l5 -8"/>`).join("")}</g>`;
  const tall = `<rect x="-1" y="-1" width="102" height="102" fill="#58b85c"/><g stroke-linecap="round" stroke-linejoin="round" fill="none">${
    [[24, 44], [72, 40], [48, 70], [16, 86], [84, 90], [52, 22]]
      .map(([x, y]) => `<path stroke="#1f6b34" stroke-width="5" d="M${x - 14} ${y + 14} Q${x - 10} ${y - 8} ${x - 2} ${y - 20} Q${x} ${y} ${x + 4} ${y - 24} Q${x + 8} ${y} ${x + 16} ${y - 16} Q${x + 14} ${y + 6} ${x + 14} ${y + 14}Z" fill="#7be07a" opacity=".9"/>`).join("")}</g>`;
  const rock = `<ellipse cx="50" cy="86" rx="38" ry="8" fill="#000" opacity=".2"/><ellipse cx="50" cy="58" rx="44" ry="36" fill="#aeb6c8" ${o}/><ellipse cx="36" cy="44" rx="14" ry="9" fill="#d5dbe8"/><path d="M60 66 q10 6 22 -2" fill="none" stroke="#8791aa" stroke-width="4" stroke-linecap="round"/>`;
  const sandSide = `<path d="M-2 -2 H102 V20 Q76 34 50 20 T-2 20Z" fill="#f2d9a0" ${o} stroke-width="3"/>`;
  const water = (mask) => `<rect x="-1" y="-1" width="102" height="102" fill="#4fb6d9"/><g stroke="#9fe0f4" stroke-width="4" stroke-linecap="round" fill="none"><path d="M18 40 q10 -8 20 0 t20 0"/><path d="M40 78 q10 -8 20 0 t20 0"/></g>${
    [[1, 0], [2, 90], [4, 180], [8, 270]].map(([bit, deg]) => (mask & bit ? `<g transform="rotate(${deg} 50 50)">${sandSide}</g>` : "")).join("")}`;
  const lip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#b8a07a" ${o}/><rect x="${x + 6}" y="${y + 4}" width="${Math.max(w - 12, 4)}" height="5" rx="2" fill="#dccaa0"/>`;
  const ledge = { v: lip(-2, 68, 104, 24), "<": lip(2, -2, 24, 104), ">": lip(74, -2, 24, 104), L: lip(-2, 68, 104, 24) + lip(2, -2, 24, 76), R: lip(-2, 68, 104, 24) + lip(74, -2, 24, 76) };

  return (kind, mask = 0, v = 0) => {
    switch (kind) {
      case "g": return tall;
      case "T": return ground(v) + tree(0, 0);
      case "c": return ground(v) + bush(0, 0);
      case "r": return ground(v) + rock;
      case "w": return water(mask);
      case "v": case "<": case ">": case "L": case "R": return ground(v) + ledge[kind];
      default: return ground(v);
    }
  };
})();

// A door on a building wall: drawn over the wall block at each DOOR cell of the map.
Art.johtoDoor = () => {
  const { o } = Art.johto;
  return `<rect x="18" y="86" width="64" height="12" rx="3" fill="#c9c3b5" ${o} stroke-width="3"/>
    <path d="M24 88 V32 Q50 4 76 32 V88Z" fill="#9a6a3a" ${o}/><circle cx="66" cy="60" r="4.5" fill="#ffc93c"/>`;
};

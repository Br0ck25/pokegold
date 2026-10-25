// Outdoor terrain for the world scene, drawn per cell (100 x 100 units): ground, tall grass, trees, rocks, water, ledges, signs, flowers, doors.
// Kinds used in map `cells`: . floor, g tall grass, T tree, c bush, r rock, w water, S sign, f flowers, p dirt path (an exit path carries on through the forest at the map edge), v > < R L ledge cells (walkable; jump two cells in their direction), C cliff face under a ledge.
Art.johto = (() => {
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const tufts = [[30, 40], [116, 30], [160, 86], [62, 124], [146, 160], [22, 176], [96, 92]]
    .map(([x, y]) => `<path d="M${x} ${y} l-6 -10 M${x} ${y} l0 -13 M${x} ${y} l6 -10"/>`).join("");
  const ground = `<rect x="-1" y="-1" width="202" height="202" fill="#86dc6f"/><g stroke="#4fae57" stroke-width="4" stroke-linecap="round" fill="none">${tufts}</g>`;
  // A tree: a visible trunk with roots, three overlapping clumps of leaves (darker underneath, lit from the top left) and a few leaf marks.
  const tree = (x, y, v = 0) => `<g transform="translate(${x} ${y})"><ellipse cx="50" cy="94" rx="36" ry="8" fill="#000" opacity=".22"/>
    <path d="M42 96 L44 58 H58 L60 96 Q51 100 42 96Z M42 96 l-8 4 M60 96 l8 4" fill="#a8743f" ${o}/><path d="M48 62 V90" stroke="#7a4e24" stroke-width="4" stroke-linecap="round"/>
    <g ${o}><circle cx="${v === 1 ? 70 : 72}" cy="52" r="26" fill="#2a8c43"/><circle cx="${v === 2 ? 34 : 28}" cy="52" r="27" fill="#2a8c43"/><circle cx="50" cy="32" r="32" fill="#38a653"/></g>
    <circle cx="38" cy="20" r="11" fill="#6fd382"/><circle cx="66" cy="44" r="7" fill="#4fc467"/><circle cx="24" cy="48" r="6" fill="#4fc467"/>
    <path d="M34 58 q6 6 12 0 M56 62 q6 6 12 0 M44 40 q5 5 10 0" fill="none" stroke="#1d6b33" stroke-width="4" stroke-linecap="round"/></g>`;
  const bush = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="50" cy="70" rx="46" ry="28" fill="#3fae57" ${o}/><ellipse cx="34" cy="60" rx="14" ry="9" fill="#6fd382"/></g>`;
  const sign = (x, y) => `<g transform="translate(${x} ${y})"><rect x="44" y="52" width="12" height="38" rx="3" fill="#9a6a3a" ${o}/>
    <rect x="16" y="14" width="68" height="44" rx="7" fill="#e2a468" ${o}/><path d="M28 28 H72 M28 42 H60" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>`;
  const flowers = [[44, 50, "#ff6b5e"], [120, 40, "#fff6dc"], [150, 120, "#ffc93c"], [60, 150, "#ff9aa8"], [100, 96, "#fff6dc"]]
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" ${o} stroke-width="3"/><circle cx="${x}" cy="${y}" r="3" fill="#ffc93c"/>`).join("");
  return { o, ground, tree, bush, sign, flowers };
})();

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
  const dirt = `<rect x="-1" y="-1" width="102" height="102" fill="#e3c88f"/><g stroke="#c9a96a" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M14 30 h12 M60 22 h14 M30 70 h14 M72 78 h12 M52 50 h8"/></g>`;
  const cliff = `<rect x="-1" y="-1" width="102" height="102" fill="#b8a07a"/><path d="M0 24 H100 M0 52 H100 M0 80 H100" stroke="#8a7656" stroke-width="4"/><rect x="-1" y="-1" width="102" height="102" fill="none" stroke="#14213d" stroke-width="3"/>`;
  const rock = `<ellipse cx="50" cy="86" rx="38" ry="8" fill="#000" opacity=".2"/><ellipse cx="50" cy="58" rx="44" ry="36" fill="#aeb6c8" ${o}/><ellipse cx="36" cy="44" rx="14" ry="9" fill="#d5dbe8"/><path d="M60 66 q10 6 22 -2" fill="none" stroke="#8791aa" stroke-width="4" stroke-linecap="round"/>`;
  const sandSide = `<path d="M-2 -2 H102 V20 Q76 34 50 20 T-2 20Z" fill="#f2d9a0" ${o} stroke-width="3"/>`;
  const water = (mask) => `<rect x="-1" y="-1" width="102" height="102" fill="#4fb6d9"/><g stroke="#9fe0f4" stroke-width="4" stroke-linecap="round" fill="none"><path d="M18 40 q10 -8 20 0 t20 0"/><path d="M40 78 q10 -8 20 0 t20 0"/></g>${
    [[1, 0], [2, 90], [4, 180], [8, 270]].map(([bit, deg]) => (mask & bit ? `<g transform="rotate(${deg} 50 50)">${sandSide}</g>` : "")).join("")}`;
  const lip = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#b8a07a" ${o}/><rect x="${x + 6}" y="${y + 4}" width="${Math.max(w - 12, 4)}" height="5" rx="2" fill="#dccaa0"/>`;
  const ledge = { v: lip(-2, 68, 104, 24), "<": lip(2, -2, 24, 104), ">": lip(74, -2, 24, 104), L: lip(-2, 68, 104, 24) + lip(2, -2, 24, 76), R: lip(-2, 68, 104, 24) + lip(74, -2, 24, 76) };

  // Cave theme: stone floor and dark rock walls instead of grass and trees.
  const floorC = (v) => `<rect x="-1" y="-1" width="102" height="102" fill="#a98f6b"/><g fill="#8f7654">${[[[16, 30], [70, 22], [52, 70]], [[30, 18], [78, 50], [20, 74]], [[58, 30], [24, 58], [80, 80]]][v % 3].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5"/>`).join("")}</g>`;
  const wallC = (v) => `<rect x="-1" y="-1" width="102" height="102" fill="#4a3d33"/><path d="M-1 30 Q30 10 54 26 T101 20 M-1 70 Q24 54 50 72 T101 62" fill="none" stroke="#6b5a4a" stroke-width="7" stroke-linecap="round"/><path d="M${14 + v * 20} 12 l12 8 -8 12Z M${60 - v * 10} 78 l14 6 -10 10Z" fill="#2c231c"/>`;
  return (kind, mask = 0, v = 0, theme = "") => {
    if (theme === "cave" && kind !== "w") return kind === "T" || kind === "r" || kind === "C" ? wallC(v) : floorC(v) + (ledge[kind] || "");
    switch (kind) {
      case "g": return tall;
      case "p": return dirt;
      case "S": return ground(v) + Art.johto.sign(0, 0);
      case "f": return ground(v) + `<g ${o} stroke-width="3"><circle cx="28" cy="40" r="9" fill="#ff6b5e"/><circle cx="68" cy="30" r="9" fill="#fff6dc"/><circle cx="56" cy="72" r="9" fill="#ffc93c"/><circle cx="20" cy="80" r="8" fill="#ff9aa8"/></g>`;
      case "T": return ground(v) + tree(0, 0, v);
      case "c": return ground(v) + bush(0, 0);
      case "r": return ground(v) + rock;
      case "w": return water(mask);
      case "C": return ground(v) + cliff;
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

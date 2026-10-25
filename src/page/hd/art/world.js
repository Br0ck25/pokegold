// A whole outdoor map as one SVG (cell = 100 units): terrain per cell, buildings on top, then `margin` cells of forest all round.
// world = { cols, rows, cells: [rows of kind chars], buildings: [{x, y, w, h, roof, wall, label, door}] } (kinds: see art/terrain.js).
Art.world = function (world, margin) {
  if (world.theme === "cave") { // floor that nothing connects to (Gold's unused blocks) is drawn as solid rock
    const seen = new Set(), stack = (world.caves || []).map(([x, y]) => [x, y]);
    const open = (x, y) => y >= 0 && y < world.rows && x >= 0 && x < world.cols && !"Trw".includes(world.cells[y][x]);
    while (stack.length) {
      const [x, y] = stack.pop(), k = y * 1000 + x;
      if (seen.has(k) || !open(x, y)) continue;
      seen.add(k);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    world = { ...world, cells: world.cells.map((row, y) => [...row].map((c, x) => (seen.has(y * 1000 + x) || c === "w" ? c : "T")).join("")) };
  }
  const W = world.cols + margin * 2, H = world.rows + margin * 2;
  const kindAt = (x, y) => {
    if (x >= 0 && x < world.cols && y >= 0 && y < world.rows) return world.cells[y][x];
    const edge = world.cells[Math.min(Math.max(y, 0), world.rows - 1)][Math.min(Math.max(x, 0), world.cols - 1)];
    return edge === "p" ? "p" : "T"; // a dirt path on the edge carries on out of the map so exits can be seen
  };
  const dry = (k) => k !== "w" && k !== "r"; // sand shows where water meets land
  const symbols = new Map();
  let uses = "";
  for (let y = -margin; y < world.rows + margin; y++) {
    for (let x = -margin; x < world.cols + margin; x++) {
      const kind = kindAt(x, y);
      const mask = kind === "w" ? (dry(kindAt(x, y - 1)) ? 1 : 0) | (dry(kindAt(x + 1, y)) ? 2 : 0) | (dry(kindAt(x, y + 1)) ? 4 : 0) | (dry(kindAt(x - 1, y)) ? 8 : 0) : 0;
      const v = ((x * 3 + y * 5) % 3 + 3) % 3;
      const id = `c${kind}${mask}${v}${world.theme || ""}`;
      if (!symbols.has(id)) symbols.set(id, `<symbol id="${id}" viewBox="0 0 100 100" overflow="visible">${Art.johtoCell(kind, mask, v, world.theme)}</symbol>`);
      uses += `<use href="#${id}" x="${(x + margin) * 100}" y="${(y + margin) * 100}" width="100" height="100"/>`;
    }
  }
  const buildings = (world.buildings || []).map((b) => Art.building({ ...b, x: b.x + margin, y: b.y + margin, doors: (b.doors || []).map(([x, y]) => [x + margin, y + margin]) })).join("");
  const caves = (world.caves || []).map(([x, y]) => `<g transform="translate(${(x + margin) * 100} ${(y + margin) * 100})" stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M4 100 V46 Q50 -14 96 46 V100Z" fill="#6b5a4a"/><path d="M20 100 V54 Q50 14 80 54 V100Z" fill="#0e0b12"/><path d="M28 34 q22 -26 46 0" fill="none" stroke="#8a7762" stroke-width="6" stroke-linecap="round"/></g>`).join("");
  // Gate doors (side doors of a gate house on the map edge): a stone wall stub with one tall wooden door per run of stacked cells.
  const runs = [];
  for (const [x, y] of [...(world.gates || [])].sort((a, b) => a[0] - b[0] || a[1] - b[1])) { const l = runs[runs.length - 1]; if (l && l[0] === x && l[1] + l[2] === y) l[2]++; else runs.push([x, y, 1]); }
  const gates = runs.map(([x, y, n]) => `<g transform="translate(${(x + margin) * 100} ${(y + margin) * 100})" stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="-60" y="-14" width="160" height="${n * 100 + 14}" rx="6" fill="#d9cdb4"/><rect x="-60" y="-14" width="160" height="22" fill="#b8503c"/><rect x="14" y="14" width="72" height="${n * 100 - 14}" rx="8" fill="#9a6a3a"/><circle cx="70" cy="${n * 50 + 8}" r="5" fill="#ffc93c"/></g>`).join("");
  return `<svg class="world-svg" viewBox="0 0 ${W * 100} ${H * 100}" xmlns="http://www.w3.org/2000/svg"><defs>${[...symbols.values()].join("")}</defs>${uses}${buildings}${gates}${caves}</svg>`;
};

// A whole outdoor map as one SVG (cell = 100 units): terrain per cell, buildings on top, then `margin` cells of forest all round.
// world = { cols, rows, cells: [rows of kind chars], buildings: [{x, y, w, h, roof, wall, label, door}] } (kinds: see art/terrain.js).
Art.world = function (world, margin) {
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
      const id = `c${kind}${mask}${v}`;
      if (!symbols.has(id)) symbols.set(id, `<symbol id="${id}" viewBox="0 0 100 100" overflow="visible">${Art.johtoCell(kind, mask, v)}</symbol>`);
      uses += `<use href="#${id}" x="${(x + margin) * 100}" y="${(y + margin) * 100}" width="100" height="100"/>`;
    }
  }
  const buildings = (world.buildings || []).map((b) => Art.building({ ...b, x: b.x + margin, y: b.y + margin })).join("");
  return `<svg class="world-svg" viewBox="0 0 ${W * 100} ${H * 100}" xmlns="http://www.w3.org/2000/svg"><defs>${[...symbols.values()].join("")}</defs>${uses}${buildings}</svg>`;
};

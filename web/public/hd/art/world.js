// A whole outdoor map as one SVG (cell = 100 units): hand-made blocks (buildings, decoration) where we have them,
// generic terrain per cell everywhere else, doors on top, then `margin` blocks of the map's border block all round.
Art.world = function (map, margin) {
  const W = map.w + margin * 2, H = map.h + margin * 2, cols = map.w * 2, rows = map.h * 2;
  const kindAt = (cx, cy) => (cx >= 0 && cx < cols && cy >= 0 && cy < rows)
    ? map.cells[cy][cx]
    : map.borderCells[(((cy % 2) + 2) % 2) * 2 + (((cx % 2) + 2) % 2)];
  const symbols = new Map();
  const symbol = (key, size, content) => {
    if (!symbols.has(key)) symbols.set(key, `<symbol id="${key}" viewBox="0 0 ${size} ${size}" overflow="visible">${content()}</symbol>`);
    return key;
  };
  const dry = (k) => k !== "w" && k !== "r"; // sand shows where water meets land (rocks stand in the water)
  let uses = "";
  const put = (id, x, y, size) => (uses += `<use href="#${id}" x="${x}" y="${y}" width="${size}" height="${size}"/>`);

  for (let by = 0; by < H; by++) {
    for (let bx = 0; bx < W; bx++) {
      const ix = bx - margin, iy = by - margin;
      const inside = ix >= 0 && ix < map.w && iy >= 0 && iy < map.h;
      const block = inside ? map.blocks[iy * map.w + ix] : map.border;
      if (Art.johtoBlocks[block]) { put(symbol(`jb${block}`, 200, Art.johtoBlocks[block]), bx * 200, by * 200, 200); continue; }
      for (let i = 0; i < 4; i++) {
        const cx = ix * 2 + (i % 2), cy = iy * 2 + (i >> 1), kind = kindAt(cx, cy);
        const mask = kind === "w" ? (dry(kindAt(cx, cy - 1)) ? 1 : 0) | (dry(kindAt(cx + 1, cy)) ? 2 : 0) | (dry(kindAt(cx, cy + 1)) ? 4 : 0) | (dry(kindAt(cx - 1, cy)) ? 8 : 0) : 0;
        const v = kind === "." ? ((cx * 3 + cy * 5) % 3 + 3) % 3 : 0;
        put(symbol(`jc${kind}${mask}${v}`, 100, () => Art.johtoCell(kind, mask, v)), (bx * 2 + (i % 2)) * 100, (by * 2 + (i >> 1)) * 100, 100);
      }
    }
  }
  for (const [x, y] of map.doors) put(symbol("jdoor", 100, Art.johtoDoor), (x + margin * 2) * 100, (y + margin * 2) * 100, 100);
  return `<svg class="world-svg" viewBox="0 0 ${W * 200} ${H * 200}" xmlns="http://www.w3.org/2000/svg"><defs>${[...symbols.values()].join("")}</defs>${uses}</svg>`;
};

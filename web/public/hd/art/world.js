// A whole outdoor map as one SVG (cell = 100 units): the map's blocks, then `margin` blocks of its border block all round.
Art.world = function (map, margin) {
  const W = map.w + margin * 2, H = map.h + margin * 2;
  const ids = new Set(map.blocks).add(map.border);
  const symbols = [...ids].map((id) =>
    `<symbol id="jb${id}" viewBox="0 0 200 200" overflow="visible">${(Art.johtoBlocks[id] || Art.johtoBlocks[1])()}</symbol>`).join("");
  let uses = "";
  for (let by = 0; by < H; by++) {
    for (let bx = 0; bx < W; bx++) {
      const x = bx - margin, y = by - margin;
      const id = x >= 0 && x < map.w && y >= 0 && y < map.h ? map.blocks[y * map.w + x] : map.border;
      uses += `<use href="#jb${id}" x="${bx * 200}" y="${by * 200}" width="200" height="200"/>`;
    }
  }
  return `<svg class="world-svg" viewBox="0 0 ${W * 200} ${H * 200}" xmlns="http://www.w3.org/2000/svg"><defs>${symbols}</defs>${uses}</svg>`;
};

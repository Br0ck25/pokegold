// Outdoor block art for the Johto tileset. Art.johtoBlocks[id]() draws one block (2 x 2 cells of 100 units, so 200 x 200);
// ids are the block ids in maps/*.blk. Only blocks with hand-made art live here (decoration, buildings); everything else is
// drawn per cell from the collision kinds (johtoCells.js). This file holds the shared pieces and the decoration blocks.
Art.johtoBlocks = {};
Art.johto = (() => {
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const tufts = [[30, 40], [116, 30], [160, 86], [62, 124], [146, 160], [22, 176], [96, 92]]
    .map(([x, y]) => `<path d="M${x} ${y} l-6 -10 M${x} ${y} l0 -13 M${x} ${y} l6 -10"/>`).join("");
  const ground = `<rect x="-1" y="-1" width="202" height="202" fill="#86dc6f"/><g stroke="#4fae57" stroke-width="4" stroke-linecap="round" fill="none">${tufts}</g>`;
  const tree = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="50" cy="92" rx="34" ry="8" fill="#000" opacity=".2"/>
    <rect x="43" y="66" width="14" height="28" rx="3" fill="#9a6a3a" ${o}/><circle cx="50" cy="42" r="46" fill="#2f9b4a" ${o}/>
    <circle cx="34" cy="26" r="15" fill="#4fc467"/><path d="M22 54 Q50 78 78 54" fill="none" stroke="#1f7a38" stroke-width="5" stroke-linecap="round"/></g>`;
  const bush = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="50" cy="70" rx="46" ry="28" fill="#3fae57" ${o}/><ellipse cx="34" cy="60" rx="14" ry="9" fill="#6fd382"/></g>`;
  const sign = (x, y) => `<g transform="translate(${x} ${y})"><rect x="44" y="52" width="12" height="38" rx="3" fill="#9a6a3a" ${o}/>
    <rect x="16" y="14" width="68" height="44" rx="7" fill="#e2a468" ${o}/><path d="M28 28 H72 M28 42 H60" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>`;
  const flowers = [[44, 50, "#ff6b5e"], [120, 40, "#fff6dc"], [150, 120, "#ffc93c"], [60, 150, "#ff9aa8"], [100, 96, "#fff6dc"]]
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" ${o} stroke-width="3"/><circle cx="${x}" cy="${y}" r="3" fill="#ffc93c"/>`).join("");
  return { o, ground, tree, bush, sign, flowers };
})();

(() => {
  const { ground, sign, flowers, o } = Art.johto, B = Art.johtoBlocks;
  B[2] = () => ground + flowers;
  B[4] = () => ground + `<ellipse cx="62" cy="70" rx="26" ry="16" fill="#b9c0cf" ${o}/><ellipse cx="140" cy="140" rx="26" ry="16" fill="#b9c0cf" ${o}/>`;
  B[69] = () => ground + sign(0, 0);
  B[71] = () => ground + flowers + sign(100, 100);
})();

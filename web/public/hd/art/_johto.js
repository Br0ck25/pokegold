// Outdoor block art for the Johto tileset. Art.johtoBlocks[id]() draws one block (2 x 2 cells of 100 units, so 200 x 200);
// ids are the block ids in maps/*.blk. This file holds the shared pieces and the terrain; buildings are in johtoBuildings.js.
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
  const water = (shore) => `<rect x="-1" y="-1" width="202" height="202" fill="#4fb6d9"/><g stroke="#9fe0f4" stroke-width="5" stroke-linecap="round" fill="none"><path d="M70 50 q14 -10 28 0 t28 0"/><path d="M96 130 q14 -10 28 0 t28 0"/></g>
    ${shore ? `<path d="M0 0 H34 C46 40 22 70 36 100 C48 130 24 160 36 200 H0Z" fill="#f2d9a0" ${o}/>` : ""}`;
  return { o, ground, tree, bush, sign, flowers, water };
})();

(() => {
  const { ground, tree, bush, sign, flowers, water, o } = Art.johto, B = Art.johtoBlocks;
  B[1] = () => ground;
  B[2] = () => ground + flowers;
  B[4] = () => ground + `<ellipse cx="62" cy="70" rx="26" ry="16" fill="#b9c0cf" ${o}/><ellipse cx="140" cy="140" rx="26" ry="16" fill="#b9c0cf" ${o}/>`;
  B[5] = () => ground + tree(0, 0) + tree(100, 0) + tree(0, 100) + tree(100, 100);
  B[98] = () => ground + tree(100, 0) + tree(100, 100);
  B[101] = () => ground + bush(0, 100) + bush(100, 100);
  B[69] = () => ground + sign(0, 0);
  B[71] = () => ground + flowers + sign(100, 100);
  B[88] = () => water(true);
  B[84] = () => water(true) + bush(-20, -30);
})();

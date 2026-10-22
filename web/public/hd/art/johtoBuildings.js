// Johto house pieces. A building is roofs on top (24 left, 31 middle, 25 right) and walls under them
// (22/28 left, 119 middle, 30 right, 26/23/27 brick shop walls; 20/21 are a small house's roof + wall in one block).
// Doors are not drawn here: art/johtoCells.js overlays one at every DOOR cell.
(() => {
  const { o } = Art.johto, B = Art.johtoBlocks;
  const sides = (cap, h) => `${cap.includes("L") ? `M0 0 V${h}` : ""}${cap.includes("R") ? `M200 0 V${h}` : ""}`;

  const roof = (cap, h = 200) => `<rect width="201" height="${h}" fill="#d9604c"/><rect width="200" height="14" fill="#f08a7a"/>
    <g stroke="#b8453a" stroke-width="3">${Array.from({ length: h / 25 - 1 }, (_, i) => `<path d="M0 ${(i + 1) * 25} H200"/>`).join("")}</g>
    <rect y="${h - 16}" width="200" height="16" fill="#a53a30"/>
    <path d="M0 0 H200 M0 ${h} H200 ${sides(cap, h)}" fill="none" ${o}/>`;

  // Wall of height h; `win` adds a window, `plaque` a shop sign, `brick` a brick face.
  const wall = (cap, h, { win, plaque, brick } = {}) => `<rect width="201" height="${h}" fill="${brick ? "#e8cfae" : "#fff1d0"}"/>
    ${brick ? `<g stroke="#c9a47a" stroke-width="3">${Array.from({ length: Math.floor(h / 28) }, (_, i) => `<path d="M0 ${(i + 1) * 28} H200"/>`).join("")}</g>` : ""}
    <rect y="${h - 14}" width="200" height="14" fill="#c9a46a"/><path d="M0 0 H200 M0 ${h} H200 ${sides(cap, h)}" fill="none" ${o}/>
    ${win ? `<rect x="60" y="30" width="80" height="62" rx="6" fill="#8fd3ff" ${o}/><path d="M100 30 V92 M60 61 H140" stroke="${INK}" stroke-width="4"/>` : ""}
    ${plaque ? `<rect x="104" y="28" width="86" height="40" rx="8" fill="${plaque.color}" ${o}/><text x="147" y="57" text-anchor="middle" font-family="'Lilita One','Fredoka',sans-serif" font-size="26" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">${plaque.text}</text>` : ""}`;

  B[24] = () => roof("L");
  B[31] = () => roof("");
  B[25] = () => roof("R");
  B[28] = () => wall("L", 200, { win: true });
  B[30] = () => wall("R", 200, { win: true });
  B[119] = () => wall("", 200);
  B[22] = () => wall("L", 200);
  B[26] = () => wall("L", 200, { brick: true });
  B[23] = () => wall("R", 200, { brick: true, plaque: { text: "MART", color: "#3a56b0" } });
  B[27] = () => wall("R", 200, { brick: true, plaque: { text: "HEAL", color: "#d63a4a" } });
  B[20] = () => roof("L", 100) + `<g transform="translate(0 100)">${wall("L", 100)}</g>`;
  B[21] = () => roof("R", 100) + `<g transform="translate(0 100)">${wall("R", 100)}</g>`;
})();

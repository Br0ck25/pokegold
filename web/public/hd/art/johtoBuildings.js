// Johto house pieces. A building is roofs on top (24 left, 31 middle, 25 right) and walls under them
// (28/22 left, 119 middle, 30 right; 20/21 are a small house's roof + wall in one block).
(() => {
  const { o } = Art.johto, B = Art.johtoBlocks;
  const sides = (cap, h) => `${cap.includes("L") ? `M0 0 V${h}` : ""}${cap.includes("R") ? `M200 0 V${h}` : ""}`;

  const roof = (cap, h = 200) => `<rect width="201" height="${h}" fill="#d9604c"/><rect width="200" height="14" fill="#f08a7a"/>
    <g stroke="#b8453a" stroke-width="3">${Array.from({ length: h / 25 - 1 }, (_, i) => `<path d="M0 ${(i + 1) * 25} H200"/>`).join("")}</g>
    <rect y="${h - 16}" width="200" height="16" fill="#a53a30"/>
    <path d="M0 0 H200 M0 ${h} H200 ${sides(cap, h)}" fill="none" ${o}/>`;

  // Wall of height h: plain, or with a window, or a door in the left/right cell.
  const wall = (cap, h, { win, door } = {}) => {
    const dx = door === "L" ? 22 : 122, dy = h - 94;
    return `<rect width="201" height="${h}" fill="#fff1d0"/><rect y="${h - 14}" width="200" height="14" fill="#c9a46a"/>
      <path d="M0 0 H200 M0 ${h} H200 ${sides(cap, h)}" fill="none" ${o}/>
      ${win ? `<rect x="60" y="30" width="80" height="62" rx="6" fill="#8fd3ff" ${o}/><path d="M100 30 V92 M60 61 H140" stroke="${INK}" stroke-width="4"/>` : ""}
      ${door ? `<rect x="${dx - 6}" y="${h - 14}" width="68" height="12" rx="3" fill="#c9c3b5" ${o} stroke-width="3"/>
        <path d="M${dx} ${h - 14} V${dy + 22} Q${dx + 28} ${dy - 4} ${dx + 56} ${dy + 22} V${h - 14}Z" fill="#9a6a3a" ${o}/><circle cx="${dx + 44}" cy="${dy + 48}" r="4" fill="#ffc93c"/>` : ""}`;
  };

  B[24] = () => roof("L");
  B[31] = () => roof("");
  B[25] = () => roof("R");
  B[28] = () => wall("L", 200, { win: true });
  B[30] = () => wall("R", 200, { win: true });
  B[119] = () => wall("", 200, { door: "L" });
  B[22] = () => wall("L", 200, { door: "R" });
  B[20] = () => roof("L", 100) + `<g transform="translate(0 100)">${wall("L", 100, { door: "R" })}</g>`;
  B[21] = () => roof("R", 100) + `<g transform="translate(0 100)">${wall("R", 100)}</g>`;
})();

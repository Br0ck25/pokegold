// A building for the world scene, w x h cells (100 units each) drawn at (x, y): roof on top, wall below with windows, door on the bottom row.
// opts: roof, wall colours; label for a shop-style plaque; doors = [[x, y]...] the absolute door cells (usually one on the bottom row, but Gold has side doors too).
// Doors stacked in one column (Gold's side doors of the gate houses are two tiles tall) are drawn as one tall door: [x, firstY, count].
const doorRuns = (doors) => {
  const runs = [];
  for (const [x, y] of [...doors].sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    const last = runs[runs.length - 1];
    if (last && last[0] === x && last[1] + last[2] === y) last[2]++; else runs.push([x, y, 1]);
  }
  return runs;
};
Art.building = function (b) {
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const W = b.w * 100, H = b.h * 100, roofH = Math.min(150, H * 0.5), wallY = roofH - 10;
  const roof = b.roof || "#d9604c", wall = b.wall || "#fff1d0";
  const planks = Array.from({ length: Math.floor(roofH / 25) }, (_, i) => `<path d="M0 ${(i + 1) * 25} H${W}" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`).join("");
  const doors = (b.doors || []).map(([x, y]) => [x - b.x, y - b.y]);
  const wins = Array.from({ length: b.w }, (_, i) => (doors.some(([dx, dy]) => dx === i && dy === b.h - 1) ? "" : `<rect x="${i * 100 + 20}" y="${wallY + 24}" width="60" height="${Math.min(52, H - wallY - 70)}" rx="6" fill="#8fd3ff" ${o}/>`)).join("");
  return `<g transform="translate(${b.x * 100} ${b.y * 100})">
    <ellipse cx="${W / 2}" cy="${H + 4}" rx="${W / 2 + 6}" ry="12" fill="#000" opacity=".2"/>
    <rect y="${wallY}" width="${W}" height="${H - wallY}" fill="${wall}" ${o}/>
    <rect y="${H - 14}" width="${W}" height="14" fill="#c9a46a" ${o} stroke-width="3"/>${wins}
    <path d="M-12 ${roofH} L${W * 0.12} 0 H${W * 0.88} L${W + 12} ${roofH} Z" fill="${roof}" ${o}/>
    <g clip-path="inset(0)">${planks}</g>
    ${doorRuns(doors).map(([cx, cy0, n]) => `<rect x="${cx * 100 + 18}" y="${(cy0 + n) * 100 - 96 - (n - 1) * 100}" width="64" height="${96 + (n - 1) * 100}" rx="8" fill="#9a6a3a" ${o}/><circle cx="${cx * 100 + 68}" cy="${(cy0 + n) * 100 - 46 - (n - 1) * 50}" r="5" fill="#ffc93c"/>`).join("")}
    ${b.label ? `<rect x="${W / 2 - 60}" y="${roofH - 38}" width="120" height="34" rx="8" fill="#3a56b0" ${o}/><text x="${W / 2}" y="${roofH - 13}" text-anchor="middle" font-family="'Lilita One','Fredoka',sans-serif" font-size="24" fill="#fff">${b.label}</text>` : ""}
  </g>`;
};

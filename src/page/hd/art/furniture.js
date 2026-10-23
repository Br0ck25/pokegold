// Shared room pieces. All coordinates are art units (cell = 100); pieces draw at (x, y) = top-left.
// Art.shell(cols, rows, theme) is the empty room; rooms add pieces after it and close with Art.roomEnd.
Art.shell = function (cols, rows, theme) {
  const W = cols * 100, H = rows * 100;
  const t = theme === "lab"
    ? { floorA: "#e6edf7", floorB: "#cfd9ea", wallA: "#9fd0e6", wallB: "#6fb3d4" }
    : { floorA: "#f0be78", floorB: "#d99a54", wallA: "#ffd9a0", wallB: "#f2b872" };
  const lines = theme === "lab"
    ? Array.from({ length: cols }, (_, i) => `<path d="M${i * 100} 110 V${H}" stroke="#b5c3dc" stroke-width="2"/>`).join("") +
      Array.from({ length: rows }, (_, i) => `<path d="M0 ${i * 100 + 110} H${W}" stroke="#b5c3dc" stroke-width="2"/>`).join("")
    : Array.from({ length: Math.floor(H / 40) }, (_, i) => `<path d="M0 ${110 + i * 40} H${W}" stroke="#c98d4a" stroke-width="2" opacity=".45"/>`).join("");
  return `<svg class="room-svg" viewBox="-20 -20 ${W + 40} ${H + 40}" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="sh-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.floorA}"/><stop offset="1" stop-color="${t.floorB}"/></linearGradient>
<linearGradient id="sh-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.wallA}"/><stop offset="1" stop-color="${t.wallB}"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="10" fill="url(#sh-f)"/>${lines}
<rect width="${W}" height="110" fill="url(#sh-w)"/><rect y="96" width="${W}" height="16" fill="#fff6dc" stroke="${INK}" stroke-width="5"/>
<rect x="-6" y="-6" width="${W + 12}" height="${H + 12}" rx="12" fill="none" stroke="${INK}" stroke-width="12"/>`;
};
Art.roomEnd = "</svg>";

Art.furniture = (() => {
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  return {
    window: (x) => `<g ${o}><rect x="${x + 10}" y="14" width="80" height="74" rx="6" fill="#8fd3ff"/><path d="M${x + 50} 14 V88 M${x + 10} 51 H${x + 90}" stroke-width="5"/></g>`,
    shelf: (x, y, w, h = 150) => {
      const books = ["#e04a4a", "#46c26f", "#ffc93c", "#4fb6d9", "#ff9aa8", "#6f86d6"];
      let inner = "";
      for (let i = 0; i < Math.floor(w / 100); i++) for (let r = 0; r < 2; r++) for (let b = 0; b < 4; b++)
        inner += `<rect x="${x + i * 100 + 12 + b * 20}" y="${y + 14 + r * (h / 2 - 8) + (b % 2) * 4}" width="15" height="${h / 2 - 34}" fill="${books[(i + r + b) % 6]}" stroke-width="3" ${o}/>`;
      return `<g ${o}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#b8763a"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="#7a4a1e" stroke="none"/>${inner}</g>`;
    },
    tv: (x, y) => `<g ${o}><rect x="${x + 6}" y="${y + 8}" width="86" height="130" rx="10" fill="#3a56b0"/><rect x="${x + 16}" y="${y + 18}" width="66" height="52" rx="6" fill="#0c1a44"/><path d="M${x + 24} ${y + 30} L${x + 74} ${y + 58}" stroke="#6f86d6" stroke-width="4" opacity=".6"/><rect x="${x + 18}" y="${y + 86}" width="62" height="40" rx="6" fill="#e9eef8"/><circle cx="${x + 38}" cy="${y + 106}" r="7" fill="#ff6b5e"/></g>`,
    pc: (x, y) => `<g ${o}><rect x="${x + 4}" y="${y + 20}" width="92" height="80" rx="8" fill="#b8763a"/><rect x="${x + 12}" y="${y - 30}" width="76" height="60" rx="8" fill="#e9eef8"/><rect x="${x + 22}" y="${y - 22}" width="56" height="40" rx="4" fill="#1b2d6b"/><path d="M${x + 30} ${y - 8} H${x + 62}" stroke="#7be8a0" stroke-width="4"/></g>`,
    radio: (x, y) => `<g ${o}><rect x="${x + 12}" y="${y + 30}" width="76" height="52" rx="8" fill="#ff6b5e"/><circle cx="${x + 36}" cy="${y + 56}" r="14" fill="#ffe0dc"/><path d="M${x + 60} ${y + 46} H${x + 80} M${x + 60} ${y + 58} H${x + 80} M${x + 60} ${y + 70} H${x + 80}" stroke-width="3"/></g>`,
    table: (x, y, w, h, cloth = "#ff8fa3", plate = true) => `<g fill="#000" opacity=".16"><ellipse cx="${x + w / 2}" cy="${y + h + 8}" rx="${w / 2 + 10}" ry="12"/></g>
      <g ${o}><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="16" fill="#c98446"/><rect x="${x + 20}" y="${y + 20}" width="${w - 40}" height="${h - 40}" rx="10" fill="${cloth}" opacity=".9" stroke-width="3"/>${plate ? `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) / 6}" fill="#fff6dc" stroke-width="4"/>` : ""}</g>`,
    plant: (x, y) => `<g ${o}><path d="M${x + 50} ${y + 60} C${x + 14} ${y + 40} ${x + 14} ${y + 6} ${x + 44} ${y} C${x + 52} ${y + 28} ${x + 62} ${y + 40} ${x + 50} ${y + 60} Z M${x + 50} ${y + 60} C${x + 88} ${y + 40} ${x + 92} ${y + 12} ${x + 66} ${y - 2} C${x + 54} ${y + 26} ${x + 44} ${y + 44} ${x + 50} ${y + 60} Z" fill="#46c26f" stroke-width="4"/><rect x="${x + 28}" y="${y + 52}" width="44" height="40" rx="6" fill="#ff8a6b"/></g>`,
    mat: (x, y, w) => `<g ${o}><rect x="${x + 12}" y="${y + 16}" width="${w - 24}" height="68" rx="12" fill="#d63a4a"/><rect x="${x + 26}" y="${y + 28}" width="${w - 52}" height="44" rx="8" fill="none" stroke="#ffd0c4" stroke-width="4" stroke-dasharray="12 8"/></g>`,
    counter: (x, y, w, h) => `<g ${o}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#e9eef8"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="14" fill="#cfd9ea" stroke="none"/></g>`,
    machine: (x, y) => `<g ${o}><rect x="${x + 6}" y="${y}" width="88" height="140" rx="10" fill="#e9eef8"/><rect x="${x + 18}" y="${y + 14}" width="64" height="40" rx="6" fill="#1b2d6b"/><path d="M${x + 26} ${y + 34} H${x + 74}" stroke="#7be8a0" stroke-width="4"/>
      ${[0, 1, 2].map((i) => `<circle cx="${x + 28 + i * 22}" cy="${y + 84}" r="9" fill="#ff6b5e"/>`).join("")}<rect x="${x + 18}" y="${y + 104}" width="64" height="20" rx="4" fill="#cfd9ea"/></g>`,
    trash: (x, y) => `<g ${o}><path d="M${x + 24} ${y + 30} L${x + 30} ${y + 92} H${x + 70} L${x + 76} ${y + 30}Z" fill="#9aa4c8"/><rect x="${x + 18}" y="${y + 20}" width="64" height="14" rx="5" fill="#6f7aa0"/></g>`,
    rug: (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#6f86d6" ${o} opacity=".9"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 30}" ry="${ry - 24}" fill="none" stroke="#bcd0ff" stroke-width="5" stroke-dasharray="14 10"/>`,
  };
})();

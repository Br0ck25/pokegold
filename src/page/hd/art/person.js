// Overworld person, dir: 0 down, 1 up, 2 left, 3 right (viewBox 60 x 80). Look `o` comes from Art.looks:
//   skin, hair, hat (cap colour, optional), bun, glasses, top, dress (skirt/coat instead of tee), apron, legs.
Art.person = function (dir, o) {
  const skin = o.skin || "#f4c397";
  const eyes = dir === 1 ? "" : dir === 0
    ? `<circle cx="24" cy="30" r="3" fill="${INK}"/><circle cx="36" cy="30" r="3" fill="${INK}"/>`
    : `<circle cx="${dir === 2 ? 21 : 39}" cy="30" r="3" fill="${INK}"/>`;
  const specs = o.glasses && dir !== 1
    ? `<g fill="none" stroke="${INK}" stroke-width="2"><circle cx="${dir === 0 ? 24 : dir === 2 ? 21 : 39}" cy="30" r="5.5"/>${dir === 0 ? `<circle cx="36" cy="30" r="5.5"/>` : ""}</g>` : "";
  const visor = !o.hat || dir === 1 ? "" : dir === 0
    ? `<path d="M14 22 Q30 32 46 22 Q30 16 14 22" fill="${o.hat}"/>`
    : `<path d="${dir === 2 ? "M8 24 Q20 20 30 22 L30 28 Q18 28 8 24" : "M52 24 Q40 20 30 22 L30 28 Q42 28 52 24"}" fill="${o.hat}"/>`;
  const hair = o.hat
    ? `<path fill="${dir === 1 ? o.hair : o.hat}" d="M14 26 C14 8 46 8 46 26 C38 20 22 20 14 26 Z"/>${dir === 1 ? `<path fill="${o.hat}" d="M15 26 C15 10 45 10 45 26 C38 22 22 22 15 26 Z"/>` : ""}`
    : `<path fill="${o.hair}" d="M13 28 C11 6 49 6 47 28 C42 18 18 18 13 28 Z"/>${dir === 1 ? `<path fill="${o.hair}" d="M14 28 C14 12 46 12 46 30 C40 36 20 36 14 28 Z"/>` : ""}${o.bun ? `<circle cx="30" cy="${dir === 1 ? 9 : 8}" r="${dir === 1 ? 6 : 5}" fill="${o.hair}"/>` : ""}`;
  const body = o.dress
    ? `<path fill="${o.top}" d="M14 64 C12 48 18 40 30 40 C42 40 48 48 46 64 Z"/>${o.apron && dir !== 1 ? `<path fill="${o.apron}" d="M22 64 C22 52 24 46 30 46 C36 46 38 52 38 64 Z"/>` : ""}`
    : `<path fill="${o.top}" d="M16 56 C14 44 20 40 30 40 C40 40 46 44 44 56 Z"/>`;
  const tail = (x, d) => `<path fill="${o.hair}" d="M${x} 22 C${x + 7 * d} 28 ${x + 8 * d} 42 ${x + 3 * d} 48 C${x - 3 * d} 44 ${x - 4 * d} 32 ${x - 2 * d} 24 Z"/>`;
  const tails = !o.pigtails ? "" : dir === 2 ? tail(44, 1) : dir === 3 ? tail(16, -1) : tail(14, -1) + tail(46, 1);
  const top = o.dress ? 60 : 56;
  return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="30" cy="74" rx="18" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">
<path class="leg l" fill="${o.legs}" d="M20 ${top} L28 ${top} L28 70 L18 70 Z"/><path class="leg r" fill="${o.legs}" d="M32 ${top} L40 ${top} L42 70 L32 70 Z"/>
${body}
${tails}<circle cx="30" cy="28" r="15" fill="${skin}"/>
${hair}
</g>
${eyes}${specs}${visor}
</svg>`;
};

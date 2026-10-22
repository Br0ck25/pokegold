// Tiny overworld hero. dir: 0 down, 1 up, 2 left, 3 right (viewBox 60 x 80)
Art.heroSprite = function (dir) {
  const face = dir === 1 ? "" : dir === 0
    ? `<circle cx="24" cy="30" r="3" fill="${INK}"/><circle cx="36" cy="30" r="3" fill="${INK}"/>`
    : `<circle cx="${dir === 2 ? 21 : 39}" cy="30" r="3" fill="${INK}"/>`;
  const visor = dir === 1 ? "" : dir === 0
    ? `<path d="M14 22 Q30 32 46 22 Q30 16 14 22" fill="#c9322a"/>`
    : `<path d="${dir === 2 ? "M8 24 Q20 20 30 22 L30 28 Q18 28 8 24" : "M52 24 Q40 20 30 22 L30 28 Q42 28 52 24"}" fill="#c9322a"/>`;
  return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="30" cy="74" rx="18" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">
<path class="leg l" fill="#1f3a8a" d="M20 56 L28 56 L28 70 L18 70 Z"/><path class="leg r" fill="#1f3a8a" d="M32 56 L40 56 L42 70 L32 70 Z"/>
<path fill="#ffb62e" d="M16 56 C14 44 20 40 30 40 C40 40 46 44 44 56 Z"/>
<circle cx="30" cy="28" r="15" fill="#f4c397"/>
<path fill="${dir === 1 ? "#3a2418" : "#c9322a"}" d="M14 26 C14 8 46 8 46 26 C38 20 22 20 14 26 Z"/>
${dir === 1 ? `<path fill="#c9322a" d="M15 26 C15 10 45 10 45 26 C38 22 22 22 15 26 Z"/>` : ""}
</g>
${face}${dir === 1 ? "" : visor}
</svg>`;
};

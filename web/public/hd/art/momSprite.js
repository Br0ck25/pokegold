// Mom, overworld sprite. dir: 0 down, 1 up, 2 left, 3 right (viewBox 60 x 80)
Art.momSprite = function (dir) {
  const eyes = dir === 1 ? "" : dir === 0
    ? `<circle cx="24" cy="30" r="3" fill="${INK}"/><circle cx="36" cy="30" r="3" fill="${INK}"/>`
    : `<circle cx="${dir === 2 ? 21 : 39}" cy="30" r="3" fill="${INK}"/>`;
  return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="30" cy="74" rx="18" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">
<path class="leg l" fill="#f4c397" d="M21 60 L28 60 L28 70 L20 70 Z"/><path class="leg r" fill="#f4c397" d="M32 60 L39 60 L40 70 L32 70 Z"/>
<path fill="#ff8fa3" d="M14 64 C12 48 18 40 30 40 C42 40 48 48 46 64 Z"/>
<path fill="#fff6dc" d="M22 64 C22 52 24 46 30 46 C36 46 38 52 38 64 Z"/>
<circle cx="30" cy="28" r="15" fill="#f4c397"/>
<path fill="#6b3d1e" d="M13 28 C11 6 49 6 47 28 C42 18 18 18 13 28 Z"/>
${dir === 1 ? `<path fill="#6b3d1e" d="M14 28 C14 12 46 12 46 30 C40 36 20 36 14 28 Z"/><circle cx="30" cy="9" r="6" fill="#6b3d1e"/>` : `<circle cx="30" cy="8" r="5" fill="#6b3d1e"/>`}
</g>
${eyes}
</svg>`;
};

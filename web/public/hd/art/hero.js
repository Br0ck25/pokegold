// Player portrait: the kid in the cap (viewBox 300 x 380)
Art.hero = function () {
  return `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="hr-jacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb62e"/><stop offset="1" stop-color="#e57d12"/></linearGradient>
<linearGradient id="hr-cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b5e"/><stop offset="1" stop-color="#c9322a"/></linearGradient>
</defs>
<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#hr-jacket)" d="M24 380 C24 304 66 266 112 256 L188 256 C234 266 276 304 276 380 Z"/>
<path fill="#1f3a8a" d="M112 256 L150 336 L188 256 L168 250 L150 292 L132 250 Z"/>
<rect x="126" y="218" width="48" height="44" rx="14" fill="#e9b184"/>
<ellipse cx="150" cy="168" rx="66" ry="70" fill="#f4c397"/>
<path fill="#3a2418" d="M82 150 C84 110 116 96 150 96 C184 96 216 110 218 150 C200 134 176 128 150 128 C124 128 100 134 82 150 Z"/>
<path fill="url(#hr-cap)" d="M78 134 C80 66 120 40 154 40 C192 40 224 70 222 134 C196 118 104 118 78 134 Z"/>
<path fill="url(#hr-cap)" d="M96 128 C130 112 214 112 248 138 C226 150 124 146 96 128 Z"/>
<circle cx="150" cy="82" r="16" fill="#ffd25a"/>
</g>
<circle cx="120" cy="172" r="9" fill="${INK}"/><circle cx="180" cy="172" r="9" fill="${INK}"/>
<circle cx="117" cy="169" r="3.4" fill="#fff"/><circle cx="177" cy="169" r="3.4" fill="#fff"/>
<path d="M132 200 Q150 216 168 200" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<circle cx="102" cy="196" r="9" fill="#ff8c9e" opacity=".6"/><circle cx="198" cy="196" r="9" fill="#ff8c9e" opacity=".6"/>
</svg>`;
};

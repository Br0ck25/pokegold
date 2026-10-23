// The Buddymon Gold title logo (wordmark with badge), used by the title and menu scenes.
Art.logo = function () {
  return `<svg class="logo-svg" viewBox="0 0 1000 320" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#f08a14"/></linearGradient>
<linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4ea8"/><stop offset="1" stop-color="#16295f"/></linearGradient>
<clipPath id="top-half"><rect x="0" y="0" width="1000" height="112"/></clipPath>
</defs>
<g font-family="'Lilita One','Fredoka',system-ui,sans-serif" text-anchor="middle" stroke-linejoin="round">
<text x="500" y="192" font-size="172" fill="#b84a12" stroke="${INK}" stroke-width="34" paint-order="stroke">BUDDYMON</text>
<text x="500" y="176" font-size="172" fill="url(#gold)" stroke="${INK}" stroke-width="30" paint-order="stroke">BUDDYMON</text>
<text x="500" y="176" font-size="172" fill="#fff" opacity=".45" clip-path="url(#top-half)">BUDDYMON</text>
</g>
<path d="M300 226 L700 226 L730 260 L700 294 L300 294 L270 260 Z" fill="url(#rib)" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
<path d="M300 236 L700 236" stroke="#6f93ff" stroke-width="3" opacity=".6"/>
<text x="500" y="282" text-anchor="middle" font-family="'Lilita One','Fredoka',system-ui,sans-serif" font-size="58" letter-spacing="14" fill="url(#gold)" stroke="${INK}" stroke-width="8" paint-order="stroke">GOLD</text>
<path d="M270 260 l-26 -20 l0 40 z M730 260 l26 -20 l0 40 z" fill="#ffc93c" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
</svg>`;
};

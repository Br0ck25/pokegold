// The Buddymon title logo (wordmark), used by the title and menu scenes.
Art.logo = function () {
  return `<svg class="logo-svg" viewBox="0 0 1000 230" xmlns="http://www.w3.org/2000/svg">
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
</svg>`;
};

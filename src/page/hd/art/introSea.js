// Intro act 1 backdrop: sunlit deep water, light rays, kelp (portrait, slice).
Art.introSea = function () {
  const kelp = [80, 210, 380, 590, 760, 910].map((x, i) =>
    `<path class="kelp" style="animation-delay:${i * 0.4}s" d="M${x} 1200 C${x - 40} 1100 ${x + 40} 1020 ${x} 930 C${x - 40} 850 ${x + 40} 780 ${x + 6} 700" fill="none" stroke="${i % 2 ? "#1f9b6a" : "#2fc486"}" stroke-width="22" stroke-linecap="round"/>`).join("");
  return `<svg class="bgsvg" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fd6ff"/><stop offset=".5" stop-color="#1a8fc4"/><stop offset="1" stop-color="#0b3b78"/></linearGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="1000" height="1200" fill="url(#sea)"/>
<g class="rays" fill="url(#ray)"><path d="M150 0 L330 0 L120 900 L-60 900Z"/><path d="M520 0 L650 0 L520 900 L360 900Z"/><path d="M800 0 L930 0 L1000 900 L780 900Z"/></g>
${kelp}
<path d="M0 1130 C200 1090 380 1150 600 1110 C800 1075 920 1130 1000 1100 L1000 1200 L0 1200Z" fill="#e9c98a" stroke="${INK}" stroke-width="6"/>
</svg>`;
};

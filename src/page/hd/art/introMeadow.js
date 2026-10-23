// Intro act 2 backdrop: morning meadow with rolling hills and flowers (portrait, slice).
Art.introMeadow = function () {
  let flowers = "";
  const cols = ["#ff6b5e", "#ffc93c", "#fff6dc", "#ff9aa8"];
  for (let i = 0; i < 26; i++) {
    const x = (i * 137) % 980 + 10, y = 860 + ((i * 71) % 300);
    flowers += `<circle cx="${x}" cy="${y}" r="9" fill="${cols[i % 4]}" stroke="${INK}" stroke-width="3"/>`;
  }
  return `<svg class="bgsvg" viewBox="0 0 1000 1200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="morn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset=".7" stop-color="#d9f2ff"/><stop offset="1" stop-color="#fff2c8"/></linearGradient></defs>
<rect width="1000" height="1200" fill="url(#morn)"/>
<circle cx="780" cy="260" r="90" fill="#ffe27a" stroke="${INK}" stroke-width="6"/>
<g class="clouds2" fill="#fff" stroke="${INK}" stroke-width="5"><path d="M110 330 q30 -60 90 -30 q50 -50 100 10 q40 0 40 40 H110z"/><path d="M520 180 q30 -50 80 -24 q40 -40 80 8 q34 0 34 34 H520z"/></g>
<path d="M0 760 C180 680 360 740 560 690 C760 640 880 720 1000 690 L1000 1200 L0 1200Z" fill="#59c97a" stroke="${INK}" stroke-width="6"/>
<path d="M0 900 C220 830 420 900 620 850 C800 810 920 870 1000 850 L1000 1200 L0 1200Z" fill="#3fae62" stroke="${INK}" stroke-width="6"/>
${flowers}
</svg>`;
};

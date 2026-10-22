// Night sky with a big golden moon and layered hills. `dim` darkens it for menus.
Art.sky = function () {
  let stars = "";
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 1000, y = rnd() * 520, r = 1 + rnd() * 2.4;
    stars += `<circle class="star" style="animation-delay:${(rnd() * 4).toFixed(2)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fff6dc"/>`;
  }
  return `<svg class="sky-svg" viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a22"/><stop offset=".55" stop-color="#1b2d6b"/><stop offset=".85" stop-color="#5a4a8c"/><stop offset="1" stop-color="#e98a58"/></linearGradient>
<radialGradient id="moon-glow"><stop offset="0" stop-color="#ffd35a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd35a" stop-opacity="0"/></radialGradient>
<linearGradient id="moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b0"/><stop offset="1" stop-color="#ffb62e"/></linearGradient>
<linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f86"/><stop offset="1" stop-color="#252a64"/></linearGradient>
<linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27346f"/><stop offset="1" stop-color="#17214f"/></linearGradient>
<linearGradient id="h3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b7a5a"/><stop offset="1" stop-color="#0d4237"/></linearGradient>
</defs>
<rect width="1000" height="900" fill="url(#sk)"/>
${stars}
<circle cx="500" cy="330" r="330" fill="url(#moon-glow)"/>
<circle cx="500" cy="330" r="150" fill="url(#moon)" stroke="${INK}" stroke-width="6"/>
<circle cx="455" cy="290" r="26" fill="#ffc94a" opacity=".55"/><circle cx="548" cy="372" r="18" fill="#ffc94a" opacity=".5"/><circle cx="520" cy="270" r="11" fill="#ffc94a" opacity=".5"/>
<g class="clouds"><path d="M80 210 q30 -40 70 -10 q40 -30 70 10 z" fill="#fff" opacity=".12"/><path d="M700 160 q30 -40 70 -10 q40 -30 70 10 z" fill="#fff" opacity=".12"/></g>
<path d="M0 640 C150 560 270 600 400 560 C560 510 720 590 1000 540 L1000 900 L0 900 Z" fill="url(#h1)" stroke="${INK}" stroke-width="5"/>
<path d="M0 720 C180 650 330 700 520 650 C700 610 850 690 1000 660 L1000 900 L0 900 Z" fill="url(#h2)" stroke="${INK}" stroke-width="5"/>
<path d="M0 800 C200 750 360 800 560 760 C760 725 880 790 1000 770 L1000 900 L0 900 Z" fill="url(#h3)" stroke="${INK}" stroke-width="5"/>
</svg>`;
};

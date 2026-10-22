"use strict";
// People, props and the bedroom, in the same ink-outline vector style as art.js.

Object.assign(Art, {
  // Night sky with a big golden moon and layered hills. `dim` darkens it for menus.
  sky() {
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
  },

  logo() {
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
  },

  // Friendly professor, bust portrait (viewBox 300 x 380)
  professor() {
    return `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="pf-coat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8e2f2"/></linearGradient>
  <linearGradient id="pf-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ebf5"/><stop offset="1" stop-color="#b9c2d8"/></linearGradient>
</defs>
<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
  <path fill="url(#pf-coat)" d="M20 380 C20 300 60 262 110 252 L190 252 C240 262 280 300 280 380 Z"/>
  <path fill="#2fae6b" d="M112 252 L150 300 L188 252 L168 246 L150 270 L132 246 Z"/>
  <path fill="#fff" d="M104 250 L150 322 L124 372 L82 292 Z"/><path fill="#fff" d="M196 250 L150 322 L176 372 L218 292 Z"/>
  <rect x="124" y="214" width="52" height="44" rx="14" fill="#f2c29a"/>
  <path fill="url(#pf-hair)" d="M60 170 C52 70 120 30 150 30 C190 30 250 66 240 170 C246 214 230 240 212 246 L212 150 L88 150 L88 246 C70 238 56 214 60 170 Z"/>
  <ellipse cx="150" cy="168" rx="70" ry="76" fill="#f7d0a8"/>
  <path fill="url(#pf-hair)" d="M78 150 C86 82 126 66 150 66 C180 66 218 84 224 150 C206 120 180 104 150 104 C120 104 96 118 78 150 Z"/>
</g>
<g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
  <circle cx="118" cy="168" r="24" fill="#cfe9ff" fill-opacity=".35"/><circle cx="182" cy="168" r="24" fill="#cfe9ff" fill-opacity=".35"/>
  <path d="M142 166 Q150 160 158 166"/>
  <path d="M96 164 L84 160 M204 164 L216 160"/>
  <path d="M126 218 Q150 236 174 218"/>
</g>
<circle cx="118" cy="170" r="8" fill="${INK}"/><circle cx="182" cy="170" r="8" fill="${INK}"/>
<circle cx="115" cy="167" r="3" fill="#fff"/><circle cx="179" cy="167" r="3" fill="#fff"/>
<circle cx="102" cy="196" r="10" fill="#ff9aa8" opacity=".55"/><circle cx="198" cy="196" r="10" fill="#ff9aa8" opacity=".55"/>
<path d="M124 150 q14 -10 28 -2 M148 148 q14 -8 28 2" fill="none" stroke="#8793ad" stroke-width="5" stroke-linecap="round"/>
<g transform="translate(206 282)"><path d="M0 0 c0 -16 14 -22 26 -22 c0 14 -8 24 -26 22z" fill="#46c26f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>
</svg>`;
  },

  // Player portrait: the kid in the cap (viewBox 300 x 380)
  hero() {
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
  },

  // Tiny overworld hero. dir: 0 down, 1 up, 2 left, 3 right (viewBox 60 x 80)
  heroSprite(dir) {
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
  },

  // The player's bedroom: an 8 x 6 grid, one cell = 100 units. Layout mirrors the
  // game's collision: PC and radio on the desk (2,1)-(3,1), TV (4,1) with console
  // (4,2), bookshelf (5,1), stairs (7,0), table (4,4)-(5,4), bed (0,4)-(0,5).
  room() {
    const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
    let planks = "";
    for (let i = 1; i < 12; i++) planks += `<path d="M0 ${100 + i * 42} H800" stroke="#c98d4a" stroke-width="2" opacity=".45"/>`;
    return `<svg class="room-svg" viewBox="-20 -20 840 640" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0be78"/><stop offset="1" stop-color="#d99a54"/></linearGradient>
  <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b57b0"/><stop offset="1" stop-color="#27408a"/></linearGradient>
  <linearGradient id="bed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a6b"/><stop offset="1" stop-color="#e5604a"/></linearGradient>
  <radialGradient id="lamp"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
</defs>
<rect x="0" y="0" width="800" height="600" rx="10" fill="url(#fl)"/>${planks}
<rect x="0" y="0" width="800" height="110" fill="url(#wl)"/>
<g stroke="#4a68c8" stroke-width="2" opacity=".5">${Array.from({ length: 16 }, (_, i) => `<path d="M${25 + i * 50} 0 V100"/>`).join("")}</g>
<rect x="0" y="96" width="800" height="16" fill="#f4e3c1" ${o}/>
<rect x="-6" y="-6" width="812" height="612" rx="12" fill="none" stroke="${INK}" stroke-width="12"/>
<!-- window -->
<g ${o}><rect x="40" y="14" width="110" height="74" rx="6" fill="#0c1a44"/><path d="M95 14 V88 M40 51 H150" stroke="${INK}" stroke-width="5"/>
  <circle cx="72" cy="36" r="9" fill="#ffd35a" stroke="none"/><circle cx="120" cy="66" r="2.5" fill="#fff" stroke="none"/><circle cx="62" cy="68" r="2" fill="#fff" stroke="none"/></g>
<!-- poster -->
<g ${o} transform="translate(600 10)"><rect width="90" height="76" rx="5" fill="#fff4d6"/><path d="M10 62 L32 30 L48 50 L60 38 L82 62 Z" fill="#46c26f"/><circle cx="66" cy="22" r="9" fill="#ffc93c"/></g>
<!-- stairs -->
<g ${o}><rect x="710" y="6" width="84" height="94" rx="6" fill="#0c1a44"/><path d="M718 30 H786 M718 52 H786 M718 74 H786" stroke="#6f86d6" stroke-width="5"/><path d="M752 82 l-12 -14 h24 z" fill="#ffc93c" stroke="${INK}" stroke-width="3"/></g>
<!-- rug -->
<ellipse cx="400" cy="320" rx="230" ry="96" fill="#2fae6b" ${o} opacity=".92"/><ellipse cx="400" cy="320" rx="196" ry="74" fill="none" stroke="#7be8a0" stroke-width="5" stroke-dasharray="14 10"/>
<!-- shadows -->
<g fill="#000" opacity=".16"><ellipse cx="270" cy="212" rx="120" ry="14"/><ellipse cx="610" cy="212" rx="58" ry="14"/></g>
<!-- desk with PC + radio (x 2-3, y 1) -->
<g ${o}>
  <rect x="198" y="118" width="206" height="92" rx="8" fill="#b8763a"/><rect x="208" y="128" width="186" height="14" fill="#d79a5a" stroke="none"/>
  <rect x="214" y="68" width="82" height="62" rx="8" fill="#e9eef8"/><rect x="224" y="76" width="62" height="42" rx="4" fill="#1b2d6b"/><path d="M232 90 H268 M232 100 H256" stroke="#7be8a0" stroke-width="4"/>
  <rect x="222" y="148" width="70" height="20" rx="4" fill="#e9eef8"/>
  <rect x="318" y="108" width="72" height="50" rx="8" fill="#ff6b5e"/><circle cx="342" cy="134" r="14" fill="#ffe0dc"/><path d="M366 120 H382 M366 134 H382 M366 148 H382" stroke="${INK}" stroke-width="3"/>
  <path d="M206 210 V224 M396 210 V224" stroke-width="8"/>
</g>
<!-- TV + console (x 4, y 1-2) -->
<g ${o}>
  <rect x="416" y="62" width="86" height="130" rx="10" fill="#3a56b0"/><rect x="426" y="72" width="66" height="52" rx="6" fill="#0c1a44"/><path d="M432 84 L486 112" stroke="#6f86d6" stroke-width="4" opacity=".6"/>
  <rect x="428" y="140" width="62" height="40" rx="6" fill="#e9eef8"/><circle cx="446" cy="160" r="7" fill="#ff6b5e"/><rect x="460" y="152" width="22" height="16" rx="3" fill="#7be8a0"/>
  <rect x="424" y="214" width="70" height="40" rx="8" fill="#6f86d6"/><circle cx="446" cy="234" r="8" fill="#ffd35a"/><path d="M470 226 v16 M462 234 h16" stroke="${INK}" stroke-width="4"/>
</g>
<!-- bookshelf (x 5, y 1) -->
<g ${o}>
  <rect x="516" y="52" width="86" height="148" rx="8" fill="#b8763a"/>
  <rect x="526" y="64" width="66" height="38" fill="#7a4a1e" stroke="none"/><rect x="526" y="112" width="66" height="38" fill="#7a4a1e" stroke="none"/>
  <g stroke-width="3"><rect x="530" y="68" width="12" height="32" fill="#e04a4a"/><rect x="544" y="72" width="12" height="28" fill="#46c26f"/><rect x="558" y="66" width="12" height="34" fill="#ffc93c"/><rect x="572" y="72" width="14" height="28" fill="#4fb6d9"/>
  <rect x="530" y="118" width="16" height="30" fill="#ffc93c"/><rect x="548" y="114" width="12" height="34" fill="#e04a4a"/><rect x="562" y="120" width="22" height="28" fill="#6f86d6"/></g>
  <rect x="526" y="160" width="66" height="30" fill="#7a4a1e" stroke="none"/><circle cx="560" cy="174" r="11" fill="#7be8a0" stroke-width="3"/>
</g>
<!-- table (x 4-5, y 4) -->
<g ${o}>
  <rect x="408" y="410" width="204" height="74" rx="10" fill="#c98446"/><rect x="418" y="418" width="184" height="12" fill="#e2a468" stroke="none"/>
  <path d="M424 484 V510 M596 484 V510" stroke-width="9"/>
  <rect x="440" y="436" width="46" height="30" rx="6" fill="#ffe0dc" stroke-width="4"/>
  <circle cx="548" cy="448" r="20" fill="#fff4d6" stroke-width="4"/><path d="M548 428 v-14" stroke-width="4"/>
</g>
<!-- bed (x 0, y 4-5) -->
<g ${o}>
  <rect x="6" y="404" width="98" height="190" rx="12" fill="url(#bed)"/>
  <rect x="14" y="412" width="82" height="52" rx="12" fill="#fff4d6"/>
  <path d="M6 480 Q55 462 104 480" fill="none" stroke="#ffd0c4" stroke-width="5"/>
</g>
<ellipse cx="260" cy="150" rx="190" ry="110" fill="url(#lamp)"/>
</svg>`;
  },
});

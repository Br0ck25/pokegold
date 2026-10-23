// The player's bedroom: an 8 x 6 grid, one cell = 100 units. Layout mirrors the
// game's collision: PC and radio on the desk (2,1)-(3,1), TV (4,1) with console
// (4,2), bookshelf (5,1), stairs (7,0), table (4,4)-(5,4), bed (0,4)-(0,5).
Art.room = function () {
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
};

// Player's house, ground floor: 10 x 8 cells of 100 units. Blocked cells (from the game's collision data):
// kitchen counters (0..3,1) with the divider (3,1..3), TV (4,1), cabinet (5,1), table (5..6,3..4).
// Stairs (9,0), front door mat (6..7,7).
Art.room1F = function () {
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  let planks = "";
  for (let i = 1; i < 19; i++) planks += `<path d="M0 ${100 + i * 38} H1000" stroke="#c98d4a" stroke-width="2" opacity=".45"/>`;
  return `<svg class="room-svg" viewBox="-20 -20 1040 840" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="fl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0be78"/><stop offset="1" stop-color="#d99a54"/></linearGradient>
<linearGradient id="wl1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#f2b872"/></linearGradient>
</defs>
<rect x="0" y="0" width="1000" height="800" rx="10" fill="url(#fl1)"/>${planks}
<rect x="0" y="0" width="1000" height="110" fill="url(#wl1)"/>
<g stroke="#e8a45c" stroke-width="2" opacity=".6">${Array.from({ length: 20 }, (_, i) => `<path d="M${25 + i * 50} 0 V100"/>`).join("")}</g>
<rect x="0" y="96" width="1000" height="16" fill="#fff6dc" ${o}/>
<rect x="-6" y="-6" width="1012" height="812" rx="12" fill="none" stroke="${INK}" stroke-width="12"/>
<!-- windows -->
<g ${o}><rect x="610" y="14" width="120" height="74" rx="6" fill="#8fd3ff"/><path d="M670 14 V88 M610 51 H730" stroke-width="5"/>
  <rect x="60" y="14" width="100" height="74" rx="6" fill="#8fd3ff"/><path d="M110 14 V88 M60 51 H160" stroke-width="5"/></g>
<!-- stairs up (9,0) -->
<g ${o}><rect x="910" y="6" width="84" height="94" rx="6" fill="#7a4a1e"/><path d="M918 30 H986 M918 52 H986 M918 74 H986" stroke="#d79a5a" stroke-width="5"/><path d="M952 82 l-12 -14 h24 z" fill="#ffc93c" stroke-width="3"/></g>
<!-- door mat (6..7,7) -->
<g ${o}><rect x="612" y="716" width="176" height="76" rx="12" fill="#d63a4a"/><rect x="626" y="728" width="148" height="52" rx="8" fill="none" stroke="#ffd0c4" stroke-width="4" stroke-dasharray="12 8"/></g>
<!-- kitchen counters: stove, sink, fridge (0..2,1) -->
<g ${o}>
  <rect x="6" y="110" width="94" height="94" rx="8" fill="#e9eef8"/><circle cx="36" cy="140" r="14" fill="#3a3f52"/><circle cx="72" cy="140" r="14" fill="#3a3f52"/><rect x="20" y="170" width="66" height="20" rx="4" fill="#ffc93c"/>
  <rect x="100" y="110" width="100" height="94" rx="8" fill="#c98446"/><rect x="118" y="124" width="64" height="40" rx="10" fill="#8fd3ff"/><path d="M150 124 v-22 h18" fill="none" stroke-width="6"/>
  <rect x="200" y="40" width="96" height="164" rx="10" fill="#cfe9ff"/><path d="M200 112 H296" /><rect x="272" y="62" width="10" height="34" rx="4" fill="#fff"/><rect x="272" y="130" width="10" height="46" rx="4" fill="#fff"/>
  <!-- divider counter (3,1..3) -->
  <rect x="300" y="116" width="96" height="300" rx="10" fill="#c98446"/><rect x="312" y="128" width="72" height="14" fill="#e2a468" stroke="none"/>
  <circle cx="348" cy="200" r="16" fill="#fff6dc"/><rect x="326" y="270" width="44" height="30" rx="6" fill="#ff6b5e"/>
</g>
<!-- TV (4,1) -->
<g ${o}><rect x="406" y="48" width="96" height="150" rx="10" fill="#3a56b0"/><rect x="416" y="58" width="76" height="62" rx="6" fill="#0c1a44"/><path d="M424 70 L484 106" stroke="#6f86d6" stroke-width="4" opacity=".6"/>
  <rect x="418" y="136" width="72" height="46" rx="6" fill="#e9eef8"/><circle cx="440" cy="160" r="8" fill="#ff6b5e"/><rect x="456" y="150" width="26" height="20" rx="3" fill="#7be8a0"/></g>
<!-- cabinet with plant (5,1) -->
<g ${o}><rect x="512" y="104" width="86" height="100" rx="8" fill="#b8763a"/><rect x="520" y="112" width="70" height="40" fill="#7a4a1e" stroke="none"/>
  <path d="M555 104 C520 80 520 50 548 40 C556 66 566 80 555 104 Z M555 104 C590 84 598 56 574 38 C560 62 552 84 555 104 Z" fill="#46c26f" stroke-width="4"/><rect x="535" y="92" width="40" height="24" rx="5" fill="#ff8a6b" stroke-width="4"/></g>
<!-- table (5..6,3..4) -->
<g fill="#000" opacity=".16"><ellipse cx="600" cy="512" rx="120" ry="14"/></g>
<g ${o}><rect x="506" y="312" width="188" height="188" rx="16" fill="#c98446"/><rect x="522" y="326" width="156" height="160" rx="10" fill="#ff8fa3" opacity=".85" stroke-width="3"/>
  <circle cx="600" cy="406" r="42" fill="#fff6dc" stroke-width="4"/><circle cx="600" cy="406" r="22" fill="#ffc93c" stroke-width="3"/></g>
</svg>`;
};

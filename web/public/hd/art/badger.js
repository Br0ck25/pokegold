// Brock Family emblem: a badger (brock = badger) in a gold-ringed crest.
Art.badger = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="bg-crest" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2b4ea8"/><stop offset="1" stop-color="#10204f"/></radialGradient>
  <linearGradient id="bg-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#f08a14"/></linearGradient>
</defs>
<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
  <circle cx="100" cy="100" r="94" fill="url(#bg-ring)"/>
  <circle cx="100" cy="100" r="80" fill="url(#bg-crest)"/>
  <circle cx="64" cy="58" r="17" fill="#3a3f52"/><circle cx="136" cy="58" r="17" fill="#3a3f52"/>
  <circle cx="64" cy="58" r="7" fill="#f6f2e4" stroke="none"/><circle cx="136" cy="58" r="7" fill="#f6f2e4" stroke="none"/>
  <ellipse cx="100" cy="108" rx="52" ry="46" fill="#3a3f52"/>
  <path fill="#f6f2e4" d="M100 62 C86 64 80 80 84 100 L94 152 L106 152 L116 100 C120 80 114 64 100 62 Z"/>
  <ellipse cx="66" cy="124" rx="15" ry="13" fill="#f6f2e4"/><ellipse cx="134" cy="124" rx="15" ry="13" fill="#f6f2e4"/>
</g>
${Art.eye(77, 102, 9, "#caa23a")}${Art.eye(123, 102, 9, "#caa23a")}
<ellipse cx="100" cy="142" rx="11" ry="8" fill="${INK}"/><circle cx="96" cy="139" r="2.6" fill="#fff"/>
<path d="M88 152 Q100 162 112 152" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<path d="M46 36 L50 28 L56 36 M144 36 L150 28 L154 36" fill="none" stroke="#fff6dc" stroke-width="4" stroke-linecap="round" opacity=".8"/>
</svg>`;
};

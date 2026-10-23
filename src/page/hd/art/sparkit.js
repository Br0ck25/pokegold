// SPARKIT: ember fox (fire starter)
Art.sparkit = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="sp-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa24a"/><stop offset="1" stop-color="#e5602a"/></linearGradient>
<linearGradient id="sp-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ffe066"/></linearGradient>
</defs>
<ellipse cx="100" cy="186" rx="56" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#sp-body)" d="M138 168 C196 168 196 112 170 96 C176 124 160 140 140 142 Z"/>
<path fill="url(#sp-flame)" d="M170 96 C160 80 170 62 184 50 C186 68 198 78 190 98 C186 106 176 108 170 96 Z"/>
<ellipse cx="72" cy="176" rx="18" ry="11" fill="#fff0d4"/>
<ellipse cx="128" cy="176" rx="18" ry="11" fill="#fff0d4"/>
<ellipse cx="100" cy="142" rx="40" ry="36" fill="url(#sp-body)"/>
<ellipse cx="100" cy="152" rx="22" ry="20" fill="#fff0d4" stroke="none"/>
<path fill="url(#sp-body)" d="M44 74 L46 14 L84 52 Z"/><path fill="#5a1d2a" stroke="none" d="M54 62 L54 32 L72 52 Z"/>
<path fill="url(#sp-body)" d="M156 74 L154 14 L116 52 Z"/><path fill="#5a1d2a" stroke="none" d="M146 62 L146 32 L128 52 Z"/>
<path fill="url(#sp-body)" d="M40 96 C36 66 66 48 100 48 C134 48 164 66 160 96 C158 120 130 136 100 136 C70 136 42 120 40 96 Z"/>
<path fill="#fff0d4" stroke="none" d="M70 112 C80 100 120 100 130 112 C126 128 74 128 70 112 Z"/>
<path fill="url(#sp-flame)" d="M100 28 C92 40 94 52 100 58 C106 52 108 40 100 28 Z" stroke-width="4"/>
</g>
${this.eye(76, 94, 11, "#7a3b00")}${this.eye(124, 94, 11, "#7a3b00")}
<path d="M92 108 L108 108 L100 118 Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M100 118 L100 124 M88 126 Q100 134 112 126" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<circle cx="58" cy="112" r="8" fill="#ff7a8a" opacity=".6"/><circle cx="142" cy="112" r="8" fill="#ff7a8a" opacity=".6"/>
</svg>`;
};

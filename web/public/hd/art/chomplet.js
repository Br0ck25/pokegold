// CHOMPLET: shark pup (water starter), after the supplied reference style
Art.chomplet = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="ch-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb6d9"/><stop offset="1" stop-color="#2a6fa8"/></linearGradient>
<linearGradient id="ch-mouth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d63a4a"/><stop offset="1" stop-color="#8f1f36"/></linearGradient>
</defs>
<ellipse cx="100" cy="188" rx="58" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#ch-body)" d="M104 10 C132 24 140 46 140 66 L66 66 C84 52 100 34 104 10 Z"/>
<path fill="url(#ch-body)" d="M26 150 C22 100 52 66 100 66 C148 66 178 100 174 150 C170 176 140 188 100 188 C60 188 30 176 26 150 Z"/>
<path fill="#ffe08a" stroke="none" d="M44 160 C60 178 140 178 156 160 C150 186 50 186 44 160 Z"/>
<path fill="url(#ch-body)" d="M30 140 L8 156 L30 166 Z"/><path fill="url(#ch-body)" d="M170 140 L192 156 L170 166 Z"/>
<path fill="url(#ch-mouth)" d="M44 112 C66 130 134 130 156 112 C160 146 134 172 100 172 C66 172 40 146 44 112 Z"/>
</g>
<g fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round">
<path d="M50 114 L62 132 L72 118 Z"/><path d="M76 120 L88 138 L98 124 Z"/><path d="M102 124 L112 138 L124 120 Z"/><path d="M128 118 L138 132 L150 114 Z"/>
</g>
<path d="M82 160 C90 148 110 148 118 160 C112 170 88 170 82 160 Z" fill="#ff8da1" stroke="${INK}" stroke-width="4"/>
<path d="M66 92 L90 86" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M134 92 L110 86" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
${this.eye(72, 100, 12, "#e04a4a")}${this.eye(128, 100, 12, "#e04a4a")}
<path d="M84 52 C92 40 98 30 100 22" fill="none" stroke="#bfeaff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
</svg>`;
};

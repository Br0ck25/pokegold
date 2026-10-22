"use strict";
// Vector art for the HD layer. Everything is plain SVG so it stays crisp at
// any size. Shared look: thick ink outline, flat colour, glossy round eyes.

const INK = "#0b1730";

const Art = {
  INK,

  // Shared eye: white sclera, coloured iris, ink pupil, two glints.
  eye(cx, cy, r, iris = "#e04a4a") {
    return `<g><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.12}" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="${cx + r * 0.08}" cy="${cy + r * 0.1}" rx="${r * 0.68}" ry="${r * 0.78}" fill="${iris}"/>
      <ellipse cx="${cx + r * 0.1}" cy="${cy + r * 0.12}" rx="${r * 0.36}" ry="${r * 0.42}" fill="${INK}"/>
      <circle cx="${cx - r * 0.22}" cy="${cy - r * 0.3}" r="${r * 0.22}" fill="#fff"/>
      <circle cx="${cx + r * 0.3}" cy="${cy + r * 0.28}" r="${r * 0.1}" fill="#fff"/></g>`;
  },

  // BRAMBLET: leaf-spined hedgehog (grass starter)
  bramblet() {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="bb-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58d684"/><stop offset="1" stop-color="#1f8f4e"/></linearGradient>
  <linearGradient id="bb-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#eeb06b"/></linearGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="9" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <path fill="url(#bb-leaf)" d="M22 130 C10 100 20 66 46 50 L50 78 L58 30 L82 62 L100 14 L118 62 L142 30 L150 78 L154 50 C180 66 190 100 178 130 C160 150 40 150 22 130 Z"/>
  <path fill="#7be8a0" stroke-width="3" d="M58 30 L66 70 L74 56 Z M100 14 L96 62 L108 62 Z M142 30 L126 56 L134 70 Z"/>
  <ellipse cx="68" cy="172" rx="20" ry="12" fill="url(#bb-fur)"/>
  <ellipse cx="132" cy="172" rx="20" ry="12" fill="url(#bb-fur)"/>
  <ellipse cx="100" cy="138" rx="46" ry="38" fill="url(#bb-fur)"/>
  <ellipse cx="100" cy="148" rx="26" ry="22" fill="#fff4d6" stroke="none"/>
  <circle cx="58" cy="76" r="14" fill="url(#bb-fur)"/><circle cx="58" cy="76" r="7" fill="#ff9aa8" stroke="none"/>
  <circle cx="142" cy="76" r="14" fill="url(#bb-fur)"/><circle cx="142" cy="76" r="7" fill="#ff9aa8" stroke="none"/>
  <ellipse cx="100" cy="100" rx="50" ry="42" fill="url(#bb-fur)"/>
</g>
<path d="M74 66 Q100 52 126 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
${this.eye(78, 98, 12, "#2e9e55")}${this.eye(122, 98, 12, "#2e9e55")}
<ellipse cx="100" cy="114" rx="8" ry="6" fill="${INK}"/>
<path d="M92 124 Q100 132 108 124" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<circle cx="64" cy="116" r="8" fill="#ff8c9e" opacity=".7"/><circle cx="136" cy="116" r="8" fill="#ff8c9e" opacity=".7"/>
</svg>`;
  },

  // SPARKIT: ember fox (fire starter)
  sparkit() {
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
  },

  // CHOMPLET: shark pup (water starter), after the supplied reference style
  chomplet() {
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
  },
};

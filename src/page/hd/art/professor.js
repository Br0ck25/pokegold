// Friendly professor, bust portrait (viewBox 300 x 380)
Art.professor = function () {
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
};

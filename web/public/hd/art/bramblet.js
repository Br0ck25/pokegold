// BRAMBLET: leaf-spined hedgehog (grass starter)
Art.bramblet = function () {
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
};

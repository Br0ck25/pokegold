// BANDIT: the tuxedo cat (dark starter), drawn from the author's cat: black coat, white muzzle, chest and paws, amber-green eyes.
Art.bandit = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bn-fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f55"/><stop offset="1" stop-color="#171a26"/></linearGradient>
<linearGradient id="bn-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe5f2"/></linearGradient>
</defs>
<ellipse cx="100" cy="186" rx="58" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<path fill="url(#bn-fur)" d="M136 172 C200 174 204 112 172 90 C178 126 162 146 140 148 Z"/>
<ellipse cx="72" cy="178" rx="19" ry="11" fill="url(#bn-white)"/>
<ellipse cx="128" cy="178" rx="19" ry="11" fill="url(#bn-white)"/>
<ellipse cx="100" cy="142" rx="42" ry="37" fill="url(#bn-fur)"/>
<path fill="url(#bn-white)" d="M68 128 C78 116 122 116 132 128 C138 158 62 158 68 128 Z"/>
<path fill="url(#bn-fur)" d="M44 76 L46 12 L88 54 Z"/><path fill="#e8a5b4" stroke="none" d="M54 62 L55 32 L74 54 Z"/>
<path fill="url(#bn-fur)" d="M156 76 L154 12 L112 54 Z"/><path fill="#e8a5b4" stroke="none" d="M146 62 L145 32 L126 54 Z"/>
<path fill="url(#bn-fur)" d="M40 96 C36 66 66 48 100 48 C134 48 164 66 160 96 C158 120 130 136 100 136 C70 136 42 120 40 96 Z"/>
<path fill="url(#bn-white)" d="M44 106 L34 114 L46 116 L38 126 L54 122 C60 136 80 142 100 142 C120 142 140 136 146 122 L162 126 L154 116 L166 114 L156 106 C148 98 132 100 100 106 C68 100 52 98 44 106 Z"/>
<path fill="${INK}" stroke="none" d="M86 102 L114 102 L108 120 L100 126 L92 120 Z"/>
</g>
<path d="M100 54 L100 80" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M54 112 L22 104 M54 120 L24 124 M146 112 L178 104 M146 120 L176 124"/></g>
<ellipse cx="100" cy="106" rx="7" ry="4" fill="#5a5f78"/>
${this.eye(74, 92, 12, "#d6b52a")}${this.eye(126, 92, 12, "#d6b52a")}
<path d="M58 80 Q74 78 90 86 M142 80 Q126 78 110 86" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<path d="M100 126 L100 132 M90 134 Q100 140 110 134" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
</svg>`;
};

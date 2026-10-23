// NIBBLET (was Rattata): round purple mouse with big front teeth and a curly tail.
Art.nibblet = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="nb-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b79cf0"/><stop offset="1" stop-color="#8466d0"/></linearGradient></defs>
<ellipse cx="100" cy="186" rx="56" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M146 160 C196 170 198 110 168 108 C186 120 176 150 146 146" fill="none" stroke-width="9"/>
  <path d="M146 160 C196 170 198 110 168 108 C186 120 176 150 146 146" fill="none" stroke="#e8c8d8" stroke-width="4"/>
  <ellipse cx="68" cy="176" rx="18" ry="10" fill="url(#nb-b)"/><ellipse cx="132" cy="176" rx="18" ry="10" fill="url(#nb-b)"/>
  <ellipse cx="100" cy="140" rx="44" ry="38" fill="url(#nb-b)"/>
  <ellipse cx="100" cy="150" rx="26" ry="22" fill="#f3e8ff" stroke="none"/>
  <circle cx="52" cy="66" r="24" fill="url(#nb-b)"/><circle cx="52" cy="66" r="13" fill="#ffb3c8" stroke="none"/>
  <circle cx="148" cy="66" r="24" fill="url(#nb-b)"/><circle cx="148" cy="66" r="13" fill="#ffb3c8" stroke="none"/>
  <ellipse cx="100" cy="102" rx="54" ry="46" fill="url(#nb-b)"/>
  <rect x="88" y="124" width="12" height="22" rx="4" fill="#fff" stroke-width="4"/><rect x="100" y="124" width="12" height="22" rx="4" fill="#fff" stroke-width="4"/>
</g>
${Art.eye(76, 94, 11, "#d63a4a")}${Art.eye(124, 94, 11, "#d63a4a")}
<ellipse cx="100" cy="116" rx="9" ry="6" fill="#ff7a96" stroke="${INK}" stroke-width="4"/>
<path d="M60 112 L34 106 M60 120 L34 124 M140 112 L166 106 M140 120 L166 124" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;
};

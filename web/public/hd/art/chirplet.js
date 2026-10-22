// CHIRPLET (was Pidgey): fluffy chick-bird with a three-feather crest.
Art.chirplet = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="cp-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f6b64a"/></linearGradient>
<linearGradient id="cp-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6a03c"/><stop offset="1" stop-color="#d9742a"/></linearGradient></defs>
<ellipse cx="100" cy="186" rx="54" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <path fill="url(#cp-w)" d="M140 150 L186 138 L170 160 L190 176 L146 172Z"/>
  <path d="M78 176 V190 M70 190 H88 M122 176 V190 M114 190 H132" fill="none" stroke="#e8842a" stroke-width="6"/>
  <ellipse cx="100" cy="128" rx="58" ry="52" fill="url(#cp-b)"/>
  <ellipse cx="100" cy="148" rx="34" ry="28" fill="#fff6dc" stroke="none"/>
  <path fill="url(#cp-w)" d="M40 112 C20 124 22 160 50 164 C60 150 58 126 40 112Z"/>
  <path fill="url(#cp-w)" d="M160 112 C180 124 178 160 150 164 C140 150 142 126 160 112Z"/>
  <path fill="#f6a03c" d="M84 50 L80 20 L98 42 L104 14 L116 42 L130 22 L122 54Z"/>
  <path fill="#ff8a3a" d="M88 98 L112 98 L100 116Z"/>
</g>
${Art.eye(74, 88, 11, "#4a3a1a")}${Art.eye(126, 88, 11, "#4a3a1a")}
<circle cx="56" cy="108" r="8" fill="#ff8c9e" opacity=".6"/><circle cx="144" cy="108" r="8" fill="#ff8c9e" opacity=".6"/>
</svg>`;
};

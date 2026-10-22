// PEEKAT (was Sentret): meerkat standing tall on its tail, always keeping watch.
Art.peekat = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="pk-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c28a"/><stop offset="1" stop-color="#c8955a"/></linearGradient></defs>
<ellipse cx="100" cy="190" rx="50" ry="7" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M128 176 C176 180 184 130 160 118 C168 140 150 158 124 160Z" fill="url(#pk-b)"/>
  <ellipse cx="78" cy="184" rx="20" ry="9" fill="#a8764a"/><ellipse cx="122" cy="184" rx="20" ry="9" fill="#a8764a"/>
  <ellipse cx="100" cy="142" rx="38" ry="46" fill="url(#pk-b)"/>
  <path d="M82 120 L118 120 M80 138 L120 138 M82 156 L118 156" stroke="#9a6a3a" stroke-width="5" fill="none"/>
  <ellipse cx="100" cy="150" rx="22" ry="26" fill="#fff0d0" stroke="none"/>
  <ellipse cx="62" cy="132" rx="11" ry="22" fill="url(#pk-b)" transform="rotate(14 62 132)"/><ellipse cx="138" cy="132" rx="11" ry="22" fill="url(#pk-b)" transform="rotate(-14 138 132)"/>
  <circle cx="56" cy="46" r="15" fill="#a8764a"/><circle cx="144" cy="46" r="15" fill="#a8764a"/>
  <ellipse cx="100" cy="64" rx="46" ry="40" fill="url(#pk-b)"/>
  <ellipse cx="100" cy="80" rx="26" ry="18" fill="#fff0d0" stroke="none"/>
  <path d="M60 60 Q74 52 86 66 Q74 76 60 70Z M140 60 Q126 52 114 66 Q126 76 140 70Z" fill="#6b4226" stroke-width="4"/>
</g>
${Art.eye(76, 62, 8, "#e8b04a")}${Art.eye(124, 62, 8, "#e8b04a")}
<ellipse cx="100" cy="76" rx="7" ry="5" fill="${INK}"/><path d="M92 86 Q100 93 108 86" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
</svg>`;
};

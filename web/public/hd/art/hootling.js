// HOOTLING (was Hoothoot): round night owl with moon-yellow eyes and ear tufts.
Art.hootling = function () {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ht-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a7ad0"/><stop offset="1" stop-color="#5a3f9a"/></linearGradient></defs>
<ellipse cx="100" cy="188" rx="50" ry="8" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M80 174 V190 M70 190 H90 M120 174 V190 M110 190 H130" fill="none" stroke="#ffb84a" stroke-width="6"/>
  <ellipse cx="100" cy="124" rx="60" ry="58" fill="url(#ht-b)"/>
  <ellipse cx="100" cy="146" rx="36" ry="32" fill="#f2e8ff" stroke="none"/>
  <path d="M82 134 q18 12 36 0 M80 150 q20 12 40 0 M86 164 q14 8 28 0" fill="none" stroke="#9a7ad0" stroke-width="4"/>
  <path d="M38 118 C16 134 22 172 54 172 C64 150 58 132 38 118Z" fill="#4a3382"/>
  <path d="M162 118 C184 134 178 172 146 172 C136 150 142 132 162 118Z" fill="#4a3382"/>
  <path d="M52 80 L44 38 L84 66Z M148 80 L156 38 L116 66Z" fill="url(#ht-b)"/>
  <ellipse cx="100" cy="84" rx="56" ry="44" fill="url(#ht-b)"/>
  <circle cx="74" cy="86" r="26" fill="#fff6dc"/><circle cx="126" cy="86" r="26" fill="#fff6dc"/>
  <path fill="#ffb84a" d="M90 96 L110 96 L100 118Z"/>
</g>
${Art.eye(74, 86, 15, "#ffd25a")}${Art.eye(126, 86, 15, "#ffd25a")}
</svg>`;
};

// Procedural placeholder creature for any species without hand-drawn art (Art.creature falls back here).
// Seeded by the species id, so a species always looks the same: hue, body, ears, tail and markings vary.
Art.critter = function (id) {
  let seed = (id * 9301 + 49297) % 233280;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const hue = Math.floor(rnd() * 360);
  const hsl = (dh, s, l) => `hsl(${(hue + dh) % 360} ${s}% ${l}%)`;
  const body = hsl(0, 62, 58), dark = hsl(0, 60, 40), light = hsl(0, 70, 82), accent = hsl(150, 70, 58);
  const ears = pick(["round", "point", "long", "horn", "none"]);
  const tail = pick(["curl", "fluff", "spike", "none"]);
  const mark = pick(["belly", "stripes", "spots", "none"]);
  const eyeR = 10 + Math.floor(rnd() * 4), iris = hsl(180, 60, 40);
  const rx = 52 + Math.floor(rnd() * 14), ry = 46 + Math.floor(rnd() * 12);
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

  const earSvg = {
    round: `<circle cx="${100 - rx + 8}" cy="62" r="16" fill="${body}" ${o}/><circle cx="${100 + rx - 8}" cy="62" r="16" fill="${body}" ${o}/>`,
    point: `<path d="M${100 - rx + 4} 74 L${100 - rx + 6} 28 L${100 - 14} 56Z M${100 + rx - 4} 74 L${100 + rx - 6} 28 L${100 + 14} 56Z" fill="${body}" ${o}/>`,
    long: `<ellipse cx="${100 - 34}" cy="34" rx="12" ry="34" fill="${body}" ${o}/><ellipse cx="${100 + 34}" cy="34" rx="12" ry="34" fill="${body}" ${o}/>`,
    horn: `<path d="M${100 - 30} 62 L${100 - 38} 24 L${100 - 14} 56Z M${100 + 30} 62 L${100 + 38} 24 L${100 + 14} 56Z" fill="${accent}" ${o}/>`,
    none: "",
  }[ears];
  const tailSvg = {
    curl: `<path d="M140 156 C190 160 196 108 164 100 C176 124 160 134 142 134Z" fill="${body}" ${o}/>`,
    fluff: `<ellipse cx="170" cy="140" rx="24" ry="34" fill="${light}" ${o} transform="rotate(25 170 140)"/>`,
    spike: `<path d="M136 160 L190 146 L150 130Z" fill="${accent}" ${o}/>`,
    none: "",
  }[tail];
  const markSvg = {
    belly: `<ellipse cx="100" cy="152" rx="26" ry="22" fill="${light}"/>`,
    stripes: `<path d="M62 84 L84 90 M138 84 L116 90 M60 108 L82 112 M140 108 L118 112" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>`,
    spots: `<circle cx="70" cy="132" r="9" fill="${dark}" opacity=".6"/><circle cx="132" cy="128" r="7" fill="${dark}" opacity=".6"/><circle cx="104" cy="150" r="6" fill="${dark}" opacity=".6"/>`,
    none: "",
  }[mark];

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="100" cy="186" rx="58" ry="9" fill="#000" opacity=".22"/>
${tailSvg}
<ellipse cx="70" cy="174" rx="20" ry="11" fill="${body}" ${o}/><ellipse cx="130" cy="174" rx="20" ry="11" fill="${body}" ${o}/>
<ellipse cx="100" cy="144" rx="${rx - 14}" ry="36" fill="${body}" ${o}/>${markSvg}
${earSvg}
<ellipse cx="100" cy="100" rx="${rx}" ry="${ry}" fill="${body}" ${o}/>
<path d="M${100 - rx + 18} 70 Q100 44 ${100 + rx - 18} 70" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>
${Art.eye(76, 98, eyeR, iris)}${Art.eye(124, 98, eyeR, iris)}
<ellipse cx="100" cy="116" rx="7" ry="5" fill="${INK}"/><path d="M92 126 Q100 134 108 126" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<circle cx="58" cy="118" r="8" fill="#ff8c9e" opacity=".6"/><circle cx="142" cy="118" r="8" fill="#ff8c9e" opacity=".6"/>
</svg>`;
};

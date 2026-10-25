// Overworld person, dir: 0 down, 1 up, 2 left, 3 right (viewBox 60 x 80): a shaded little figure with head, ears, eyes with highlights, brows, nose, mouth,
// hair, sleeves and hands, collar, belt, trousers and shoes. Look `o` comes from Art.looks:
//   skin, hair, hat (cap colour), bun, pigtails, glasses, top, dress (skirt instead of trousers), apron, legs, shoes, short (no long hair for a dress).
// Legs have classes "leg l/r" and arms "arm l/r" so the walk cycle (room.css) can move them; right-facing is the left-facing drawing mirrored.
Art.person = function (dir, o) {
  const skin = o.skin || "#f4c397", hair = o.hair || "#3a2418", top = o.top || "#9aa4c8", legs = o.legs || "#3a3f52", shoes = o.shoes || "#2b2430";
  const shade = (hex, k) => `#${[1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k))).toString(16).padStart(2, "0")).join("")}`;
  const skinD = shade(skin, 0.86), topD = shade(top, 0.78), topL = shade(top, 1.12), legsD = shade(legs, 0.76), hairD = shade(hair, 0.7), hairL = shade(hair, 1.25);
  const long = (o.dress && !o.short && !o.bun) || o.pigtails; // long hair or tails for the girls and women
  const ink = `stroke="${INK}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"`;
  const coat = o.coat || null, hat = o.hat || null, hatD = hat && shade(o.hat, 0.78);

  // --- front and back views share the body; the face is drawn for the front only
  const front = (back) => {
    const skirt = o.dress;
    const lowerLegs = skirt
      ? `<g ${ink}><path class="leg l" fill="${skin}" d="M22 62 H28 V69 H22Z"/><path class="leg r" fill="${skin}" d="M32 62 H38 V69 H32Z"/></g>`
      : `<g ${ink}><path class="leg l" fill="${legs}" d="M19.5 50 H29 V68 H19.5Z"/><path class="leg r" fill="${legs}" d="M31 50 H40.5 V68 H31Z"/></g>`;
    const feet = `<g ${ink} fill="${shoes}"><path class="leg l" d="M18.5 66 Q18.5 72 22 72 H29 V66Z"/><path class="leg r" d="M31 66 V72 H38 Q41.5 72 41.5 66Z"/></g>`;
    const bodice = skirt
      ? `<path ${ink} fill="${top}" d="M18 37 Q18 32 25 32 H35 Q42 32 42 37 L41 46 L46 64 H14 L19 46Z"/><path d="M22 47 L17 63 M38 47 L43 63" stroke="${topD}" stroke-width="1.6" fill="none"/>`
      : `<path ${ink} fill="${top}" d="M17 37 Q17 32 24 32 H36 Q43 32 43 37 L42 54 H18Z"/><path d="M17.5 38 L18.5 53 H22 L21 36Z M42.5 38 L41.5 53 H38 L39 36Z" fill="${topD}" opacity=".55"/>`;
    const belt = skirt ? "" : `<rect x="18" y="50.5" width="24" height="4" fill="#4a3424" stroke="${INK}" stroke-width="1.4"/><rect x="28" y="50.5" width="4" height="4" fill="#e8c24a" stroke="${INK}" stroke-width="1"/>`;
    const collar = back ? `<path d="M24 32 Q30 36 36 32" fill="none" stroke="${topD}" stroke-width="2.4"/>` : `<path d="M25 32 L30 39 L35 32Z" fill="${skinD}"/><path d="M24 32 L30 40 L36 32" fill="none" stroke="${topL}" stroke-width="2.2" stroke-linejoin="round"/>`;
    const coatSvg = !coat ? "" : back
      ? `<path ${ink} fill="${coat}" d="M16.5 36 Q16.5 32 24 32 H36 Q43.5 32 43.5 36 L45 63 H15Z"/>`
      : `<path ${ink} fill="${coat}" d="M16.5 36 Q16.5 32 24 32 H27 L30 38 L33 32 H36 Q43.5 32 43.5 36 L45 63 H33.5 L30 40 L26.5 63 H15Z"/><path d="M27 32 L30 38 L33 32" fill="none" stroke="${shade(coat, 0.8)}" stroke-width="1.6"/><path d="M26.4 63 L30 41 L33.6 63" fill="none" stroke="${shade(coat, 0.85)}" stroke-width="1.2"/><rect x="36" y="50" width="6" height="5" rx="1" fill="none" stroke="${shade(coat, 0.8)}" stroke-width="1.2"/>`;
    const apron = o.apron && !back ? `<path ${ink} fill="${o.apron}" d="M23 40 H37 L39 60 H21Z"/><path d="M25 40 L24 33 M35 40 L36 33" stroke="${o.apron}" stroke-width="2"/>` : "";
    const sleeve = coat || top;
    const arm = (x, c) => `<g class="arm ${c}"><rect ${ink} x="${x - 3.6}" y="33" width="7.2" height="20" rx="3.4" fill="${sleeve}"/><path d="M${x - 3.6} 47 H${x + 3.6}" stroke="${shade(sleeve, 0.78)}" stroke-width="1.4"/><circle cx="${x}" cy="55.5" r="3.1" fill="${skin}" stroke="${INK}" stroke-width="1.5"/></g>`;
    const arms = arm(13.4, "l") + arm(46.6, "r");
    const ears = back ? "" : `<circle cx="18.6" cy="22.5" r="2.6" fill="${skin}" stroke="${INK}" stroke-width="1.6"/><circle cx="41.4" cy="22.5" r="2.6" fill="${skin}" stroke="${INK}" stroke-width="1.6"/>`;
    const tails = o.pigtails ? [14, 46].map((x, i) => `<path ${ink} fill="${hair}" d="M${x} 18 C${x + (i ? 9 : -9)} 24 ${x + (i ? 8 : -8)} 38 ${x + (i ? 3 : -3)} 42 C${x + (i ? -3 : 3)} 38 ${x + (i ? -2 : 2)} 26 ${x + (i ? -2 : 2)} 20Z"/>`).join("") : "";
    const backHair = long && !o.pigtails ? `<path ${ink} fill="${hair}" d="M17 20 C15 8 45 8 43 20 L45 36 Q30 41 15 36Z"/>` : "";
    const head = `<circle cx="30" cy="22" r="12.5" fill="${skin}" stroke="${INK}" stroke-width="1.8"/>`;
    const face = back ? "" : `
      <ellipse cx="24.8" cy="23" rx="1.9" ry="2.5" fill="${INK}"/><ellipse cx="35.2" cy="23" rx="1.9" ry="2.5" fill="${INK}"/>
      <circle cx="24.2" cy="22" r=".8" fill="#fff"/><circle cx="34.6" cy="22" r=".8" fill="#fff"/>
      <path d="M21.6 18.8 Q24.8 17.2 28 18.6 M32 18.6 Q35.2 17.2 38.4 18.8" fill="none" stroke="${hairD}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M30 24.5 q1.2 2 0 3" fill="none" stroke="${skinD}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M27.4 29.4 Q30 31.2 32.6 29.4" fill="none" stroke="#a8453a" stroke-width="1.4" stroke-linecap="round"/>
      ${o.dress || o.pigtails ? `<circle cx="22.4" cy="27" r="2" fill="#ff8c9e" opacity=".5"/><circle cx="37.6" cy="27" r="2" fill="#ff8c9e" opacity=".5"/>` : ""}`;
    const specs = o.glasses && !back ? `<g fill="none" stroke="${INK}" stroke-width="1.5"><circle cx="24.8" cy="23" r="4.4"/><circle cx="35.2" cy="23" r="4.4"/><path d="M29.2 23 H30.8"/></g>` : "";
    let cap;
    if (hat) {
      cap = back
        ? `<path ${ink} fill="${hat}" d="M17.5 21 C16 4 44 4 42.5 21 Q30 25 17.5 21Z"/><path d="M19 17 Q30 12 41 17" fill="none" stroke="${hatD}" stroke-width="1.6"/><path d="M26 19 H34" stroke="${hatD}" stroke-width="3"/>`
        : `<path ${ink} fill="${hat}" d="M17.5 20 C16 4 44 4 42.5 20Z"/><path d="M17 19.5 Q30 15 43 19.5 Q44 24 30 25 Q16 24 17 19.5Z" fill="${hatD}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="6.4" r="1.8" fill="${hatD}" stroke="${INK}" stroke-width="1.2"/>${long ? "" : `<path d="M19 20 Q18 24 19.5 26 M41 20 Q42 24 40.5 26" fill="none" stroke="${hair}" stroke-width="2.4" stroke-linecap="round"/>`}`;
    } else if (back) {
      cap = `<path ${ink} fill="${hair}" d="M17.5 22 C15 5 45 5 42.5 22 Q42 31 30 33 Q18 31 17.5 22Z"/><path d="M22 14 Q30 9 38 14" fill="none" stroke="${hairL}" stroke-width="1.6" stroke-linecap="round"/>`;
    } else {
      cap = `<path ${ink} fill="${hair}" d="M17.4 21 C14 4 46 4 42.6 21 C41 14 36 12.5 31 13 C27 13 23 12.6 21 14.5 C19.6 15.6 18.4 18 17.4 21Z"/><path d="M23 9 Q30 5 37 9" fill="none" stroke="${hairL}" stroke-width="1.6" stroke-linecap="round"/><path d="M20 20 V25 M40 20 V25" stroke="${hair}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    const bun = o.bun ? `<circle ${ink} cx="30" cy="${hat ? 3.5 : 5}" r="5" fill="${hair}"/>` : "";
    return `${backHair}${lowerLegs}${feet}${arms}${bodice}${belt}${collar}${coatSvg}${apron}${tails}${ears}${head}${face}${specs}${cap}${bun}`;
  };

  // --- left-facing side view (right-facing is this mirrored)
  const side = () => {
    const skirt = o.dress;
    const legsSvg = skirt
      ? `<g ${ink}><path class="leg r" fill="${skin}" d="M29 62 H35 V69 H29Z"/><path class="leg l" fill="${skin}" d="M24 62 H30 V69 H24Z"/></g>`
      : `<g ${ink}><path class="leg r" fill="${legsD}" d="M28 50 H37 V68 H28Z"/><path class="leg l" fill="${legs}" d="M23 50 H32.5 V68 H23Z"/></g>`;
    const feet = `<g ${ink} fill="${shoes}"><path class="leg r" d="M27 66 H38 Q39 72 34 72 H27Z"/><path class="leg l" d="M17.5 69 Q17.5 66 22 66 H32.5 V72 H19.5 Q17.5 72 17.5 69Z"/></g>`;
    const bodice = skirt
      ? `<path ${ink} fill="${top}" d="M20 37 Q20 32 27 32 H34 Q40 32 40 38 L39 46 L44 64 H15 L21 46Z"/>`
      : `<path ${ink} fill="${top}" d="M20 37 Q20 32 27 32 H34 Q40 32 40 38 L39 54 H21Z"/><path d="M36.5 36 L36 53 H39 L40 38Z" fill="${topD}" opacity=".55"/>`;
    const belt = skirt ? "" : `<rect x="21" y="50.5" width="18" height="4" fill="#4a3424" stroke="${INK}" stroke-width="1.4"/>`;
    const apron = o.apron ? `<path ${ink} fill="${o.apron}" d="M20 40 H27 L28 60 H18Z"/>` : "";
    const arm = `<g class="arm l"><path ${ink} fill="${coat || top}" d="M26 35 Q22 37 23 46 L24 52 H32 L32.5 38Z"/><path d="M23.6 46 H32" stroke="${topD}" stroke-width="1.4"/><circle cx="28" cy="54.5" r="3.2" fill="${skin}" stroke="${INK}" stroke-width="1.8"/></g>`;
    const backHair = long ? `<path ${ink} fill="${hair}" d="M31 11 C45 8 46 24 44 34 Q38 38 32 34 L30 18Z"/>` : "";
    const tails = o.pigtails ? `<path ${ink} fill="${hair}" d="M38 14 C48 20 49 34 44 40 C38 36 38 26 36 20Z"/>` : "";
    const head = `<circle cx="29" cy="22" r="12.5" fill="${skin}" stroke="${INK}" stroke-width="2.2"/><circle cx="17.2" cy="25.6" r="2.4" fill="${skin}" stroke="${INK}" stroke-width="1.6"/><circle cx="33" cy="23" r="2.4" fill="${skinD}" stroke="${INK}" stroke-width="1.5"/>`;
    const face = `<ellipse cx="21.2" cy="23" rx="1.7" ry="2.5" fill="${INK}"/><circle cx="20.7" cy="22" r=".8" fill="#fff"/>
      <path d="M18.4 18.6 Q21.4 17 24.4 18.4" fill="none" stroke="${hairD}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M17.2 24.2 q-1.6 1.4 .3 2.6" fill="none" stroke="${skinD}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M20.4 29.4 Q22.4 30.8 24.4 29.6" fill="none" stroke="#a8453a" stroke-width="1.4" stroke-linecap="round"/>`;
    const specs = o.glasses ? `<g fill="none" stroke="${INK}" stroke-width="1.5"><circle cx="21.4" cy="23" r="4.3"/><path d="M25.7 23 H31"/></g>` : "";
    let cap;
    if (hat) cap = `<path ${ink} fill="${hat}" d="M16.5 20 C14 4 44 4 42 21 L33 22 Q28 18 16.5 20Z"/><path d="M12 22 Q22 15 32 20 L31 24 Q20 22 12 22Z" fill="${hatD}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="29" cy="6.4" r="1.8" fill="${hatD}" stroke="${INK}" stroke-width="1.2"/>`;
    else cap = `<path ${ink} fill="${hair}" d="M16.2 22 C13 4 45 4 42 22 C41 19 38 15.6 34 15 C29 14 24 14.4 21 16.4 C19 17.6 17.4 19.4 16.2 22Z"/><path d="M22 9 Q29 5 36 9" fill="none" stroke="${hairL}" stroke-width="1.6" stroke-linecap="round"/><path d="M37 16 Q40 24 38 31" fill="none" stroke="${hair}" stroke-width="3.4" stroke-linecap="round"/>`;
    const bun = o.bun ? `<circle ${ink} cx="36" cy="${hat ? 4 : 6}" r="5" fill="${hair}"/>` : "";
    const coatS = coat ? `<path ${ink} fill="${coat}" d="M20 37 Q20 32 27 32 H34 Q40 32 40 38 L42 63 H17 L21 46Z"/>` : "";
    return `${backHair}${legsSvg}${feet}${bodice}${belt}${coatS}${apron}${tails}${head}${face}${specs}${cap}${bun}${arm}`;
  };

  const figure = dir === 2 ? side() : dir === 3 ? `<g transform="translate(60 0) scale(-1 1)">${side()}</g>` : front(dir === 1);
  return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="74" rx="17" ry="4.6" fill="#000" opacity=".25"/>${figure}</svg>`;
};

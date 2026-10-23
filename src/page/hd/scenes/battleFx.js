// Per-move battle effects, in the spirit of Gold's move animations. Art.moveFx[anim](colour) returns SVG (viewBox 100 x 100) for the
// target's .fx box; parts with class "p" are animated by battleFx.css, staggered by their --i. MOVE_ANIMS lists how each anim plays.
(() => {
  const P = (i, inner, extra = "") => `<g class="p" style="--i:${i}" ${extra}>${inner}</g>`;
  const star = (c, r = 1) => `<path transform="scale(${r})" fill="${c}" stroke="#14213d" stroke-width="3" stroke-linejoin="round" d="M0 -40 L9 -12 L38 -16 L16 4 L30 34 L2 18 L-26 36 L-14 8 L-40 -10 L-9 -12Z"/>`;
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const flame = (c) => `<path fill="${c}" stroke="#7a1d0a" stroke-width="3" stroke-linejoin="round" d="M0 -16 C10 -6 10 4 0 12 C-10 4 -10 -6 0 -16Z"/><path fill="#fff3a8" d="M0 -4 C5 1 4 6 0 8 C-4 6 -5 1 0 -4Z"/>`;
  const leaf = (c) => `<path fill="${c}" stroke="#1f5a22" stroke-width="2.5" stroke-linejoin="round" d="M0 -12 C12 -6 12 6 0 12 C-12 6 -12 -6 0 -12Z"/><path d="M0 -10 V10" stroke="#1f5a22" stroke-width="2"/>`;
  const note = `<g fill="#fff" stroke="#14213d" stroke-width="2.5" stroke-linejoin="round"><ellipse cx="0" cy="8" rx="7" ry="5"/><path d="M6 8 V-14 L16 -8" fill="none" stroke-linecap="round"/></g>`;
  const at = (x, y, inner, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">${inner}</g>`;
  const slash = (x, y) => `<path d="M${x} ${y} l26 40" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M${x + 3} ${y - 2} l26 40" stroke="#14213d" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/>`;
  Art.moveFx = {
    tackle: (c) => P(0, at(50, 50, star("#fff", 1.1))),
    scratch: () => [20, 40, 60].map((x, i) => P(i, slash(x, 22))).join(""),
    quick: () => range(5).map((i) => P(i, `<path d="M${6 + (i % 2) * 14} ${22 + i * 14} h40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`)).join("") + P(3, at(60, 50, star("#fff", .7))),
    bite: () => P(0, `<path class="jaw u" fill="#fff" stroke="#14213d" stroke-width="3" stroke-linejoin="round" d="M12 8 L88 8 L88 30 L76 46 L66 30 L54 48 L44 30 L32 46 L22 30 L12 30Z"/>`) + P(0, `<path class="jaw d" fill="#fff" stroke="#14213d" stroke-width="3" stroke-linejoin="round" d="M12 92 L88 92 L88 70 L76 54 L66 70 L54 52 L44 70 L32 54 L22 70 L12 70Z"/>`),
    peck: () => P(0, at(36, 44, star("#fff", .5))) + P(2, at(64, 56, star("#fff", .5))),
    gust: () => range(3).map((i) => P(i, `<path d="M${14 + i * 4} ${30 + i * 18} C40 ${14 + i * 18} 60 ${46 + i * 18} 84 ${28 + i * 18}" stroke="#d6ecff" stroke-width="7" fill="none" stroke-linecap="round"/>`)).join(""),
    water: () => range(6).map((i) => P(i, at(18 + i * 13, 50 + (i % 2 ? 10 : -10), `<circle r="${8 - (i % 3)}" fill="#8fd2ff" stroke="#1e5fa8" stroke-width="3"/><circle cx="-2" cy="-3" r="2" fill="#fff"/>`), 'data-travel="1"')).join(""),
    flame: () => range(4).map((i) => P(i, at(20 + i * 20, 50 + (i % 2 ? 10 : -10), flame("#ff7a3c"), 90), 'data-travel="1"')).join("") + P(4, at(60, 50, star("#ffb03c", 1))),
    vine: () => P(0, `<path class="whip" d="M6 86 C30 90 40 20 90 24" stroke="#46a84a" stroke-width="9" fill="none" stroke-linecap="round"/><path class="whip" d="M6 86 C30 90 40 20 90 24" stroke="#1f5a22" stroke-width="3" fill="none" stroke-linecap="round"/>`) + P(3, at(86, 26, star("#9de06a", .7))),
    bolt: () => P(0, `<path fill="#ffe03c" stroke="#8a6a00" stroke-width="3" stroke-linejoin="round" d="M54 4 L24 54 H46 L36 96 L78 40 H54 L66 4Z"/>`) + P(2, `<path fill="#fff7a8" stroke="#8a6a00" stroke-width="3" stroke-linejoin="round" d="M80 14 L64 44 H76 L70 70 L92 36 H80Z"/>`),
    leaves: () => range(5).map((i) => P(i, at(14 + i * 16, 30 + (i % 3) * 18, leaf("#6fd35a"), 40 * i), 'data-travel="1"')).join(""),
    needles: () => range(4).map((i) => P(i, `<path d="M${10 + i * 6} ${24 + i * 16} h30" stroke="#d9a0ff" stroke-width="4" stroke-linecap="round"/><path d="M${40 + i * 6} ${24 + i * 16} l8 0" stroke="#b45ad9" stroke-width="7" stroke-linecap="round"/>`, 'data-travel="1"')).join(""),
    sound: () => range(3).map((i) => P(i, `<circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/>`)).join(""),
    song: () => range(3).map((i) => P(i, at(24 + i * 26, 70 - (i % 2) * 20, note))).join(""),
    glare: () => P(0, `<g fill="#fff" stroke="#14213d" stroke-width="3"><path d="M10 44 Q26 28 42 44 Q26 54 10 44Z"/><path d="M58 44 Q74 28 90 44 Q74 54 58 44Z"/></g><circle cx="26" cy="43" r="5" fill="#e0382c"/><circle cx="74" cy="43" r="5" fill="#e0382c"/>`),
    wag: () => P(0, `<path d="M20 70 Q50 30 80 70" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`),
    web: () => range(4).map((i) => P(i, `<path d="M10 ${20 + i * 20} Q50 ${6 + i * 20} 92 ${30 + i * 16}" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`)).join("") + P(3, `<g stroke="#fff" stroke-width="3" fill="none"><path d="M50 14 V86 M14 50 H86 M24 24 L76 76 M76 24 L24 76"/><circle cx="50" cy="50" r="14"/><circle cx="50" cy="50" r="28"/></g>`),
    dust: () => range(5).map((i) => P(i, at(18 + i * 15, 56 + (i % 2) * 14, `<circle r="${11 - (i % 3) * 2}" fill="#d9bf8a" opacity=".9"/>`), 'data-travel="1"')).join(""),
    mud: () => range(4).map((i) => P(i, at(22 + i * 18, 48 + (i % 2) * 14, `<ellipse rx="12" ry="9" fill="#7a5530" stroke="#3a2812" stroke-width="3"/>`), 'data-travel="1"')).join(""),
    shell: () => P(0, `<circle cx="50" cy="50" r="38" fill="#9fd0ff" fill-opacity=".35" stroke="#fff" stroke-width="6"/>`),
    grow: () => range(5).map((i) => P(i, at(16 + i * 17, 60, `<path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3Z" fill="#b8ff9a" stroke="#2f7a2a" stroke-width="2"/>`))).join(""),
  };
  // How an anim plays: contact = attacker lunges at the target, self = drawn on the user, travel handled by the data-travel parts.
  Art.moveFxHow = {
    tackle: { contact: 1 }, scratch: { contact: 1 }, quick: { contact: 1 }, bite: { contact: 1 }, peck: { contact: 1 },
    shell: { self: 1 }, grow: { self: 1 }, wag: { wiggle: 1 },
  };
})();

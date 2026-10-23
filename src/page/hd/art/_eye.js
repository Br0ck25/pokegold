// Shared eye: white sclera, coloured iris, ink pupil, two glints.
Art.eye = function (cx, cy, r, iris = "#e04a4a") {
  return `<g><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.12}" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="${cx + r * 0.08}" cy="${cy + r * 0.1}" rx="${r * 0.68}" ry="${r * 0.78}" fill="${iris}"/>
    <ellipse cx="${cx + r * 0.1}" cy="${cy + r * 0.12}" rx="${r * 0.36}" ry="${r * 0.42}" fill="${INK}"/>
    <circle cx="${cx - r * 0.22}" cy="${cy - r * 0.3}" r="${r * 0.22}" fill="#fff"/>
    <circle cx="${cx + r * 0.3}" cy="${cy + r * 0.28}" r="${r * 0.1}" fill="#fff"/></g>`;
};

// Violet Gym, 10 x 16 cells: a winding bird-wing floor over a pit. Walkable cells come from the map (Game.maps.violetgym.solid); every blocked cell
// below the top wall is drawn as pit, except the two bird statues at (3,13) and (6,13).
Art.violetGym = function () {
  const solid = Game.maps.violetgym.solid, o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  let floor = "", pits = "";
  solid.forEach((row, y) => [...row].forEach((c, x) => {
    if (y === 0 || (y === 15 && (x === 4 || x === 5)) || ((x === 3 || x === 6) && y === 13)) return;
    if (c === "#") pits += `<rect x="${x * 100}" y="${y * 100}" width="100" height="100" fill="#10153a"/>`;
    else floor += `<rect x="${x * 100 + 3}" y="${y * 100 + 3}" width="94" height="94" rx="8" fill="${(x + y) % 2 ? "#e9dcc0" : "#f4ead2"}"/>`;
  }));
  const statue = (x, y) => `<g ${o}><rect x="${x * 100 + 18}" y="${y * 100 + 60}" width="64" height="40" rx="6" fill="#9aa3b8"/><path d="M${x * 100 + 50} ${y * 100 + 6} l22 34 l-10 6 v18 h-24 v-18 l-10 -6z" fill="#c8d0e0"/></g>`;
  return `<svg class="room-svg" viewBox="-20 -20 1040 1640" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="1000" height="1600" rx="10" fill="#2a3470"/>
    <rect x="0" y="0" width="1000" height="100" fill="#3a46a0" ${o}/><g ${o}><path d="M420 14 l80 -4 l80 4 l-20 70 h-120z" fill="#ffc93c"/></g>${pits}${floor}${statue(3, 13)}${statue(6, 13)}
    <g ${o}><rect x="400" y="1500" width="200" height="100" rx="8" fill="#d63a4a"/></g><rect x="-6" y="-6" width="1012" height="1612" rx="12" fill="none" stroke="${INK}" stroke-width="12"/></svg>`;
};

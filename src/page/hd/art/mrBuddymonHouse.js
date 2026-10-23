// Mr. Buddymon's house, 8 x 8 cells: magazines (0..1,1), broken computer (6..7,1), table (4..5,3..4), strange coins (6..7,3), door (2..3,7).
Art.mrBuddymonHouse = function () {
  const f = Art.furniture, o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  const coins = [[630, 330], [690, 350], [740, 330], [660, 380], [720, 385]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="12" fill="#ffc93c" ${o} stroke-width="3"/>`).join("");
  return Art.shell(8, 8, "house") + f.window(300) + f.shelf(0, 40, 200, 160) + f.pc(600, 100) + f.pc(700, 100) +
    f.table(400, 300, 200, 200, "#8fd3ff") + `<rect x="610" y="300" width="170" height="110" rx="10" fill="#b8763a" ${o}/>` + coins +
    f.rug(300, 600, 200, 70) + f.mat(200, 700, 200) + Art.roomEnd;
};

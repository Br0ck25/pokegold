// Elm's lab, 10 x 12 cells: machine + counters (0..3,1..2), shelves (6..9,1), ball table (6..9,3), divider wall + shelves (rows 6-7), door (4..5,11).
Art.elmsLab = function () {
  const f = Art.furniture;
  return Art.shell(10, 12, "lab") + f.window(400) +
    f.counter(0, 110, 400, 90) + f.counter(0, 200, 200, 90) + f.machine(200, 56) +
    f.shelf(600, 40, 400, 160) + f.table(600, 290, 400, 110, "#b9c6e8", false) + f.trash(900, 290) +
    `<rect x="0" y="600" width="400" height="100" fill="#6fb3d4" stroke="${INK}" stroke-width="5"/><rect x="600" y="600" width="400" height="100" fill="#6fb3d4" stroke="${INK}" stroke-width="5"/>` +
    f.shelf(0, 620, 400, 180) + f.shelf(600, 620, 400, 180) + f.rug(500, 930, 300, 90) + f.mat(400, 1100, 200) + Art.roomEnd;
};

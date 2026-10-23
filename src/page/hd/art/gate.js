// Route gate house, 10 x 8 cells: doors north (4..5,0) and south (4..5,7), guard room at (0,4).
Art.gate = function () {
  const f = Art.furniture;
  return Art.shell(10, 8, "house") + f.window(100) + f.window(700) + f.mat(400, 0, 200) + f.rug(500, 400, 260, 90) +
    f.plant(0, 600) + f.plant(900, 600) + f.mat(400, 700, 200) + Art.roomEnd;
};

// The same gate house with its doors on the west and east walls (Route 31's Violet gate): mats at (0,4..5) and (9,4..5).
Art.gateEW = function () {
  const f = Art.furniture, side = (col) => `<g transform="translate(${col * 100 + 100} 400) rotate(90)">${f.mat(0, 0, 200)}</g>`;
  return Art.shell(10, 8, "house") + f.window(300) + f.window(600) + side(0) + side(9) + f.rug(300, 400, 400, 90) + f.plant(100, 600) + f.plant(800, 600) + Art.roomEnd;
};

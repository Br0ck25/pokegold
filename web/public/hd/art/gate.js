// Route gate house, 10 x 8 cells: doors north (4..5,0) and south (4..5,7), guard room at (0,4).
Art.gate = function () {
  const f = Art.furniture;
  return Art.shell(10, 8, "house") + f.window(100) + f.window(700) + f.mat(400, 0, 200) + f.rug(500, 400, 260, 90) +
    f.plant(0, 600) + f.plant(900, 600) + f.mat(400, 700, 200) + Art.roomEnd;
};

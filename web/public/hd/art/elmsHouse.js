// Elm's house, 8 x 8 cells: PC (0,1), TV (4,1), shelves (6..7,1), table (3..4,3..4), door (2..3,7).
Art.elmsHouse = function () {
  const f = Art.furniture;
  return Art.shell(8, 8, "house") + f.window(200) + f.pc(0, 120) + f.tv(400, 30) + f.plant(500, 110) + f.shelf(600, 40, 200, 160) +
    f.rug(400, 580, 220, 80) + f.table(300, 300, 200, 200) + f.mat(200, 700, 200) + Art.roomEnd;
};

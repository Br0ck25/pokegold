// The neighbor's house, 8 x 8 cells: shelves (0..1,1), TV (2,1), radio (7,1), table (3..4,3..4), plants (0,6) (7,6), door (2..3,7).
Art.neighborHouse = function () {
  const f = Art.furniture;
  return Art.shell(8, 8, "house") + f.window(500) + f.shelf(0, 40, 200, 160) + f.tv(200, 30) + f.radio(700, 100) +
    f.rug(400, 580, 220, 80) + f.table(300, 300, 200, 200, "#8fd3ff") + f.plant(0, 600) + f.plant(700, 600) + f.mat(200, 700, 200) + Art.roomEnd;
};

// Cherrygrove Mart, 12 x 8 cells: shelves (0..11,0..1), counter (0..2,4) with the clerk behind at (1,3), door (2..3,7).
Art.cherrygroveMart = function () {
  const f = Art.furniture;
  return Art.shell(12, 8, "house") + f.window(100) + f.shelf(300, 40, 900, 160) +
    f.counter(0, 400, 300, 90) + f.rug(700, 560, 260, 80) + f.mat(200, 700, 200) + Art.roomEnd;
};

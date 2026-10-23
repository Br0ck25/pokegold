// Pokecenter 1F, 10 x 8 cells: counter (0..5,2), healing machine (5,1), PC (9,1), sofas (7..8,5) (7..8,7), stairs (0,7), door (3..4,7).
Art.pokecenter = function () {
  const f = Art.furniture;
  return Art.shell(10, 8, "lab") + f.window(100) + f.window(700) + f.machine(450, 40) + f.pc(900, 100) +
    f.counter(0, 200, 600, 90) + f.table(700, 500, 200, 100, "#ff8fa3", false) + f.table(700, 700, 200, 100, "#ff8fa3", false) +
    f.mat(300, 700, 200) + Art.roomEnd;
};

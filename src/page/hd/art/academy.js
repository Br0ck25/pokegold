// Earl's Buddymon Academy, 8 x 16 cells: blackboard on the back wall, bookshelves (0..1,1), four rows of desks (rows 4, 6, 8, 10, x 2..5), door mat (3..4,15).
Art.academy = function () {
  const f = Art.furniture, o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  const board = `<g ${o}><rect x="260" y="10" width="280" height="76" rx="6" fill="#1f5a3a"/><path d="M290 36 H500 M290 62 H440" stroke="#e8f5e0" stroke-width="5" stroke-linecap="round"/></g>`;
  return Art.shell(8, 16, "house") + board + f.shelf(0, 100, 200, 100) + [4, 6, 8, 10].map((y) => f.table(200, y * 100, 400, 100, "#c98d4a")).join("") +
    f.plant(600, 1400) + f.plant(0, 1400) + f.mat(300, 1500, 200) + Art.roomEnd;
};

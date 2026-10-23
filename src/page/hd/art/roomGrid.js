// Generic room art drawn from Gold's own collision: Art.roomGrid(room) with room = { cols, rows, kinds, props, theme }.
// kinds[y][x] (from tools/goldmap.py): . floor, T wall or furniture, k counter, b bookshelf, m mart shelf, P PC, V TV, r radio, M town map, W window, H stairs, D door mat.
// Blocked 'T' cells joined to the outer wall are wall; other blocked clusters are furniture (table, bench, plant). props = [[x, y, scriptName|SPRITE]] name what
// stands on a blocked cell (PC, radio, stove, healing machine...). Because the picture is made from the collision, it can never disagree with it.
Art.roomGrid = function (room) {
  const { cols, rows, kinds } = room, f = Art.furniture, o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const at = (x, y) => (kinds[y] || "")[x] || "T";
  const blockedT = (x, y) => at(x, y) === "T";
  // wall = blocked T cells connected (8-way) to row 0 or the map edge
  const wall = new Set(), seen = new Set(), stack = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (blockedT(x, y) && (y === 0 || x === 0 || x === cols - 1 || y === rows - 1)) stack.push([x, y]);
  while (stack.length) {
    const [x, y] = stack.pop(), k = `${x},${y}`;
    if (x < 0 || y < 0 || x >= cols || y >= rows || seen.has(k) || !blockedT(x, y)) continue;
    seen.add(k); wall.add(k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) stack.push([x + dx, y + dy]);
  }
  let art = Art.shell(cols, rows, room.theme);
  for (const k of wall) { const [x, y] = k.split(",").map(Number); if (y > 0) art += `<rect x="${x * 100}" y="${y * 100}" width="100" height="100" rx="6" fill="#f2b872" ${o}/>`; }
  // furniture clusters among the remaining blocked T cells
  const left = new Set(), done = new Set();
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (blockedT(x, y) && !wall.has(`${x},${y}`)) left.add(`${x},${y}`);
  for (const k of left) {
    if (done.has(k)) continue;
    const cl = [], st = [k.split(",").map(Number)];
    while (st.length) { const [x, y] = st.pop(), kk = `${x},${y}`; if (done.has(kk) || !left.has(kk)) continue; done.add(kk); cl.push([x, y]); st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
    const x0 = Math.min(...cl.map((c) => c[0])), y0 = Math.min(...cl.map((c) => c[1])), w = Math.max(...cl.map((c) => c[0])) - x0 + 1, h = Math.max(...cl.map((c) => c[1])) - y0 + 1;
    if (cl.length === 1) art += f.plant(x0 * 100, y0 * 100);
    else if (w * h === cl.length) art += f.table(x0 * 100, y0 * 100, w * 100, h * 100, h >= 2 ? "#8fd3ff" : "#ff8fa3"); // a plain block
    else for (let y = y0; y < y0 + h; y++) { // an L or T shape: one table per row run, so nothing is drawn over walkable floor
      const xs = cl.filter((c) => c[1] === y).map((c) => c[0]).sort((a, b) => a - b);
      for (let i = 0; i < xs.length;) { let j = i; while (xs[j + 1] === xs[j] + 1) j++; art += f.table(xs[i] * 100, y * 100, (xs[j] - xs[i] + 1) * 100, 100, "#ff8fa3"); i = j + 1; }
    }
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const c = at(x, y), X = x * 100, Y = y * 100;
    if (c === "k") art += f.counter(X, Y, 100, 100);
    else if (c === "b") art += f.shelf(X, Y, 100, 100);
    else if (c === "m") art += f.shelf(X, Y, 100, 100).replace(/#b8763a/g, "#4fb6d9").replace(/#7a4a1e/g, "#2a6f8c");
    else if (c === "P") art += f.pc(X, Y);
    else if (c === "V") art += f.tv(X, Y);
    else if (c === "r") art += f.radio(X, Y);
    else if (c === "W") art += f.window(X);
    else if (c === "M") art += `<g ${o}><rect x="${X + 6}" y="${Y + 14}" width="88" height="70" rx="6" fill="#fff4d6"/><path d="M${X + 20} ${Y + 66} L${X + 40} ${Y + 34} L${X + 56} ${Y + 52} L${X + 70} ${Y + 40} L${X + 84} ${Y + 66}Z" fill="#46c26f"/></g>`;
    else if (c === "H") art += `<g ${o}><rect x="${X + 6}" y="${Y + 6}" width="88" height="94" rx="6" fill="#0c1a44"/><path d="M${X + 14} ${Y + 30} H${X + 86} M${X + 14} ${Y + 52} H${X + 86} M${X + 14} ${Y + 74} H${X + 86}" stroke="#6f86d6" stroke-width="5"/></g>`;
    else if (c === "D") art += f.mat(X, Y, 100);
  }
  // named things on blocked cells
  for (const [x, y, name] of room.props || []) {
    const X = x * 100, Y = y * 100, n = name.toLowerCase();
    if (at(x, y) !== "T") continue;
    if (/\bpc|^pc|pcscript|computer/.test(n) || n.includes("pc")) art += f.pc(X, Y);
    else if (n.includes("radio")) art += f.radio(X, Y);
    else if (n.includes("bookshelf")) art += f.shelf(X, Y, 100, 100);
    else if (n.includes("trash")) art += f.trash(X, Y);
    else if (n.includes("healingmachine")) art += f.machine(X, Y);
    else if (/stove|sink|fridge|kitchen/.test(n)) art += `<g ${o}><rect x="${X + 4}" y="${Y + 8}" width="92" height="88" rx="8" fill="${n.includes("fridge") ? "#e9eef8" : n.includes("sink") ? "#cfd9ea" : "#9aa4c8"}"/></g>`;
    else if (n.includes("window")) art += f.window(X);
    else if (n.includes("statue")) art += `<g ${o}><rect x="${X + 18}" y="${Y + 60}" width="64" height="40" rx="6" fill="#9aa3b8"/><path d="M${X + 50} ${Y + 6} l22 34 l-10 6 v18 h-24 v-18 l-10 -6z" fill="#c8d0e0"/></g>`;
  }
  return art + Art.roomEnd;
};

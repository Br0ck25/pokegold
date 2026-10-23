#!/usr/bin/env node
// Every map must be walkable end to end: from where you arrive, you can reach every door, every sign (from a free neighbouring cell)
// and every person you can talk to. Catches signs or furniture that block a door. Usage: node test/reach.js [baseUrl]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  await page.goto(base);
  const problems = await page.evaluate(() => {
    const out = [], D = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    for (const [key, m] of Object.entries(Game.maps)) {
      const w = m.solid[0].length, h = m.solid.length;
      const free = (x, y) => y >= 0 && y < h && x >= 0 && x < w && m.solid[y][x] !== "#"; // people can be asked to move, furniture and signs cannot
      const starts = [];
      if (key === "bedroom") starts.push([3, 3]);
      for (const o of Object.values(Game.maps)) for (const wp of o.warps || []) if (wp.to === key) starts.push([wp.tx, wp.ty]);
      const seen = new Set(starts.map(([x, y]) => `${x},${y}`)), q = [...starts];
      const cells = m.world && m.world.cells, HOP = { v: [[0, 1]], ">": [[1, 0]], "<": [[-1, 0]], R: [[0, 1], [1, 0]], L: [[0, 1], [-1, 0]] }; // Gold's ledges: jump two cells
      while (q.length) {
        const [x, y] = q.shift();
        const next = D.map(([dx, dy]) => [x + dx, y + dy]).concat(cells ? (HOP[cells[y][x]] || []).map(([dx, dy]) => [x + 2 * dx, y + 2 * dy]) : []);
        for (const [nx, ny] of next) if (!seen.has(`${nx},${ny}`) && free(nx, ny)) { seen.add(`${nx},${ny}`); q.push([nx, ny]); }
      }
      // you can also talk across a counter (kind k): stand two cells away with a counter between
      const across = (x, y) => D.some(([dx, dy]) => (m.kinds || [])[y + dy]?.[x + dx] === "k" && seen.has(`${x + 2 * dx},${y + 2 * dy}`));
      const near = (x, y) => D.some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`)) || across(x, y);
      for (const wp of m.warps || []) if (!seen.has(`${wp.x},${wp.y}`)) out.push(`${key}: door/exit at (${wp.x},${wp.y}) cannot be reached`);
      for (const sg of m.signs || []) if (!sg.needs && !near(sg.x, sg.y)) out.push(`${key}: sign at (${sg.x},${sg.y}) cannot be reached`);
      for (const n of m.npcs || []) if (!n.hideIf && !n.surf && n.faces !== false && !near(n.x, n.y)) out.push(`${key}: ${n.name} at (${n.x},${n.y}) cannot be reached`);
    }
    return out;
  });
  // Every warp leads somewhere real: the target map exists and you arrive on a walkable cell.
  const warps = await page.evaluate(() => {
    const out = [];
    for (const [key, m] of Object.entries(Game.maps)) for (const wp of m.warps || []) {
      const t = Game.maps[wp.to];
      if (!t) { out.push(`${key}: warp at (${wp.x},${wp.y}) goes to missing map ${wp.to}`); continue; }
      if (!t.solid[wp.ty] || t.solid[wp.ty][wp.tx] !== ".") out.push(`${key}: warp (${wp.x},${wp.y}) -> ${wp.to} (${wp.tx},${wp.ty}) arrives inside a wall`);
    }
    return out;
  });
  problems.push(...warps);
  for (const p of problems) console.error("FAIL:", p);
  console.log(problems.length ? "FAILED" : "OK");
  process.exitCode = problems.length ? 1 : 0;
  await browser.close();
})();

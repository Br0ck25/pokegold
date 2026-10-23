// Shared test helper: goTo(x, y) walks the hero to a cell by holding keys, with Gold's ledge jumps in the path search.
// makeGoTo(page, between) -> async (tx, ty); `between` (optional async fn) runs before each step (e.g. to click through text).
exports.makeGoTo = (page, between = async () => {}) => async (tx, ty) => {
  const names = ["DOWN", "UP", "LEFT", "RIGHT"];
  for (let i = 0; i < 400; i++) {
    await between();
    const d = await page.evaluate(([tx, ty]) => {
      const m = Game.maps[Game.state.map.key], k = (x, y) => `${x},${y}`, cells = m.world ? m.world.cells : null;
      if (Game.script || (Game.state.x === tx && Game.state.y === ty)) return -1;
      const free = (x, y) => y >= 0 && y < m.solid.length && x >= 0 && x < m.solid[0].length && m.solid[y][x] !== "#" && !Game.state.objects.some((o) => o.x === x && o.y === y);
      const HOP = { v: [0], ">": [3], "<": [2], R: [0, 3], L: [0, 2] }, DX = [0, 0, -1, 1], DY = [1, -1, 0, 0];
      const from = new Map([[k(Game.state.x, Game.state.y), null]]), q = [[Game.state.x, Game.state.y]];
      while (q.length) {
        const [x, y] = q.shift();
        if (x === tx && y === ty) break;
        for (let d = 0; d < 4; d++) {
          const nx = x + DX[d], ny = y + DY[d];
          if (free(nx, ny) && !from.has(k(nx, ny))) { from.set(k(nx, ny), [x, y, d]); q.push([nx, ny]); }
          const hop = cells && HOP[cells[y][x]];
          if (hop && hop.includes(d)) { const jx = x + 2 * DX[d], jy = y + 2 * DY[d]; if (free(jx, jy) && !from.has(k(jx, jy))) { from.set(k(jx, jy), [x, y, d]); q.push([jx, jy]); } }
        }
      }
      let first = -2;
      for (let at = from.get(k(tx, ty)); at; at = from.get(k(at[0], at[1]))) first = at[2];
      return first;
    }, [tx, ty]);
    if (d === -1) return;
    if (d === -2) { await page.waitForTimeout(300); continue; } // blocked for now (someone is in the way)
    const before = await page.evaluate(() => [Game.state.map.key, Game.state.x, Game.state.y].join());
    await page.evaluate((key) => setKey(key, true), names[d]);
    await page.waitForFunction((b) => [Game.state.map.key, Game.state.x, Game.state.y].join() !== b || Game.script, before, { timeout: 1500 }).catch(() => {});
    await page.evaluate((key) => setKey(key, false), names[d]);
    await page.waitForTimeout(300);
  }
};

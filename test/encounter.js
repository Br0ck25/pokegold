#!/usr/bin/env node
// Gold's wild encounter rules: a 5-step cooldown after entering a map (the first 4 steps never roll), then 10% per grass step on Route 29.
// With Math.random pinned to 0 every roll succeeds, so the first allowed step must be the 5th. Usage: node test/encounter.js [baseUrl]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let failed = false;
  const fail = (m, g) => { console.error("FAIL:", m, g === undefined ? "" : JSON.stringify(g)); failed = true; };
  page.on("pageerror", (e) => fail("pageerror " + e.message));
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "route29", x: 54, y: 9, dir: 2,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: {}, party: [makeMon("bandit", 30)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");

  // Find a floor cell on Route 29 followed by five grass cells in a straight line, enter the map there and walk along it with every roll succeeding.
  const run = await page.evaluate(() => {
    const c = Game.maps.route29.world.cells, W = c[0].length, H = c.length, D = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (".p".includes(c[y][x])) D.forEach(([dx, dy], d) => {
      if (window.__run) return;
      if ([1, 2, 3, 4, 5].every((k) => (c[y + dy * k] || "")[x + dx * k] === "g")) window.__run = { x, y, d, end: [x + dx * 5, y + dy * 5] };
    });
    return window.__run;
  });
  if (!run) fail("Route 29 has a straight run of five grass cells after a floor cell");
  await page.evaluate((r) => { Math.random = () => 0; Game.warp("route29", r.x, r.y, r.d); }, run);
  await page.waitForTimeout(300);
  const key = ["DOWN", "UP", "LEFT", "RIGHT"][run.d];
  await page.evaluate((k) => setKey(k, true), key);
  await page.waitForFunction(() => Game.state.screen === "battle", null, { timeout: 8000 }).catch(() => fail("an encounter should happen once the cooldown ends"));
  await page.evaluate((k) => setKey(k, false), key);
  const at = await page.evaluate(() => [Game.state.x, Game.state.y]);
  if (at.join() !== run.end.join()) fail("the first encounter comes on the 5th step after entering the map", [at, run.end]);
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

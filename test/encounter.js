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

  // Route 29's grass corridor starts at (40,10), one cell wide. Enter the map just east of it and walk west with every roll succeeding.
  await page.evaluate(() => { Math.random = () => 0; Game.warp("route29", 41, 10, 2); });
  await page.waitForTimeout(300);
  await page.evaluate(() => setKey("LEFT", true));
  await page.waitForFunction(() => Game.state.screen === "battle", null, { timeout: 8000 }).catch(() => fail("an encounter should happen once the cooldown ends"));
  await page.evaluate(() => setKey("LEFT", false));
  const x = await page.evaluate(() => Game.state.x);
  if (x !== 36) fail("the first encounter comes on the 5th step after entering the map (x 41 -> 36)", x);
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

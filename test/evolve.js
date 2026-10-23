#!/usr/bin/env node
// Evolution: a level-up in battle at the evolve level changes the species after the battle (stats, nickname, BUDDYDEX); B stops it.
// Usage: node test/evolve.js [baseUrl]   (dev server must be running)
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
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5 }, party: [makeMon("bramblet", 15)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");
  await page.evaluate(() => { Game.msgMs = 60; });

  // Every evolve target exists and no species evolves into itself.
  const bad = await page.evaluate(() => Object.entries(SPECIES).filter(([k, v]) => v.evolve && (!SPECIES[v.evolve.to] || v.evolve.to === k)).map(([k]) => k));
  if (bad.length) fail("evolve targets must be real species", bad);

  // B stops it.
  await page.evaluate(() => { const m = makeMon("bramblet", 16); Game.player.party = [m]; Game.run(async (s) => { window.__r = await Game.evolve(s, m); }); });
  await page.waitForTimeout(300); await page.evaluate(() => setKey("B", true)); await page.waitForTimeout(200); await page.evaluate(() => setKey("B", false));
  await page.waitForFunction(() => window.__r !== undefined, null, { timeout: 8000 });
  if ((await page.evaluate(() => [window.__r, Game.player.party[0].species])).join() !== "false,bramblet") fail("B stops the evolution");

  // A level-up in a won battle evolves it afterwards.
  await page.evaluate(() => {
    window.__r = undefined;
    const m = makeMon("bramblet", 15); m.exp = growthExp("slow", 16) - 1; m.nick = "BRAMBLET";
    window.__hp = m.hp; Game.player.party = [m];
    Game.run(async (s) => { await Game.battle(s, makeMon("nibblet", 3)); window.__r = "done"; });
  });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  await page.evaluate(async () => { for (let i = 0; i < 60 && window.__r === undefined; i++) { if (Game.state.battle) Game.pick(0); await new Promise((r) => setTimeout(r, 250)); } });
  await page.waitForFunction(() => window.__r === "done", null, { timeout: 30000 });
  const m = await page.evaluate(() => ({ ...Game.player.party[0], dex: Game.player.dex.brambleaf, max: statsFor(Game.player.party[0]).hp }));
  if (m.species !== "brambleaf" || m.nick !== "BRAMBLEAF") fail("a level-up at 16 evolves BRAMBLET into BRAMBLEAF", [m.species, m.nick, m.level]);
  if (m.dex !== "caught") fail("the new form is registered in the BUDDYDEX", m.dex);
  if (!(m.hp > 0 && m.hp <= m.max)) fail("HP stays valid after evolving", [m.hp, m.max]);
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

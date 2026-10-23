#!/usr/bin/env node
// The PC: deposit/withdraw through the real menus, Gold's last-buddymon rule, old saves' `box` moving into BOX 1, and a full box.
// Usage: node test/pc.js [baseUrl]   (dev server must be running)
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
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "cgcenter", x: 8, y: 2, dir: 0,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: {}, party: [makeMon("bandit", 8)], box: [makeMon("nibblet", 3)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "cgcenter");
  // Messages are recorded instead of waited on (a key press per line would make the test racy); menus and panels are driven for real.
  const said = () => page.evaluate(() => window.__said.slice());
  const pick = async (i) => { await page.evaluate((n) => Game.pick(n), i); await page.waitForTimeout(300); };
  const counts = () => page.evaluate(() => ({ party: Game.player.party.map((m) => m.species), box: Game.player.boxes.map((b) => b.length) }));

  let c = await counts();
  if (c.box[0] !== 1 || c.party.length !== 1) fail("an old save's box moves into BOX 1", c);
  await page.evaluate(() => { window.__said = []; Game.run(async (s) => { s.say = async (t) => { window.__said.push(t); }; await Game.pc(s); window.__done = true; }); });
  await page.waitForTimeout(400);
  await pick(1); await pick(0); await pick(0); // DEPOSIT, first buddymon, DEPOSIT
  if (!(await said()).some((t) => /last BUDDYMON/.test(t))) fail("Gold: you cannot deposit your last buddymon", await said());
  await pick(-1);
  await pick(0); await pick(0); await pick(0); // WITHDRAW, the nibblet, WITHDRAW
  c = await counts();
  if (c.party.join() !== "bandit,nibblet" || c.box[0] !== 0) fail("withdraw moves the buddymon into the party", c);
  if (!(await said()).some((t) => /Got NIBBLET/.test(t))) fail("withdrawing says Got");
  await pick(1); await pick(1); await pick(0); // DEPOSIT, second (nibblet), DEPOSIT
  c = await counts();
  if (c.party.join() !== "bandit" || c.box[0] !== 1) fail("deposit moves the buddymon into the box", c);
  if (!(await said()).some((t) => /Stored NIBBLET/.test(t))) fail("depositing says Stored");
  await pick(-1); await pick(3); // back, SEE YA!
  await page.waitForFunction(() => window.__done, null, { timeout: 5000 }).catch(() => fail("SEE YA closes the PC"));

  // A full box refuses nets (Gold's BallBoxFullText) and deposits.
  const full = await page.evaluate(() => { const P = Game.player; P.boxes[P.curBox] = Array.from({ length: 20 }, () => makeMon("nibblet", 3)); P.party = Array.from({ length: 6 }, () => makeMon("bandit", 8)); return Game.boxFull(P) && Game.boxAdd(P, makeMon("nibblet", 3)) === null; });
  if (!full) fail("a full box refuses another buddymon");
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

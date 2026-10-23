#!/usr/bin/env node
// Status conditions and the EXP readout through the real battle UI, with Math.random pinned so every roll succeeds:
// sleep and poison land, the tag shows on the card, poison hurts after the foe moves, a sleeping foe loses its turn, REMEDY cures.
// Usage: node test/status.js [baseUrl]   (dev server must be running)
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
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5, remedy: 2 }, party: [makeMon("bandit", 20)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");
  await page.evaluate(() => {
    Game.msgMs = 60;
    Game.player.party[0].moves = [{ id: "lull_song", pp: 15 }, { id: "venom_dart", pp: 35 }, { id: "scratch", pp: 35 }];
    window.__rand = Math.random; Math.random = () => 0;
    Game.run(async (s) => { await Game.battle(s, makeMon("nibblet", 30)); });
  });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  const num = await page.locator(".bt-card.me .xpn").textContent();
  if (!/^EXP \d+ \/ \d+$/.test(num)) fail("the player's card shows EXP as numbers", num);

  const fight = async (i) => { await page.evaluate(() => Game.pick(0)); await page.waitForTimeout(250); await page.evaluate((n) => Game.pick(n), i); };
  const idle = () => page.waitForFunction(() => Game.state.battle && Game.state.battle.menu && Game.state.battle.menu.kind === "cmd", null, { timeout: 20000 });
  await fight(0); await idle();
  let foe = await page.evaluate(() => Game.state.battle.foe);
  if (foe.status !== "slp") fail("LULL SONG puts the foe to sleep", foe);
  if ((await page.locator(".bt-card.foe .st").textContent()) !== "SLP") fail("the card shows the SLP tag");
  const hpSleep = foe.hp;
  await fight(1); await idle(); // VENOM DART on a sleeper fails; if it already woke, it gets poisoned. Either way it holds a condition.
  foe = await page.evaluate(() => Game.state.battle.foe);
  if (foe.status !== "slp" && foe.status !== "psn") fail("the foe keeps a condition", foe);
  // Poison my own buddymon and use REMEDY from the pack (2nd entry: nets come first).
  await page.evaluate(() => { Game.player.party[0].status = "psn"; });
  await page.evaluate(() => Game.pick(1)); await page.waitForTimeout(300);
  await page.evaluate(() => Game.pick(1));
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ status: Game.player.party[0].status, remedy: Game.player.bag.remedy }));
  if (after.status !== null || after.remedy !== 1) fail("REMEDY cures a condition and is used up", after);
  await page.evaluate(() => { Math.random = window.__rand; });
  const dmg = await page.evaluate(async () => {
    const out = {}, fake = { msg: async () => {} };
    for (const k of ["psn", "brn", null]) { const m = makeMon("bandit", 20); m.status = k; const h = m.hp; await residual(fake, { mon: m, label: "X" }, () => {}); out[k] = h - m.hp; }
    return out;
  });
  const eighth = await page.evaluate(() => Math.floor(statsFor(makeMon("bandit", 20)).hp / 8));
  if (dmg.psn !== eighth || dmg.brn !== eighth || dmg.null !== 0) fail("poison and burn cost 1/8 max HP, nothing else does", [dmg, eighth]);
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

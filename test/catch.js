#!/usr/bin/env node
// Catching and the move menu: a caught buddymon keeps the HP it had when caught, and the FIGHT menu starts on the move you used last.
// Usage: node test/catch.js [baseUrl]   (dev server must be running)
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let failed = false;
  const fail = (m, g) => { console.error("FAIL:", m, g === undefined ? "" : JSON.stringify(g)); failed = true; };
  page.on("pageerror", (e) => fail("pageerror " + e.message));
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "route29", x: 54, y: 9, dir: 2,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5 }, party: [makeMon("bandit", 20)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");

  // the pad: Select and Start never sit on the D-pad
  const pad = await page.evaluate(() => { const r = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.x, y: b.y, r: b.right, b: b.bottom }; }; return { d: r("#dpad"), s: r("[data-key=SELECT]"), t: r("[data-key=START]") }; });
  for (const k of ["s", "t"]) if (pad[k].x < pad.d.r && pad.d.x < pad[k].r && pad[k].y < pad.d.b && pad.d.y < pad[k].b) fail(`${k === "s" ? "Select" : "Start"} overlaps the D-pad`, pad);

  // 1. the FIGHT cursor remembers the last move
  await page.evaluate(() => {
    Game.msgMs = 40; window.__r = Math.random;
    Game.player.party[0].moves = [{ id: "tackle", pp: 35 }, { id: "scratch", pp: 35 }, { id: "growl", pp: 40 }];
    Game.run(async (s) => { window.__result = await Game.battle(s, makeMon("nibblet", 30)); });
  });
  const menu = () => page.evaluate(() => { const m = Game.state.battle && Game.state.battle.menu; return m ? { kind: m.kind, sel: m.items.findIndex((i) => i.sel) } : null; });
  const waitMenu = (kind) => page.waitForFunction((k) => { const m = Game.state.battle && Game.state.battle.menu; return m && m.kind === k; }, kind, { timeout: 20000 }).catch(async (e) => { console.error("stuck waiting for", kind, await page.evaluate(() => JSON.stringify({ menu: Game.state.battle && Game.state.battle.menu, d: Game.state.dialogue, boxes: Game.state.boxes.length, hp: Game.player.party.map((m) => m.hp) }))); throw e; });
  await waitMenu("cmd");
  const balls = await page.evaluate(() => ({ total: document.querySelectorAll("#hd .bt-card.me .balls i").length, ok: document.querySelectorAll("#hd .bt-card.me .balls i.ok").length, pc: Game.state.battle.pc }));
  if (balls.total !== 6 || balls.ok !== 1 || balls.pc) fail("the card shows six party balls (one full) and you have been sent out", balls);
  await page.waitForTimeout(300);
  await page.evaluate(() => Game.pick(0)); await waitMenu("moves");
  if ((await menu()).sel !== 0) fail("the first FIGHT menu starts on the first move", await menu());
  await page.evaluate(() => Game.pick(2)); // GROWL: harmless, keeps the foe alive
  await waitMenu("cmd"); await page.waitForTimeout(300);
  await page.evaluate(() => Game.pick(0)); await waitMenu("moves");
  const second = await menu();
  if (second.sel !== 2) fail("the FIGHT menu starts on the move used last", second);
  await page.evaluate(() => Game.pick(-1)); await waitMenu("cmd");
  await page.evaluate(() => Game.pick(3)); // RUN
  await page.waitForFunction(() => window.__result !== undefined, null, { timeout: 20000 });

  // 2. a caught buddymon keeps its HP
  await page.evaluate(() => {
    for (const m of Game.player.party) healMon(m);
    window.__result = undefined; Math.random = () => 0; // every roll succeeds
    const foe = makeMon("nibblet", 5); foe.hp = 3; window.__foeMax = statsFor(foe).hp;
    Game.run(async (s) => { window.__result = await Game.battle(s, foe); });
  });
  await waitMenu("cmd");
  await page.evaluate(() => Game.pick(1)); await waitMenu("pack");
  await page.evaluate(() => Game.pick(0));
  await page.waitForFunction(() => Game.state.boxes.length || window.__result !== undefined, null, { timeout: 20000 });
  if (await page.evaluate(() => window.__result === undefined)) await page.evaluate(() => Game.pick(1)); // no nickname
  await page.waitForFunction(() => window.__result !== undefined, null, { timeout: 20000 });
  const got = await page.evaluate(() => ({ result: window.__result, party: Game.player.party.map((m) => [m.species, m.hp]), max: window.__foeMax }));
  if (got.result !== "caught" || got.party.length !== 2 || got.party[1][1] !== 3) fail("the caught buddymon keeps the 3 HP it had", got);
  await browser.close();
  if (failed) process.exit(1);
  console.log("catch: ok");
})().catch((e) => { console.error(e); process.exit(1); });

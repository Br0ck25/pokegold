#!/usr/bin/env node
// Route 31 / Violet City content: walking poison, Falkner's gym (badge + TM31), TM, RARE CANDY and PP UP use, and the Route 30 -> 31 -> gate -> Violet chain.
// Usage: node test/violet.js [baseUrl]   (dev server must be running)
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
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "violetgym", x: 4, y: 14, dir: 1,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { rare_candy: 1, pp_up: 1, tm31: 0 }, party: [makeMon("gatormaw", 60)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "violetgym");
  await page.evaluate(() => { Game.msgMs = 40; });

  // Walking poison: 1 HP every 4 steps.
  const poison = await page.evaluate(async () => {
    const P = Game.player, m = P.party[0]; m.status = "psn"; m.hp = 10; P.steps = 0;
    const out = [];
    for (let i = 0; i < 3; i++) Game.poisonStep();
    out.push(m.hp);
    Game.poisonStep(); out.push(m.hp);
    return out;
  });
  if (poison[0] !== 10 || poison[1] !== 9) fail("poison costs 1 HP every 4 steps", poison);
  await page.evaluate(() => { const m = Game.player.party[0]; m.hp = statsFor(m).hp; m.status = null; });

  // Falkner: win (the engine battle picks FIGHT every turn) and get the badge and TM31.
  await page.evaluate(() => {
    window.__said = []; window.__done = false;
    Game.player.party[0].moves = [{ id: "sharp_fang", pp: 15 }];
    Game.run(async (s) => { s.say = async (t) => { window.__said.push(t); }; await Game.maps.violetgym.npcs[0].script(s); window.__done = true; });
  });
  await page.evaluate(async () => { for (let i = 0; i < 120 && !window.__done; i++) { if (Game.state.battle && Game.state.battle.menu) { Game.pick(0); await new Promise((r) => setTimeout(r, 120)); Game.pick(0); } await new Promise((r) => setTimeout(r, 200)); } });
  const g = await page.evaluate(() => ({ done: window.__done, badges: Game.player.badges, tm: Game.player.bag.tm31, flag: Game.player.flags.BEAT_FALKNER }));
  if (!g.done || !g.flag || (g.badges || []).join() !== "ZEPHYRBADGE" || g.tm !== 1) fail("beating Falkner gives the ZEPHYRBADGE and TM31", g);

  await page.waitForFunction(() => !Game.script, null, { timeout: 8000 });
  // TM, RARE CANDY, PP UP through Game.useOn.
  const use = await page.evaluate(async () => { try {
    const P = Game.player, m = P.party[0], out = {};
    const run = async (fn) => { const r = await new Promise((resolve) => { setTimeout(() => resolve("TIMEOUT"), 4000); Game.run(async (s) => { s.say = async () => {}; s.choose = async () => 0; await fn(s); resolve("ok"); }); }); await new Promise((r) => setTimeout(r, 50)); return r; }; // let G.script clear before the next run
    P.bag.tm31 = 1; await run((s) => Game.useOn(s, "tm31", m)); out.tm = m.moves.some((x) => x.id === "mud_slap") && !P.bag.tm31;
    const lv = m.level; await run((s) => Game.useOn(s, "rare_candy", m)); out.candy = m.level === lv + 1 && !P.bag.rare_candy;
    const max0 = maxPP(m.moves[0]); await run((s) => Game.useOn(s, "pp_up", m)); out.ppup = maxPP(m.moves[0]) > max0 && !P.bag.pp_up;
    return out; } catch (e) { return { err: String(e && e.stack || e) }; }
  });
  if (!use.tm) fail("a TM teaches its move and is used up", use);
  if (!use.candy) fail("RARE CANDY adds a level", use);
  if (!use.ppup) fail("PP UP raises max PP", use);

  // The road: Route 30 north -> Route 31 -> gate -> Violet City and back.
  const chain = await page.evaluate(() => {
    const hop = (from, to) => (Game.maps[from].warps || []).some((w) => w.to === to);
    return [hop("route30", "route31"), hop("route31", "route30"), hop("route31", "gate31"), hop("gate31", "route31"), hop("gate31", "violet"), hop("violet", "gate31"), hop("violet", "violetgym"), hop("violetgym", "violet"), hop("violet", "vcenter"), hop("violet", "vmart"), hop("violet", "academy")];
  });
  if (!chain.every(Boolean)) fail("Route 30, Route 31, the gate and Violet City connect both ways", chain);
  // Poison can faint you: at 1 HP the fourth step shows the faint message (and a lone buddymon means a blackout).
  await page.evaluate(() => { const m = Game.player.party[0]; m.status = "psn"; m.hp = 1; Game.player.steps = 3; Game.poisonStep(); });
  await page.waitForFunction(() => Game.state.dialogue && /fainted/.test(Game.state.dialogue.text), null, { timeout: 5000 }).catch(() => fail("poison can faint a buddymon"));
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

#!/usr/bin/env node
// Layout rules, checked on real geometry: (1) nothing on the battle screen overlaps (sprites, platforms, cards, menu, message box) at
// phone size; (2) every outdoor exit is a visible dirt path; (3) Route 29 forces the grass west-bound and lets the ledge skip it east-bound.
// Usage: node test/layout.js [baseUrl]   (dev server must be running)
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

  // 2 + 3: pure map data.
  const maps = await page.evaluate(() => {
    const out = { exits: [], grass: null };
    // Every road that leaves a map (a connected edge in Gold) is a visible dirt road.
    for (const t of Object.values(Game.terrain)) for (const e of t.exits || []) if (Game.maps[t.key].world.cells[e.y][e.x] !== "p") out.exits.push(`${t.key}: exit at (${e.x},${e.y}) is not a dirt road`);
    const m = Game.maps.route29, cells = m.world.cells, w = cells[0].length, h = cells.length;
    const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? cells[y][x] : "T");
    // Gold's rules: ledge cells are walkable, and pressing their direction jumps two cells over the cliff beyond. avoidGrass = never step on 'g'.
    const HOP = { v: [[0, 1]], ">": [[1, 0]], "<": [[-1, 0]], R: [[0, 1], [1, 0]], L: [[0, 1], [-1, 0]] };
    const reach = (from, to, avoidGrass) => {
      const ok = (x, y) => ".pvR<>L".includes(at(x, y)) || (!avoidGrass && at(x, y) === "g");
      const seen = new Set([from.join()]), q = [from];
      while (q.length) {
        const [x, y] = q.shift();
        if (x === to[0] && y === to[1]) return true;
        const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).concat((HOP[at(x, y)] || []).map(([dx, dy]) => [x + 2 * dx, y + 2 * dy]));
        for (const [nx, ny] of next) if (ok(nx, ny) && !seen.has(nx + "," + ny)) { seen.add(nx + "," + ny); q.push([nx, ny]); }
      }
      return false;
    };
    // New Bark end (east edge, row 8) and Cherrygrove end (west edge, row 6)
    out.grass = { westNoGrass: reach([58, 8], [1, 6], true), westAny: reach([58, 8], [1, 6], false), eastNoGrass: reach([1, 6], [58, 8], true) };
    return out;
  });
  maps.exits.forEach((e) => fail(e));
  if (!maps.grass.westAny) fail("Route 29 is not walkable west-bound", maps.grass);
  if (maps.grass.westNoGrass) fail("Route 29 west-bound must cross tall grass", maps.grass);
  if (!maps.grass.eastNoGrass) fail("Route 29 east-bound must be possible without grass (ledge shortcut)", maps.grass);

  // 1: battle screen geometry (the shell hides behind the start screen, so enter the game with a quick save).
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "route29", x: 54, y: 9, dir: 2,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5 }, party: [makeMon("bandit", 5)] } })));
  await page.reload();
  await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");
  await page.evaluate(() => { Game.msgMs = 80; Game.run(async (s) => { await Game.battle(s, makeMon("peekat", 2)); }); });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  await page.waitForTimeout(900);
  // Overlap check at several phone heights (browser bars make the game area much shorter than the screen), with a tall foe and a long name.
  for (const h of [924, 800, 780, 760]) {
    await page.setViewportSize({ width: 412, height: h });
    await page.waitForTimeout(500);
    const boxes = await page.evaluate(() => {
      const r = (sel) => { const e = document.querySelector(sel); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
      return { foeMon: r(".bt-side.foe .mon"), foePlat: r(".bt-side.foe .plat"), meMon: r(".bt-side.me .mon"), mePlat: r(".bt-side.me .plat"),
        foeCard: r(".bt-card.foe"), meCard: r(".bt-card.me"), menu: r(".bt-menu"), dlg: r(".dlg, .dialogue") };
    });
    const names = Object.keys(boxes).filter((k) => boxes[k]);
    const hit = (a, b) => a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1;
    // A platform belongs to its mon (they overlap on purpose); nothing else may touch.
    const own = new Set(["foeMon,foePlat", "meMon,mePlat"]);
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      if (own.has(`${a},${b}`)) continue;
      if (hit(boxes[a], boxes[b])) fail(`battle screen at height ${h}: ${a} overlaps ${b}`, [boxes[a], boxes[b]]);
    }
    if (h === 780) await page.screenshot({ path: "test/out/battle-layout-780.png" });
  }
  await page.setViewportSize({ width: 412, height: 924 });
  await page.screenshot({ path: "test/out/battle-layout.png" });

  // Move animation + EXP bar: run from the first fight, then beat a level 2 foe in one hit.
  if (!(await page.locator(".bt-card.me .xp").isVisible())) fail("the player's card shows an EXP bar");
  await page.evaluate(() => Game.pick(3));
  await page.waitForFunction(() => !Game.state.battle, null, { timeout: 15000 });
  await page.evaluate(() => { window.__xp = Game.player.party[0].exp; Game.run(async (s) => { await Game.battle(s, makeMon("nibblet", 2)); }); });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  await page.evaluate(() => Game.pick(0)); await page.waitForTimeout(300); await page.evaluate(() => Game.pick(0));
  if (!(await page.waitForSelector(".bt-side .fx.go", { timeout: 6000 }).then(() => true, () => false))) fail("using a move plays an attack animation");
  await page.evaluate(async () => { for (let i = 0; i < 40 && Game.state.battle; i++) { Game.pick(0); await new Promise((r) => setTimeout(r, 250)); } });
  if (!(await page.evaluate(() => Game.player.party[0].exp > window.__xp))) fail("EXP is awarded after the foe faints");
  const bar = await page.evaluate(() => Game.state.battle && Game.state.battle.me.xp);
  if (bar !== null && bar !== undefined && !(bar > 0)) fail("the EXP bar fills after a win", bar);

  // Panels: the stats card (picture + 7 lines + Back) must fit, over the room scene.
  for (const where of ["room"]) {
    if (where === "room") await page.evaluate(() => { Game.run(async (s) => { await s.panel({ title: "BANDIT", g: "F", art: "bandit", rows: [], lines: ["Lv 8", "HP 26/26", "SP", "EXP", "a", "b", "c"] }); }); });
    await page.waitForSelector(".panel-ui:not([hidden]) .pn-back", { timeout: 5000 });
    await page.waitForTimeout(300);
    const fit = await page.evaluate(() => { const p = document.querySelector(".panel-ui").getBoundingClientRect(), b = document.querySelector(".pn-back").getBoundingClientRect(), hero = document.querySelector(".pn-hero").getBoundingClientRect(); return { backInside: b.bottom <= p.bottom + 1, hero: hero.height }; });
    if (!fit.backInside || fit.hero < 80) fail(`the stats card fits (${where})`, fit);
    await page.evaluate(() => { Game.pick(-1); });
    await page.waitForTimeout(300);
  }
  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

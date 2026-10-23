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
    for (const [key, m] of Object.entries(Game.maps)) {
      if (!m.world) continue;
      for (const wp of m.warps) {
        const edge = wp.x === 0 || wp.y === 0 || wp.x === m.world.cols - 1 || wp.y === m.world.rows - 1;
        if (edge && m.world.cells[wp.y][wp.x] !== "p") out.exits.push(`${key}: exit at (${wp.x},${wp.y}) is not a dirt path`);
      }
    }
    const m = Game.maps.route29, cells = m.world.cells, w = cells[0].length, h = cells.length;
    const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? cells[y][x] : "T");
    // Walk with Gold's rules: a ledge can only be entered from above and throws you two cells down. avoidGrass = never step on 'g'.
    const reach = (from, to, avoidGrass) => {
      const seen = new Set([from.join()]), q = [from];
      while (q.length) {
        const [x, y] = q.shift();
        if (x === to[0] && y === to[1]) return true;
        for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
          let nx = x + dx, ny = y + dy; const k = at(nx, ny);
          if (k === "v") { if (dy !== 1 || "TcrwSv".includes(at(nx, ny + 1))) continue; ny += 1; }
          else if ("TcrwS".includes(k) || (avoidGrass && k === "g")) continue;
          if (m.npcs.some((n) => n.x === nx && n.y === ny && n.faces === false)) continue;
          if (!seen.has(nx + "," + ny)) { seen.add(nx + "," + ny); q.push([nx, ny]); }
        }
      }
      return false;
    };
    out.grass = { westNoGrass: reach([54, 9], [1, 9], true), westAny: reach([54, 9], [1, 9], false), eastNoGrass: reach([1, 9], [54, 9], true) };
    for (const [key, mm] of Object.entries(Game.maps)) {
      if (!mm.world) continue;
      for (const n of mm.npcs || []) {
        if (n.trainer || n.faces === false) continue; // trainers wait in grass in Gold; props and items are placed on purpose
        const along = n.wander === "vertical" ? [[0, -2], [0, -1], [0, 0], [0, 1], [0, 2]] : n.wander === "horizontal" ? [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]] : [[0, 0]];
        if (along.some(([dx, dy]) => (mm.world.cells[n.y + dy] || "")[n.x + dx] === "g")) out.exits.push(`${key}: ${n.name} at (${n.x},${n.y}) stands in or wanders into tall grass`);
      }
    }
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
  await page.evaluate(() => { Game.msgMs = 80; Game.run(async (s) => { await Game.battle(s, makeMon("hootling", 5)); }); });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  await page.waitForTimeout(900);
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
    if (hit(boxes[a], boxes[b])) fail(`battle screen: ${a} overlaps ${b}`, [boxes[a], boxes[b]]);
  }
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

  console.log(failed ? "FAILED" : "OK");
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();

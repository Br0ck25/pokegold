#!/usr/bin/env node
// Landscape phone (915x412): the stage is wider than tall, the pad sits left/right of it without overlapping it, and the world and
// battle screens still lay out (screenshots in test/out/landscape-*.png to look at).
// Usage: node test/landscape.js [baseUrl]   (dev server must be running)
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
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

  const boxes = async () => page.evaluate(() => {
    const r = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
    return { stage: r("#stage"), dpad: r("#dpad"), a: r("[data-key=A]"), b: r("[data-key=B]"), start: r("[data-key=START]"), select: r("[data-key=SELECT]"), cloud: r("#cloud"), vw: innerWidth, vh: innerHeight };
  });
  const g = await boxes();
  if (g.stage.w <= g.stage.h * 1.2) fail("the stage is wider than tall", g.stage);
  if (g.stage.w < 480) fail("the stage uses the width (not a thin strip)", g.stage);
  const hit = (p, q) => p.x < q.r && q.x < p.r && p.y < q.b && q.y < p.b;
  for (const k of ["dpad", "a", "b", "start", "select", "cloud"]) {
    if (hit(g.stage, g[k])) fail(`${k} overlaps the stage`, { stage: g.stage, [k]: g[k] });
    if (g[k].x < 0 || g[k].r > g.vw || g[k].y < 0 || g[k].b > g.vh) fail(`${k} is off screen`, g[k]);
  }
  for (const [p, q] of [["a", "b"], ["a", "start"], ["b", "start"], ["b", "select"], ["dpad", "cloud"], ["dpad", "select"]]) if (hit(g[p], g[q])) fail(`${p} overlaps ${q}`, { p: g[p], q: g[q] });
  if (g.dpad.x > g.stage.x || g.a.x < g.stage.r) fail("d-pad left of the stage, A right of it");
  await page.screenshot({ path: "test/out/landscape-world.png" });
  const hero = await page.evaluate(() => { const h = document.querySelector("#hd .actor.hero").getBoundingClientRect(), s = document.querySelector("#stage").getBoundingClientRect(); return { inside: h.x > s.x && h.right < s.right && h.y > s.y && h.bottom < s.bottom, h: h.height, rows: s.height / (h.height / 1.0) }; });
  if (!hero.inside) fail("the hero is on screen in the world", hero);

  // Rooms fit the wide stage; long text comes a page at a time in a short box; the name form never sits behind the message box.
  await page.evaluate(() => Game.warp("bedroom", 3, 3, 0));
  await page.waitForFunction(() => HD.last.map.key === "bedroom");
  await page.waitForTimeout(600);
  const room = await page.evaluate(() => {
    const st = document.querySelector("#hd").getBoundingClientRect(), r = document.querySelector("#hd .room-svg").getBoundingClientRect();
    return { top: r.y - st.y, bottom: st.bottom - r.bottom, left: r.x - st.x, right: st.right - r.right };
  });
  if (room.top < -1 || room.bottom < -1 || room.left < -1 || room.right < -1) fail("the room fits inside the wide stage", room);
  if (room.top > 60 && room.bottom > 60 && Math.abs(room.top - room.bottom) > 40) fail("the room is centred", room);
  await page.screenshot({ path: "test/out/landscape-room.png" });
  await page.evaluate(() => { Game.run(async (s) => { await s.say("Jayda! Your very own BUDDYMON story is about to unfold. A world of dreams and adventure is waiting. Let's go!"); }); });
  await page.waitForFunction(() => HD.last.dialogue);
  await page.waitForTimeout(300);
  const dlg = await page.evaluate(() => ({ h: document.querySelector("#hd .dlg").getBoundingClientRect().height, stage: document.querySelector("#hd").getBoundingClientRect().height, text: HD.last.dialogue.text }));
  if (dlg.h > dlg.stage * 0.28) fail("the message box is short on a wide stage", dlg);
  if (/world of dreams/.test(dlg.text)) fail("long text shows one page first", dlg);
  await page.screenshot({ path: "test/out/landscape-dialogue.png" });
  await tapA(); await page.waitForTimeout(300); await tapA(); await page.waitForTimeout(300);
  await page.evaluate(() => Game.warp("route29", 54, 9, 2));
  await page.waitForFunction(() => HD.last.map.key === "route29");
  await page.evaluate(() => { Game.state.dialogue = null; });
  await page.evaluate(() => { Game.msgMs = 60; Game.run(async (s) => { await Game.battle(s, makeMon("nibblet", 5)); }); });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  await page.screenshot({ path: "test/out/landscape-battle.png" });
  const ov = await page.evaluate(() => {
    const stage = document.querySelector("#stage").getBoundingClientRect(), bad = [];
    for (const sel of [".bt-card.me", ".bt-card.foe", ".bt-menu", ".bt-side.me .mon", ".bt-side.foe .mon"]) {
      const b = document.querySelector("#hd " + sel).getBoundingClientRect();
      if (b.x < stage.x - 1 || b.right > stage.right + 1 || b.y < stage.y - 1 || b.bottom > stage.bottom + 1) bad.push(sel);
    }
    const sels = [".bt-card.me", ".bt-card.foe", ".bt-menu", ".bt-side.me .mon", ".bt-side.foe .mon"];
    const r = sels.map((sel) => document.querySelector("#hd " + sel).getBoundingClientRect());
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].x < r[j].right && r[j].x < r[i].right && r[i].y < r[j].bottom && r[j].y < r[i].bottom) bad.push(`${sels[i]} overlaps ${sels[j]}`);
    return bad;
  });
  if (ov.length) fail("battle parts stay inside the stage and apart", ov);
  await browser.close();
  if (failed) process.exit(1);
  console.log("landscape: ok");
})().catch((e) => { console.error(e); process.exit(1); });

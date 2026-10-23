#!/usr/bin/env node
// Whole start-up in a phone-sized browser: splash, intro, title, menu, Willow's talk, typed name, bedroom, stairs, Mom.
// Usage: node test/game.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]   (dev server must be running: npm run dev)
const { chromium } = require("playwright");
const fs = require("fs");
const base = process.argv[2] || "http://127.0.0.1:8787";
const out = process.argv[3] || "test/out";

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });
  const fail = (msg, got) => { console.error("FAIL:", msg, got === undefined ? "" : JSON.stringify(got)); failed = true; };
  const st = () => page.evaluate(() => ({ screen: HD.last.screen, map: HD.last.map.key, x: HD.last.x, y: HD.last.y, say: HD.last.dialogue && HD.last.dialogue.text, name: Game.player.name, flags: Game.player.flags }));
  const until = (fn, ms = 8000) => page.waitForFunction(fn, null, { timeout: ms });
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(250); };
  const hold = async (key, done, ms = 4000) => {
    await page.evaluate((k) => setKey(k, true), key);
    await page.waitForFunction(done, null, { timeout: ms }).catch(() => {});
    await page.evaluate((k) => setKey(k, false), key);
    await page.waitForTimeout(450);
  };

  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.tap("#play");
  await until(() => HD.last && HD.last.screen === "splash");
  await page.screenshot({ path: `${out}/1-splash.png` });
  await until(() => HD.last && HD.last.screen === "intro", 9000);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/2-intro.png` });
  await tapA();
  await until(() => HD.last && HD.last.screen === "title");
  await page.screenshot({ path: `${out}/3-title.png` });
  await tapA();
  await until(() => HD.last && HD.last.screen === "menu");
  await page.screenshot({ path: `${out}/4-menu.png` });
  await tapA();
  await until(() => HD.last && HD.last.screen === "prof");
  await page.screenshot({ path: `${out}/5-willow.png` });
  for (let i = 0; i < 6 && !(await page.$("#hd .ask input")); i++) await tapA();
  await page.fill("#hd .ask input", "Ash");
  await page.tap("#hd .ask button");
  await until(() => Game.player.name === "Ash");
  for (let i = 0; i < 4 && (await st()).screen; i++) await tapA();
  await until(() => HD.last && HD.last.map.key === "bedroom");
  let s = await st();
  if (s.x !== 3 || s.y !== 3 || s.screen) fail("should start in the bedroom at (3,3)", s);
  await page.screenshot({ path: `${out}/6-bedroom.png` });

  await hold("UP", () => Game.state.y <= 2, 1500);
  await hold("UP", () => false, 700);
  s = await st();
  if (s.y !== 2) fail("the desk at (3,1) must stop you at (3,2)", s);
  await hold("DOWN", () => Game.state.y >= 3, 1500);
  await hold("RIGHT", () => Game.state.x >= 7, 4000);
  await hold("UP", () => Game.state.map.key === "livingroom", 4000);
  await until(() => HD.last.dialogue, 5000).catch(() => {});
  s = await st();
  if (s.map !== "livingroom" || !/WILLOW/.test(s.say || "")) fail("Mom should greet you downstairs", s);
  for (let i = 0; i < 8; i++) await tapA();
  s = await st();
  if (!s.flags.GOT_BUDDYGEAR || s.say) fail("Mom's scene should finish and set GOT_BUDDYGEAR", s);

  // The game saved itself: a reload offers Continue and resumes in the living room.
  await page.evaluate(() => Game.save());
  await page.reload();
  await page.tap("#play");
  await until(() => HD.last && HD.last.screen === "intro", 9000);
  await tapA(); await until(() => HD.last && HD.last.screen === "title"); await tapA();
  await until(() => HD.last && HD.last.screen === "menu");
  const labels = await page.evaluate(() => HD.last.menu.items.map((i) => i.label));
  if (labels[0] !== "Continue") fail("menu should offer Continue", labels);
  await tapA();
  await until(() => HD.last && HD.last.map.key === "livingroom", 5000).catch(() => fail("Continue should resume in the living room", {}));

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

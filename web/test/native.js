#!/usr/bin/env node
// Native engine, scene 1: type a name on the phone keyboard, walk to the stairs, meet Mom downstairs.
// Usage: node test/native.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]
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
  const st = () => page.evaluate(() => ({ map: HD.last.map.key, x: HD.last.x, y: HD.last.y, dir: HD.last.dir, say: HD.last.dialogue && HD.last.dialogue.text, name: Game.player.name, flags: Game.player.flags }));
  const hold = async (key, done, ms = 4000) => {
    await page.evaluate((k) => setKey(k, true), key);
    await page.waitForFunction(done, null, { timeout: ms }).catch(() => {});
    await page.evaluate((k) => setKey(k, false), key);
    await page.waitForTimeout(450);
  };
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(300); };

  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.selectOption("#game", "native");
  await page.tap("#play");
  await page.waitForSelector("#hd .ask input", { timeout: 15000 });
  await page.fill("#hd .ask input", "Ash");
  await page.tap("#hd .ask button");
  await page.waitForFunction(() => Game.player.name === "Ash", null, { timeout: 5000 });
  let s = await st();
  if (s.map !== "bedroom" || s.x !== 3 || s.y !== 3) fail("should start in the bedroom at (3,3)", s);
  await page.screenshot({ path: `${out}/native-bedroom.png` });

  await hold("UP", () => Game.state.y <= 2 || false, 600);          // blocked by the console? (4,2) is not on this column; (3,2) is free
  await hold("UP", () => Game.state.y <= 2, 1500);
  s = await st();
  if (s.y !== 2) fail("one step up should reach (3,2)", s);
  await hold("UP", () => false, 700);
  s = await st();
  if (s.y !== 2) fail("the desk at (3,1) must block walking", s);
  await hold("DOWN", () => Game.state.y >= 3, 1500);
  await hold("RIGHT", () => Game.state.x >= 7, 4000);
  await hold("UP", () => Game.state.map.key === "livingroom" || HD.last.map.key === "livingroom", 4000);
  await page.waitForFunction(() => HD.last.dialogue, null, { timeout: 5000 }).catch(() => {});
  s = await st();
  if (s.map !== "livingroom" || !/WILLOW/.test(s.say || "")) fail("Mom should greet you downstairs", s);
  await page.screenshot({ path: `${out}/native-mom.png` });
  for (let i = 0; i < 8; i++) await tapA();
  s = await st();
  if (!s.flags.GOT_BUDDYGEAR || s.say) fail("Mom's scene should finish and set GOT_BUDDYGEAR", s);

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

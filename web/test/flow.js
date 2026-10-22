#!/usr/bin/env node
// Plays the intro with real touch taps at Pixel 9 size (412x924) and writes a
// screenshot per scene. Fails if a single tap doesn't register or the room isn't reached.
// Usage: node test/flow.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]
const { chromium } = require("playwright");
const fs = require("fs");

const base = process.argv[2] || "http://127.0.0.1:8787";
const out = process.argv[3] || "test/out";

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); process.exitCode = 1; });

  const scene = () => page.evaluate(() => HD.last && HD.last.scene);
  const tapKey = async (key) => {
    const box = await page.locator(`[data-key=${key}]`).boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  };
  const tapDpad = async (dir) => {
    const b = await page.locator("#dpad").boundingBox();
    const at = { LEFT: [0.1, 0.5], RIGHT: [0.9, 0.5], UP: [0.5, 0.1], DOWN: [0.5, 0.9] }[dir];
    await page.touchscreen.tap(b.x + b.width * at[0], b.y + b.height * at[1]);
  };
  const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
  const seen = new Set();
  const snap = async () => { const s = await scene(); if (!seen.has(s)) { seen.add(s); await shot(`scene${s}`); } };

  await page.goto(base);
  const play = await page.locator("#play").boundingBox();
  await page.touchscreen.tap(play.x + play.width / 2, play.y + play.height / 2);
  await page.waitForFunction(() => document.getElementById("start").hidden, null, { timeout: 60000 });
  await shot("00-pixel-or-intro");
  for (let i = 0; i < 120 && (await scene()) !== 1; i++) { await snap(); await page.waitForTimeout(1000); }
  for (const id of [7, 8]) if (!seen.has(id)) { console.error(`FAIL: startup scene ${id} (splash=7, intro=8) never showed`); process.exitCode = 1; }
  await page.waitForTimeout(2000); await snap();

  // One tap each: Start opens the menu, A starts a new game.
  await tapKey("START"); await page.waitForTimeout(1500);
  if ((await scene()) !== 2) { console.error("FAIL: single Start tap did not open the menu"); process.exitCode = 1; }
  await snap();
  // Options open as an HD scene and Back returns to the menu.
  await tapDpad("DOWN"); await page.waitForTimeout(500);
  await tapKey("A");
  await page.waitForFunction(() => HD.last && HD.last.scene === 9, null, { timeout: 5000 }).catch(() => { console.error("FAIL: Options did not open as HD scene 9"); process.exitCode = 1; });
  await page.waitForTimeout(800); await shot("options");
  await tapKey("B");
  await page.waitForFunction(() => HD.last && HD.last.scene === 2, null, { timeout: 5000 }).catch(() => { console.error("FAIL: B did not return from Options"); process.exitCode = 1; });
  await tapDpad("UP"); await page.waitForTimeout(500);
  await tapKey("A");
  await page.waitForFunction(() => HD.last && HD.last.scene !== 2, null, { timeout: 8000 })
    .catch(() => { console.error("FAIL: single A tap did not choose New Game"); process.exitCode = 1; });

  let inRoom = false;
  for (let i = 0; i < 400 && !inRoom; i++) {
    await tapKey("A"); await page.waitForTimeout(450); await snap();
    inRoom = await page.evaluate(() => HD.last && HD.last.scene === 0 && HD.last.map.group === 24 && HD.last.map.number === 7);
  }
  if (!inRoom) { console.error("FAIL: never reached the room"); process.exitCode = 1; }
  else {
    await page.waitForTimeout(3000);
    // The game turns the player on a quick tap and walks on the next one.
    const x0 = await page.evaluate(() => HD.last.x);
    await tapDpad("LEFT"); await page.waitForTimeout(600);
    if ((await page.evaluate(() => HD.last.dir)) !== 2) { console.error("FAIL: one D-pad tap did not turn left"); process.exitCode = 1; }
    await tapDpad("LEFT"); await page.waitForTimeout(900);
    const x1 = await page.evaluate(() => HD.last.x);
    if (x1 !== x0 - 1) { console.error(`FAIL: second D-pad tap moved x ${x0} -> ${x1}`); process.exitCode = 1; }
    await shot("room");
    // A Start menu has no HD design yet: the room must step aside and show the pixel screen.
    await tapKey("START"); await page.waitForTimeout(1200);
    const stepped = await page.evaluate(() => HD.last.menu && !document.getElementById("screen-wrap").classList.contains("hd-on"));
    if (!stepped) { console.error("FAIL: room did not step aside for the Start menu"); process.exitCode = 1; }
    await tapKey("B"); await page.waitForTimeout(1200);
    // Walk to the stairs (7,0): right along the row, then up. Mom should be drawn in the living room.
    const hold = async (key, done) => {
      await page.evaluate((k) => setKey(k, true), key);
      await page.waitForFunction(done, null, { timeout: 8000 }).catch(() => {});
      await page.evaluate((k) => setKey(k, false), key);
      await page.waitForTimeout(400);
    };
    await hold("RIGHT", () => HD.last.x >= 7);
    await hold("UP", () => HD.last.map.number === 6);
    await page.waitForTimeout(2500);
    const living = await page.evaluate(() => ({ label: document.querySelector("#hd .loc")?.textContent, npcs: document.querySelectorAll("#hd .actor.npc").length }));
    if (living.label !== "Home · Living Room" || living.npcs < 1) { console.error("FAIL: living room not drawn with Mom", JSON.stringify(living)); process.exitCode = 1; }
    await shot("room1f");
  }
  console.log(process.exitCode ? "FAILED" : "OK", "scenes seen:", [...seen].join(","));
  await browser.close();
})();

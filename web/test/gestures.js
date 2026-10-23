#!/usr/bin/env node
// Gesture mode: checks which keys each touch gesture presses (no game progress needed).
// Usage: node test/gestures.js [baseUrl=http://127.0.0.1:8787]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });

  await page.goto(base);
  await page.selectOption("#game", "gold");
  const play = await page.locator("#play").boundingBox();
  await page.touchscreen.tap(play.x + play.width / 2, play.y + play.height / 2);
  await page.waitForFunction(() => document.getElementById("start").hidden, null, { timeout: 60000 });
  await page.click("#controls");
  if (await page.locator("#pad").isVisible()) { console.error("FAIL: pad still visible in gesture mode"); failed = true; }
  await page.evaluate(() => { window.__keys = []; const o = setKey; window.setKey = (k, d) => { window.__keys.push(k + (d ? "+" : "-")); o(k, d); }; });

  const b = await page.locator("#screen-wrap").boundingBox();
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
  const keys = async () => page.evaluate(() => window.__keys.splice(0).join(" "));
  const expect = async (name, got, want) => { if (got !== want) { console.error(`FAIL ${name}: got "${got}", want "${want}"`); failed = true; } };

  await touch("touchStart", [{ x: cx, y: cy, id: 1 }]); await page.waitForTimeout(80); await touch("touchEnd", []);
  await page.waitForTimeout(250); await expect("tap -> A", await keys(), "A+ A-");

  await touch("touchStart", [{ x: cx, y: cy, id: 1 }]);
  await touch("touchMove", [{ x: cx - 70, y: cy + 5, id: 1 }]); await page.waitForTimeout(150);
  await touch("touchMove", [{ x: cx - 70, y: cy + 80, id: 1 }]); await page.waitForTimeout(150);
  await touch("touchEnd", []); await page.waitForTimeout(250);
  await expect("drag left then down", await keys(), "LEFT+ LEFT- DOWN+ DOWN-");

  await touch("touchStart", [{ x: cx, y: cy, id: 1 }]); await page.waitForTimeout(800); await touch("touchEnd", []);
  await page.waitForTimeout(250); await expect("long press -> Start only", await keys(), "START+ START-");

  await touch("touchStart", [{ x: cx - 40, y: cy, id: 1 }, { x: cx + 40, y: cy, id: 2 }]); await page.waitForTimeout(80);
  await touch("touchEnd", []); await page.waitForTimeout(250); await expect("two-finger tap -> B once", await keys(), "B+ B-");

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

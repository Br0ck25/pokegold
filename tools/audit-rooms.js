// LOOK at every room: one contact sheet of all interiors in the real scene (phone size) into test/out/audit-rooms.png.
// Usage: node tools/audit-rooms.js   (dev server must be running)
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 700 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:8787");
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "cgmart", x: 3, y: 5, dir: 1, player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true, GOT_BUDDYGEAR: true, GOT_EGG: true }, bag: {}, party: [makeMon("bandit", 8)] } })));
  await page.reload(); await page.tap("#play");
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "cgmart");
  const keys = ["bedroom", "livingroom", "willowlab", "neighbor", "willowhouse", "gate29", "cgmart", "cgcenter", "cggent", "mrbuddy", "gate31", "vmart", "vcenter", "vnickname", "academy", "violetgym"];
  const shots = [];
  for (const k of keys) {
    await page.evaluate((k) => { Game.script = null; Game.state.dialogue = null; const m = Game.maps[k]; const w = m.warps[0]; Game.warp(k, w.tx !== undefined ? w.x : 1, w.y, 1); }, k);
    await page.waitForTimeout(700);
    await page.evaluate(() => { Game.state.dialogue = null; });
    shots.push([k, (await page.screenshot({ clip: { x: 0, y: 0, width: 412, height: 460 } })).toString("base64")]);
  }
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: 1700, height: 1000 });
  await p2.setContent(`<body style="margin:0;background:#111;display:flex;flex-wrap:wrap;gap:6px">${shots.map(([k, b]) => `<div style="color:#fff;font:12px sans-serif"><div>${k}</div><img src="data:image/png;base64,${b}" width="270"></div>`).join("")}</body>`);
  await p2.screenshot({ path: "test/out/audit-rooms.png", fullPage: true });
  await browser.close();
})();

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

  // Out the front door, across New Bark Town, into Willow's lab, and pick the grass buddymon.
  const goTo = async (tx, ty) => {
    const path = await page.evaluate(([tx, ty]) => {
      const m = Game.maps[Game.state.map.key], key = (x, y) => `${x},${y}`;
      const free = (x, y) => y >= 0 && y < m.solid.length && x >= 0 && x < m.solid[0].length && m.solid[y][x] !== "#" && !Game.state.objects.some((o) => o.x === x && o.y === y);
      const D = [[0, 1], [0, -1], [-1, 0], [1, 0]], from = new Map([[key(Game.state.x, Game.state.y), null]]), q = [[Game.state.x, Game.state.y]];
      while (q.length) {
        const [x, y] = q.shift();
        if (x === tx && y === ty) break;
        D.forEach(([dx, dy], d) => { if (free(x + dx, y + dy) && !from.has(key(x + dx, y + dy))) { from.set(key(x + dx, y + dy), [x, y, d]); q.push([x + dx, y + dy]); } });
      }
      const out = []; for (let at = from.get(key(tx, ty)); at; at = from.get(key(at[0], at[1]))) out.unshift(at[2]);
      return out;
    }, [tx, ty]);
    const names = ["DOWN", "UP", "LEFT", "RIGHT"];
    for (const d of path) {
      const before = await page.evaluate(() => [Game.state.map.key, Game.state.x, Game.state.y].join());
      await page.evaluate((k) => setKey(k, true), names[d]);
      await page.waitForFunction((b) => [Game.state.map.key, Game.state.x, Game.state.y].join() !== b, before, { timeout: 3000 }).catch(() => {});
      await page.evaluate((k) => setKey(k, false), names[d]);
      await page.waitForTimeout(380);
    }
  };
  await goTo(7, 7);
  await until(() => HD.last.map.key === "newbark", 5000);
  await page.screenshot({ path: `${out}/7-newbark.png` });
  await goTo(0, 8);
  await until(() => HD.last.dialogue, 4000);
  s = await st();
  if (!/WILLOW/.test(s.say || "")) fail("the road west should be blocked until you see Willow", s);
  for (let i = 0; i < 3; i++) await tapA();
  await goTo(11, 13);
  await until(() => HD.last.map.key === "willowlab", 5000);
  for (let i = 0; i < 5; i++) await tapA();
  await page.screenshot({ path: `${out}/8-lab.png` });
  await goTo(6, 4);
  await hold("UP", () => false, 500);
  await tapA();
  await page.waitForTimeout(300);
  await tapA(); // YES is the first choice
  for (let i = 0; i < 8; i++) await tapA();
  const party = await page.evaluate(() => ({ party: Game.player.party, nets: Game.player.bag.buddy_net, got: Game.player.flags.GOT_STARTER }));
  if (!party.got || party.party[0]?.species !== "bramblet" || party.nets !== 5) fail("choosing the grass buddymon should give it plus 5 nets", party);
  await page.screenshot({ path: `${out}/9-starter.png` });

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
  await until(() => HD.last && HD.last.map.key === "willowlab", 5000).catch(() => fail("Continue should resume in the lab", {}));

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

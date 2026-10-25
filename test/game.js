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
  for (let i = 0; i < 16 && !(await page.$("#hd .ask input")); i++) await tapA();
  await page.fill("#hd .ask input", "Ash");
  await page.tap("#hd .ask button");
  await until(() => Game.player.name === "Ash");
  for (let i = 0; i < 10 && (await st()).screen; i++) await tapA();
  await until(() => HD.last && HD.last.map.key === "bedroom");
  let s = await st();
  if (s.x !== 3 || s.y !== 3 || s.screen) fail("should start in the bedroom at (3,3)", s);
  if ((await page.evaluate(() => HD.last.objects.length)) !== 0) fail("the bedroom should have no dolls or other people");
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
  const mom = await page.evaluate(() => HD.last.objects[0]);
  if (mom.x !== 9 || mom.y !== 2) fail("Mom should have walked over next to the stairs", mom);
  for (let i = 0; i < 40 && (i < 3 || (await st()).say); i++) await tapA(); // every page of Gold's text, the phone question included
  s = await st();
  if (!s.flags.GOT_BUDDYGEAR || s.say) fail("Mom's scene should finish and set GOT_BUDDYGEAR", s);

  // The stairs work both ways (as in Gold you arrive ON the stairs tile, so step off and back on).
  await hold("DOWN", () => Game.state.y >= 1, 1500);
  await hold("UP", () => Game.state.map.key === "bedroom", 3000);
  s = await page.evaluate(() => Game.state.map.key);
  if (s !== "bedroom") fail("the stairs should lead back up to your room", s);
  await hold("DOWN", () => Game.state.y >= 1, 1500);
  await hold("UP", () => Game.state.map.key === "livingroom", 3000);
  s = await page.evaluate(() => Game.state.map.key);
  if (s !== "livingroom") fail("and down again", s);

  // Out the front door and across New Bark Town, scene by scene as Gold has them.
  const goTo = async (tx, ty) => {
    const names = ["DOWN", "UP", "LEFT", "RIGHT"];
    for (let i = 0; i < 120; i++) {
      const d = await page.evaluate(([tx, ty]) => {
        const m = Game.maps[Game.state.map.key], key = (x, y) => `${x},${y}`;
        if (Game.script || (Game.state.x === tx && Game.state.y === ty)) return -1;
        const free = (x, y) => y >= 0 && y < m.solid.length && x >= 0 && x < m.solid[0].length && m.solid[y][x] !== "#" && !Game.state.objects.some((o) => o.x === x && o.y === y);
        const D = [[0, 1], [0, -1], [-1, 0], [1, 0]], from = new Map([[key(Game.state.x, Game.state.y), null]]), q = [[Game.state.x, Game.state.y]];
        while (q.length) {
          const [x, y] = q.shift();
          if (x === tx && y === ty) break;
          D.forEach(([dx, dy], d) => { if (free(x + dx, y + dy) && !from.has(key(x + dx, y + dy))) { from.set(key(x + dx, y + dy), [x, y, d]); q.push([x + dx, y + dy]); } });
        }
        let first = -2;
        for (let at = from.get(key(tx, ty)); at; at = from.get(key(at[0], at[1]))) first = at[2];
        return first;
      }, [tx, ty]);
      if (d === -1) return;
      if (d === -2) { await page.waitForTimeout(400); continue; } // blocked for now (someone is in the way)
      const before = await page.evaluate(() => [Game.state.map.key, Game.state.x, Game.state.y].join());
      await page.evaluate((k) => setKey(k, true), names[d]);
      await page.waitForFunction((b) => [Game.state.map.key, Game.state.x, Game.state.y].join() !== b, before, { timeout: 1500 }).catch(() => {});
      await page.evaluate((k) => setKey(k, false), names[d]);
      await page.waitForTimeout(380);
    }
  };
  const talkOut = async (n = 12) => { for (let i = 0; i < n && (await page.evaluate(() => !!Game.script)); i++) await tapA(); await page.waitForTimeout(300); };
  const here = () => page.evaluate(() => ({ map: Game.state.map.key, x: Game.state.x, y: Game.state.y, dir: Game.state.dir }));

  await goTo(7, 7);
  await until(() => HD.last.map.key === "newbark", 5000);
  await page.screenshot({ path: `${out}/7-newbark.png` });
  // The teacher stops you at the road west and walks you back.
  await goTo(1, 9);
  await until(() => Game.script, 4000);
  await page.screenshot({ path: `${out}/7b-teacher.png` });
  await talkOut();
  s = await here();
  if (s.map !== "newbark" || s.x < 4) fail("the teacher should walk you back into town", s);
  // The rival beside the lab shoves you away.
  await goTo(2, 2); // the only cell you can talk to him from
  await hold("RIGHT", () => false, 500);
  await tapA();
  await talkOut();
  s = await here();
  if (s.y < 4) fail("the rival should shove you away (two cells down)", s);
  // Willow's lab: you walk up to the professor by yourself.
  await goTo(6, 3);
  await until(() => HD.last.map.key === "willowlab" && HD.last.dialogue, 8000);
  s = await here();
  if (s.x !== 4 || s.y !== 2 || s.dir !== 3) fail("you should have walked up to Willow and be facing him", s);
  await page.screenshot({ path: `${out}/8-lab.png` });
  await talkOut();
  // Can't leave without a buddymon.
  await goTo(4, 5);
  await hold("DOWN", () => Game.script, 1500);
  await until(() => HD.last.dialogue, 3000);
  await talkOut();
  s = await here();
  if (s.y !== 5) fail("the lab should stop you at the door without a buddymon", s);
  // Pick the grass buddymon (right-hand net): picture first, then Yes.
  await goTo(8, 4);
  await hold("UP", () => false, 500);
  await tapA();
  await until(() => HD.last.pic === "bramblet", 3000).catch(() => fail("the big picture of the buddymon should show", { pic: HD.last.pic }));
  await page.screenshot({ path: `${out}/9-pic.png` });
  await tapA(); // WILLOW: you'll take ...?
  await page.waitForTimeout(300);
  await tapA(); // YES
  await talkOut(14);
  s = await here();
  const got = await page.evaluate(() => ({ party: Game.player.party, got: Game.player.flags.GOT_STARTER, nets: Game.player.bag.buddy_net }));
  if (!got.got || got.party[0]?.species !== "bramblet" || got.nets) fail("you should have Bramblet and no nets yet (Gold gives balls later)", got);
  if (s.x !== 5 || s.y !== 3) fail("after choosing you should stand in front of Willow", s);
  await page.screenshot({ path: `${out}/10-starter.png` });
  // The aide hands you a tonic as you head for the door.
  await goTo(4, 8);
  await until(() => Game.script, 4000).catch(() => {});
  await talkOut();
  const bag = await page.evaluate(() => Game.player.bag);
  if (bag.tonic !== 1) fail("the aide should give you a tonic", bag);
  await goTo(4, 11);
  await until(() => HD.last.map.key === "newbark", 5000);

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
  await until(() => HD.last && HD.last.map.key === "newbark", 5000).catch(() => fail("Continue should resume outside the lab", {}));

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

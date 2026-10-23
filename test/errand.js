#!/usr/bin/env node
// Willow's errand end to end, as in Gold: Route 30 trainers, Mr. Buddymon's house (egg, BUDDYDEX), the rival in Cherrygrove,
// the officer naming the rival, Willow taking the egg, the aide's nets, and the catching lesson on Route 29.
// Usage: node test/errand.js [baseUrl]   (dev server must be running)
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.stack.split("\n").slice(0, 3).join(" | ")); failed = true; });
  const fail = (msg, got) => { console.error("FAIL:", msg, got === undefined ? "" : JSON.stringify(got)); failed = true; };
  const key = (k) => page.evaluate((k) => { setKey(k, true); setTimeout(() => setKey(k, false), 120); }, k).then(() => page.waitForTimeout(180));
  const running = () => page.evaluate(() => !!Game.script);
  // Plays any running script: types names, picks the first option in menus and battles, taps A through text.
  const auto = async (max = 600) => {
    for (let i = 0; i < max && (await running()); i++) {
      if (await page.$("#hd .ask input")) { await page.fill("#hd .ask input", "Rex"); await page.tap("#hd .ask button"); continue; }
      const m = await page.evaluate(() => { const b = HD.last.battle; return b && b.menu ? b.menu.kind : Game.state.boxes.length ? "box" : null; });
      if (m === "party") await page.evaluate(() => Game.pick(0));
      else if (m) await page.evaluate(() => Game.pick(0));
      else await key("A");
    }
  };
  const flags = () => page.evaluate(() => Game.player.flags);
  const where = () => page.evaluate(() => ({ map: Game.state.map.key, x: Game.state.x, y: Game.state.y, dir: Game.state.dir }));
  const goTo = async (tx, ty) => {
    const names = ["DOWN", "UP", "LEFT", "RIGHT"];
    for (let i = 0; i < 200; i++) {
      await auto();
      const d = await page.evaluate(([tx, ty]) => {
        const m = Game.maps[Game.state.map.key], k = (x, y) => `${x},${y}`;
        if (Game.state.x === tx && Game.state.y === ty) return -1;
        const free = (x, y) => y >= 0 && y < m.solid.length && x >= 0 && x < m.solid[0].length && m.solid[y][x] !== "#" && !Game.state.objects.some((o) => o.x === x && o.y === y);
        const D = [[0, 1], [0, -1], [-1, 0], [1, 0]], from = new Map([[k(Game.state.x, Game.state.y), null]]), q = [[Game.state.x, Game.state.y]];
        while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; D.forEach(([dx, dy], d) => { if (free(x + dx, y + dy) && !from.has(k(x + dx, y + dy))) { from.set(k(x + dx, y + dy), [x, y, d]); q.push([x + dx, y + dy]); } }); }
        let first = -2; for (let at = from.get(k(tx, ty)); at; at = from.get(k(at[0], at[1]))) first = at[2];
        return first;
      }, [tx, ty]);
      if (d === -1) return;
      if (d === -2) { await page.waitForTimeout(300); continue; }
      const before = await page.evaluate(() => [Game.state.map.key, Game.state.x, Game.state.y].join());
      await page.evaluate((k) => setKey(k, true), names[d]);
      await page.waitForFunction((b) => [Game.state.map.key, Game.state.x, Game.state.y].join() !== b || Game.script, before, { timeout: 1500 }).catch(() => {});
      await page.evaluate((k) => setKey(k, false), names[d]);
      await page.waitForTimeout(300);
    }
  };

  await page.goto(base);
  await page.evaluate(() => {
    const mon = makeMon("bramblet", 14);
    localStorage.setItem("buddymon-save", JSON.stringify({ at: 1, map: "route30", x: 15, y: 38, dir: 1,
      player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true, GOT_BUDDYGEAR: true, MET_WILLOW: true, GOT_TONIC: true }, bag: { tonic: 2 }, party: [mon] } }));
  });
  await page.reload();
  await page.tap("#play");
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  for (let i = 0; i < 3; i++) await key("A");
  await page.waitForFunction(() => HD.last.map.key === "route30", null, { timeout: 8000 });
  await page.evaluate(() => { Game.msgMs = 40; Game.player.options.speed = "fast"; });

  // Route 30: the three trainers watch the road.
  await goTo(16, 7);
  let f = await flags();
  if (!f.BEAT_JOEY || !f.BEAT_MIKEY || !f.BEAT_DON) fail("all three Route 30 trainers should have spotted and fought you", { j: f.BEAT_JOEY, m: f.BEAT_MIKEY, d: f.BEAT_DON });
  await page.evaluate(() => { for (const m of Game.player.party) m.hp = statsFor(m).hp; });
  await goTo(16, 6);
  await page.waitForFunction(() => HD.last.map.key === "mrbuddy", null, { timeout: 5000 });
  await auto(900);
  f = await flags();
  const after = await page.evaluate(() => ({ egg: Game.player.bag.mystery_egg, flags: Game.player.flags.GOT_BUDDYDEX, center: Game.player.lastCenter && Game.player.lastCenter.map, party: Game.player.party.length }));
  if (!f.GOT_EGG || !after.egg || !after.flags || after.center !== "cgcenter") fail("Mr. Buddymon gives the egg, Aspen the BUDDYDEX, and your home Center changes", after);

  // Cherrygrove: the rival is waiting on the way back.
  await page.evaluate(() => Game.warp("cherrygrove", 34, 9, 2));
  await page.waitForTimeout(400);
  await page.evaluate(() => setKey("LEFT", true));
  await page.waitForFunction(() => Game.script, null, { timeout: 4000 }).catch(() => fail("the rival should ambush you after the errand"));
  await page.evaluate(() => setKey("LEFT", false));
  await auto(900);
  if (!(await flags()).RIVAL_CHERRYGROVE_DONE) fail("the rival fight should be over");

  // The lab: the officer asks for the rival's name, Willow takes the egg, the aide gives nets.
  await page.evaluate(() => { for (const m of Game.player.party) m.hp = statsFor(m).hp; Game.warp("willowlab", 4, 11, 1); });
  await page.waitForTimeout(400);
  await goTo(4, 5);
  await auto(300);
  const rival = await page.evaluate(() => [Game.player.rival, Game.player.flags.COP_GONE].join());
  if (rival !== "Rex,true") fail("the officer should take the rival's name", rival);
  await goTo(5, 4);
  await page.evaluate(() => setKey("UP", true)); await page.waitForTimeout(400); await page.evaluate(() => setKey("UP", false));
  await key("A");
  await auto(400);
  f = await flags();
  if (!f.GAVE_EGG || (await page.evaluate(() => Game.player.bag.mystery_egg)) !== 0) fail("Willow should take the egg", f);
  await goTo(4, 8);
  await auto(300);
  const nets = await page.evaluate(() => Game.player.bag.buddy_net);
  if (nets !== 5) fail("the aide should give 5 nets", nets);

  // Route 29: the dude shows you how to catch; your party is unchanged.
  await page.evaluate(() => Game.warp("route29", 54, 9, 2));
  await page.waitForTimeout(400);
  await page.evaluate(() => setKey("LEFT", true));
  await page.waitForFunction(() => Game.script, null, { timeout: 4000 }).catch(() => fail("the dude should offer the lesson"));
  await page.evaluate(() => setKey("LEFT", false));
  await auto(900);
  const lesson = await page.evaluate(() => [Game.player.flags.LEARNED_TO_CATCH, Game.player.party.length, Game.player.bag.buddy_net].join());
  if (lesson !== "true,1,5") fail("the lesson should not cost nets or add buddymon", lesson);

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

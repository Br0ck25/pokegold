#!/usr/bin/env node
// Battles through the real UI: fight to a win (experience), catch with a buddy net, run away, and lose (whiteout).
// Usage: node test/battle.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]   (dev server must be running)
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
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };

  // Start from a saved game: Bramblet lvl 5, 5 nets, standing on Route 29.
  await page.goto(base);
  await page.evaluate(() => {
    localStorage.setItem("buddymon-save", JSON.stringify({
      at: Date.now(), map: "route29", x: 54, y: 9, dir: 2,
      player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5, tonic: 1 }, party: [makeMon("bramblet", 5)] },
    }));
  });
  await page.reload();
  await page.tap("#play");
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
  await page.waitForFunction(() => HD.last.screen === "menu"); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29", null, { timeout: 8000 });
  await page.evaluate(() => { Game.msgMs = 80; });

  // Genders: Bandit is always female; the starters are mostly male.
  const genders = await page.evaluate(() => ({ bandit: Array.from({ length: 20 }, () => makeMon("bandit", 5).gender).join(""), bramblet: Array.from({ length: 200 }, () => makeMon("bramblet", 5).gender).filter((g) => g === "F").length }));
  if (/M/.test(genders.bandit)) fail("Bandit is always female", genders);
  if (genders.bramblet < 5 || genders.bramblet > 60) fail("about one starter in eight is female", genders);

  // Ledge: hopping down from the north side of the road lands two cells on (and never back up).
  await page.evaluate(() => Game.warp("route29", 33, 7, 0));
  await page.evaluate(() => setKey("DOWN", true));
  await page.waitForFunction(() => Game.state.y >= 9, null, { timeout: 3000 }).catch(() => {});
  await page.evaluate(() => setKey("DOWN", false));
  await page.waitForTimeout(500);
  if ((await page.evaluate(() => Game.state.y)) !== 9) fail("the ledge should drop you onto the road", await page.evaluate(() => [Game.state.x, Game.state.y]));
  await page.evaluate(() => setKey("UP", true));
  await page.waitForTimeout(700);
  await page.evaluate(() => setKey("UP", false));
  if ((await page.evaluate(() => Game.state.y)) !== 9) fail("you cannot climb back up a ledge");
  if ((await page.evaluate(() => Game.player.money)) !== 3000) fail("you start with 3000 BUDS");

  // Plays a battle by clicking real buttons; `plan(menu)` returns the label to tap for the visible menu.
  const play = async (foe, plan, mod) => {
    await page.evaluate(([foe, mod]) => {
      window.__result = null;
      const mon = makeMon(foe[0], foe[1]);
      if (mod) new Function("mon", mod)(mon);
      Game.run(async (s) => { window.__result = await Game.battle(s, mon); });
    }, [foe, mod || ""]);
    for (let i = 0; i < 400; i++) {
      if (await page.evaluate(() => window.__result)) break;
      if (await page.$("#hd .ask input")) { await page.fill("#hd .ask input", "Pip"); await page.tap("#hd .ask button"); continue; }
      const labels = await page.evaluate(() => { const m = HD.last.battle && HD.last.battle.menu; return m ? { kind: m.kind, items: m.items.map((x) => x.label) } : null; });
      if (labels) {
        const want = plan(labels);
        const idx = labels.items.findIndex((l) => l.startsWith(want));
        await page.evaluate((i) => Game.pick(i), idx >= 0 ? idx : 0);
      } else await tapA();
      await page.waitForTimeout(60);
    }
    return page.evaluate(() => window.__result);
  };
  const fight = (m) => (m.kind === "cmd" ? "FIGHT" : m.kind === "moves" ? m.items[0].split("  ")[0] : m.kind === "party" ? (m.items.find((l) => !/ 0\//.test(l)) || "").split("  ")[0] : "CANCEL");

  // 1. Fight a weak wild chirplet until someone faints.
  const exp0 = await page.evaluate(() => Game.player.party[0].exp);
  let r = await play(["chirplet", 2], fight);
  await page.screenshot({ path: `${out}/b1-after-fight.png` });
  if (r !== "won" && r !== "lost") fail("a fight should end in a win or loss", r);
  if (r === "won" && (await page.evaluate(() => Game.player.party[0].exp)) <= exp0) fail("winning should give experience");

  // 2. Catch: foe at 1 HP, throw a net. Look at the net while it shakes.
  await page.evaluate(() => { const p = Game.player.party[0]; p.hp = statsFor(p).hp; });
  const nets0 = await page.evaluate(() => Game.player.bag.buddy_net);
  r = await play(["nibblet", 3], (m) => (m.kind === "cmd" ? "PACK" : m.kind === "pack" ? "BUDDY NET" : "CANCEL"), "mon.hp = 1;");
  if (r !== "caught") fail("a 1 HP nibblet should be caught within five nets", r);
  if ((await page.evaluate(() => Game.player.party.map((m) => m.nick))).join() !== "BRAMBLET,Pip") fail("the caught buddymon should join the party with its nickname");
  const bag = await page.evaluate(() => ({ nets: Game.player.bag.buddy_net, party: Game.player.party.length }));
  if (!(bag.nets < nets0)) fail("throwing should use up nets", bag);

  // 3. Run away.
  await page.evaluate(() => { const p = Game.player.party[0]; p.hp = statsFor(p).hp; });
  r = await play(["peekat", 3], (m) => (m.kind === "cmd" ? "RUN" : "CANCEL"));
  if (r !== "ran" && r !== "lost") fail("running should end the battle", r);

  // 4. Lose: a level 30 foe against a 1 HP buddymon sends you home with half the money.
  await page.evaluate(() => { Game.player.party.forEach((m) => { m.hp = 1; }); Game.player.money = 3000; });
  r = await play(["hootling", 30], fight);
  if (r !== "lost") fail("a level 30 foe should win against a 1 HP buddymon", r);
  await page.evaluate(() => { Game.run(async (s) => { await Game.whiteout(s); }); });
  await page.waitForFunction(() => !Game.script, null, { timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 6 && (await page.evaluate(() => !!Game.script)); i++) await tapA();
  const end = await page.evaluate(() => ({ money: Game.player.money, hp: Game.player.party[0].hp, max: statsFor(Game.player.party[0]).hp, map: Game.state.map.key }));
  if (end.money !== 1500 || end.hp !== end.max || end.map !== "livingroom") fail("whiteout: half the money, full health, back home", end);

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

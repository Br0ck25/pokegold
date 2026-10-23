#!/usr/bin/env node
// Cherrygrove: the rival ambush (a trainer battle), the Guide Gent's tour, the Mart (buying), the Center (healing).
// Usage: node test/cherrygrove.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]   (dev server must be running)
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
  page.on("pageerror", (e) => { console.error("pageerror:", e.stack.split("\n").slice(0, 4).join(" | ")); failed = true; });
  const fail = (msg, got) => { console.error("FAIL:", msg, got === undefined ? "" : JSON.stringify(got)); failed = true; };
  const key = (k) => page.evaluate((k) => { setKey(k, true); setTimeout(() => setKey(k, false), 130); }, k).then(() => page.waitForTimeout(260));
  const pick = (i) => page.evaluate((i) => Game.pick(i), i).then(() => page.waitForTimeout(260));
  const running = () => page.evaluate(() => !!Game.script);
  const talkOut = async (n = 40) => { for (let i = 0; i < n && (await running()); i++) { if (await page.$("#hd .ask input")) { await page.fill("#hd .ask input", "Pip"); await page.tap("#hd .ask button"); } await key("A"); } };
  const here = () => page.evaluate(() => ({ map: Game.state.map.key, x: Game.state.x, y: Game.state.y }));

  await page.goto(base);
  await page.evaluate(() => {
    localStorage.setItem("buddymon-save", JSON.stringify({ at: 1, map: "route29", x: 1, y: 9, dir: 2,
      player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true, GOT_BUDDYGEAR: true, GOT_EGG: true }, bag: { tonic: 1 }, party: [makeMon("bramblet", 8)] } }));
  });
  await page.reload();
  await page.tap("#play");
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  for (let i = 0; i < 3; i++) await key("A");
  await page.waitForFunction(() => HD.last.map.key === "route29", null, { timeout: 8000 });
  await page.evaluate(() => { Game.msgMs = 60; });

  // West end of Route 29 leads into Cherrygrove (arrive at its east side); one step in, the rival ambushes you.
  await page.evaluate(() => { setKey("LEFT", true); });
  await page.waitForFunction(() => Game.state.map.key === "cherrygrove", null, { timeout: 6000 });
  await page.evaluate(() => { setKey("LEFT", false); });
  let s = await here();
  if (s.map !== "cherrygrove" || s.x < 36) fail("Route 29 should lead to Cherrygrove's east side", s);
  await page.evaluate(() => setKey("LEFT", true));
  await page.waitForFunction(() => Game.script, null, { timeout: 4000 }).catch(() => fail("the rival should ambush you"));
  await page.evaluate(() => setKey("LEFT", false));
  // Win the trainer battle by always choosing the first move; tap through text.
  for (let i = 0; i < 300 && (await running()); i++) {
    if (await page.$("#hd .ask input")) { await page.fill("#hd .ask input", "Pip"); await page.tap("#hd .ask button"); }
    const m = await page.evaluate(() => { const x = HD.last.battle && HD.last.battle.menu; return x ? x.kind : null; });
    if (m === "cmd") await pick(0);
    else if (m === "moves") await pick(0);
    else if (m === "party") await pick(0);
    else await key("A");
  }
  const after = await page.evaluate(() => ({ done: Game.player.flags.RIVAL_CHERRYGROVE_DONE, hp: Game.player.party[0].hp, max: statsFor(Game.player.party[0]).hp, rival: Game.state.objects.some((o) => o.name === "RIVAL"), money: Game.player.money }));
  if (!after.done || after.hp !== after.max || after.rival) fail("after the fight the rival leaves and your party is healed", after);
  await page.screenshot({ path: `${out}/c1-after-rival.png` });

  // The Guide Gent's tour ends with a MAP CARD and him going home.
  await page.evaluate(() => Game.warp("cherrygrove", 32, 7, 1));
  await page.waitForTimeout(400);
  await key("A");
  for (let i = 0; i < 160 && (await running()); i++) { if (await page.evaluate(() => !!Game.state.boxes.length)) await pick(0); else await key("A"); }
  const gent = await page.evaluate(() => ({ card: Game.player.flags.GOT_MAP_CARD, gone: !Game.state.objects.some((o) => o.name === "GRAMPS") }));
  if (!gent.card || !gent.gone) fail("the tour should give a MAP CARD and the Gent goes home", gent);

  // The Mart: buy two tonics. Nets are sold out until the egg errand is done.
  await page.evaluate(() => Game.warp("cgmart", 1, 5, 1));
  await page.waitForTimeout(300);
  await key("A"); // counter at (1,4)
  await key("A"); // welcome
  await pick(0); // BUY
  const rows = await page.evaluate(() => Game.state.panel && Game.state.panel.rows.map((r) => r.label));
  if (rows?.join() !== "TONIC,REMEDY") fail("before the errand the Mart sells no nets (tonics and remedies only)", rows);
  const money0 = await page.evaluate(() => Game.player.money), tonic0 = await page.evaluate(() => Game.player.bag.tonic);
  await pick(0);
  await key("RIGHT"); await key("A"); // quantity 2, confirm
  await pick(0); // YES
  const bought = await page.evaluate(() => ({ tonic: Game.player.bag.tonic, money: Game.player.money }));
  if (bought.tonic !== tonic0 + 2 || bought.money !== money0 - 600) fail("two tonics cost 600", { tonic0, ...bought });
  await key("A"); // "Here you are!"
  await key("B"); // leave BUY
  await pick(2); // QUIT
  await talkOut();

  // The Center heals and remembers where you healed.
  await page.waitForFunction(() => !Game.script, null, { timeout: 8000 });
  await page.evaluate(() => { Game.state.panel = null; Game.player.party[0].hp = 1; Game.warp("cgcenter", 3, 3, 1); });
  await page.waitForTimeout(300);
  await key("A");
  for (let i = 0; i < 100 && (await running()); i++) { if (await page.evaluate(() => !!Game.state.boxes.length)) await pick(0); else await key("A"); }
  const healed = await page.evaluate(() => ({ hp: Game.player.party[0].hp, max: statsFor(Game.player.party[0]).hp, spot: Game.player.lastCenter && Game.player.lastCenter.map }));
  if (healed.hp !== healed.max || healed.spot !== "cgcenter") fail("the nurse should heal you and set your home Center", healed);

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

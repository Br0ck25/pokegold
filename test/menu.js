#!/usr/bin/env node
// The Start menu and its screens through the real UI: party (use a tonic), pack, trainer card, save, options, exit.
// Usage: node test/menu.js [baseUrl=http://127.0.0.1:8787] [outDir=test/out]   (dev server must be running)
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
  const key = (k) => page.evaluate((k) => { setKey(k, true); setTimeout(() => setKey(k, false), 130); }, k).then(() => page.waitForTimeout(420));
  const pick = (i) => page.evaluate((i) => Game.pick(i), i).then(() => page.waitForTimeout(380));
  const panel = () => page.evaluate(() => Game.state.panel && { title: Game.state.panel.title, rows: Game.state.panel.rows.map((r) => r.label + (r.right ? " " + r.right : "")), lines: Game.state.panel.lines || [] });
  const box = () => page.evaluate(() => (Game.state.boxes[0] ? Game.state.boxes[0].rows.map((r) => r.text) : null));
  const say = () => page.evaluate(() => Game.state.dialogue && Game.state.dialogue.text);

  await page.goto(base);
  await page.evaluate(() => {
    const mon = makeMon("bramblet", 5); mon.hp = 5;
    localStorage.setItem("buddymon-save", JSON.stringify({ at: 1, map: "route29", x: 54, y: 9, dir: 2,
      player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true, GOT_BUDDYGEAR: true, GOT_BUDDYDEX: true }, bag: { tonic: 2, berry: 1, buddy_net: 3 }, party: [mon] } }));
  });
  await page.reload();
  await page.tap("#play");
  await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
  for (let i = 0; i < 3; i++) await key("A");
  await page.waitForFunction(() => HD.last.map.key === "route29", null, { timeout: 8000 });

  const max = await page.evaluate(() => statsFor(Game.player.party[0]).hp);
  await key("START");
  let b = await box();
  if (b?.join() !== "BUDDYDEX,BUDDYMON,PACK,BUDDYGEAR,Ash,SAVE,OPTION,EXIT") fail("Start menu entries", b);
  await page.screenshot({ path: `${out}/m1-start.png` });

  // Party: use a tonic on the hurt buddymon.
  await pick(1);
  let p = await panel();
  if (p?.title !== "BUDDYMON" || !new RegExp(`5/${max}`).test(p.rows[0])) fail(`party screen should list Bramblet 5/${max}`, p);
  await page.screenshot({ path: `${out}/m2-party.png` });
  await pick(0); await pick(2); await pick(0); // row, ITEM, TONIC
  if (!new RegExp(`regained ${Math.min(20, max - 5)} HP`).test((await say()) || "")) fail("tonic should restore up to 20 HP, capped at max", await say());
  await key("A");
  if ((await page.evaluate(() => [Game.player.party[0].hp, Game.player.bag.tonic].join())) !== `${Math.min(25, max)},1`) fail("hp restored and one tonic left");
  await pick(0); await pick(0); // row, STATS
  p = await panel();
  if (!/Lv 5/.test(p.lines[0])) fail("stats screen", p);
  await page.screenshot({ path: `${out}/m3-stats.png` });
  await key("B"); await key("B");
  if ((await panel())) fail("B from the party list returns to the Start menu");

  // Pack: pockets.
  await pick(2);
  p = await panel();
  if (p?.rows.join() !== "TONIC x1,SWEET BERRY x1") fail("pack items", p);
  await key("RIGHT");
  p = await panel();
  if (p?.rows.join() !== "BUDDY NET x3") fail("pack nets", p);
  await key("B");

  // Trainer card, BuddyGear.
  await pick(4);
  p = await panel();
  if (!p.lines.some((l) => /3000/.test(l)) || !p.lines.some((l) => /BUDS/.test(l))) fail("trainer card shows BUDS", p);
  await page.screenshot({ path: `${out}/m4-card.png` });
  await key("B");
  await pick(3);
  p = await panel();
  if (p?.title !== "BUDDYGEAR") fail("buddygear screen", p);
  await key("B");

  // Options: text speed.
  await pick(6);
  const before = await page.evaluate(() => Game.msgMs);
  await key("RIGHT");
  if ((await page.evaluate(() => Game.msgMs)) === before) fail("changing text speed should change message time");
  await key("B");

  // Save writes the device save.
  await pick(5); // SAVE
  await pick(0); // YES
  if (!/saved the game/.test((await say()) || "")) fail("save message", await say());
  await key("A");
  const at = await page.evaluate(() => JSON.parse(localStorage.getItem("buddymon-save")).at);
  if (at <= 1) fail("saving should write the save", at);

  // Exit closes the menu and you can walk again.
  await pick(7);
  if ((await box()) || (await panel()) || (await page.evaluate(() => !!Game.script))) fail("EXIT should close the menu");

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

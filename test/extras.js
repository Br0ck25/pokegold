#!/usr/bin/env node
// Move animations (every move has its own effect and plays), boy/girl choice in the intro, and save export/import.
// Usage: node test/extras.js [baseUrl]   (dev server must be running)
const { chromium } = require("playwright");
const fs = require("fs");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
  const page = await ctx.newPage();
  let failed = false;
  const fail = (m, g) => { console.error("FAIL:", m, g === undefined ? "" : JSON.stringify(g)); failed = true; };
  page.on("pageerror", (e) => fail("pageerror " + e.message));
  const tapA = async () => { const b = await page.locator("[data-key=A]").boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(150); };
  const toMenu = async () => {
    await page.tap("#play");
    await page.waitForFunction(() => HD.last && HD.last.screen === "intro", null, { timeout: 12000 });
    await tapA(); await page.waitForFunction(() => HD.last.screen === "title"); await tapA();
    await page.waitForFunction(() => HD.last.screen === "menu");
  };

  // --- Rotate button: a portrait phone that won't lock the screen gets the page turned sideways
  await page.goto(base);
  await page.evaluate(() => { screen.orientation.lock = () => Promise.reject(new Error("no lock")); });
  await page.locator("#rotate").tap();
  const turned = await page.evaluate(() => { const b = document.querySelector("#stage"); return { land: document.body.classList.contains("land"), rot: document.body.classList.contains("rot"), w: b.offsetWidth, h: b.offsetHeight }; });
  if (!turned.land || !turned.rot || turned.w <= turned.h) fail("Rotate turns the game sideways", turned);
  await page.locator("#rotate").tap();
  if (await page.evaluate(() => document.body.classList.contains("rot"))) fail("Rotate again turns it back");

  // --- boy/girl choice (new game, no save)
  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await toMenu(); await tapA();
  for (let i = 0; i < 12 && !(await page.evaluate(() => HD.last.boxes.length)); i++) { await tapA(); await page.waitForTimeout(250); }
  await page.waitForSelector("#hd .popup li");
  const rows = await page.locator("#hd .popup li").allTextContents();
  if (rows.join() !== "BOY,GIRL") fail("the intro asks BOY or GIRL before the name", rows);
  const boyLook = await page.evaluate(() => Art.heroSprite(0));
  await page.locator("#hd .popup li").nth(1).tap();
  await page.waitForSelector("form.ask input", { timeout: 5000 });
  const girl = await page.evaluate(() => ({ g: Game.player.gender, same: Art.heroSprite(0) === 0 }));
  if (girl.g !== 1) fail("choosing GIRL stores gender 1", girl);
  if ((await page.evaluate(() => Art.heroSprite(0))) === boyLook) fail("the girl looks different from the boy");

  // --- every move has an effect that plays
  await page.goto(base);
  await page.evaluate(() => localStorage.setItem("buddymon-save", JSON.stringify({ at: Date.now(), map: "route29", x: 54, y: 9, dir: 2,
    player: { name: "Ash", money: 3000, flags: { GOT_STARTER: true }, bag: { buddy_net: 5 }, party: [makeMon("bandit", 20)] } })));
  await page.reload();
  await toMenu(); await tapA();
  await page.waitForFunction(() => HD.last.map.key === "route29");
  const missing = await page.evaluate(() => Object.entries(MOVES).filter(([, m]) => !Art.moveFx[m.anim]).map(([id]) => id));
  if (missing.length) fail("every move names a known animation", missing);
  await page.evaluate(() => { Game.run(async (s) => { await Game.battle(s, makeMon("nibblet", 30)); }); });
  await page.waitForSelector(".bt-menu:not([hidden]) button", { timeout: 8000 });
  const anims = [...new Set(await page.evaluate(() => Object.values(MOVES).map((m) => m.anim)))];
  for (const [n, anim] of anims.entries()) {
    const ok = await page.evaluate(async ([anim, n]) => {
      const B = Game.state.battle;
      B.fx = { n: 1000 + n, who: n % 2 ? "foe" : "me", type: "normal", anim, hurts: true, kind: "move" };
      await new Promise((r) => setTimeout(r, 200));
      const box = document.querySelector(`#hd .bt-side .fx[data-anim=${anim}]`);
      return !!box && box.querySelectorAll("svg .p, svg .jaw").length > 0;
    }, [anim, n]);
    if (!ok) fail(`${anim} draws its effect`);
    if (["scratch", "bite", "flame", "bolt", "vine"].includes(anim)) await page.screenshot({ path: `test/out/fx-${anim}.png` });
    await page.waitForTimeout(900);
  }

  // Animations stay on the side that acts: after we attack, the foe's old lunge class must not replay, and the other way round.
  const sides = async (who, n) => page.evaluate(async ([who, n]) => {
    Game.state.battle.fx = { n, who, type: "normal", anim: "scratch", hurts: true, kind: "move" };
    await new Promise((r) => setTimeout(r, 120));
    const cls = (side) => document.querySelector(`#hd .bt-side.${side} .mon`).className;
    return { me: cls("me"), foe: cls("foe") };
  }, [who, n]);
  const a1 = await sides("me", 2001); await page.waitForTimeout(700);
  const a2 = await sides("foe", 2002); await page.waitForTimeout(700);
  const a3 = await sides("me", 2003);
  if (!/lunge-me/.test(a1.me) || /lunge-foe/.test(a1.foe)) fail("our attack lunges only our side", a1);
  if (!/lunge-foe/.test(a2.foe) || /lunge-me/.test(a2.me)) fail("the foe's attack lunges only its side", a2);
  if (!/lunge-me/.test(a3.me) || /lunge-foe/.test(a3.foe)) fail("our second attack still lunges only our side", a3);
  await page.waitForTimeout(900);

  // --- export and import
  await page.evaluate(() => { Game.state.screen = null; });
  await page.locator("#account-btn").click();
  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("#save-export").click()]);
  const file = "test/out/export.json";
  await dl.saveAs(file);
  const saved = JSON.parse(fs.readFileSync(file, "utf8"));
  if (saved.player.name !== "Ash" || saved.map !== "route29") fail("the export is the current save", { name: saved.player.name, map: saved.map });
  saved.player.name = "Imported"; saved.player.party[0].level = 33;
  fs.writeFileSync("test/out/import.json", JSON.stringify(saved));
  await page.setInputFiles("#save-file", "test/out/import.json");
  await page.waitForFunction(() => document.querySelector("#hd") && !!localStorage.getItem("buddymon-save") && JSON.parse(localStorage.getItem("buddymon-save")).player.name === "Imported");
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("buddymon-save")).player.name);
  if (after !== "Imported") fail("the imported save survives the reload", after);
  fs.writeFileSync("test/out/bad.json", "{\"hello\":1}");
  await page.locator("#account-btn").click();
  await page.setInputFiles("#save-file", "test/out/bad.json");
  await page.waitForTimeout(300);
  if (!/not a Buddymon save/.test(await page.locator("#acct-msg").textContent())) fail("a wrong file is refused");

  await browser.close();
  if (failed) process.exit(1);
  console.log("extras: ok");
})().catch((e) => { console.error(e); process.exit(1); });

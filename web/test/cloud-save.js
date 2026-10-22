#!/usr/bin/env node
// Regression: opening the game in a browser that already has a local save while a different save
// exists in the cloud must not throw, and the chosen save must be what the emulator loads.
// Usage: node test/cloud-save.js [baseUrl=http://127.0.0.1:8787]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 } });
  const page = await ctx.newPage();
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });
  page.on("dialog", (d) => d.accept()); // "use the cloud save?"

  const play = async () => {
    await page.goto(base);
    await page.click("#play");
    await page.waitForFunction(() => document.getElementById("start").hidden, null, { timeout: 60000 });
  };
  const stored = () => page.evaluate(async () => {
    const rom = new Uint8Array(await (await fetch("roms/pokegold.gbc")).arrayBuffer());
    const ram = (await localSaveEntry(saveKey(rom))).cartridgeRam;
    return ram ? hash(ram) : null;
  });
  const putCloud = (fill) => page.evaluate(async (v) => {
    await fetch("/api/me");
    const body = new Uint8Array(0x8000).fill(v);
    return (await fetch("/api/save/gold", { method: "PUT", body })).ok;
  }, fill);
  const cloudHash = (fill) => page.evaluate((v) => hash(new Uint8Array(0x8000).fill(v)), fill);

  await page.goto(base);
  await putCloud(0x11);
  await play(); // 1st open: nothing local, cloud applied
  if ((await stored()) !== (await cloudHash(0x11))) { console.error("FAIL: first open did not use the cloud save"); failed = true; }

  await putCloud(0x22); // cloud changes elsewhere
  await play(); // 2nd open in the same browser: local exists and differs -> prompt -> accept
  if ((await stored()) !== (await cloudHash(0x22))) { console.error("FAIL: second open did not switch to the new cloud save"); failed = true; }

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

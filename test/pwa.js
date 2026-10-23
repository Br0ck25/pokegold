#!/usr/bin/env node
// Installable app: manifest, icons and a service worker that caches the shell; the game still opens offline.
// Usage: node test/pwa.js [baseUrl=http://127.0.0.1:8787]   (dev server must be running)
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({ viewport: { width: 412, height: 924 } });
  const page = await ctx.newPage();
  let failed = false;
  const fail = (msg, got) => { console.error("FAIL:", msg, got === undefined ? "" : JSON.stringify(got)); failed = true; };
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });

  await page.goto(base);
  const manifest = await page.evaluate(async () => (await fetch(document.querySelector("link[rel=manifest]").href)).json());
  if (manifest.display !== "standalone" || manifest.start_url !== "/") fail("manifest should be a standalone app", manifest);
  const sizes = manifest.icons.map((i) => i.sizes).join();
  if (!sizes.includes("192x192") || !sizes.includes("512x512") || !manifest.icons.some((i) => i.purpose === "maskable")) fail("manifest needs 192, 512 and a maskable icon", sizes);
  for (const icon of manifest.icons) {
    const res = await page.evaluate(async (src) => { const r = await fetch(src); const b = await r.arrayBuffer(); return { type: r.headers.get("content-type"), magic: [...new Uint8Array(b).slice(1, 4)].map((c) => String.fromCharCode(c)).join("") }; }, icon.src);
    if (res.type !== "image/png" || res.magic !== "PNG") fail(`${icon.src} should be a PNG`, res);
  }

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the service worker
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => fail("the service worker should control the page"));
  const cached = await page.evaluate(async () => { const names = await caches.keys(); const c = await caches.open(names[0]); return (await c.keys()).map((r) => new URL(r.url).pathname); });
  if (!["/", "/app.js", "/style.css"].every((p) => cached.includes(p))) fail("the shell should be cached", cached);

  await ctx.setOffline(true);
  await page.reload();
  const title = await page.title();
  const hasPlay = await page.$("#play");
  if (title !== "Buddymon Gold" || !hasPlay) fail("the game should open offline", { title, hasPlay: !!hasPlay });

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

#!/usr/bin/env node
// Draws the app icons (src/page/icons/*.png) from the Bandit art. Run with the dev server up: node tools/make-icons.js
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  await page.goto(process.argv[2] || "http://127.0.0.1:8787");
  const cat = await page.evaluate(() => Art.bandit().replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""));
  const icon = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2d4a9a"/><stop offset="1" stop-color="#0b1022"/></radialGradient>
    <linearGradient id="moon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe98a"/><stop offset="1" stop-color="#ffb62e"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#bg)"/><circle cx="256" cy="250" r="${190 - pad}" fill="url(#moon)" stroke="#0b1730" stroke-width="10"/>
    <g transform="translate(${256 - (170 - pad * 0.9)} ${262 - (170 - pad * 0.9)}) scale(${(340 - pad * 1.8) / 200})">${cat}</g></svg>`;
  const out = path.join(__dirname, "../src/page/icons");
  for (const [name, size, pad] of [["icon-192", 192, 0], ["icon-512", 512, 0], ["maskable-512", 512, 40]]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<body style="margin:0">${icon(pad).replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
    fs.writeFileSync(path.join(out, `${name}.png`), await page.screenshot({ type: "png" }));
  }
  await browser.close();
})();

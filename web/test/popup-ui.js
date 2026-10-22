#!/usr/bin/env node
// Popup box parsing with synthetic tiles: a text-only box keeps its first letter, a cursor box marks the selection, scenery tiles are not boxes.
// Usage: node test/popup-ui.js [baseUrl=http://127.0.0.1:8787]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await (await browser.newContext()).newPage();
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });
  await page.goto(base);
  const boxes = await page.evaluate(() => {
    const A = 0x80, tiles = new Uint8Array(360).fill(0x7f);
    const put = (row, col, text) => [...text].forEach((c, i) => (tiles[row * 20 + col + i] = A + c.charCodeAt(0) - 65));
    const box = (r0, c0, r1, c1) => {
      tiles[r0 * 20 + c0] = 0x79; tiles[r0 * 20 + c1] = 0x7b; tiles[r1 * 20 + c0] = 0x7d; tiles[r1 * 20 + c1] = 0x7e;
      for (let c = c0 + 1; c < c1; c++) tiles[r0 * 20 + c] = tiles[r1 * 20 + c] = 0x7a;
      for (let r = r0 + 1; r < r1; r++) tiles[r * 20 + c0] = tiles[r * 20 + c1] = 0x7c;
    };
    box(0, 10, 3, 19); put(1, 11, "THURSDAY");              // text starts right after the border (no cursor column)
    box(5, 0, 9, 7); tiles[6 * 20 + 1] = 0xed; put(6, 2, "YES"); put(8, 2, "NO"); // cursor in the first interior column
    tiles[12 * 20 + 3] = 0x79;                              // a lone corner id from map scenery is not a box
    return HD.readBoxes(tiles);
  });
  const want = [[{ text: "THURSDAY", selected: false }], [{ text: "YES", selected: true }, { text: "NO", selected: false }]]; // and no third box
  if (JSON.stringify(boxes.map((b) => b.rows)) !== JSON.stringify(want)) { console.error("FAIL boxes:", JSON.stringify(boxes.map((b) => b.rows))); failed = true; }
  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

// LOOK at every outdoor map: renders each world as one big picture with markers (blue W warp/door, magenta c closed-door script, orange s sign,
// green people, red trainers) into test/out/audit-<key>.png. Run it after building or changing a map and check it against `python3 tools/goldmap.py <Name>`.
// Usage: node tools/audit-maps.js [key...]   (dev server must be running)
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto("http://127.0.0.1:8787");
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : ["newbark", "route29", "cherrygrove", "route30", "route31", "violet"];
  for (const key of keys) {
    await page.evaluate((key) => {
      const m = Game.maps[key], w = m.world, cell = Math.floor(1100 / w.cols);
      const mark = (x, y, c, t) => `<div style="position:absolute;left:${x * cell}px;top:${y * cell}px;width:${cell}px;height:${cell}px;box-sizing:border-box;border:2px solid ${c};color:${c};font:bold ${Math.floor(cell * 0.45)}px sans-serif;text-align:center;line-height:${cell}px;background:${c}33">${t}</div>`;
      let ov = "";
      for (const wp of m.warps) ov += mark(wp.x, wp.y, "#00e", "W");
      for (const c of m.coords || []) ov += mark(c.x, c.y, "#e0e", "c");
      for (const s of m.signs || []) ov += mark(s.x, s.y, "#e80", "s");
      for (const n of m.npcs || []) ov += mark(n.x, n.y, n.trainer ? "#d00" : "#080", n.name[0]);
      document.body.style.margin = "0"; document.body.style.background = "#222";
      document.body.innerHTML = `<div style="position:relative;width:${w.cols * cell}px;height:${w.rows * cell}px">${Art.world(w, 0).replace("<svg ", `<svg width="${w.cols * cell}" height="${w.rows * cell}" `)}${ov}</div>`;
    }, key);
    await page.screenshot({ path: `test/out/audit-${key}.png`, fullPage: true });
  }
  await browser.close();
})();

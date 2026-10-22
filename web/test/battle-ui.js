#!/usr/bin/env node
// Battle scene with synthetic game state (no emulator progress needed): HP bars, names, command and move menus.
// Usage: node test/battle-ui.js [baseUrl=http://127.0.0.1:8787]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await (await browser.newContext({ viewport: { width: 412, height: 924 } })).newPage();
  let failed = false;
  page.on("pageerror", (e) => { console.error("pageerror:", e.message); failed = true; });
  await page.goto(base);

  const result = await page.evaluate(() => {
    const A = 0x80, tiles = new Uint8Array(360).fill(0x7f);
    const put = (row, col, text) => [...text].forEach((c, i) => (tiles[row * 20 + col + i] = A + c.charCodeAt(0) - 65));
    const rows = Array(18).fill("");
    rows[1] = "     3 ♀"; rows[8] = "       5 ♂";
    const state = (cursorCol) => {
      tiles.fill(0x7f);
      tiles[14 * 20 + cursorCol] = 0xed;
      put(14, 10, "FIGHT"); tiles[14 * 20 + 16] = 0xe1; tiles[14 * 20 + 17] = 0xe2;
      put(16, 10, "PACK"); put(16, 16, "RUN");
      return { tiles: tiles.slice(), rows, dialogue: null, boxes: [],
        battle: { mode: 1, enemy: { species: 16, level: 3, hp: 10, max: 15, name: "PIDGEY" }, player: { species: 152, level: 5, hp: 20, max: 20, name: "BUDDY" } } };
    };
    const root = document.createElement("div");
    document.body.appendChild(root);
    const scene = Scenes.battle(root);
    scene.update(state(9));
    const first = { hp: root.querySelector(".bt-card.foe .hp i").style.width, name: root.querySelector(".bt-card.foe .nm").textContent,
      cmds: [...root.querySelectorAll(".cmds button")].map((b) => b.textContent), sel: root.querySelector(".cmds .sel")?.textContent };
    scene.update(state(15));
    const second = root.querySelector(".cmds .sel")?.textContent;
    return { first, second };
  });

  const expect = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) { console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); failed = true; } };
  expect("enemy hp bar", result.first.hp, "67%");
  expect("enemy name", result.first.name, "PIDGEY");
  expect("command buttons", result.first.cmds, ["Fight", "Buddymon", "Pack", "Run"]);
  expect("cursor on Fight", result.first.sel, "Fight");
  expect("cursor on Buddymon", result.second, "Buddymon");
  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();

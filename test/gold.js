#!/usr/bin/env node
// Every native map must match Gold's map (snapshots in tools/gold/*.json, made by tools/goldmap.py --json): same size, same walls / grass / water,
// the same building footprints, doors, signs and people at the same cells. Differences must be listed in ALLOW below with a reason.
// Usage: node test/gold.js [baseUrl]   (dev server must be running)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const base = process.argv[2] || "http://127.0.0.1:8787";
const MAPS = {
  bedroom: "PlayersHouse2F", livingroom: "PlayersHouse1F", newbark: "NewBarkTown", willowlab: "ElmsLab", neighbor: "PlayersNeighborsHouse", willowhouse: "ElmsHouse",
  route29: "Route29", gate29: "Route29Route46Gate", cherrygrove: "CherrygroveCity", cgmart: "CherrygroveMart", cgcenter: "CherrygrovePokecenter1F",
  cggent: "GuideGentsHouse", cggym: "CherrygroveGymSpeechHouse", cgevo: "CherrygroveEvolutionSpeechHouse", route30: "Route30", mrbuddy: "MrPokemonsHouse",
  route31: "Route31", gate31: "Route31VioletGate", violet: "VioletCity", vmart: "VioletMart", vcenter: "VioletPokecenter1F", vnickname: "VioletNicknameSpeechHouse",
  academy: "EarlsPokemonAcademy", violetgym: "VioletGym",
};
// Things Gold has that we deliberately do not have yet, as "map:x,y" or "map:what". Each needs a reason; shrink this list, never grow it casually.
const ALLOW = JSON.parse(fs.readFileSync(path.join(__dirname, "gold-allow.json"), "utf8"));

(async () => {
  const gold = Object.fromEntries(Object.entries(MAPS).map(([k, g]) => [k, JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tools", "gold", `${g}.json`), "utf8"))]));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  await page.goto(base);
  const problems = await page.evaluate(([gold, allow]) => {
    const out = [];
    const say = (key, msg) => { if (!allow[`${key}:${msg.id}`]) out.push(`${key}: ${msg.text}`); };
    for (const [key, g] of Object.entries(gold)) {
      const m = Game.maps[key];
      if (!m) { out.push(`${key}: map missing`); continue; }
      const w = m.solid[0].length, h = m.solid.length;
      if (w !== g.w || h !== g.h) { say(key, { id: "size", text: `size ${w}x${h}, Gold ${g.w}x${g.h}` }); continue; }
      const warpAt = (x, y) => (m.warps || []).some((p) => p.x === x && p.y === y) || (m.coords || []).some((c) => c.x === x && c.y === y);
      // doors
      for (const wp of g.warps) if (!warpAt(wp.x, wp.y)) say(key, { id: `door${wp.x},${wp.y}`, text: `Gold door (${wp.x},${wp.y}) -> ${wp.to} has no warp or closed-door script` });
      // signs
      for (const s of g.signs) if (!(m.signs || []).some((n) => n.x === s.x && n.y === s.y)) say(key, { id: `sign${s.x},${s.y}`, text: `Gold sign (${s.x},${s.y}) ${s.script} missing` });
      for (const n of m.signs || []) if (!g.signs.some((s) => n.x === s.x && n.y === s.y)) say(key, { id: `xsign${n.x},${n.y}`, text: `extra sign at (${n.x},${n.y})` });
      // people
      for (const o of g.objects) if (!(m.npcs || []).some((n) => n.x === o.x && n.y === o.y)) say(key, { id: `npc${o.x},${o.y}`, text: `Gold ${o.sprite} (${o.x},${o.y}) ${o.script} missing` });
      for (const n of m.npcs || []) if (!g.objects.some((o) => n.x === o.x && n.y === o.y)) say(key, { id: `xnpc${n.x},${n.y}`, text: `extra person ${n.name} at (${n.x},${n.y})` });
      // terrain
      const wd = m.world;
      let bad = 0, first = "";
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const gc = g.grid[y][x];
        if (g.warps.some((p) => p.x === x && p.y === y)) continue;
        let ours;
        if (wd) {
          const b = (wd.buildings || []).some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
          const c = wd.cells[y][x];
          ours = b ? "wall" : c === "g" ? "g" : c === "w" ? "w" : "v><RL".includes(c) ? c : "TScrC".includes(c) ? "wall" : "floor";
        } else ours = m.solid[y][x] === "#" ? "wall" : "floor";
        const want = gc === "." ? "floor" : gc === "g" ? "g" : gc === "w" ? "w" : "v><RL".includes(gc) ? gc : "wall";
        const okay = ours === want || (!wd && want === "g" && ours === "floor");
        if (!okay) { bad++; if (!first) first = `(${x},${y}) is ${ours}, Gold ${want}`; }
      }
      if (bad) say(key, { id: "terrain", text: `${bad} cells differ from Gold's terrain, first ${first}` });
      // building footprints (outdoor)
      if (wd) for (const gb of g.buildings) {
        const ours = (wd.buildings || []).find((r) => r.x === gb.x && r.y === gb.y);
        if (!ours || ours.w !== gb.w || ours.h !== gb.h) say(key, { id: `bld${gb.x},${gb.y}`, text: `building at (${gb.x},${gb.y}) should be ${gb.w}x${gb.h}${ours ? `, ours ${ours.w}x${ours.h}` : ", missing"}` });
      }
    }
    return out;
  }, [gold, ALLOW]);
  problems.forEach((p) => console.error("FAIL:", p));
  console.log(problems.length ? `FAILED (${problems.length})` : "OK");
  await browser.close();
  process.exitCode = problems.length ? 1 : 0;
})();

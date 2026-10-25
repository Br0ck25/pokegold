#!/usr/bin/env node
// Gold's text, map by map: every paragraph the disassembly says for a built map must be in our map file (or be named there as a label), except the
// ones listed in test/text-allow.json (story we have not built yet). The allowed number per map may only go down.
// Usage: node test/text.js   (needs python3 and the Gold branch at /home/user/pokegold; no dev server)
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const allow = JSON.parse(fs.readFileSync(path.join(__dirname, "text-allow.json"), "utf8"));
const py = "import importlib.util,sys\nsys.argv=['x']\ns=importlib.util.spec_from_file_location('g','tools/gen-terrain.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(' '.join(m.BUILT))";
const built = execFileSync("python3", ["-c", py], { cwd: root, encoding: "utf8" }).trim().split("\n").pop().split(/\s+/);
const gameFiles = fs.readdirSync(path.join(root, "src/game")).filter((f) => f.endsWith(".js")).map((f) => path.join("src/game", f));
const libFiles = fs.readdirSync(path.join(root, "src/game/lib")).map((f) => path.join("src/game/lib", f));
let failed = false;
for (const gold of built) {
  const files = gameFiles.filter((f) => fs.readFileSync(path.join(root, f), "utf8").includes(`"${gold}"`));
  const r = spawnSync("python3", ["tools/goldtext.py", gold, "--audit", ...files, ...libFiles], { cwd: root, encoding: "utf8" });
  const missing = r.stdout.split("\n").filter((l) => l.startsWith("MISSING")).length;
  const ok = allow[gold] ?? 0;
  if (missing > ok) { failed = true; console.error(`FAIL: ${gold}: ${missing} Gold paragraphs missing (allowed ${ok}). Run: tools/audit-text.sh ${gold}`); }
  else if (missing < ok) console.log(`note: ${gold} now misses ${missing}; lower test/text-allow.json from ${ok}`);
}
if (failed) process.exit(1);
console.log("OK");

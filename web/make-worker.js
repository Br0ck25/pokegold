#!/usr/bin/env node
// Writes paste/worker.js: one self-contained file you can paste into the
// Cloudflare dashboard's Worker editor (page, app, and ROM(s) embedded).
// Usage: node make-worker.js [gold] [silver]     (default: gold)
// Build the ROMs first (./build.sh). The only binding it needs is a KV
// namespace named SAVES.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const games = process.argv.slice(2).length ? process.argv.slice(2) : ["gold"];
const read = (f) => fs.readFileSync(path.join(__dirname, f));

const roms = {};
for (const g of games) {
  const rom = path.join("public/roms", `poke${g}.gbc`);
  if (!fs.existsSync(path.join(__dirname, rom))) throw new Error(`${rom} missing; run ./build.sh`);
  roms[g] = zlib.gzipSync(read(rom), { level: 9 }).toString("base64");
}

let html = read("public/index.html").toString();
html = html.replace("vendor/wasmboy.wasm.iife.js", "https://cdn.jsdelivr.net/npm/wasmboy@0.7.1/dist/wasmboy.wasm.iife.js");
for (const g of ["gold", "silver"]) {
  if (!roms[g]) html = html.replace(new RegExp(`\\s*<option value="${g}">.*</option>`), "");
}

// Every text asset under public/ (app, styles, the hd/ layer) except the big
// generated folders, which are loaded from a CDN or embedded separately.
const files = { "/index.html": html };
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(__dirname, "public", dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) { if (!["roms", "vendor", "hd"].includes(rel)) walk(rel); }
    else if (/\.(js|css)$/.test(entry.name)) files["/" + rel] = read(path.join("public", rel)).toString();
  }
};
walk("");
const embedded = { files, roms };

fs.mkdirSync(path.join(__dirname, "paste"), { recursive: true });
const out = path.join(__dirname, "paste/worker.js");
fs.writeFileSync(out, `const EMBEDDED = ${JSON.stringify(embedded)};\n\n${read("src/worker.js")}`);
console.log(`${out}: ${(fs.statSync(out).size / 1e6).toFixed(2)} MB (${games.join(", ")})`);

#!/usr/bin/env node
// Concatenates public/hd/**/* into public/hd.bundle.js and hd.bundle.css so a new
// art/scene/ui file needs no manual registration. Order: core/registry first, then
// ui, art, scenes, the rest of core (engine) and generated syms.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public/hd");
const order = ["core/registry.js", "ui", "art", "scenes", "core", "."];
const seen = new Set();
const collect = (ext) => {
  const files = [];
  const add = (rel) => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return;
    if (fs.statSync(abs).isDirectory()) {
      for (const f of fs.readdirSync(abs).sort()) if (!fs.statSync(path.join(abs, f)).isDirectory()) add(path.join(rel, f));
    } else if (abs.endsWith(ext) && !seen.has(abs)) {
      seen.add(abs);
      files.push(rel);
    }
  };
  for (const entry of order) add(entry);
  return files;
};

const build = (ext, header) => {
  const files = collect(ext);
  const body = files.map((f) => `/* ${f} */\n${fs.readFileSync(path.join(root, f), "utf8")}`).join("\n");
  fs.writeFileSync(path.join(__dirname, `public/hd.bundle${ext}`), header + body);
  return files.length;
};

const nJs = build(".js", '"use strict";\n');
const nCss = build(".css", "");
console.log(`hd.bundle: ${nJs} js, ${nCss} css`);

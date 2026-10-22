# Buddymon Gold

Fork of pret/pokegold (Game Boy asm) being turned into an original game that runs in the browser from a
Cloudflare Worker. The ROM is the game engine; `web/` is the Worker + an HD vector layer drawn over the emulator.

## Working rules
1. **Think before coding.** Don't assume; don't hide confusion; surface tradeoffs.
   State assumptions. If unsure, ask. If several interpretations exist, present them, don't pick silently.
   If a simpler approach exists, say so and push back. If something is unclear, stop and name it.
2. **Simplicity first.** Minimum code that solves the problem. Nothing speculative: no extra features,
   no single-use abstractions, no unrequested configurability, no error handling for impossible cases.
   200 lines that could be 50 -> rewrite. Ask: would a senior engineer call this overcomplicated?
3. **Surgical changes.** Touch only what you must. Don't "improve" adjacent code/comments/formatting or
   refactor what isn't broken. Match existing style. Mention unrelated dead code, don't delete it. Remove only
   orphans YOUR change created. Every changed line must trace to the request.
4. **Goal-driven execution.** Turn tasks into verifiable goals (bug -> reproduce, then fix; refactor -> tests
   pass before/after). For multi-step work state a plan: `1. step -> verify: check`. Loop until verified.

## Map (read only what you need)
- ROM source: `engine/ home/ data/ constants/ ram/ maps/ gfx/` (pret layout). Build: `make gold` (needs rgbds 1.0.1).
- `web/src/worker.js` Worker (assets or embedded + KV saves). `web/make-worker.js` -> `web/paste/worker.js` (paste-in file; hand it to the user with SendUserFile, never Read it).
- `web/public/app.js` page logic, touch pad, cloud save. `web/public/style.css` shell/pad.
- `web/public/hd/` HD layer, one small file per thing, CSS beside its JS:
  `core/` engine+registry, `ui/` shared bits, `art/` SVG art, `scenes/` one screen each. See `web/docs/UI.md`.
- Start-up screens (splash, cinematic) are HD scenes; old pixel intro/splash code and gfx were deleted. Credits still show the old copyright text.
- `gfx/pokemon/<slot>/*.svg` creature art -> PNG via `tools/svgpic.py` (pixel fallback only).
- Rules for UI/UX/art: **`web/docs/UI.md`**.

## Commands (from `web/`)
- `npm run build` ROM + bundle + symbols. `npm run dev` local at :8787. `npm test` touch flow at 412x924 (dev must run).
- `node make-worker.js [gold silver]` -> `paste/worker.js`. Deploy: `npm run deploy`.

## Save tokens
- Never read generated/binary files (blocked in `.claude/settings.json`): `*.o *.sym *.map *.gbc *.2bpp *.lz`,
  `web/public/{roms,vendor,hd.bundle.*}`, `node_modules`; also never Read `web/paste/worker.js` (1 MB). Find a RAM address with
  `grep -w wName pokegold.sym`, not by opening the file.
- Edit the source file, not the bundle. Keep files under ~150 lines; split by scene/creature, not by type.
- Use Grep/Glob before Read; Read with offset/limit on big asm files. A new art/scene file needs no registration
  (`web/bundle.js` globs `public/hd`). Add RAM symbols in `web/build.sh` only.
- Don't restate big files in replies; refer to `path:line`.
- Don't commit generated output (`web/public/hd/syms.js`, bundles, ROMs, paste, test/out); they are gitignored.

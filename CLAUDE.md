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
   **Exception (this repo): when new code replaces old, delete the old code, art, data and tests in the same change.**
   If it is entangled with shared tables, say what is left and why (still left: GS-intro/Game Freak entries in the
   index-coupled `data/sprite_anims` tables, `PREDEFPAL_*` intro palettes, `Sfx_GameFreakLogoGs`).
4. **Goal-driven execution.** Turn tasks into verifiable goals (bug -> reproduce, then fix; refactor -> tests
   pass before/after). For multi-step work state a plan: `1. step -> verify: check`. Loop until verified.

## Map (read only what you need)
- ROM source: `engine/ home/ data/ constants/ ram/ maps/ gfx/` (pret layout). Build: `make gold` (needs rgbds 1.0.1).
- `web/src/worker.js` Worker (assets or embedded + KV saves). `web/make-worker.js` -> `web/paste/worker.js` (the paste-in file; it embeds the ROM, so keep the repo private. COMMIT the regenerated file with every push: the user copies it from GitHub. Never Read it).
- `web/public/app.js` page logic, touch pad, cloud save. `web/public/style.css` shell/pad.
- `web/public/hd/` HD layer, one small file per thing, CSS beside its JS:
  `core/` engine+registry, `ui/` shared bits (dialogue, popup, actors), `art/` SVG art, `scenes/` one screen each (room, world, ...).
  Species art: `art/creature.js` (hand-drawn) + `art/critter.js` (procedural placeholder). Generated: `hd/syms.js` (RAM addresses, `web/build.sh`), `hd/maps.js` (outdoor map blocks, `web/gen-maps.py`). See `web/docs/UI.md`.
- Start-up screens (splash, cinematic) are HD scenes; old pixel intro/splash code and gfx were deleted. Credits still show the old copyright text.
- `gfx/pokemon/<slot>/*.svg` creature art -> PNG via `tools/svgpic.py` (pixel fallback only).
- Rules for UI/UX/art: **`web/docs/UI.md`**.

## World naming (game text)
Rename a name only when the game reaches it, and rename it everywhere it appears in that part (strings, tables, HD labels).
Done so far: Buddymon / BUDDYDEX / BUDDYGEAR / BUDDY BALL (everywhere), PROF. WILLOW (was Elm), PROF. ASPEN (was Oak) in the radio text,
your room, the neighbor's house and Willow's lab, the starters BRAMBLET / SPARKIT / CHOMPLET, and the Route 29 species CHIRPLET (Pidgey) / NIBBLET (Rattata) / PEEKAT (Sentret) / HOOTLING (Hoothoot).
Evolutions of all of these are still the old names. A species is renamed in the table and in every string at once.
Not yet: Oak in Pallet Town / his lab / Pokecenter PC / Mr. Buddymon's house / Radio Tower / Lance, every other species, other characters, towns.
Use the full words in strings (trainer class names have a 12-char limit); `#`-shorthand must not come back.

## Commands (from `web/`)
- `npm run build` ROM + bundle + symbols. `npm run dev` local at :8787. `npm test` touch flow at 412x924 (dev must run).
- `node make-worker.js [gold silver]` -> `paste/worker.js`. Deploy: `npm run deploy`.

## Save tokens
- Never read generated/binary files (blocked in `.claude/settings.json`): `*.o *.sym *.map *.gbc *.2bpp *.lz`,
  `web/public/{roms,vendor,hd.bundle.*}`, `node_modules`; also never Read `web/paste/worker.js` (1 MB). RAM addresses:   nothing to look up in the file: add the symbol to the list in `web/build.sh` and read it from `HD_SYMS` (generated `hd/syms.js`).
- Edit the source file, not the bundle. Keep files under ~150 lines; split by scene/creature, not by type.
- Use Grep/Glob before Read; Read with offset/limit on big asm files. A new art/scene file needs no registration
  (`web/bundle.js` globs `public/hd`). Add RAM symbols in `web/build.sh` only.
- Don't restate big files in replies; refer to `path:line`.
- Don't commit generated output (`web/public/hd/syms.js`, bundles, ROMs, test/out); they are gitignored. Exception: `web/paste/worker.js` is committed.

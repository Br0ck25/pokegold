# Buddymon

An original monster-collecting game in the spirit of Pokemon Gold, written from scratch to run in a phone browser (target Pixel 9)
from one Cloudflare Worker file. No emulator, no ROM. Layouts, story, names and art are original; the rules and feel follow Gold
(how Gold does a thing is in `docs/ENGINE.md`; read it, and read the old disassembly on branch `claude/fervent-brahmagupta-2v8nau` if you need detail).
Catching uses buddy nets instead of balls. Accounts are optional (guest cookie by default).

## Working rules
1. **Think before coding.** Don't assume; state assumptions; if unsure, ask; if several interpretations exist, present them; push back on complexity.
2. **Simplicity first.** Minimum code that solves the problem; nothing speculative; no single-use abstractions.
3. **Surgical changes.** Touch only what you must; match existing style; every changed line traces to the request.
   When new code replaces old, delete the old code, art, data and tests in the same change.
4. **Goal-driven.** Turn tasks into verifiable goals (bug -> reproduce then fix; feature -> test). Loop until verified.

5. **Build every scene from Gold's own data, never from memory or guesses.** The procedure (each step is enforced or has a script):
   1. `python3 tools/goldmap.py <GoldMapName>` prints the real cell grid, building footprints, signs, people and connections. Read `maps/<Name>.asm` (scripts, text, movement)
      with `git show claude/fervent-brahmagupta-2v8nau:maps/<Name>.asm`, and `engine/` for mechanics (collision types, ledges, cooldowns...).
   2. `python3 tools/add-map.py <GoldName> <nativeKey>` snapshots the map into `tools/gold/`, registers it (`tools/gen-terrain.py` BUILT, `test/gold.js` MAPS), regenerates
      `src/game/data/terrain.js` (**generated, never hand-edited**) and prints a map-file skeleton with everything at Gold's coordinates.
   3. Write the map with `Game.outdoor(key, gold, {...})` or `Game.indoor(key, gold, {...})` (`src/game/lib/world.js`): terrain, building footprints, doors, arrival cells
      (you arrive ON the matching door tile, as in Gold, so Gold's scripted walks work unchanged) and map-edge roads come from the terrain data. You supply people, signs,
      scripts and texts only. The file's line 2 is `// Gold: <Name>.asm ...` (build.js fails without it). Doors to maps we have not built are closed with a message.
   4. `node test/gold.js` must pass: same size, walls/grass/water/ledges, building footprints, doors, signs and people at the same cells. A deliberate difference goes in
      `test/gold-allow.json` with a reason (e.g. decoration-system objects, events not built yet); never silence a mismatch without one.
   5. Run `node tools/audit-maps.js <key>` / `node tools/audit-rooms.js`, **open the pictures and look** (houses on trees, wrong sizes, signs, doors), then `node test/reach.js` + `npm test`.
   6. **Text, people, trainers and walks come from scripts too.** `python3 tools/goldtext.py <GoldName>` lists every person (sprite, cell, movement, script), trainer (class, party,
      speeches) and text block of a map; `--label _LabelName` prints shared text (data/text/*.asm: Mom's bank, ...); `--audit <our files>` lists Gold text we do not say.
      `python3 tools/gen-text.py` writes `src/game/data/text.js` (`Game.text[GoldMap][Label]`, `Game.moves[GoldMap][Label]` = Gold's movement lists) with our renames and fixes
      (Willow is a woman; nets not balls; add a fix to FIXES in the tool, never edit text.js). In a map file say it with `s.text("Map", "Label")`, `Game.said("Map", "Label")`
      (a whole script), `Game.line("Map", "Label")` (one string for trainer speeches) and walk with `s.follow(who, Game.moves.Map.Label)`. Never retype Gold's text or invent lines.
      `node test/text.js` fails when a built map misses Gold text beyond `test/text-allow.json` (the allowance only goes down).
   Gold facts the engine follows: ledge cells are walkable and pressing their direction jumps two cells over the cliff (C); you can talk across a COUNTER tile; a PC tile opens
   the PC; a map entry starts a 5-step wild-encounter cooldown; trainers' sight comes from the object event. Sign cells on a building footprint are its plaque (no sign drawn).

## Layout (read `MAP.md` first: generated index of every file, its size and purpose)
- `build.js` builds `worker.js` (the page is embedded) and regenerates `MAP.md`. **Commit `worker.js` with every push** (the user pastes it
  into Cloudflare). **Never Read `worker.js`** (blocked in `.claude/settings.json`); read the sources in `src/`.
- Game data (`src/game/data/`: species, moves, items, types) and battle code (`src/game/battle/`: formulas in `calc.js`, flow in `battle.js`). Currency is BUDS (start 3000).
- `src/worker/` the Worker: saves + accounts in KV. `src/page/` the page: `app.js`, `pad.js` (touch), `style.css`, `hd/` the renderer
  (`art/` SVG art, `scenes/` one screen each, `ui/` shared bits, `core/` registry + loop). `src/game/` the engine: `core.js`, `lib/` (input, script verbs, flow, boot/saves, trainers, helpers), `data/`, `battle/`, `menu/`, and one map file per area (loaded last).
- Every source file: header comment on line 1 (feeds `MAP.md`), under 2000 lines (build fails otherwise), aim for ~150. Split by scene/creature.
- Docs: `docs/UI.md` (UI/UX/art rules), `docs/ENGINE.md` (Gold mechanics and our build order).

## Commands
- `npm run build` -> `worker.js` + `MAP.md`. `npm run dev` local at :8787 (wrangler). `npm test` (dev running): accounts and the full game flow at 412x924.
- Installable PWA: `src/page/manifest.json`, `src/page/sw.js` (offline shell cache, versioned by `build.js`), icons in `src/page/icons/` (redraw with `node tools/make-icons.js`). `worker.js` serves them all.
- `npm run deploy`. KV namespace `SAVES` is the only binding.

## Naming (game text)
Buddymon / BUDDYDEX / BUDDYGEAR / buddy nets; PROF. WILLOW; starters BRAMBLET / BANDIT (the tuxedo cat, the author's own cat) / CHOMPLET; Route 29 species CHIRPLET / NIBBLET / PEEKAT / HOOTLING. Evolved forms: BRAMBLEAF, THORNKING, RAIDER, OUTLAW, CHOMPJAW, GATORMAW, SWOOPLET, SKYHAWK, GNAWLER, SCOUTAT, WEBSPINNER, OWLSAGE, FLUTTERBY.
Original names for everything else as it is built; no real Pokemon/Nintendo names or text.

## Save tokens
- Use `MAP.md` + Grep before reading; Read with offset/limit. Don't restate big files in replies; refer to `path:line`.
- Don't commit test output (`test/out`). The audit pictures are for you to look at, not to commit. `worker.js` is the one generated file that is committed.

## Status
Done: home, New Bark, Willow's lab/house, neighbor, Route 29, Cherrygrove, Route 30, Mr. Buddymon's house, Route 31, Violet City, Dark Cave (entrance level), the egg errand
(egg -> Willow -> aide nets -> BUDDYDEX), trainers, genders (BANDIT always female; `SPECIES[x].female` = female share), BUDDYDEX screen.
Rival is named by the player at the officer; his starter is the one that beats yours. Dialogue uses the shared `Game.talk(...)`.
Also in: boy/girl choice in the intro (`player.gender`, 0 boy / 1 girl, `Art.heroLook`), landscape phone layout (`style.css` media query + a `@container` block in `scenes/battle.css`; new wide-screen layouts go in the same style), per-move battle effects (`MOVES[id].anim` -> `Art.moveFx` in `hd/scenes/battleFx.js`; a new move must name an anim, `test/extras.js` checks), save export/import (Account dialog, `app.js`).
Status conditions are in (sleep, poison, burn, paralysis, freeze; REMEDY cures). Everything still missing or half-done is tracked in **`docs/TODO.md`**: add to it whenever you notice a gap, remove items you finish.

## Layout rules (tested by `test/layout.js`, `test/gold.js`)
- Every outdoor exit is a dirt road ("p") that runs off the map edge (generated from Gold's connections); never a bare gap in trees.
- Route 29 is the model of Gold's design: west-bound you must cross tall grass, east-bound ledges give a grass-free way back.
- Panels (party, stats, pack, dex) must fit: every line and the Back button inside the panel at phone size, in the tallest case (stats card).
- Nothing on the battle screen may overlap (sprites, platforms, HUD cards, menu, message box).

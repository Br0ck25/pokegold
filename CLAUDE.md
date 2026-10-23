# Buddymon Gold

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

5. **Study Gold before building a scene.** Read that area's map script and data first (`git show claude/fervent-brahmagupta-2v8nau:maps/<Name>.asm`,
   also `engine/` for mechanics) and reproduce its beats: who walks where, what faces what, which objects exist, what each cell does. Then redraw it with
   original layout, text and art. **Enforced:** every map file starts with a `// Gold: <Map>.asm` line (build.js fails without it); that line is your
   promise that you read the asm (objects, connections, warps, terrain from the `.blk`) and kept its landmarks (e.g. Cherrygrove: big sea, fisher across it). Check every object has art (an unknown name draws as a plain villager) and every sign/trigger cell matches the art.

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
Buddymon / BUDDYDEX / BUDDYGEAR / buddy nets; PROF. WILLOW; starters BRAMBLET / BANDIT (the tuxedo cat, the author's own cat) / CHOMPLET; Route 29 species CHIRPLET / NIBBLET / PEEKAT / HOOTLING.
Original names for everything else as it is built; no real Pokemon/Nintendo names or text.

## Save tokens
- Use `MAP.md` + Grep before reading; Read with offset/limit. Don't restate big files in replies; refer to `path:line`.
- Don't commit test output (`test/out`). `worker.js` is the one generated file that is committed.

## Status
Done: home, New Bark, Willow's lab/house, neighbor, Route 29, Cherrygrove, Route 30, Mr. Buddymon's house, the egg errand
(egg -> Willow -> aide nets -> BUDDYDEX), trainers, genders (BANDIT always female; `SPECIES[x].female` = female share), BUDDYDEX screen.
Rival is named by the player at the officer; his starter is the one that beats yours. Dialogue uses the shared `Game.talk(...)`.
Missing vs Gold: status conditions, PC storage, BuddyGear map/phone, evolutions, Route 31+, gyms.

## Layout rules (tested by `test/layout.js`)
- Every outdoor exit is a dirt path ("p") that runs to the map edge and on out of the map; never a bare gap in trees.
- Routes follow Gold: the way forward crosses tall grass; ledges (down-only) give a grass-free way back. Route 29 is the model.
- Nothing on the battle screen may overlap (sprites, platforms, HUD cards, menu, message box).

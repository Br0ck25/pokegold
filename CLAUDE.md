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
   original layout, text and art. Check every object has art (an unknown name draws as a plain villager) and every sign/trigger cell matches the art.

## Layout (read `MAP.md` first: generated index of every file, its size and purpose)
- `build.js` builds `worker.js` (the page is embedded) and regenerates `MAP.md`. **Commit `worker.js` with every push** (the user pastes it
  into Cloudflare). **Never Read `worker.js`** (blocked in `.claude/settings.json`); read the sources in `src/`.
- Game data (`src/game/data/`: species, moves, items, types) and battle code (`src/game/battle/`: formulas in `calc.js`, flow in `battle.js`). Currency is BUDS (start 3000).
- `src/worker/` the Worker: saves + accounts in KV. `src/page/` the page: `app.js`, `pad.js` (touch), `style.css`, `hd/` the renderer
  (`art/` SVG art, `scenes/` one screen each, `ui/` shared bits, `core/` registry + loop). `src/game/` the engine, flow and one map file per area.
- Every source file: header comment on line 1 (feeds `MAP.md`), under 2000 lines (build fails otherwise), aim for ~150. Split by scene/creature.
- Docs: `docs/UI.md` (UI/UX/art rules), `docs/ENGINE.md` (Gold mechanics and our build order).

## Commands
- `npm run build` -> `worker.js` + `MAP.md`. `npm run dev` local at :8787 (wrangler). `npm test` (dev running): accounts and the full game flow at 412x924.
- `npm run deploy`. KV namespace `SAVES` is the only binding.

## Naming (game text)
Buddymon / BUDDYDEX / BUDDYGEAR / buddy nets; PROF. WILLOW; starters BRAMBLET / BANDIT (the tuxedo cat, the author's own cat) / CHOMPLET; Route 29 species CHIRPLET / NIBBLET / PEEKAT / HOOTLING.
Original names for everything else as it is built; no real Pokemon/Nintendo names or text.

## Save tokens
- Use `MAP.md` + Grep before reading; Read with offset/limit. Don't restate big files in replies; refer to `path:line`.
- Don't commit test output (`test/out`). `worker.js` is the one generated file that is committed.

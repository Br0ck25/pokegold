# UI / UX rules (web/)

Follow these for every screen, control and piece of art. Change a rule here first, then the code.

## Target
- Phone first: **Pixel 9, 412 x 924 CSS px**, portrait. Desktop is the same column, max 480px wide.
- Layout: game stage fills the free height (`#screen-wrap`, flex), then pad (244px), then a 44px status row. Nothing else.
- No horizontal scroll. Respect `env(safe-area-inset-*)`.

## Touch
- Every target >= 48px. The pad lives in `app.js`/`style.css`; keys reach the emulator **only** through the
  `ResponsiveGamepad` plugin there. Never call `WB.setJoypadState` (WasmBoy overwrites it every frame).
- Presses are held >= 110ms so a tap can't fall between frames. D-pad is one touch surface (thumb can roll).
- `npm test` (needs `npm run dev` running) must pass: single taps register, D-pad turns/steps, room reached.

## HD layer (web/public/hd)
- **Vector only**: SVG + DOM + CSS. No bitmap art, no canvas. Must stay crisp at any size.
- Size everything in `cqw` (container width) or `%`, never `px`, so scenes scale with the stage. Design portrait first.
- Palette tokens (in `core/base.css`): ink `#0b1730`, gold `#ffc93c`/`#f08a14`, cream `#fff6dc`, navy `#10204f`, teal `#3de0c4`, coral `#ff6b5e`.
- Fonts: Fredoka (UI, text), Lilita One (logo, big numbers). Title Case for labels; keep game wording for dialogue.
- Look: thick ink outline (5/200 of the art box), flat colour + one gradient, glossy eyes (`Art.eye`), soft shadow ellipse under creatures.
- Panels: rounded 4-5cqw, navy glass, 0.6cqw gold border for focus/dialogue; selected item = gold gradient + ink text.
- Motion: CSS only, loops 1-5s, subtle. `prefers-reduced-motion` already disables it; don't bypass.
- Text comes from the game (tilemap), never hard-coded copy that the ROM also prints.
- Anything not redrawn must fall back to the pixel canvas (scene id 0 / no scene).

## Creatures (art/*.js)
- One file per creature: `Art.<name> = function () { return `<svg viewBox="0 0 200 200">...`; };`
- Unique gradient ids per file (`bb-`, `sp-`, `ch-` prefixes). Original designs only: no real Pokemon likeness.
- Register its species id in `SPECIES_ART` (scenes/prof.js) when the game shows that species.

## Timed scenes (splash 7, intro 8)
- The ROM only waits (`engine/movie/hd_intro.asm`: `SPLASH_FRAMES`, `INTRO_FRAMES`) and lets any button skip; the scene animates
  itself with CSS from mount time. Keep the animation length <= the ROM wait (60 frames = 1s).
- Studio name is "Brock Family" (badger emblem, `art/badger.js`). No Nintendo / Game Freak text anywhere on start-up.

## Add a screen (checklist)
1. ROM: set `wHDScene` to a new `HDSCENE_*` (constants/hd_constants.asm) where the screen starts; reset to 0 where it ends.
2. `scenes/<name>.js` (+ `<name>.css` beside it): `Scenes.<name> = function (root, flags) { ...; return { update(state) {} }; };`
3. `core/engine.js`: map the id in `pick()`. Add any new RAM symbol to `build.sh`'s list.
4. `npm run build`, run `npm test`, look at the screenshot in `test/out/`.

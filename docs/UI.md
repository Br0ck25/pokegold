# UI / UX rules

Follow these for every screen, control and piece of art. Change a rule here first, then the code.

## Target
- Phone first: **Pixel 9, 412 x 924 CSS px**, portrait. Desktop is the same column, max 480px wide.
- Layout: game stage fills the free height (`#stage`, flex), then pad (244px), then a 44px status row. Nothing else.
- No horizontal scroll. Respect `env(safe-area-inset-*)`.
- Typing (names, nicknames, account) uses the device keyboard on a real `<input>`; never an on-screen letter grid.

## Touch
- Every target >= 48px. Pad buttons write to `held` (`src/page/pad.js`); the game reads it through `game/input.js`.
- Presses are held >= 110ms so a tap can't fall between frames. D-pad is one touch surface (thumb can roll).
- Two control modes (header button, remembered per device): **Pad** and **Gesture** (pad hidden, the stage is the controller:
  drag/hold = walk, tap = A, two-finger tap = B, long-press = Start). Keep both working.
- `npm test` (needs `npm run dev` running) must pass.

## HD layer (src/page/hd)
- **Vector only**: SVG + DOM + CSS. No bitmap art, no canvas. Crisp at any size.
- Size everything in `cqw` (container width) or `%`, never `px`, so scenes scale with the stage. Design portrait first.
- Palette tokens (`core/base.css`): ink `#0b1730`, gold `#ffc93c`/`#f08a14`, cream `#fff6dc`, navy `#10204f`, teal `#3de0c4`, coral `#ff6b5e`.
- Fonts: Fredoka (UI, text), Lilita One (logo, big numbers). Title Case for labels.
- Look: thick ink outline, flat colour + one gradient, glossy eyes (`Art.eye`), soft shadow ellipse under creatures.
- Panels: rounded 4-5cqw, navy glass, 0.6cqw gold border for focus/dialogue; selected item = gold gradient + ink text.
- Motion: CSS only, loops 1-5s, subtle. `prefers-reduced-motion` disables it; don't bypass.
- Dialogue is one paragraph that wraps (no width limit); keep a page to about 3 lines.
- Scenes read `Game.state` only. A scene file is `scenes/<name>.js` + `<name>.css`: `Scenes.<name> = function (root) { ...; return { update(state) {} }; }`.
  Full-screen scenes are chosen by `state.screen`; otherwise the room for `state.map.key` (see `core/hd.js`).

## Creatures (art/*.js)
- One file per creature: `Art.<name> = function () { return `<svg viewBox="0 0 200 200">...`; };`
- Unique gradient ids per file (`bb-`, `sp-`, `ch-` prefixes). Original designs only: no real Pokemon likeness.
- Hand-drawn species are listed in `art/creature.js` (`Art.speciesArt`); others use the seeded placeholder in `art/critter.js`.

## Timed scenes (splash, intro)
- Animated by CSS from mount; `game/flow.js` decides how long to show them and lets a button skip the intro.
- Studio name is "Brock Family" (badger emblem, `art/badger.js`). No Nintendo / Game Freak text anywhere.

## Rooms (scenes/room.js)
- A map file in `src/game/` calls `Game.register(key, { room: {art, cols, rows, label}, solid, warps, npcs, signs, enter })`.
- Art is `art/<room>.js` drawn at 100 units per cell from `Art.shell` + `Art.furniture`; blocked cells in `solid` must match the furniture.
- People: a look per name in `art/looks.js`; non-people in `art/props.js`. Unlisted names draw as a plain villager.
- Rooms taller than the stage scroll to keep the hero in view.

## Add a screen (checklist)
1. `scenes/<name>.js` + css, state fields documented at the top of the file.
2. Drive it from `game/flow.js` or a map script (`s.screen("name", {...})`).
3. `npm run build` (updates `MAP.md`), `npm test`, look at the screenshots in `test/out/`.

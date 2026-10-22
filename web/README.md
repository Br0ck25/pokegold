# pokegold on Cloudflare Workers

The game is still the assembly in the repo root. `build.sh` assembles it into
ROMs, and a Worker serves them with a JS Game Boy Color emulator
([WasmBoy](https://github.com/torch2424/wasmboy), GPL-3.0) to the browser.
Battery saves (32 KB cartridge RAM) are stored in KV, keyed by a per-player
cookie.

    web/src/worker.js   static assets + /api/save/:game + /api/me
    web/public/         index.html, app.js, style.css (ROMs and emulator are generated)
    web/build.sh        make gold silver, then stage ROMs and the emulator into public/

## The HD layer

The Game Boy screen is 160x144 pixels, so crisp graphics can't come from the ROM.
Instead the ROM stays the game engine and a browser layer (`public/hd/`) draws
vector scenes over it:

- The ROM writes a scene id to `wHDScene` (`constants/hd_constants.asm`) at the
  title, main menu, clock, professor intro, name choice and name entry.
- `core.js` polls emulator memory ~30x/s: scene id, the on-screen tilemap
  (decoded to text), map/coordinates/facing, and the naming cursor. RAM
  addresses come from `pokegold.sym` (`build.sh` writes `hd/syms.js`).
- `scenes.js` builds one DOM/SVG scene per screen; `art.js`/`art2.js` hold the
  vector art; `hd.css` styles it. Anything without a scene shows the pixel canvas.

To redraw another screen: set a `wHDScene` value in the asm, add a scene in
`scenes.js`, and add it to `pick()` in `core.js`.

## Run locally

Needs rgbds >= 1.0.1 (see ../INSTALL.md), node and npm.

    cd web && npm run dev          # http://127.0.0.1:8787, KV is simulated

## Deploy

    cd web
    npx wrangler kv namespace create SAVES   # paste the id into wrangler.toml
    npm run deploy

## Changing the game

Edit the `.asm`/`.inc` files, then `npm run dev` (or `npm run deploy`).
The ROM is rebuilt on every run.

Note: the built ROMs contain Nintendo's copyrighted game. Keep the deployment
private (e.g. Cloudflare Access) rather than publicly hosting it.

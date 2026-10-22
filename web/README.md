# pokegold on Cloudflare Workers

The game is still the assembly in the repo root. `build.sh` assembles it into
ROMs, and a Worker serves them with a JS Game Boy Color emulator
([WasmBoy](https://github.com/torch2424/wasmboy), GPL-3.0) to the browser.
Battery saves (32 KB cartridge RAM) are stored in KV, keyed by a per-player
cookie.

    web/src/worker.js   static assets + /api/save/:game + /api/me
    web/public/         index.html, app.js, style.css (ROMs and emulator are generated)
    web/build.sh        make gold silver, then stage ROMs and the emulator into public/

## Run locally

Needs rgbds >= 1.0.1 (see ../INSTALL.md), node and npm.

    cd web && npm run dev          # http://127.0.0.1:8787, KV is simulated

## Deploy

    cd web
    npx wrangler kv namespace create SAVES   # paste the id into wrangler.toml
    npx wrangler secret put SITE_PASSWORD    # optional: HTTP Basic password gate
    npm run deploy

## Changing the game

Edit the `.asm`/`.inc` files, then `npm run dev` (or `npm run deploy`).
The ROM is rebuilt on every run.

Note: the built ROMs contain Nintendo's copyrighted game. Keep the deployment
private (e.g. `SITE_PASSWORD` or Cloudflare Access) rather than publicly hosting it.

#!/usr/bin/env bash
# Builds the ROMs from the assembly in the repo root and stages everything
# the Worker serves into web/public. Needs rgbds >= 1.0.1 (see ../INSTALL.md).
set -euo pipefail
cd "$(dirname "$0")"

make -C .. -j"$(nproc)" gold silver

mkdir -p public/roms public/vendor
cp ../pokegold.gbc ../pokesilver.gbc public/roms/

[ -d node_modules/wasmboy ] || npm install --no-audit --no-fund
cp node_modules/wasmboy/dist/wasmboy.wasm.iife.js public/vendor/

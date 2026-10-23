#!/usr/bin/env bash
# Builds the ROMs from the assembly in the repo root and stages everything
# the Worker serves into web/public. Needs rgbds >= 1.0.1 (see ../INSTALL.md).
set -euo pipefail
cd "$(dirname "$0")"

make -C .. -j"$(nproc)" gold silver

mkdir -p public/roms public/vendor
cp ../pokegold.gbc ../pokesilver.gbc public/roms/

# RAM addresses the HD layer reads (bank-1 vars are addressed as 0xD000+).
python3 - <<'PY'
import json
want = ["wHDScene", "wTilemap", "wMapGroup", "wMapNumber", "wXCoord", "wYCoord",
        "wPlayerDirection", "wPlayerName", "wCurPartySpecies", "wMenuCursorY",
        "wNamingScreenCursorObjectPointer", "wNamingScreenCurNameLength", "wNamingScreenMaxNameLength", "wNamingScreenType",
        "wObjectStructs", "wBattleMode", "wBattleMon", "wEnemyMon", "wBattleMonNickname", "wEnemyMonNickname"]
syms = {}
for line in open("../pokegold.sym"):
    if line.startswith(";") or " " not in line:
        continue
    addr, name = line.split()
    if name in want:
        syms[name] = int(addr.split(":")[1], 16)
missing = [w for w in want if w not in syms]
assert not missing, missing
open("public/hd/syms.js", "w").write("const HD_SYMS = " + json.dumps(syms) + ";\n")
PY

[ -d node_modules/wasmboy ] || npm install --no-audit --no-fund
cp node_modules/wasmboy/dist/wasmboy.wasm.iife.js public/vendor/
python3 gen-maps.py
node bundle.js

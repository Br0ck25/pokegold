#!/usr/bin/env python3
"""Print a map's collision grid (one char per 16px cell) to design HD rooms against.

Usage: mapgrid.py PlayersHouse1F
  . floor  # wall/blocked  T tv  P pc  R radio  B bookshelf  W window  S stairs  D door/warp mat  ? other
Cell (x, y) is row y, column x, the same coordinates the game and HD layer use.
"""
import re
import sys

name = sys.argv[1]
text = open("data/maps/maps.asm").read()
m = re.search(rf"^\s*map {name}, TILESET_(\w+),", text, re.M)
if not m:
    sys.exit(f"map {name} not found in data/maps/maps.asm")
tileset = m.group(1).lower()
const = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[a-z])(?=\d)", "_", name).upper()
dims = re.search(rf"map_const {const},\s*(\d+),\s*(\d+)", open("constants/map_constants.asm").read())
if not dims:
    sys.exit(f"map_const {const} not found")
w, h = int(dims.group(1)), int(dims.group(2))

coll = [re.match(r"\s*tilecoll (\w+), (\w+), (\w+), (\w+)", l).groups()
        for l in open(f"data/tilesets/{tileset}_collision.asm") if l.strip().startswith("tilecoll")]
blocks = open(f"maps/{name}.blk", "rb").read()
sym = {"FLOOR": ".", "WALL": "#", "TV": "T", "PC": "P", "RADIO": "R", "BOOKSHELF": "B",
       "WINDOW": "W", "STAIRCASE": "S", "WARP_CARPET_DOWN": "D"}
for by in range(h):
    rows = ["", ""]
    for bx in range(w):
        tl, tr, bl, br = coll[blocks[by * w + bx]]  # one block = 2 x 2 cells: TL TR / BL BR
        rows[0] += f"{sym.get(tl, '?')} {sym.get(tr, '?')} "
        rows[1] += f"{sym.get(bl, '?')} {sym.get(br, '?')} "
    print("\n".join(r.rstrip() for r in rows))

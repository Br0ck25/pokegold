#!/usr/bin/env python3
"""Print a Gold map as a cell grid plus its events, so a native map can follow Gold's real shape (read this before writing a map file).
Usage: python3 tools/goldmap.py VioletCity [gold-repo=/home/user/pokegold] [branch=claude/fervent-brahmagupta-2v8nau]
Cells: . floor  T wall/tree/building  g tall grass  w water  v > < ledges  (collision of the map's tileset, 2x2 cells per block).
Then the warp / coord / sign / object events with their coordinates, exactly as in maps/<Name>.asm."""
import re, subprocess, sys

name = sys.argv[1]
repo = sys.argv[2] if len(sys.argv) > 2 else "/home/user/pokegold"
branch = sys.argv[3] if len(sys.argv) > 3 else "claude/fervent-brahmagupta-2v8nau"
show = lambda path: subprocess.run(["git", "-C", repo, "show", f"{branch}:{path}"], capture_output=True, text=True, check=True).stdout
snake = re.sub(r"(?<!^)(?=[A-Z])", "_", name).upper()
consts = show("constants/map_constants.asm")
m = re.search(rf"map_const {re.escape(snake)},\s+(\d+),\s+(\d+)", consts) or re.search(rf"map_const {re.escape(re.sub(r'(?<=[A-Za-z])(?=\d)', '_', snake))},\s+(\d+),\s+(\d+)", consts)
if not m:
    cands = [c for c in re.findall(r"map_const ([A-Z0-9_]+),\s+(\d+),\s+(\d+)", consts) if c[0].replace("_", "") == snake.replace("_", "")]
    m = cands and re.match(r"(.*)", "") and type("M", (), {"group": lambda self, i, c=cands[0]: c[i]})()
W, H = int(m.group(1)), int(m.group(2))
header = re.search(rf"^\tmap {name},\s+TILESET_([A-Z0-9_]+)", show("data/maps/maps.asm"), re.M)
tileset = header.group(1).lower()
coll = show(f"data/tilesets/{tileset}_collision.asm")
rows = re.findall(r"tilecoll ([A-Z_0-9]+), ([A-Z_0-9]+), ([A-Z_0-9]+), ([A-Z_0-9]+)", coll)
kind = {"FLOOR": ".", "TALL_GRASS": "g", "WATER": "w", "HOP_DOWN": "v", "HOP_RIGHT": ">", "HOP_LEFT": "<", "HOP_DOWN_RIGHT": "R", "HOP_DOWN_LEFT": "L"}
blk = subprocess.run(["git", "-C", repo, "show", f"{branch}:maps/{name}.blk"], capture_output=True, check=True).stdout
grid = [[""] * (W * 2) for _ in range(H * 2)]
for i, b in enumerate(blk[: W * H]):
    bx, by = i % W, i // W
    tl, tr, bl, br = rows[b] if b < len(rows) else ("WALL",) * 4
    for (dx, dy), c in zip(((0, 0), (1, 0), (0, 1), (1, 1)), (tl, tr, bl, br)):
        grid[by * 2 + dy][bx * 2 + dx] = kind.get(c, "T")
print(f"{name}: {W}x{H} blocks = {W*2}x{H*2} cells, tileset {tileset}")
print("    " + "".join(str(x // 10 % 10) if x % 10 == 0 else " " for x in range(W * 2)))
print("    " + "".join(str(x % 10) for x in range(W * 2)))
for y, r in enumerate(grid):
    print(f"{y:3d} " + "".join(r))
asm = show(f"maps/{name}.asm")
ev = asm[asm.find("def_warp_events"):] if "def_warp_events" in asm else ""
print()
for line in ev.splitlines():
    s = line.strip()
    if s.startswith(("warp_event", "coord_event", "bg_event", "object_event", "def_", "connection")):
        print(s)
con = show("data/maps/attributes.asm")
a = re.search(rf"map_attributes {name},.*?\n\n", con, re.S)
if a: print(a.group(0).strip())

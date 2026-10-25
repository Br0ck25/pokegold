#!/usr/bin/env python3
"""Read a Gold map the way a native map must follow it.
  python3 tools/goldmap.py VioletCity            print the cell grid, building footprints, signs and objects
  python3 tools/goldmap.py VioletCity --json     the same as JSON (tools/gold/<Name>.json snapshots are made this way; test/gold.js compares maps to them)
Options after the name: [gold-repo=/home/user/pokegold] [branch=claude/fervent-brahmagupta-2v8nau]
Cells: . floor  T wall/tree/building  c cut bush  o rock/bank (a wall that is not trees)  g tall grass  w water (buoys and whirlpools too)  v > < R L ledges; indoors also k counter b bookshelf m mart shelf P PC V TV r radio M map W window H stairs D door x pit (2x2 cells per block, from the tileset's collision).
Buildings: found by flood-filling the blocks that are all-wall and not trees around each door (a door is a warp event), so a house is 4x2 cells
and a Mart/Center 4x4 with the door in column 1 of the bottom row -- never guess a footprint. Signs on a building footprint are its plaque."""
import json, re, subprocess, sys

args = [a for a in sys.argv[1:] if not a.startswith("--")]
name = args[0]
repo = args[1] if len(args) > 1 else "/home/user/pokegold"
branch = args[2] if len(args) > 2 else "claude/fervent-brahmagupta-2v8nau"
as_json = "--json" in sys.argv

def raw(path):
    return subprocess.run(["git", "-C", repo, "show", f"{branch}:{path}"], capture_output=True, check=True).stdout
def show(path):
    return raw(path).decode()

# size, tileset
consts = show("constants/map_constants.asm")
want = re.sub(r"(?<!^)(?=[A-Z])", "_", name).upper().replace("_", "")
hit = [c for c in re.findall(r"map_const ([A-Z0-9_]+),\s+(\d+),\s+(\d+)", consts) if c[0].replace("_", "") == want]
W, H = int(hit[0][1]), int(hit[0][2]); CONST = hit[0][0]
tileset = re.search(rf"^\tmap {name},\s+TILESET_([A-Z0-9_]+)", show("data/maps/maps.asm"), re.M).group(1).lower()
tileset = {"dark_cave": "cave"}.get(tileset, tileset)  # shares its files
meta = raw(f"data/tilesets/{tileset}_metatiles.bin")
coll = re.findall(r"tilecoll ([A-Z_0-9]+), ([A-Z_0-9]+), ([A-Z_0-9]+), ([A-Z_0-9]+)", show(f"data/tilesets/{tileset}_collision.asm"))
kind = {"FLOOR": ".", "TALL_GRASS": "g", "WATER": "w", "BUOY": "w", "WHIRLPOOL": "w", "CUT_TREE": "c", "HOP_DOWN": "v", "HOP_RIGHT": ">", "HOP_LEFT": "<", "HOP_DOWN_RIGHT": "R", "HOP_DOWN_LEFT": "L",
        # interior furniture (the walls under them are all blocked): counter, bookshelf, mart shelf, PC, TV, radio, town map, window, ladder/stairs, door, pit
        "COUNTER": "k", "BOOKSHELF": "b", "MART_SHELF": "m", "PC": "P", "TV": "V", "RADIO": "r", "TOWN_MAP": "M", "WINDOW": "W", "LADDER": "H", "STAIRCASE": "H",
        "DOOR": "D", "WARP_CARPET_DOWN": "D", "WARP_CARPET_LEFT": "D", "WARP_CARPET_RIGHT": "D", "WARP_PANEL": "D", "PIT": "x", "ICE": "i", "INCENSE_BURNER": "n"}
def blk_path():
    # Several maps share one .blk (every Pokecenter, small houses...): data/maps/blocks.asm lists labels, then the INCBIN.
    text = show("data/maps/blocks.asm"); m0 = re.search(rf"^{name}_Blocks:", text, re.M); i = m0.start() if m0 else -1
    return re.search(r'INCBIN "([^"]+)"', text[i:]).group(1) if i >= 0 else f"maps/{name}.blk"
blk = raw(blk_path())
grid = [[""] * (W * 2) for _ in range(H * 2)]
TREES = {0x1e, 0x1f, 0x2e, 0x2f, 0x3e, 0x3f, 0x13, 0x15, 0x45, 0x1d, 0x05}
quad = {(0, 0): (0, 1, 4, 5), (1, 0): (2, 3, 6, 7), (0, 1): (8, 9, 12, 13), (1, 1): (10, 11, 14, 15)}
for i, b in enumerate(blk[: W * H]):
    bx, by = i % W, i // W
    cs = coll[b] if b < len(coll) else ("WALL",) * 4
    for (dx, dy), c in zip(((0, 0), (1, 0), (0, 1), (1, 1)), cs):
        ch = kind.get(c, "T")
        # outdoors, a wall that is not made of tree tiles is rock / bank / cliff (o); indoors every wall stays T
        if ch == "T" and tileset in ("johto", "kanto") and not {meta[b * 16 + t] for t in quad[(dx, dy)]} <= TREES: ch = "o"
        grid[by * 2 + dy][bx * 2 + dx] = ch

# events
asm = show(f"maps/{name}.asm")
ev = asm[asm.find("def_warp_events"):] if "def_warp_events" in asm else ""
warps = [dict(x=int(m[0]), y=int(m[1]), to=m[2], idx=int(m[3])) for m in re.findall(r"warp_event\s+(\d+),\s+(\d+),\s+([A-Z0-9_]+),\s+(\d+)", ev)]
coords = [dict(x=int(m[0]), y=int(m[1]), script=m[3]) for m in re.findall(r"coord_event\s+(\d+),\s+(\d+),\s+(\w+),\s+(\w+)", ev)]
signs = [dict(x=int(m[0]), y=int(m[1]), kind=m[2], script=m[3]) for m in re.findall(r"bg_event\s+(\d+),\s+(\d+),\s+(\w+),\s+(\w+)", ev)]
objects = []
for m in re.finditer(r"object_event\s+(\d+),\s+(\d+),\s+SPRITE_(\w+),\s+SPRITEMOVEDATA_(\w+),\s+(-?\d+),\s+(-?\d+),\s+(-?\d+),\s+(-?\d+),\s+(\w+),\s+OBJECTTYPE_(\w+),\s+(-?\d+),\s+(\w+),\s+(-?\w+)", ev):
    objects.append(dict(x=int(m[1]), y=int(m[2]), sprite=m[3], move=m[4], type=m[10], script=m[12], flag=m[13]))
for o in objects:  # fix field order (regex groups are 1-based)
    pass
objects = [dict(x=int(m.group(1)), y=int(m.group(2)), sprite=m.group(3), move=m.group(4), type=m.group(10), script=m.group(12), flag=m.group(13))
           for m in re.finditer(r"object_event\s+(\d+),\s+(\d+),\s+SPRITE_(\w+),\s+SPRITEMOVEDATA_(\w+),\s+(-?\d+),\s+(-?\d+),\s+(-?\d+),\s+(-?\d+),\s+(\w+),\s+OBJECTTYPE_(\w+),\s+(-?\d+),\s+(\w+),\s+(-?\w+)", ev)]
attrs = re.search(rf"map_attributes {name},.*?\n\n", show("data/maps/attributes.asm"), re.S)
connections = re.findall(r"connection (\w+), (\w+), \w+, (-?\d+)", attrs.group(0)) if attrs else []

# buildings: all-wall, non-tree blocks flood-filled from each door
TREE = {0x1e, 0x1f, 0x2e, 0x2f, 0x3e, 0x3f, 0x13, 0x15, 0x45, 0x1d, 0x05}
def bkind(b):
    tiles = set(meta[b * 16:b * 16 + 16]); c = set(coll[b]) if b < len(coll) else {"WALL"}
    if c == {"FLOOR"}: return "floor"
    if "WATER" in c: return "water"
    if tiles <= TREE: return "tree"
    return "bld" if c <= {"WALL"} else "other"
doors = {(w["x"] // 2, w["y"] // 2) for w in warps}
buildings = []
if as_json or True:
    seen = set()
    for w in warps:
        start = (w["x"] // 2, w["y"] // 2)
        if start in seen or not (0 <= start[0] < W and 0 <= start[1] < H): continue
        ok = lambda p: 0 <= p[0] < W and 0 <= p[1] < H and (bkind(blk[p[1] * W + p[0]]) == "bld" or p in doors)
        comp, stack = set(), [start]
        while stack:
            p = stack.pop()
            if p in comp or not ok(p): continue
            comp.add(p)
            stack += [(p[0] + 1, p[1]), (p[0] - 1, p[1]), (p[0], p[1] + 1), (p[0], p[1] - 1)]
        if len(comp) < 2: continue
        seen |= comp
        x0 = min(p[0] for p in comp) * 2; y0 = min(p[1] for p in comp) * 2
        x1 = max(p[0] for p in comp) * 2 + 1; y1 = max(p[1] for p in comp) * 2 + 1
        ds = [w for w in warps if (w["x"] // 2, w["y"] // 2) in comp and x0 <= w["x"] <= x1 and y0 <= w["y"] <= y1]
        # shrink to the part that is really wall: a side row/column holding walkable floor (not a door) is outside the building
        dc = {(d["x"], d["y"]) for d in warps}
        def floors(cells): return any(grid[cy][cx] == "." and (cx, cy) not in dc for cx, cy in cells)
        while x1 > x0 and floors([(x1, yy) for yy in range(y0, y1 + 1)]): x1 -= 1
        while x0 < x1 and floors([(x0, yy) for yy in range(y0, y1 + 1)]): x0 += 1
        while y1 > y0 and floors([(xx, y1) for xx in range(x0, x1 + 1)]): y1 -= 1
        while y0 < y1 and floors([(xx, y0) for xx in range(x0, x1 + 1)]): y0 += 1
        buildings.append(dict(x=x0, y=y0, w=x1 - x0 + 1, h=y1 - y0 + 1, doors=[[d["x"], d["y"], d["to"]] for d in ds]))

data = dict(name=name, const=CONST, w=W * 2, h=H * 2, tileset=tileset, grid=["".join(r) for r in grid], warps=warps, coords=coords, signs=signs, objects=objects, buildings=buildings, connections=connections)
if as_json:
    print(json.dumps(data, indent=1))
    sys.exit()
print(f"{name}: {W}x{H} blocks = {W*2}x{H*2} cells, tileset {tileset}")
print("    " + "".join(str(x // 10 % 10) if x % 10 == 0 else " " for x in range(W * 2)))
print("    " + "".join(str(x % 10) for x in range(W * 2)))
for y, r in enumerate(grid): print(f"{y:3d} " + "".join(r))
print("\nbuildings (x y w h, doors):")
for b in buildings: print(f"  {b['x']} {b['y']} {b['w']}x{b['h']}  doors {b['doors']}")
print("\nwarps:", *[f"({w['x']},{w['y']})->{w['to']}#{w['idx']}" for w in warps])
print("coords:", *[f"({c['x']},{c['y']}) {c['script']}" for c in coords])
def inside(s): return any(b["x"] <= s["x"] < b["x"] + b["w"] and b["y"] <= s["y"] < b["y"] + b["h"] for b in buildings)
print("signs:", *[f"({s['x']},{s['y']}) {s['script']} {'[on a building: its plaque]' if inside(s) else '[free-standing: draw S]'}" for s in signs])
print("objects:")
for o in objects: print(f"  ({o['x']},{o['y']}) {o['sprite']} {o['move']} {o['type']} {o['script']} {o['flag']}")
print("connections:", connections)

#!/usr/bin/env python3
"""Writes public/hd/maps.js from the ROM sources: block grids for the outdoor maps the HD layer
draws (HD_MAPS, keyed "group:number") and sprite ids (HD_SPRITE, name -> id).
Run from web/ (build.sh does). Add a map name to OUTDOOR to draw it."""
import json
import os
import re

OUTDOOR = ["NewBarkTown", "Route29", "CherrygroveCity"]
# Johto tileset: blocks whose art we draw by hand (buildings), and the block that is pure trees (to tell trees from rocks).
BUILDING_BLOCKS = {20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 119}
TREE_BLOCK = 5
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
rd = lambda p: open(os.path.join(ROOT, p)).read()

group = num = 0
ids = {}
for line in rd("constants/map_constants.asm").splitlines():
    line = line.strip()
    if line.startswith("newgroup"):
        group += 1
        num = 0
    elif line.startswith("map_const"):
        num += 1
        name, w, h = re.match(r"map_const (\w+),\s*(\d+),\s*(\d+)", line).groups()
        ids[name] = (group, num, int(w), int(h))

def tileset_files(name):
    ts = re.search(rf"map {name}, TILESET_(\w+),", rd("data/maps/maps.asm")).group(1).lower()
    coll = [re.match(r"\s*tilecoll (\w+), (\w+), (\w+), (\w+)", l).groups()
            for l in rd(f"data/tilesets/{ts}_collision.asm").splitlines() if l.strip().startswith("tilecoll")]
    meta = open(os.path.join(ROOT, f"data/tilesets/{ts}_metatiles.bin"), "rb").read()
    return coll, meta

LEDGES = {"HOP_DOWN": "v", "HOP_LEFT": "<", "HOP_RIGHT": ">", "HOP_DOWN_LEFT": "L", "HOP_DOWN_RIGHT": "R"}

def cell_kinds(coll, meta, block):
    """4 kind chars (TL TR BL BR) for a block. . floor, g tall grass, T tree, c cut tree, r rock, w water,
    v < > L R ledges, B hand-drawn building."""
    if block in BUILDING_BLOCKS:
        return "BBBB"
    tree_tiles = set(meta[TREE_BLOCK * 16:(TREE_BLOCK + 1) * 16])
    out = ""
    for i, c in enumerate(coll[block]):
        qx, qy = i % 2, i // 2
        tiles = [meta[block * 16 + (qy * 2 + dy) * 4 + qx * 2 + dx] for dy in (0, 1) for dx in (0, 1)]
        if c in ("WATER", "BUOY", "WHIRLPOOL"): out += "w"
        elif c == "TALL_GRASS": out += "g"
        elif c in LEDGES: out += LEDGES[c]
        elif c == "CUT_TREE": out += "c"
        elif c in ("WALL", "HEADBUTT_TREE", "UP_WALL"):
            out += "T" if c == "HEADBUTT_TREE" or sum(t in tree_tiles for t in tiles) >= 3 else "r"
        else: out += "."
    return out

maps = {}
for name in OUTDOOR:
    const = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[a-z])(?=\d)", "_", name).upper()
    g, n, w, h = ids[const]
    border = int(re.search(rf"map_attributes {name}, {const}, \$([0-9a-fA-F]+)", rd("data/maps/attributes.asm")).group(1), 16)
    blocks = list(open(os.path.join(ROOT, "maps", name + ".blk"), "rb").read())
    coll, meta = tileset_files(name)
    rows = [""] * (h * 2)
    doors = []
    for by in range(h):
        for bx in range(w):
            b = blocks[by * w + bx]
            kinds = cell_kinds(coll, meta, b)
            for i in range(4):
                rows[by * 2 + i // 2] += kinds[i]
                if coll[b][i] == "DOOR":
                    doors.append([bx * 2 + i % 2, by * 2 + i // 2])
    maps[f"{g}:{n}"] = {"w": w, "h": h, "label": re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name), "border": border,
                        "blocks": blocks, "cells": rows, "doors": doors, "borderCells": cell_kinds(coll, meta, border)}

sprites, value = {}, -1
for line in rd("constants/sprite_constants.asm").splitlines():
    m = re.match(r"\s*const SPRITE_(\w+)", line)
    if m:
        value += 1
        sprites[m.group(1)] = value

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "public/hd/maps.js"), "w") as f:
    f.write(f"const HD_MAPS = {json.dumps(maps, separators=(',', ':'))};\nconst HD_SPRITE = {json.dumps(sprites, separators=(',', ':'))};\n")

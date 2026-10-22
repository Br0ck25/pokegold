#!/usr/bin/env python3
"""Writes public/hd/maps.js from the ROM sources: block grids for the outdoor maps the HD layer
draws (HD_MAPS, keyed "group:number") and sprite ids (HD_SPRITE, name -> id).
Run from web/ (build.sh does). Add a map name to OUTDOOR to draw it."""
import json
import os
import re

OUTDOOR = ["NewBarkTown"]
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

maps = {}
for name in OUTDOOR:
    const = re.sub(r"(?<=[a-z])(?=[A-Z])|(?<=[a-z])(?=\d)", "_", name).upper()
    g, n, w, h = ids[const]
    border = int(re.search(rf"map_attributes {name}, {const}, \$([0-9a-fA-F]+)", rd("data/maps/attributes.asm")).group(1), 16)
    maps[f"{g}:{n}"] = {"w": w, "h": h, "label": re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name), "border": border, "blocks": list(open(os.path.join(ROOT, "maps", name + ".blk"), "rb").read())}

sprites, value = {}, -1
for line in rd("constants/sprite_constants.asm").splitlines():
    m = re.match(r"\s*const SPRITE_(\w+)", line)
    if m:
        value += 1
        sprites[m.group(1)] = value

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "public/hd/maps.js"), "w") as f:
    groups = {k.split(":")[0] for k in maps}
    assert len(groups) == 1, "HD maps must share one map group (see scenes/room.js ROOMS)"
    f.write(f"const HD_GROUP = {groups.pop()};\nconst HD_MAPS = {json.dumps(maps, separators=(',', ':'))};\nconst HD_SPRITE = {json.dumps(sprites, separators=(',', ':'))};\n")

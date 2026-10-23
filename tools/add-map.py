#!/usr/bin/env python3
"""Start a new scene the right way, from Gold's own data.
  python3 tools/add-map.py <GoldMapName> <nativeKey> [--write src/game/<file>.js]
1. snapshots the map (tools/gold/<Name>.json, via goldmap.py --json); 2. registers it in tools/gen-terrain.py (BUILT, OUTDOOR) and test/gold.js (MAPS);
3. regenerates src/game/data/terrain.js; 4. prints a map-file skeleton (or writes it) with every person, sign and door at Gold's coordinates.
Then: fill in texts and scripts from maps/<Name>.asm, run `node test/gold.js`, and LOOK at tools/audit-maps.js / tools/audit-rooms.js output."""
import json, os, re, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
args = [a for a in sys.argv[1:] if not a.startswith("--")]
name, key = args[0], args[1]
out_path = sys.argv[sys.argv.index("--write") + 1] if "--write" in sys.argv else None

snap = subprocess.run([sys.executable, os.path.join(here, "goldmap.py"), name, "--json"], capture_output=True, text=True, check=True).stdout
open(os.path.join(here, "gold", name + ".json"), "w").write(snap)
g = json.loads(snap)
outdoor = g["tileset"] in ("johto", "kanto")

def edit(path, fn):
    s = open(path).read(); s2 = fn(s)
    if s2 != s: open(path, "w").write(s2)
gen = os.path.join(here, "gen-terrain.py")
edit(gen, lambda s: s if f'"{name}": "{key}"' in s else s.replace("BUILT = {\n", f'BUILT = {{\n    "{name}": "{key}",\n', 1))
if outdoor: edit(gen, lambda s: s if f'"{name}"' in s.split("OUTDOOR = [", 1)[1].split("]", 1)[0] else s.replace("OUTDOOR = [", f'OUTDOOR = ["{name}", ', 1))
edit(os.path.join(root, "test", "gold.js"), lambda s: s if f'"{name}"' in s.split("const MAPS = {", 1)[1].split("};", 1)[0] else s.replace("const MAPS = {\n", f'const MAPS = {{\n  {key}: "{name}",\n', 1))
subprocess.run([sys.executable, gen], check=True)

DIR = {"DOWN": 0, "UP": 1, "LEFT": 2, "RIGHT": 3}
def npc(i, o):
    mv = o["move"]
    d = next((v for k, v in DIR.items() if mv.endswith(k)), 0)
    extra = ', wander: "spin"' if "SPIN" in mv else ', wander: "horizontal"' if "LEFT_RIGHT" in mv else ', wander: "vertical"' if "UP_DOWN" in mv else ', wander: "horizontal"' if mv == "WANDER" else ""
    still = ', faces: false' if o["sprite"] in ("FRUIT_TREE", "POKE_BALL") else ""
    name = {"POKE_BALL": "SACK"}.get(o["sprite"], o["sprite"])
    hidden = f', hideIf: "TODO_{o["flag"]}"' if o["flag"] not in ("-1", "0") else ""
    return f'      {{ id: {i}, name: "{name}", x: {o["x"]}, y: {o["y"]}, dir: {d}{extra}{still}{hidden}, script: talk("TODO {o["script"]}") }},'
lines = [f"// TODO one-line description of {name}.", f"// Gold: {name}.asm (positions from tools/goldmap.py {name}; keep them: test/gold.js checks every person, sign, door and cell)", "(() => {", "  const talk = Game.talk;"]
if outdoor:
    styles = ", ".join(f'"{b["doors"][0][0]},{b["doors"][0][1]}": {{ roof: "#d9604c" }}' for b in g["buildings"])
    lines += [f'  Game.outdoor("{key}", "{name}", {{', f'    label: "{name}",', f"    style: {{ {styles} }},", "    // closed: { SOME_MAP_CONST: \"message\" }, wild: { rate: 10, morn: [], day: [], nite: [] },"]
else:
    lines += [f'  Game.indoor("{key}", "{name}", {{', f'    label: "{name}", // art: "neighborHouse" etc. for bespoke art; default is drawn from the collision', "    // tiles: { P: Game.pc }, closed: { POKECENTER_2F: \"message\" },"]
lines.append("    npcs: [")
lines += [npc(i + 1, o) for i, o in enumerate(g["objects"])]
lines += ["    ],", "    signs: ["]
lines += [f'      {{ x: {s["x"]}, y: {s["y"]}, script: talk("TODO {s["script"]}") }},' for s in g["signs"]]
lines += ["    ],", "  });", "})();"]
text = "\n".join(lines) + "\n"
if out_path: open(os.path.join(root, out_path), "w").write(text); print("wrote", out_path)
else: print(text)
print("Next: fill the TODOs from maps/%s.asm, then node test/gold.js && node tools/audit-maps.js %s (or audit-rooms.js)" % (name, key), file=sys.stderr)

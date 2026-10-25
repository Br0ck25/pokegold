#!/usr/bin/env python3
"""Everything Gold says and who says it, for one map, straight from the disassembly (never retype Gold's text from memory).
  tools/goldtext.py <GoldName>            readable dump: people (sprite, position, how they move, script), signs, every text block, every script
  tools/goldtext.py <GoldName> --json     the same as JSON on stdout
  tools/goldtext.py <GoldName> --audit src/game/a.js [b.js ...]
                                          list Gold text that none of our files says (after normalising case, punctuation and the renames below);
                                          exit 1 when something is missing, so a test can run it. Extra text of ours is not an error.
Source: branch claude/fervent-brahmagupta-2v8nau of /home/user/pokegold (already has Buddymon/BUDDYGEAR/WILLOW renames; the other species and
towns are renamed by us as we reach them, so audits also accept `RENAMES`). Pronouns for Willow (she) are ours to fix by hand."""
import json, re, subprocess, sys

args = [a for a in sys.argv[1:] if not a.startswith("--")] or [""]
REPO, BRANCH = "/home/user/pokegold", "claude/fervent-brahmagupta-2v8nau"
RENAMES = [("POKé", "BUDDYMON"), ("#MON", "BUDDYMON"), ("ELM", "WILLOW"), ("Elm", "Willow"), ("OAK", "ASPEN"), ("Oak", "Aspen"), ("POKéGEAR", "BUDDYGEAR"),
           ("MR.#MON", "MR. BUDDYMON"), ("BUDDY BALL", "BUDDY NET"), ("BUDDYBALL", "BUDDY NET")]

def git(path):
    return subprocess.run(["git", "-C", REPO, "show", f"{BRANCH}:{path}"], capture_output=True, check=True).stdout.decode()

def parse(name):
    src = git(name if "/" in name else f"maps/{name}.asm")  # a map name, or a repo path like engine/events/mom.asm
    people, signs, texts, scripts = [], [], {}, {}
    label, body = None, []
    for line in src.splitlines():
        m = re.match(r"^([.\w]+):", line)
        if m:
            if label: scripts[label] = body
            label, body = m.group(1), []
            continue
        if label: body.append(line.strip())
    if label: scripts[label] = body
    for m in re.finditer(r"^\tobject_event\s+(\d+),\s*(\d+),\s*(\w+),\s*(\w+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(\w+),\s*(\w+),\s*(\d+),\s*(\w+),\s*(-?\w+)", src, re.M):
        x, y, sprite, move, a, b, h1, h2, pal, typ, sight, scr, ev = m.groups()
        people.append({"x": int(x), "y": int(y), "sprite": sprite.replace("SPRITE_", ""), "move": move.replace("SPRITEMOVEDATA_", ""), "radius": [int(a), int(b)],
                       "type": typ.replace("OBJECTTYPE_", ""), "sight": int(sight), "script": scr, "event": ev})
    for m in re.finditer(r"^\tbg_event\s+(\d+),\s*(\d+),\s*(\w+),\s*(-?\w+)", src, re.M):
        signs.append({"x": int(m.group(1)), "y": int(m.group(2)), "type": m.group(3).replace("BGEVENT_", ""), "script": m.group(4)})
    for lab, lines in scripts.items():
        out, para = [], []
        for ln in lines:
            t = re.match(r'^(text|line|para|cont|done|prompt|page|next)\b\s*(?:"(.*)")?', ln)
            if not t: continue
            kind, s = t.group(1), t.group(2) or ""
            if kind in ("text", "line", "cont", "next"): para.append(s)
            elif kind in ("para", "page"): out.append(join(para)); para = [s]
            elif kind in ("done", "prompt"): out.append(join(para)); para = []
        if para: out.append(join(para))
        out = merge([re.sub(r"\s+", " ", o).strip() for o in out if o.strip()])
        if out: texts[lab] = out
    DIR = {"DOWN": 0, "UP": 1, "LEFT": 2, "RIGHT": 3}
    moves = {}
    for lab, lines in scripts.items():
        seq = []
        for ln in lines:
            m = re.match(r"^(?:slow_|big_|jump_)?step (DOWN|UP|LEFT|RIGHT)", ln)
            if m: seq.append(DIR[m.group(1)]); continue
            m = re.match(r"^turn_head (DOWN|UP|LEFT|RIGHT)", ln)
            if m: seq.append(f"t{DIR[m.group(1)]}")
        if seq and all(re.match(r"^(?:\w*step|turn_head|fix_facing|remove_fixed_facing|step_end|;)", ln) or not ln for ln in lines): moves[lab] = seq
    trainers = []
    for lab, lines in scripts.items():
        for ln in lines:
            m = re.match(r"^trainer (\w+), (\w+), (\w+), (\w+), (\w+), 0, ([.\w]+)", ln)
            if m:
                c, i = m.group(1), m.group(2)
                trainers.append({"script": lab, "class": c, "id": i, "event": m.group(3), "seen": m.group(4), "beaten": m.group(5), "after": m.group(6), **trainer_tables().get(c, {}).get(i, {})})
    return {"map": name, "people": people, "signs": signs, "trainers": trainers, "moves": moves, "texts": texts, "scripts": {k: v for k, v in scripts.items() if k not in texts}}

_TR = {}
def trainer_tables():
    """{CLASS: {CONST: {name, party}}} from constants/trainer_constants.asm and data/trainers/parties.asm."""
    if _TR: return _TR
    consts, cls = {}, None
    for ln in git("constants/trainer_constants.asm").splitlines():
        m = re.match(r"\s*trainerclass (\w+)", ln)
        if m: cls = m.group(1); consts[cls] = []; continue
        m = re.match(r"\s*const (\w+)", ln)
        if m and cls and cls != "TRAINER_NONE": consts[cls].append(m.group(1))
    groups, cur = {}, None
    for ln in git("data/trainers/parties.asm").splitlines():
        m = re.match(r"\s*; (\w+) \((\d+)\)", ln)
        if m: cur = {"name": None, "party": []}; groups.setdefault(m.group(1), []).append(cur); continue
        if cur is None: continue
        m = re.match(r'\s*db "([^@]*)@", TRAINERTYPE_(\w+)', ln)
        if m: cur["name"], cur["type"] = m.group(1), m.group(2); continue
        m = re.match(r"\s*db\s+(\d+),\s*(\w+)((?:,\s*\w+)*)", ln)
        if m: cur["party"].append({"lv": int(m.group(1)), "species": m.group(2), "extra": [x.strip() for x in m.group(3).split(",") if x.strip() and x.strip() != "NO_MOVE"]})
    for c, ids in consts.items():
        for i, k in enumerate(ids):
            if c in groups and i < len(groups[c]): _TR.setdefault(c, {})[k] = groups[c][i]
    return _TR

def join(parts):
    """Gold breaks words with a trailing '-' at line ends: glue those back together."""
    out = ""
    for p in parts:
        out = out[:-1] + p if out.endswith("-") and p[:1].islower() else (out + " " + p if out else p)
    return out

def merge(pages):
    """Gold starts a new box every two lines, mid-sentence too: glue pages back together unless the page ended a sentence (our say() repaginates)."""
    out = []
    for p in pages:
        ended = re.search(r"[.!?…:)\"”]$", out[-1]) and not re.search(r"\b(PROF|MR|MRS|DR|S\.S)\.$", out[-1]) if out else False
        if out and not ended: out[-1] = join([out[-1], p])
        else: out.append(p)
    return out

def norm(s):
    for a, b in RENAMES: s = s.replace(a, b)
    s = re.sub(r"\$\{[^}]*\}", "", s).replace("@", "").replace("<PLAYER>", "").replace("<RIVAL>", "").replace("…", "...")
    return re.sub(r"[^a-z0-9]", "", s.lower())

def label_text(label):
    """Text of a shared text label (_MomLeavingText1 ...): they live in data/text/*.asm, not in the map files."""
    hit = subprocess.run(["git", "-C", REPO, "grep", "-n", f"^{label}::", BRANCH, "--", "data/text"], capture_output=True).stdout.decode().split("\n")[0]
    if not hit: return None
    _, path, line = hit.split(":")[:3]
    lines = git(path.split(":", 1)[-1] if path.startswith(BRANCH) else path).splitlines()[int(line):]
    out, para = [], []
    for ln in lines:
        t = re.match(r'^\s*(text|line|para|cont|done|prompt|page|next|text_end)\b\s*(?:"(.*)")?', ln)
        if not t:
            if not ln.strip(): continue
            if re.match(r'^\s*text_(ram|decimal|bcd|start|promptbutton|asm)', ln): continue
            break
        k, v = t.group(1), t.group(2) or ""
        if k in ("text", "line", "cont", "next"): para.append(v)
        elif k in ("para", "page"): out.append(join(para)); para = [v]
        elif k in ("done", "prompt", "text_end"): out.append(join(para)); para = []
    if para: out.append(join(para))
    return merge([o for o in out if o])

if __name__ == "__main__":
    if "--label" in sys.argv:
        for lab in sys.argv[sys.argv.index("--label") + 1:]:
            print(lab); [print("    ", p) for p in label_text(lab) or ["(not found)"]]
        sys.exit(0)
    data = parse(args[0])
    if "--json" in sys.argv:
        print(json.dumps(data, indent=1)); sys.exit(0)
    if "--audit" in sys.argv:
        raw = " ".join(open(f).read() for f in sys.argv[sys.argv.index("--audit") + 1:])
        ours = norm(raw)  # a label named in a file (s.text("Map", "Label")) counts as said
        missing = [(lab, p) for lab, ps in data["texts"].items() if f'"{lab}"' not in raw for p in ps if len(norm(p)) > 8 and norm(p)[:28] not in ours]
        for lab, p in missing: print(f"MISSING {lab}: {p}")
        print(f"{args[0]}: {sum(len(v) for v in data['texts'].values())} Gold paragraphs, {len(missing)} missing")
        sys.exit(1 if missing else 0)
    print(f"== {args[0]}: people (x,y are map cells)")
    for p in data["people"]: print(f"  {p['sprite']:<16} ({p['x']},{p['y']}) {p['move']:<18} {p['type']:<6} sight {p['sight']} -> {p['script']}  [{p['event']}]")
    print("== trainers")
    for t in data["trainers"]: print(f"  {t['script']}: {t['class']} {t.get('name')} ({t['event']}) " + ", ".join(f"L{p['lv']} {p['species']}" + (" " + "/".join(p['extra']) if p['extra'] else "") for p in t.get("party", [])))
    print("== signs")
    for s in data["signs"]: print(f"  ({s['x']},{s['y']}) {s['type']} -> {s['script']}")
    print("== texts")
    for lab, ps in data["texts"].items():
        print(f"  {lab}:")
        for p in ps: print(f"      {p}")
    print("== scripts (no text)")
    for lab, body in data["scripts"].items():
        if any(b for b in body): print(f"  {lab}: " + " | ".join(b for b in body if b and not b.startswith(";"))[:300])

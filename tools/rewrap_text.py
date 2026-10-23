#!/usr/bin/env python3
"""Re-wrap dialogue paragraphs (text/para + line/cont) that overflow the 18-column text box.

Renames (BUDDYMON for #MON, PROF.WILLOW ...) made many lines longer than the box. Only paragraphs
with an overlong line are touched; hyphenated breaks ("wait-" / "ing") are re-joined when the joined
word appears elsewhere in the game text. Usage: tools/rewrap_text.py [--check]
"""
import glob
import re
import sys

W = 18
TAG = re.compile(r"<[^>]*>")
LINE = re.compile(r'^\t(text|para|line|cont) "([^"]*)"$')
OK_PREV = re.compile(r'^(\t(done|prompt|text_end)|[A-Za-z_0-9.]+::?)$')
files = [f for f in glob.glob("**/*.asm", recursive=True) if f.startswith(("maps/", "data/", "engine/"))]
SPACED = [(r"PROF\.(?=[A-Z])", "PROF. "), (r"MR\.(?=BUDDYMON)", "MR. ")]


def width(s):
    return len(TAG.sub(lambda m: "x" * (6 if m.group(0) == "<PLAYER>" else 2), s))


texts = {f: open(f, errors="surrogateescape").read() for f in files}
words = set()
for t in texts.values():
    for m in re.finditer(r'"([^"]*)"', t):
        s = m.group(1)
        if not s.endswith("-"):
            words.update(re.findall(r"[A-Za-z']+", s.lower()))


def tokens(strings):
    out = []
    for s in strings:
        parts = s.split(" ")
        if out and out[-1].endswith("-") and parts[0]:
            head = out[-1][:-1]
            if (head + parts[0]).lower().strip(".,!?…") in words or head.upper() == "BUDDY":
                out[-1] = head + parts[0]
                parts = parts[1:]
        out.extend(p for p in parts if p)
    return out


def wrap(toks):
    lines, cur = [], ""
    for t in toks:
        if cur and width(cur + " " + t) > W:
            lines.append(cur)
            cur = t
        else:
            cur = (cur + " " + t) if cur else t
    return lines + [cur]


changed = 0
for f, t in texts.items():
    for a, b in SPACED:
        t = re.sub(a, b, t)
    src = t.split("\n")
    out, i = [], 0
    while i < len(src):
        m = LINE.match(src[i])
        prev = next((l for l in reversed(out) if l.strip()), "")
        if m and m.group(1) in ("text", "para") and (OK_PREV.match(prev) or LINE.match(prev) and not prev.endswith('@"')):
            j = i + 1
            while j < len(src) and LINE.match(src[j]) and LINE.match(src[j]).group(1) in ("line", "cont"):
                j += 1
            strs = [LINE.match(l).group(2) for l in src[i:j]]
            if any(s.endswith("@") for s in strs) or not any(width(s) > W for s in strs):
                out.extend(src[i:j])
            else:
                new = wrap(tokens(strs))
                kw = [m.group(1), "line"] + ["cont"] * (len(new) - 2)
                out.extend(f'\t{k} "{l}"' for k, l in zip(kw, new))
                changed += 1
            i = j
        else:
            out.append(src[i])
            i += 1
    res = "\n".join(out)
    if res != texts[f] and "--check" not in sys.argv:
        open(f, "w", errors="surrogateescape").write(res)
print(changed, "paragraphs re-wrapped")

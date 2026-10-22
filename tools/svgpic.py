#!/usr/bin/env python3
"""Render a creature SVG into the 4-color indexed PNG the pic build expects.

Usage: svgpic.py in.svg out.png

The SVG is drawn on the Game Boy pixel grid: its viewBox size (40, 48 or 56)
is the output size in pixels. The root element declares the four colors:

    <svg viewBox="0 0 40 40" data-palette="#ffffff #efbd63 #18a500 #000000" ...>

in palette order: white, light, dark, black. Index 0 is the transparent/white
background, so draw nothing behind the creature. The SVG is rendered at
SCALE x without anti-aliasing, and each output pixel takes the most common
palette color in its SCALE x SCALE block (nearest palette color for any
blended pixels).
"""
import io
import re
import sys
from collections import Counter

import cairosvg
from PIL import Image

SCALE = 8


def parse_palette(svg_text):
    m = re.search(r'data-palette="([^"]+)"', svg_text)
    if not m:
        sys.exit("svgpic: root <svg> needs data-palette=\"#white #light #dark #black\"")
    colors = re.findall(r"#([0-9a-fA-F]{6})", m.group(1))
    if len(colors) != 4:
        sys.exit("svgpic: data-palette needs exactly 4 colors")
    return [tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) for c in colors]


def nearest(rgb, palette):
    return min(range(4), key=lambda i: sum((a - b) ** 2 for a, b in zip(rgb, palette[i])))


def main(src, dst):
    svg = open(src, encoding="utf-8").read()
    palette = parse_palette(svg)
    size = int(float(re.search(r'viewBox="0 0 (\d+) \1"', svg).group(1)))
    if size not in (40, 48, 56):
        sys.exit("svgpic: viewBox must be 40, 48 or 56 square")

    png = cairosvg.svg2png(
        bytestring=svg.encode(),
        output_width=size * SCALE,
        output_height=size * SCALE,
        background_color="#%02x%02x%02x" % palette[0],
    )
    big = Image.open(io.BytesIO(png)).convert("RGB")

    out = Image.new("P", (size, size), 0)
    flat = Image.new("P", (1, 1))
    pixels = out.load()
    for y in range(size):
        for x in range(size):
            block = big.crop((x * SCALE, y * SCALE, (x + 1) * SCALE, (y + 1) * SCALE))
            votes = Counter(nearest(p, palette) for p in block.get_flattened_data())
            pixels[x, y] = votes.most_common(1)[0][0]

    flat_palette = [c for rgb in palette for c in rgb]
    out.putpalette(flat_palette)
    out.save(dst, optimize=False)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])

#!/usr/bin/env python3
"""
Split globals.css into:
- globals.css (kept): design tokens, base styles, homepage styles, accessibility
- editor.css (new): editor-only styles (.int-*, .coc-*, .loader-* classes)

Lines 191-716   → editor.css (sidebar, cards, buttons, mobile editor UX helpers)
Lines 733-1179  → editor.css (coc loader animations)
Lines 1241-1390 → editor.css (mobile editor UX overhaul)
"""
from pathlib import Path

SRC = Path('/home/z/my-project/src/app/globals.css')
EDITOR_DST = Path('/home/z/my-project/src/styles/editor.css')
KEPT_DST = Path('/home/z/my-project/src/app/globals.css.new')

# Line ranges to extract (1-indexed, inclusive)
EDITOR_RANGES = [(191, 716), (733, 1179), (1241, 1390)]

lines = SRC.read_text().splitlines(keepends=True)
total = len(lines)

editor_lines = []
kept_lines = []
editor_ranges_set = set()
for start, end in EDITOR_RANGES:
    for i in range(start, end + 1):
        editor_ranges_set.add(i)

for idx, line in enumerate(lines, start=1):
    if idx in editor_ranges_set:
        editor_lines.append(line)
    else:
        kept_lines.append(line)

# Write editor.css with a header
EDITOR_DST.parent.mkdir(parents=True, exist_ok=True)
header = "/* ═══════════════════════════════════════════════════════════════\n   EDITOR-ONLY STYLES — extracted from globals.css\n   Loaded only by /editor route via InteriorStudio.tsx + EditorLoader.tsx\n   to avoid shipping 30KB+ of editor CSS to homepage visitors.\n   ═══════════════════════════════════════════════════════════════ */\n\n"
EDITOR_DST.write_text(header + ''.join(editor_lines))

# Write trimmed globals.css
KEPT_DST.write_text(''.join(kept_lines))

# Stats
orig_size = len(''.join(lines))
editor_size = len(''.join(editor_lines))
kept_size = len(''.join(kept_lines))
print(f"Original globals.css: {total} lines, {orig_size:,} bytes")
print(f"editor.css: {len(editor_lines)} lines, {editor_size:,} bytes ({editor_size*100//orig_size}%)")
print(f"new globals.css: {len(kept_lines)} lines, {kept_size:,} bytes ({kept_size*100//orig_size}%)")
print(f"Savings on homepage: {editor_size:,} bytes ({editor_size*100//orig_size}%)")

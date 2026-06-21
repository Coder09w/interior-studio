#!/bin/bash
# Retry remaining failed frames
PROMPT="You are a senior UX/UI auditor analyzing a screenshot of an interior design web app (Instod). Identify ANY visible issues:

LOOK FOR:
1. Layout problems: overlapping elements, misalignment, awkward spacing, broken grids
2. Color/contrast issues: low contrast, clashing colors, colors that look wrong
3. Typography: text overflow, wrong sizes, hard-to-read text, text cut off
4. Mobile/responsive issues: tiny touch targets, broken layouts on small screens
5. Padding/margins: inconsistent, cramped, or excessive spacing
6. Buttons/controls: hard to find, hard to click, unclear labels
7. Empty/error states: visible errors, broken images, missing content
8. Inconsistencies: mixed styles, fonts, or components
9. Anything else that looks unprofessional or confusing

OUTPUT FORMAT (be brief):
- If frame looks clean: 'CLEAN'
- Otherwise: 'ISSUE: [location] - [description] (severity: HIGH/MED/LOW)'

Be specific about WHERE on screen each issue is. One line per issue."

FRAMES_DIR="/home/z/my-project/scripts/recording-frames"
OUT_DIR="/home/z/my-project/scripts/frame-analyses"

for f in "$FRAMES_DIR"/frame_*.jpg; do
  name=$(basename "$f" .jpg)
  out="$OUT_DIR/$name.json"
  if [ ! -f "$out" ]; then
    echo "Analyzing $name..."
    z-ai vision -p "$PROMPT" -i "$f" -o "$out" 2>&1 | tail -1
    sleep 6
  fi
done
echo "DONE"
ls "$OUT_DIR" | wc -l

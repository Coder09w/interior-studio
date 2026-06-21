#!/bin/bash
# Mobile UX audit - run sequentially with delays to avoid rate limits
PROMPT="You are auditing the MOBILE view (390px wide, iPhone 14) of an interior design web app called Instod. Identify mobile-specific UX issues:

MOBILE-SPECIFIC CHECKS:
1. Touch target sizes — buttons should be at least 44x44px (Apple HIG)
2. Text readability — too small? cut off? overlapping?
3. Horizontal overflow — content extending beyond viewport?
4. Layout breaks — elements stacked wrong, awkward gaps?
5. Navigation — hamburger menu visible and working?
6. Forms — inputs hard to tap, labels far from fields?
7. Modals — too tall to fit on screen? hard to dismiss?
8. Whitespace — too cramped? awkward spacing?
9. Readability — text too small, contrast issues on mobile?
10. Buttons — too close together causing mis-taps?

Output: For each issue, write 'ISSUE: [location] - [description] (severity: HIGH/MED/LOW)'. If clean, write 'CLEAN'."

OUT_DIR="/home/z/my-project/scripts/mobile-audits"
mkdir -p "$OUT_DIR"

for shot in editor-mobile home-mobile-top home-mobile-2 home-mobile-3 home-mobile-4 home-mobile-footer; do
  if [ ! -f "$OUT_DIR/$shot.json" ]; then
    echo "Analyzing $shot..."
    z-ai vision -p "$PROMPT" -i "/home/z/my-project/scripts/verify-shots/$shot.png" -o "$OUT_DIR/$shot.json" 2>&1 | tail -1
    sleep 7
  fi
done
echo "DONE"

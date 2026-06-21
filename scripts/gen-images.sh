#!/bin/bash
# Generate polished images sequentially with delay to avoid 429 rate limits
set -e

OUT_DIR="/home/z/my-project/public"
mkdir -p "$OUT_DIR/images" "$OUT_DIR/hero"

gen() {
  local prompt="$1"
  local out="$2"
  local size="${3:-1152x864}"
  echo "→ Generating: $out"
  for attempt in 1 2 3; do
    if z-ai image -p "$prompt" -o "$out" -s "$size" 2>&1; then
      echo "  ✓ Done (attempt $attempt)"
      return 0
    fi
    echo "  ⚠ Attempt $attempt failed, waiting 12s..."
    sleep 12
  done
  echo "  ✗ Gave up on $out"
  return 1
}

# 1. Polished BEFORE image — centered, symmetrical, editorial
gen "Empty living room interior photograph, completely bare unfurnished room with plain warm white walls (#FAF6F0), light oak hardwood floor, single tall window with soft neutral daylight streaming in, no furniture, no decoration, real estate listing photography style, perfectly symmetrical straight-on composition, wide angle lens, soft even natural lighting, professional architectural photography, warm neutral color palette, calm and minimal, centered composition, high quality, photorealistic, no people" \
  "$OUT_DIR/images/room-empty-v2.png" "1152x864"

sleep 6

# 2. Polished AFTER image — same room, fully designed, warm cohesive palette
gen "Beautifully designed living room interior photograph, same empty room layout now furnished, terracotta velvet sofa (#C17F4E) centered against back wall, walnut mid-century coffee table, woven jute rug, brass arc floor lamp casting warm pool of light, large monstera plant in corner, two framed art prints on wall, sheer linen curtains diffusing golden afternoon light, modern bohemian style, perfectly symmetrical centered composition, editorial interior magazine aesthetic, warm cohesive terracotta and cream color palette, professional architectural photography, high quality, photorealistic, no people" \
  "$OUT_DIR/images/room-designed-v2.png" "1152x864"

sleep 6

# 3. Cream-toned atmospheric backdrop for light sections
gen "Abstract atmospheric architectural photograph, warm cream beige textured plaster wall surface (#FAF6F0) with soft morning light raking across creating gentle organic shadows, subtle terracotta and copper accent tones, minimalist serene mood, editorial design magazine aesthetic, shallow depth of field, no furniture, no people, high quality, photorealistic, professional photography" \
  "$OUT_DIR/hero/section-bg-cream.png" "1344x768"

sleep 6

# 4. Dark moody atmospheric backdrop for dark sections
gen "Abstract atmospheric architectural photograph, dark charcoal black textured plaster wall (#0F0F0F) with single dramatic pool of warm copper lamp light, deep cinematic shadows, moody sophisticated mood, editorial design magazine aesthetic, shallow depth of field, warm cinematic color grade, no furniture, no people, high quality, photorealistic, professional photography" \
  "$OUT_DIR/hero/section-bg-dark.png" "1344x768"

echo ""
echo "=== ALL GENERATED ==="
ls -lh "$OUT_DIR/images/room-empty-v2.png" "$OUT_DIR/images/room-designed-v2.png" "$OUT_DIR/hero/section-bg-cream.png" "$OUT_DIR/hero/section-bg-dark.png"

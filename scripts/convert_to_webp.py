#!/usr/bin/env python3
"""
Convert key hero/section PNGs to WebP for ~75% size reduction.
Next.js serves AVIF/WebP automatically when <Image> or <img> is used with
proper extensions, but since we use static <img src="/hero/x.png"> tags,
we need to:
1. Generate .webp versions alongside the .png files
2. Update the <img> tags to use the .webp extension

Note: We keep originals as fallback (browser will use modern format).
"""
from pathlib import Path
from PIL import Image
import os

PUBLIC = Path('/home/z/my-project/public')

# Key images to convert (used on homepage)
TARGETS = [
    'hero/hero-backdrop-dark.png',
    'hero/hero-backdrop.png',
    'hero/section-bg-cream.png',
    'hero/section-bg-dark.png',
    'images/room-designed-v2.png',
    'images/room-empty-v2.png',
    'images/hero-living-v2.png',
    'images/hero-bedroom-v2.png',
    'images/hero-kitchen-v2.png',
    'images/hero-bathroom-v2.png',
    'images/hero-dining-v2.png',
    'images/hero-office-v2.png',
    'images/gallery-living.png',
    'images/gallery-bedroom.png',
    'images/gallery-kitchen.png',
    'images/gallery-bathroom.png',
    'images/gallery-dining.png',
    'images/gallery-office.png',
]

results = []
for rel_path in TARGETS:
    src = PUBLIC / rel_path
    if not src.exists():
        print(f"SKIP (not found): {rel_path}")
        continue
    dst = src.with_suffix('.webp')
    try:
        img = Image.open(src)
        # For very large images, downscale to max 1920px wide (still sharp on retina)
        max_width = 1920
        if img.width > max_width:
            new_height = int(img.height * max_width / img.width)
            img = img.resize((max_width, new_height), Image.LANCZOS)
        # Convert to RGB if needed (WebP doesn't support RGBA as well)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGBA')
        img.save(dst, 'WEBP', quality=80, method=6)
        orig_size = src.stat().st_size
        new_size = dst.stat().st_size
        savings = (1 - new_size / orig_size) * 100
        results.append((rel_path, orig_size, new_size, savings))
        print(f"OK: {rel_path}: {orig_size//1024}KB -> {new_size//1024}KB (-{savings:.0f}%)")
    except Exception as e:
        print(f"FAIL: {rel_path}: {e}")

# Summary
if results:
    total_orig = sum(r[1] for r in results)
    total_new = sum(r[2] for r in results)
    print(f"\nTotal: {total_orig//1024}KB -> {total_new//1024}KB (-{(1-total_new/total_orig)*100:.0f}%)")

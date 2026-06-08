# Worklog: Instod Homepage Hero & Responsiveness Improvements

**Date:** 2026-03-04  
**Files Modified:**
- `/home/z/my-project/src/app/page.tsx`
- `/home/z/my-project/src/app/globals.css`

## Summary

Restructured the Hero section from a two-column grid layout to a single-column centered layout, and added comprehensive responsiveness improvements across all 10 homepage sections.

## Changes Made

### 1. Hero Section — Centered Single-Column Layout
- **Layout:** Changed from `grid lg:grid-cols-2` to `flex flex-col items-center text-center`
- **Text alignment:** Removed `lg:text-left` — all text is now centered at all breakpoints
- **Headline:** Updated responsive sizes to `text-3xl sm:text-4xl md:text-5xl lg:text-7xl`
- **Subtitle:** Removed `lg:mx-0` — keeps `max-w-xl mx-auto` at all sizes
- **CTAs:** Removed `lg:justify-start` — buttons centered via `justify-center`; stack vertically on mobile, horizontal on `sm+`
- **Social proof row:** Removed `lg:justify-start` — stays centered at all breakpoints
- **Carousel:** Moved below the text with `mt-12 lg:mt-16`, wrapped in `max-w-4xl mx-auto w-full`
- **Carousel aspect ratio:** Responsive `aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]` — taller on mobile, wider on desktop
- **Carousel reveal animation:** Changed direction from `right` to `up` to match vertical stacking
- **Dot indicators:** Added `min-w-[8px] min-h-[20px]` for better touch targets

### 2. Navbar — Mobile Touch Targets
- Mobile menu items (`Features`, `Gallery`, `Pricing`) updated to `py-3 min-h-[44px] flex items-center` for proper 44px touch targets

### 3. Before/After Section
- Already had `md:grid-cols-2` — stacks vertically on mobile, side-by-side on `md+` ✅

### 4. Audience Cards
- Already had `sm:grid-cols-2 lg:grid-cols-4` ✅

### 5. Feature Grid
- Already had `sm:grid-cols-2 lg:grid-cols-3` ✅

### 6. Gallery Section
- **Tab bar:** Added `gallery-tabs-scroll` class, `flex-nowrap sm:flex-wrap`, `whitespace-nowrap flex-shrink-0` for horizontal scrolling on mobile
- **Tab alignment:** `justify-start sm:justify-center` — left-aligned on mobile (scroll), centered on desktop
- **Gallery image:** Changed from `aspect-[16/9]` to `aspect-[4/3] sm:aspect-[16/9]` — taller on mobile

### 7. How It Works
- Already had `sm:grid-cols-2 md:grid-cols-4` ✅

### 8. Value Comparison Table
- **Desktop (sm+):** Kept original 3-column grid table layout with `hidden sm:block`
- **Mobile (below sm):** New card-style layout with `sm:hidden`, each comparison as a separate card with category title and two rows (traditional/instod)
- Prevents text overflow and cramped columns on small screens

### 9. Early Access Beta
- Benefits grid explicitly set to `grid-cols-1 sm:grid-cols-2` (was implicitly single column on mobile, now explicit)

### 10. Final CTA
- Already responsive ✅

### 11. Footer
- Already had `sm:grid-cols-2 lg:grid-cols-5` ✅

### globals.css Additions
- Added `.gallery-tabs-scroll` responsive CSS under `@media (max-width: 640px)` with:
  - `overflow-x: auto` for horizontal scrolling
  - `-webkit-overflow-scrolling: touch` for smooth iOS scrolling
  - Hidden scrollbar via `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`

## Build Verification
- `npx next build` compiled successfully with no TypeScript errors
- Pre-existing Prisma/DB connection warnings are unrelated to these changes

## Design Principles Preserved
- No color scheme changes
- No font changes
- All framer-motion animations preserved
- All section content preserved
- Only layout and responsiveness modified

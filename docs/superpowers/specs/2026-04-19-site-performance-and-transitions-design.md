# Site performance and page transitions

## Goals
- Home page loads without a visible "flash of poster image" before the background video plays.
- Projects page images load fast (first paint well under 1 second on a good connection).
- Cross-page navigation feels continuous, not abrupt.

## Non-goals
- No framework migration (site stays multi-page static).
- No redesign of resume, connect, or footage pages beyond adding the shared view-transition rule.
- No CDN or build-pipeline changes.

## Design

### 1. Project images
- Convert every raster image referenced from `projects.html` to WebP at max 1600px wide, quality ~82.
- Keep original files on disk (in place) as silent backup — they're already in `.gitignore`-adjacent territory. Do not delete.
- Replace `IMG_0691-ezgif...gif` (21MB) with a silent, looping `<video>` element (MP4, ~500KB target).
- Update `projects.html` image src arrays to point at `.webp` versions.
- Add `loading="lazy"` and `decoding="async"` to every project image tag.
- First image of each project is still lazy — the project detail view isn't visible on initial load, so eager loading buys nothing.

**Implementation:** one-off Node script using `sharp` (already common; install locally, don't ship). Script reads asset filenames, produces `name.webp` next to each source file. Script is committed under `scripts/` for reproducibility but not run in CI.

### 2. Home video flash
- Extract the exact first frame of `background-video.mp4` as a highly compressed JPEG (~20-30KB), save as `assets/video-poster.jpg` (replacing current poster).
- Remove `poster` attribute from `<video>`. Instead, set that image as a `background-image` on the fixed video container at `background-size: cover`.
- Video element starts at `opacity: 0`.
- On `canplay` event, add class `is-ready` that transitions `opacity` to 1 over 400ms.
- Because poster IS the first video frame, the crossfade is visually invisible — the still image appears to come alive.
- Fallback: if `canplay` never fires (rare), the video stays hidden but the poster remains visible, so the page never looks broken.

### 3. Page transitions
- Add single CSS rule to every page's stylesheet (or shared `styles.css`):
  ```css
  @view-transition { navigation: auto; }
  ```
- Browser automatically crossfades old page → new page on same-origin navigation.
- Chrome/Edge/Safari supported; Firefox falls back to instant navigation (no regression).
- Optional: `::view-transition-old(root)` / `::view-transition-new(root)` with custom animation if default crossfade feels too slow.

## Files changed
- `index.html` — video markup, small inline CSS/JS for opacity fade, view-transition rule.
- `projects.html` — image src arrays → `.webp`, add lazy/decoding attrs, swap GIF for video.
- `styles.css` — view-transition rule, opacity transition for video.
- `assets/video-poster.jpg` — regenerated from first frame of video.
- `assets/*.webp` — new files alongside existing PNG/JPG.
- `scripts/optimize-images.js` — new, one-off conversion script (not shipped).

## Verification
- Open `index.html` in browser, hard-reload: no visible flash of poster before video plays.
- Open `projects.html`, DevTools Network panel: initial page weight < 500KB, images load only when project is opened.
- Navigate home → projects → resume: smooth crossfade (in supporting browsers).
- Check Firefox: pages still navigate without error, just without the crossfade.
- Lighthouse performance score improves from baseline on both pages.

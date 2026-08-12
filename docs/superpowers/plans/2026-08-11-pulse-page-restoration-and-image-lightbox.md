# Pulse Page Restoration and Site Image Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the pulse-generator project as a technically substantial case study and add full-size viewing for meaningful images across the site.

**Architecture:** Keep the project inside the existing `projects.html` data/rendering system and restore its existing board-layer component. Add a separate shared lightbox stylesheet and script to the four deployable pages so generic image enlargement has one implementation and remains independent of the specialized board-layer viewer.

**Tech Stack:** Static HTML/CSS/JavaScript, Vite, Node `assert`, Pillow-generated WebP asset, Playwright browser verification.

## Global Constraints

- Use `IMG_6527.jpg` as the pulse-generator project cover and first gallery image.
- Keep the technical case-study sections visible by default.
- Use exactly one closed project disclosure titled `Earlier Microsecond Prototype`.
- Restore the eight-state interactive board-layer viewer and its specialized expanded mode.
- Keep demonstrated V1 results distinct from Revision 2 targets.
- Preserve the approved recruiter-facing Skills chips exactly.
- The generic lightbox applies to meaningful content images, not backgrounds, previews, thumbnails, iframes, or board-layer images.
- Keep unrelated project content, navigation, themes, and widths unchanged.
- Preserve user-owned `tmp/` and `test-results/` directories.

---

### Task 1: Restore the pulse-generator case study

**Files:**
- Modify: `scripts/site-content.test.mjs`
- Modify: `projects.html`
- Create: `public/assets/pulse-v1-cover.jpg`
- Create: `public/assets/pulse-v1-cover.webp`

**Interfaces:**
- Consumes: the pre-rewrite pulse project content from commit `f11933d`, the newer measured-result narrative, and existing board-layer assets and JavaScript.
- Produces: a visible technical case study and a gallery whose first image is `/assets/pulse-v1-cover.jpg`.

- [ ] **Step 1: Add failing restoration assertions**

Extend the pulse-generator fixture in `scripts/site-content.test.mjs` to require:

```javascript
assert.equal(pulseDisclosures.length, 1);
assert.match(pulseGeneratorSource, /<summary>Earlier Microsecond Prototype<\/summary>/);
assert.match(pulseGeneratorSource, /class="board-layer-viewer"/);
assert.match(pulseGeneratorSource, /ns-pulse-schematic-thumbnail\.png/);
assert.match(pulseGeneratorSource, /ns-pulse-board-layout\.png/);
assert.match(pulseGeneratorSource, /pulse-v1-ltspice\.png/);
assert.match(pulseGeneratorSource, /<strong>Testing \+ Key Design Lesson<\/strong>/);
assert.match(pulseGeneratorSource, /<strong>Revision 2<\/strong>/);
assert.equal(pulseGalleryImages[0], '/assets/pulse-v1-cover.jpg');
```

Reject the former three collapsed summaries.

- [ ] **Step 2: Run the content test and verify failure**

Run: `node scripts/site-content.test.mjs`

Expected: FAIL because the current page has three disclosures, no board-layer viewer, and the new cover is absent.

- [ ] **Step 3: Import and optimize the new cover**

Copy `C:\Users\aadit\Downloads\IMG_6527.jpg` to `public/assets/pulse-v1-cover.jpg`. Generate `public/assets/pulse-v1-cover.webp` with EXIF orientation applied, a maximum dimension of 2400 px, and WebP quality 84. Verify both images decode and preserve the source aspect ratio.

- [ ] **Step 4: Restore the visible technical content**

Replace the pulse-generator description with visible sections for Overview, Experiment Target, Measurement Problem, V1 Architecture and Design Loop, Interactive Board Layers, Schematic/Layout/Simulation, Physical Implementation, Testing + Key Design Lesson, Revision 2, and Current Stage. Reuse the pre-rewrite technical copy where it remains accurate and the newer measured results where they supersede planning language.

- [ ] **Step 5: Restore the board viewer**

Reinsert the existing `.board-layer-viewer` markup with all eight radio states, controls, layer images, caption, and `data-board-lightbox-open` button. Keep `initializeBoardLayerLightbox()` unchanged unless browser verification exposes a regression.

- [ ] **Step 6: Add the earlier prototype disclosure**

Create one closed `<details class="project-disclosure">` titled `Earlier Microsecond Prototype`. Include the explanatory text and the existing physical-board, schematic, layout, render, and LTspice assets.

- [ ] **Step 7: Update gallery and preserve Skills**

Make `/assets/pulse-v1-cover.jpg` the first gallery entry. Include the physical V1 images, board render, board layout, schematic, simulation, Revision 2 CAD, and earlier prototype assets after it. Preserve the exact approved Skills array.

- [ ] **Step 8: Run Task 1 verification**

Run: `node scripts/site-content.test.mjs`

Run: `npm run build`

Expected: both commands exit 0.

- [ ] **Step 9: Browser-verify Task 1**

At `/projects#ns-us-pulse-generator`, verify desktop and mobile layouts, visible technical sections, one closed prototype disclosure, new cover, image loading, board-layer selection, expanded board viewer, and no horizontal overflow.

### Task 2: Add the shared site image lightbox

**Files:**
- Create: `image-lightbox.css`
- Create: `image-lightbox.js`
- Modify: `index.html`
- Modify: `resume.html`
- Modify: `projects.html`
- Modify: `footage.html`
- Modify: `scripts/site-content.test.mjs`

**Interfaces:**
- Consumes: semantic content images rendered in the four pages and optional `data-lightbox-ignore`, `data-lightbox-group`, and `data-lightbox-caption` attributes.
- Produces: one delegated click handler and one accessible `.site-image-lightbox` dialog shared by all pages.

- [ ] **Step 1: Add failing shared-asset assertions**

For every deployable page, require:

```javascript
assert.match(html, /href="\/image-lightbox\.css"/);
assert.match(html, /src="\/image-lightbox\.js"/);
```

Require the shared script to expose delegated click behavior, Escape close, Left/Right navigation, backdrop close, focus restoration, and opt-out handling. Require explicit opt-outs on the home background poster, project hover preview, gallery thumbnails, and board-layer viewer.

- [ ] **Step 2: Run the content test and verify failure**

Run: `node scripts/site-content.test.mjs`

Expected: FAIL because the shared assets and opt-outs do not exist.

- [ ] **Step 3: Implement `image-lightbox.css`**

Style a fixed overlay, centered image stage, caption, close button, previous/next icon buttons, visible focus states, mobile constraints, and reduced-motion behavior. Use square/circular icon controls rather than text pills.

- [ ] **Step 4: Implement `image-lightbox.js`**

Use event delegation to find eligible images. Resolve the full-size URL from the `<img src>` fallback so original-resolution assets open instead of WebP thumbnails. Build gallery groups from project gallery main images and inline project content, manage current index, keyboard controls, backdrop close, scroll lock, dialog focus, and trigger-focus restoration.

- [ ] **Step 5: Load shared assets and mark exclusions**

Add the stylesheet in each page `<head>` and the deferred script before `</body>`. Add `data-lightbox-ignore` to background/preview/thumbnail/board-layer image containers or images. Ensure the board-layer expand control still owns board-layer images.

- [ ] **Step 6: Run complete verification**

Run: `node scripts/site-content.test.mjs`

Run: `npm run build`

Run: `git diff --check`

Expected: all commands exit 0.

- [ ] **Step 7: Browser-verify the lightbox**

On desktop and mobile, open representative project cover, gallery, inline schematic, simulation, and Resume photo images. Verify large rendering, close button, backdrop close, Escape, arrow navigation, scroll lock, focus restoration, no overflow, and exclusion of board-layer/thumbnail/background/preview images.

- [ ] **Step 8: Commit and push to main**

```powershell
git add -- projects.html index.html resume.html footage.html image-lightbox.css image-lightbox.js scripts/site-content.test.mjs public/assets/pulse-v1-cover.jpg public/assets/pulse-v1-cover.webp docs/superpowers/plans/2026-08-11-pulse-page-restoration-and-image-lightbox.md
git commit -m "Restore pulse project depth and add image lightbox"
git push origin main
```

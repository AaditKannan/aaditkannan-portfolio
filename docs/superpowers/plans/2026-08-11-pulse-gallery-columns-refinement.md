# Pulse Gallery and Column Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore scan-friendly desktop columns, remove gallery bars from photographs, replace repetitive gallery images with distinct technical evidence, and add a focused Revision 2 disclosure.

**Architecture:** Keep the project data and rendering in `projects.html`, following the existing static-site pattern. Add pulse-specific gallery metadata through source-path classification, then use scoped CSS to control image fitting and column-spanning evidence without changing other projects.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js assertions, Vite, Playwright browser verification.

## Global Constraints

- Keep Overview, experiment target, measurement problem, V1 architecture, design loop, testing result, Revision 2 response/target, and Current Stage visible.
- Use exactly two initially closed disclosures: `Revision 2 Architecture and Packaging` and `Earlier Microsecond Prototype`.
- Use the approved six-item gallery order from the design spec.
- Preserve the specialized board-layer viewer and generic site-wide image lightbox.
- Keep recruiter-facing skills unchanged.
- Do not alter unrelated projects, navigation, theme behavior, or page widths.

---

### Task 1: Lock Gallery, Columns, and Disclosure Requirements

**Files:**
- Modify: `scripts/site-content.test.mjs`

**Interfaces:**
- Consumes: Pulse project source fixture already extracted as `pulseGeneratorSource`.
- Produces: Regression assertions used by the final verification command.

- [ ] **Step 1: Write failing assertions**

Assert the exact six gallery paths, exactly two disclosure summaries, the absence of the pulse single-column override, the presence of a pulse two-column rule and full-span media class, and photo/technical gallery fit classifiers.

- [ ] **Step 2: Run the content test and verify RED**

Run: `node scripts/site-content.test.mjs`

Expected: FAIL because the current page has one disclosure, a single-column override, the repetitive gallery list, and no per-media fit classification.

- [ ] **Step 3: Commit only after the implementation passes**

The tests and implementation change together because this repository uses one source-level content suite.

### Task 2: Implement Hybrid Columns and Relevant Disclosures

**Files:**
- Modify: `projects.html`

**Interfaces:**
- Consumes: Existing `.detail-description`, `.project-inline-grid`, `.project-feature-figure`, `.board-layer-viewer`, and `.project-disclosure` styles.
- Produces: Pulse-specific two-column text flow and `.pulse-full-span` evidence blocks.

- [ ] **Step 1: Restore desktop columns**

Replace the pulse `columns: 1` override with two desktop columns. Apply `column-span: all` and full-width layout protection to `.pulse-full-span`, board-layer viewer, and the two disclosures. Retain the existing responsive one-column media rule.

- [ ] **Step 2: Mark wide evidence blocks**

Add `pulse-full-span` to the schematic/layout grid, board viewer, hardware grid, bench figure, and the Revision 2 disclosure.

- [ ] **Step 3: Add the R2 disclosure**

Keep the visible R2 architectural response and target. Move expanded packaging details and the two CAD figures into the initially closed `Revision 2 Architecture and Packaging` disclosure. Leave the earlier prototype disclosure unchanged.

### Task 3: Curate and Fit the Gallery

**Files:**
- Modify: `projects.html`

**Interfaces:**
- Consumes: `project.images`, `renderMedia(src, id)`, `renderThumb(src, i)`, and gallery CSS.
- Produces: Six distinct gallery entries and `gallery-media-photo` / `gallery-media-technical` class names.

- [ ] **Step 1: Replace the pulse gallery order**

Use cover, schematic, combined layout, 3D render, bench test, and one R2 CAD view, in that order.

- [ ] **Step 2: Classify gallery media**

Add a source classifier that marks the pulse cover and bench assets as photographs and the schematic/layout/render/CAD assets as technical media. Apply the class to the main-media container output and thumbnails.

- [ ] **Step 3: Remove visual bars without cropping technical evidence**

Use `object-fit: cover` for pulse photographs and `object-fit: contain` for technical media. Match technical-media frame backgrounds to their white/light asset canvases. Keep the lightbox unchanged so enlarged sources remain uncropped.

- [ ] **Step 4: Run content tests and build**

Run: `node scripts/site-content.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: exit 0 with all entry pages built.

### Task 4: Browser Verification and Publish

**Files:**
- Verify: `projects.html`

**Interfaces:**
- Consumes: Local Vite server at `http://127.0.0.1:4173`.
- Produces: Browser evidence and the published `main` commit.

- [ ] **Step 1: Verify desktop layout**

At 1440x1000, verify two computed columns, full-width technical evidence, two closed disclosures, six distinct gallery thumbnails, cover/bench `object-fit: cover`, and technical media `object-fit: contain`.

- [ ] **Step 2: Verify mobile layout**

At 390x844, verify one column, no horizontal overflow, readable media, and functional disclosures.

- [ ] **Step 3: Verify interactions**

Verify gallery navigation, generic image lightbox, and specialized board-layer expansion.

- [ ] **Step 4: Run final repository checks**

Run: `node scripts/site-content.test.mjs`, `npm run build`, and `git diff --check`.

Expected: all exit 0.

- [ ] **Step 5: Commit and push**

Stage only the plan, test, and project-page files. Commit with `Refine pulse gallery and detail layout`, then push `main` to `origin` and verify local/remote HEAD equality.

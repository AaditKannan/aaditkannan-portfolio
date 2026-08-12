# Pulse Generator Portfolio Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the pulse-generator project report with a concise portfolio narrative using the five supplied V1 and Revision 2 images.

**Architecture:** Preserve the existing single-file Projects data/rendering system. Replace only the `ns-us-pulse-generator` description and gallery data, add optimized assets under `public/assets`, and protect the editorial structure with the existing Node content test.

**Tech Stack:** Static HTML/CSS/JavaScript, Vite, Node `assert`, responsive images.

## Global Constraints

- Use exactly three native project disclosures, initially closed.
- Preserve the `built -> tested -> learned -> redesigned` narrative.
- Keep 30 V, approximately 100 ns-scale, and 1 ns-class as the only major performance numbers.
- Do not claim that V1 achieved the Revision 2 target.
- Match the existing Wolfrom disclosure and inline-image styling.
- Use only recruiter-readable software and transferable competencies in the project Skills chips.
- Keep unrelated project entries and user-owned untracked files unchanged.

---

### Task 1: Lock the pulse-generator content contract

**Files:**
- Modify: `scripts/site-content.test.mjs`
- Test: `scripts/site-content.test.mjs`

**Interfaces:**
- Consumes: the `projects.html` source string already loaded by `readPage()`.
- Produces: regression assertions for the pulse-generator detail content and supplied asset references.

- [ ] **Step 1: Write the failing content assertions**

Add assertions scoped to the `ns-us-pulse-generator` project object. Require the three summary labels, `Current Stage`, `30 V`, `100 ns`, `1 ns-class`, and all five new image paths. Reject the old `Experiment Target`, `Measurement Problem`, `Design Loop`, `Bring-Up Plan`, and `Tools In The Workflow` headings.

- [ ] **Step 2: Run the content test and verify the expected failure**

Run: `node scripts/site-content.test.mjs`

Expected: FAIL because the current project entry still contains report-style headings and does not reference the supplied images.

- [ ] **Step 3: Commit the failing contract with the implementation**

Stage this test together with the production changes after the test passes so the commit remains buildable.

### Task 2: Add and optimize the supplied images

**Files:**
- Create: `public/assets/pulse-v1-enclosure.jpeg`
- Create: `public/assets/pulse-v1-enclosure.webp`
- Create: `public/assets/pulse-v1-board.jpeg`
- Create: `public/assets/pulse-v1-board.webp`
- Create: `public/assets/pulse-v1-bench.jpeg`
- Create: `public/assets/pulse-v1-bench.webp`
- Create: `public/assets/pulse-r2-cad-front.png`
- Create: `public/assets/pulse-r2-cad-front.webp`
- Create: `public/assets/pulse-r2-cad-rear.png`
- Create: `public/assets/pulse-r2-cad-rear.webp`

**Interfaces:**
- Consumes: the five user-supplied image files.
- Produces: stable project asset paths used by `projects.html`.

- [ ] **Step 1: Copy the original images to stable asset names**

Use `Copy-Item -LiteralPath` for each supplied file so the temporary clipboard paths are no longer dependencies.

- [ ] **Step 2: Generate WebP derivatives**

Use the repository's available image tooling to create WebP files at visually lossless portfolio quality while preserving the original aspect ratios.

- [ ] **Step 3: Inspect dimensions and file sizes**

Confirm each original and WebP is non-empty and that the WebP derivatives decode successfully.

### Task 3: Rewrite the project detail

**Files:**
- Modify: `projects.html`

**Interfaces:**
- Consumes: the ten stable image assets from Task 2 and existing `.project-disclosure` / `.project-inline-grid` styles.
- Produces: the rewritten `description`, concise `excerpt`, revised `tags`, and five-image gallery for project id `ns-us-pulse-generator`.

- [ ] **Step 1: Replace the visible introduction**

Use the approved overview copy, lead with the physical hardware, and add the `V1 pulse-generator hardware during bench characterization.` caption.

- [ ] **Step 2: Add the three disclosures**

Add `Architecture Validation - V1 Board`, `Testing + Key Design Lesson`, and `Revision 2` using native `<details class="project-disclosure">` markup. Place the populated-board image in the first, the test-bench image in the second, and the two CAD renders in the third.

- [ ] **Step 3: Add the visible Current Stage ending**

State that V1 is assembled and characterized, summarize what it demonstrated and revealed, and identify simulation and architecture selection as the next Revision 2 step.

- [ ] **Step 4: Simplify metadata and gallery**

Update the excerpt to distinguish validated V1 from Revision 2, keep only accurate workflow tags, and order the five supplied images as enclosure, board, bench, front CAD, rear CAD.

- [ ] **Step 5: Run the content test**

Run: `node scripts/site-content.test.mjs`

Expected: PASS with no output.

### Task 4: Verify presentation and publish

**Files:**
- Verify: `projects.html`
- Verify: `scripts/site-content.test.mjs`

**Interfaces:**
- Consumes: the complete project rewrite.
- Produces: a tested commit on `main` and an updated remote branch.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Vite exits 0 and emits `dist/projects.html` plus the referenced assets.

- [ ] **Step 2: Check the deep-linked detail at desktop and mobile sizes**

Open `/projects#ns-us-pulse-generator`; confirm the lead image, disclosures, captions, inline CAD pair, overflow, and mobile stacking are coherent.

- [ ] **Step 3: Review the final diff and status**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only the intended project, test, docs, and image assets are tracked.

- [ ] **Step 4: Commit and push**

Run:

```powershell
git add -- projects.html scripts/site-content.test.mjs docs/superpowers/specs/2026-08-11-pulse-generator-portfolio-rewrite-design.md docs/superpowers/plans/2026-08-11-pulse-generator-portfolio-rewrite.md public/assets/pulse-v1-enclosure.jpeg public/assets/pulse-v1-enclosure.webp public/assets/pulse-v1-board.jpeg public/assets/pulse-v1-board.webp public/assets/pulse-v1-bench.jpeg public/assets/pulse-v1-bench.webp public/assets/pulse-r2-cad-front.png public/assets/pulse-r2-cad-front.webp public/assets/pulse-r2-cad-rear.png public/assets/pulse-r2-cad-rear.webp
git commit -m "Rewrite pulse generator project story"
git push origin main
```

### Task 5: Refine recruiter-facing skill tags

**Files:**
- Modify: `scripts/site-content.test.mjs`
- Modify: `projects.html`

**Interfaces:**
- Consumes: the `tags` array for project id `ns-us-pulse-generator`.
- Produces: recruiter-readable Skills chips in the rendered project sidebar.

- [ ] **Step 1: Write the failing skills assertion**

Scope the existing pulse-generator source fixture to its `tags` array and assert the exact list `KiCad`, `LTspice`, `Python`, `LabVIEW`, `PCB Design`, `Embedded Systems`, `SMD Soldering`, and `Oscilloscope Testing`.

- [ ] **Step 2: Run the content test and verify the expected failure**

Run: `node scripts/site-content.test.mjs`

Expected: FAIL because the current tags include project activities such as `GaN Switching` and omit several approved recruiter-facing skills.

- [ ] **Step 3: Replace the project tags**

Set the pulse-generator `tags` array to:

```javascript
['KiCad', 'LTspice', 'Python', 'LabVIEW', 'PCB Design', 'Embedded Systems', 'SMD Soldering', 'Oscilloscope Testing']
```

- [ ] **Step 4: Run verification**

Run: `node scripts/site-content.test.mjs`

Run: `npm run build`

Expected: both commands exit 0.

- [ ] **Step 5: Commit and push**

```powershell
git add -- projects.html scripts/site-content.test.mjs docs/superpowers/specs/2026-08-11-pulse-generator-portfolio-rewrite-design.md docs/superpowers/plans/2026-08-11-pulse-generator-portfolio-rewrite.md
git commit -m "Refine pulse generator skill tags"
git push origin main
```

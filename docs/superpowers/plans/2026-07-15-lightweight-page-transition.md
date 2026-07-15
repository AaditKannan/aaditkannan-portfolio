# Lightweight Page Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the page-transition performance regression while retaining a short, smooth cross-page handoff.

**Architecture:** The shared navigation controller continues to identify eligible internal document links. A fixed CSS pseudo-element provides the entire visual handoff, so page media and content never receive animation or transform styles.

**Tech Stack:** Static HTML, shared CSS, browser JavaScript, Playwright, Vite.

## Global Constraints

- Do not change project media sources, image lazy loading, homepage video playback, or project-detail animation behavior.
- Preserve same-page hashes, project hashes, modifier clicks, external links, downloads, browser back, and reduced-motion behavior.
- Do not animate video, images, `<main>`, galleries, or page content containers.

---

### Task 1: Replace content compositing with a lightweight cover

**Files:**
- Modify: `page-transitions.css`
- Modify: `public/page-transitions.js`
- Test: `tmp/project-transition.spec.js`

**Interfaces:**
- Consumes: `site-leaving` and `site-entering` classes on `document.documentElement`.
- Produces: a 70 ms outgoing cover and 120 ms incoming cover without styling content containers.

- [x] **Step 1: Write regression tests**

Assert that `.bg-video-wrap` and `main` retain `animation-name: none` and `transform: none`, and that cross-page navigation does not retain the old visible delay.

- [x] **Step 2: Verify the regression tests fail**

Run: `npx playwright test tmp/project-transition.spec.js -g "heavyweight media|visible loading pause" --reporter=line`

Expected: both tests fail against the current content-animation implementation.

- [x] **Step 3: Implement the cover transition**

Remove body-child animation selectors. Add an `html::after` fixed cover that changes opacity only while `site-leaving` or `site-entering` is active. Update JavaScript timers to match the shorter cover timing.

- [x] **Step 4: Run focused tests**

Run: `npx playwright test tmp/project-transition.spec.js -g "heavyweight media|visible loading pause" --reporter=line`

Expected: both tests pass.

- [x] **Step 5: Run full verification**

Run: `npx playwright test tmp/project-transition.spec.js --reporter=line`

Expected: all transition and project-detail tests pass.

Run: `npm run build`

Expected: Vite exits 0 and `dist/page-transitions.js` exists.

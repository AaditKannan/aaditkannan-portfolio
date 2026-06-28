# NS/US Pulse Generator Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the standalone ns/µs pulse-generator project page with grounded technical content, an interactive PCB/schematic explorer focused on the current nanosecond board, and a collapsible V1 µs prototype section.

**Architecture:** Keep the existing static Vite/site pattern. Modify only `ns-us-pulse-generator.html` for page structure/style/script and add exported assets under `public/assets`. Use KiCad-exported SVGs and user-provided screenshots; do not claim measured ns performance.

**Tech Stack:** Static HTML/CSS/vanilla JS, KiCad CLI SVG exports, existing Vite server.

## Global Constraints

- Preserve the existing site style, navigation, theme behavior, spacing language, and standalone detail-page pattern.
- Focus the page on the current ns board, especially the LMG1020/EPC2051 nanosecond switching path.
- Show the first µs board only in a collapsed “Version 1” section.
- Label LTspice and V1 assets as simulation/prototype, not measured current-board data.
- Do not claim verified rise time, final pulse width accuracy, 50 Ω validation, DUT switching, or full bench characterization.

---

### Task 1: Export and Stage Visual Assets

**Files:**
- Create: `public/assets/pulse-pcb-top.svg`
- Create: `public/assets/pulse-pcb-bottom.svg`
- Create: `public/assets/pulse-pcb-copper.svg`
- Create: `public/assets/pulse-pcb-silk.svg`
- Create: `public/assets/pulse-schematic-exports/nanosecondpulse.svg`
- Create: `public/assets/pulse-schematic-exports/microseconstage.svg`
- Create: `public/assets/pulse-v1-us-schematic.png`
- Create: `public/assets/pulse-v1-us-layout.png`
- Create: `public/assets/pulse-v1-us-render.png`
- Create: `public/assets/pulse-v1-ltspice.png`

**Interfaces:**
- Consumes: KiCad files in `C:\Users\aadit\Downloads` and screenshots provided by the user.
- Produces: static assets referenced by the page.

- [x] Export current PCB top/bottom/copper/silkscreen SVGs with KiCad CLI.
- [x] Export current ns and µs schematic SVGs with KiCad CLI.
- [x] Copy V1 µs screenshots and LTspice screenshot into `public/assets`.

### Task 2: Rewrite Standalone Project Page

**Files:**
- Modify: `ns-us-pulse-generator.html`

**Interfaces:**
- Consumes: assets from Task 1.
- Produces: a complete standalone project page reachable at `/ns-us-pulse-generator.html` and `/projects/ns-us-pulse-generator`.

- [ ] Add richer technical sections: overview, research context, architecture, ns path, µs path, layout strategy, lab interface, validation plan, status.
- [ ] Add an interactive PCB/schematic explorer with tabs for ns stage, architecture, PCB layers, lab interface, validation.
- [ ] Add layer toggles for current-board SVG assets.
- [ ] Add a collapsed V1 µs prototype section using the user-provided schematic/layout/render/LTspice images.
- [ ] Keep all claims grounded as design targets or validation plans.

### Task 3: Verify Locally

**Files:**
- Verify: `ns-us-pulse-generator.html`

**Interfaces:**
- Consumes: local Vite server.
- Produces: confidence that the page renders and current localhost remains healthy.

- [ ] Run `npm run build`.
- [ ] Confirm `http://localhost:5180/ns-us-pulse-generator.html` returns `200`.
- [ ] Inspect page in browser if permitted by the in-app browser policy.
- [ ] Check key assets return `200`.

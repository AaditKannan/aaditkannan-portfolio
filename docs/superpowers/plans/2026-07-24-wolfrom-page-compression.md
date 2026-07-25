# Wolfrom Project Page Compression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the initially visible Wolfrom project page to 350–450 words, preserve the original project typography and columns, and move prototype and simulation evidence into five native dropdowns.

**Architecture:** Replace the current long Wolfrom description plus injected simulation section with one concise project-description template. Use semantic `<details>` elements for progressive disclosure and a small inherited-style CSS block for summaries and inline image pairs. Keep the existing gallery, project renderer, transitions, model viewer, assets, and all other project data unchanged.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript project data, native `<details>/<summary>`, Vite 5, Playwright with Chrome.

## Global Constraints

- Change only the `wolfrom-actuator` detail content and supporting styles in `projects.html`.
- Keep project routing, transitions, gallery behavior, 3D viewer behavior, card data, and other project pages unchanged.
- Keep approximately 350–450 words visible before any dropdown opens.
- Keep exactly five dropdowns, all closed on initial load.
- Use the existing `detail-description` font, size, line height, colors, spacing, and two-column behavior.
- Do not use the simulation kicker, large simulation headings, metric grid, or full-width report layout.
- Do not introduce a dependency or custom accordion library.
- Preserve all supported ANSYS and KISSsoft values exactly.
- Do not imply completed torque, efficiency, backlash, backdrive, dyno, or metal-hardware validation.
- Maintain zero horizontal page overflow at a 390 px viewport.

---

## File Map

- Modify: `projects.html`
  - Remove the simulation-specific CSS block.
  - Add minimal inherited disclosure and inline-image styles.
  - Replace `wolfromValidationSection` and the long Wolfrom `description` with one compressed description template.
  - Remove the Wolfrom-only string replacement from the detail renderer.
- Modify for local verification only: `tmp/project-transition.spec.js`
  - Add assertions for visible word count, dropdown defaults, exact engineering values, inherited font behavior, image loading, and mobile overflow.

---

### Task 1: Lock the Compressed Page Contract with Failing Tests

**Files:**
- Modify: `tmp/project-transition.spec.js`
- Test: `tmp/project-transition.spec.js`

**Interfaces:**
- Consumes: Existing project route `http://127.0.0.1:5180/projects#wolfrom-actuator`.
- Produces: Playwright assertions that define the visible-copy and disclosure contract.

- [ ] **Step 1: Replace the existing Wolfrom validation test with a visible-copy and dropdown test**

Delete the existing test named `Wolfrom validation section reports only supported ANSYS and KISSsoft results`. Add this replacement in the same location:

```js
test('Wolfrom page keeps technical depth behind five native disclosures', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5180/projects#wolfrom-actuator');

  const description = page.locator('#detailDescription');
  const disclosures = description.locator('details.project-disclosure');
  await expect(disclosures).toHaveCount(5);

  for (let index = 0; index < 5; index += 1) {
    await expect(disclosures.nth(index)).not.toHaveAttribute('open', '');
  }

  const visibleWordCount = await description.evaluate((element) => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('details').forEach((details) => details.remove());
    const text = clone.textContent.replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  });
  expect(visibleWordCount).toBeGreaterThanOrEqual(350);
  expect(visibleWordCount).toBeLessThanOrEqual(450);

  await expect(description.locator('summary')).toHaveText([
    'Prototype details',
    'Load case and hand calculations',
    'Static structural and mesh sensitivity',
    'Topology optimization',
    'KISSsoft gear analysis'
  ]);
});
```

- [ ] **Step 2: Add a content, typography, and disclosure interaction test**

Add this directly after the visible-copy test:

```js
test('Wolfrom disclosures preserve supported values and original typography', async ({ page }) => {
  await page.goto('http://127.0.0.1:5180/projects#wolfrom-actuator');

  const description = page.locator('#detailDescription');
  await expect(description).toContainText('50.45:1');
  await expect(description).toContainText('50 N·m');
  await expect(description).toContainText('30 N·m');
  await expect(description).toContainText('5.34 MPa');
  await expect(description).toContainText('1.069 µm');
  await expect(description).toContainText('153.4 g');
  await expect(description).toContainText('99.6 g');
  await expect(description).toContainText('1.913 / 0.000 / 1.913');
  await expect(description).toContainText('1.258 / 1.340');
  await expect(description).toContainText('1.217 / 1.384');

  const fontFamilies = await page.evaluate(() => {
    const description = document.querySelector('#detailDescription');
    const summary = description.querySelector('summary');
    return {
      description: getComputedStyle(description).fontFamily,
      summary: getComputedStyle(summary).fontFamily
    };
  });
  expect(fontFamilies.summary).toBe(fontFamilies.description);
  await expect(page.locator('.engineering-validation')).toHaveCount(0);

  const prototype = description.locator('details.project-disclosure').first();
  await prototype.locator('summary').click();
  await expect(prototype).toHaveAttribute('open', '');
  await expect(prototype.locator('img')).toHaveCount(1);
  await expect.poll(() => prototype.locator('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
});
```

- [ ] **Step 3: Replace the simulation-specific mobile containment steps**

In the existing test named `Wolfrom validation section stays inside the mobile viewport`, replace the `.engineering-validation` and `.mesh-sensitivity-wrap` assertions with:

```js
await page.locator('details.project-disclosure').last().scrollIntoViewIfNeeded();
await page.locator('details.project-disclosure').last().locator('summary').click();
const viewportOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
expect(viewportOverflow).toBeLessThanOrEqual(0);
```

- [ ] **Step 4: Run the focused tests and confirm they fail for the intended reasons**

Run:

```powershell
npx playwright test tmp/project-transition.spec.js --grep "Wolfrom page|Wolfrom disclosures|Wolfrom validation section stays" --reporter=line --workers=1
```

Expected:

- FAIL because there are no `details.project-disclosure` elements.
- FAIL because `.engineering-validation` still exists.
- FAIL because the current visible page is longer than 450 words.

---

### Task 2: Replace the Separate Simulation Design with Native Disclosures

**Files:**
- Modify: `projects.html:1150-1424`
- Modify: `projects.html:2398-2542`
- Modify: `projects.html:2547-2562`
- Modify: `projects.html:3225-3228`
- Test: `tmp/project-transition.spec.js`

**Interfaces:**
- Consumes: Existing image assets under `/assets/wolfrom-*`.
- Produces: `details.project-disclosure`, `.project-inline-grid`, and one compressed Wolfrom description.

- [ ] **Step 1: Remove the simulation-specific CSS**

Delete the complete CSS block beginning with:

```css
.engineering-validation {
```

and ending after its dedicated mobile media query.

This removes:

- `.engineering-validation`
- `.validation-header`
- `.validation-kicker`
- `.validation-metrics`
- `.validation-metric`
- `.validation-grid`
- `.validation-figure`
- `.mesh-sensitivity-wrap`
- `.kisssoft-results-wrap`
- `.validation-table`
- `.validation-callout`
- `.validation-note`

- [ ] **Step 2: Add inherited disclosure and image-pair styles**

Insert these styles after `.detail-description strong:first-child`:

```css
.project-disclosure {
  margin: 14px 0;
  padding: 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
}

.project-disclosure + .project-disclosure {
  margin-top: -15px;
  border-top: 0;
}

.project-disclosure summary {
  padding: 12px 0;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  list-style-position: outside;
}

.project-disclosure[open] {
  break-inside: auto;
  -webkit-column-break-inside: auto;
}

.project-disclosure[open] summary {
  margin-bottom: 4px;
}

.project-disclosure-content {
  padding: 0 0 14px;
}

.project-inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
}

.project-inline-grid figure {
  min-width: 0;
  margin: 0;
}

.project-inline-grid img,
.project-disclosure img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  background: #fff;
  border-radius: 4px;
}

.project-inline-grid figcaption,
.project-disclosure figcaption {
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 0.82em;
  font-style: italic;
  line-height: 1.5;
}

.project-result-list {
  margin: 10px 0 14px;
  padding-left: 18px;
}

.project-result-list li {
  margin: 5px 0;
}

@media (max-width: 768px) {
  .project-inline-grid {
    grid-template-columns: 1fr;
  }

  .project-disclosure,
  .project-disclosure-content {
    max-width: 100%;
  }
}
```

- [ ] **Step 3: Replace `wolfromValidationSection` with a single compressed description constant**

Delete the entire `wolfromValidationSection` template.

Add a `wolfromDescription` constant before `const projects = [` using this structure and copy:

```js
const wolfromDescription = `
  <strong>Overview</strong><br><br>
  I am designing a compact Wolfrom compound planetary actuator for humanoid-scale joints. The current geartrain uses a driven sun, three compound planets at 120°, a fixed Ra ring integrated into the housing, and an Rb output ring. Tooth counts S=33, Ps=57, Pa=27, Pb=25, Ra=72, and Rb=75 give <b>555/11 = 50.45:1</b> reduction.<br><br>

  The design target is <b>50 N·m peak</b> and <b>30 N·m continuous</b> output torque. I pushed more reduction into the sun stage to reduce circulating power in the Wolfrom differential, then packaged the gearbox, output bearing, motor, electronics, and cable exit as one joint module. Efficiency, backlash, and backdrive performance are still targets for the metal revision and dyno, not measured final claims.<br><br>

  <picture>
    <source srcset="/assets/wolfrom-integrated-section.webp" type="image/webp">
    <img src="/assets/wolfrom-integrated-section.png" alt="Integrated Wolfrom actuator cutaway showing the output support, compound geartrain, motor, electronics, and cable exit" width="1633" height="1376" loading="lazy" decoding="async" style="display:block; max-width:82%; margin:20px auto; border-radius:8px;">
  </picture>
  <br><em style="opacity:0.7; font-size:0.9em;">Current integrated package: Wolfrom reduction and output support above the motor, with control electronics inside the lower housing.</em><br><br>

  <strong>Prototype Iteration</strong><br><br>
  I built FDM versions before committing the housing and ring interfaces to metal. The printed hardware exposed gear-mesh clearance, stack-height, bearing-placement, gear-timing, fastener-access, and split-ring assembly problems while those changes were still cheap. The prototypes are geometry and assembly checks, not load-rated actuator validation.<br><br>

  <div class="project-inline-grid">
    <figure>
      <img src="/assets/wolfrom-stand.jpg" alt="Assembled FDM Wolfrom actuator prototype on its test stand" loading="lazy" decoding="async">
      <figcaption>Assembled prototype used for stack-height, output-ring, and access checks.</figcaption>
    </figure>
    <figure>
      <img src="/assets/wolfrom-bench.jpg" alt="Wolfrom prototype open on the bench during gear timing and assembly checks" loading="lazy" decoding="async">
      <figcaption>Bench fit-check during gear timing and repeated teardown.</figcaption>
    </figure>
  </div>

  <details class="project-disclosure">
    <summary>Prototype details</summary>
    <div class="project-disclosure-content">
      The first test article used a goBILDA gearmotor and a plate stack tied together with standoffs and dowels. I used it to check whether all three compound planets could be timed and assembled, whether the split output ring remained accessible, and whether bearings and fasteners could be removed without taking the whole actuator apart.<br><br>
      <img src="/assets/wolfrom-render-side.jpg" alt="Side CAD view of the earlier plate-stack Wolfrom prototype" loading="lazy" decoding="async">
    </div>
  </details>

  <strong>Simulation and Redesign</strong><br><br>
  For the integrated Structural Steel Ra ring and housing, I checked a combined peak case with <b>50 N·m</b> torque reaction, <b>500 N</b> radial bearing load, and <b>50 N·m</b> overturning moment. The refined solution returned <b>5.34 MPa</b> peak von Mises stress and <b>1.069 µm</b> maximum deformation. Topology optimization then showed that the thick outer wall contributed little compared with the circumferential gear, bearing, and mounting structure.<br><br>

  <picture>
    <source srcset="/assets/wolfrom-manufacturable-redesign.webp" type="image/webp">
    <img src="/assets/wolfrom-manufacturable-redesign.png" alt="Manufacturable Wolfrom housing redesign with a thin outer shell, structural rings, and simple ribs" width="1202" height="692" loading="lazy" decoding="async" style="display:block; max-width:100%; margin:20px 0; border-radius:8px;">
  </picture>
  <br><em style="opacity:0.7; font-size:0.9em;">Manufacturable redesign: thin shell, preserved structural rings, simple ribs, and unchanged gear, bearing, bolt, and mating interfaces.</em><br><br>

  <details class="project-disclosure">
    <summary>Load case and hand calculations</summary>
    <div class="project-disclosure-content">
      Gravity and acceleration produced a <b>28.1 N·m</b> calculated continuous case, rounded to the 30 N·m design target. A 50 N hard-stop event at the load arm produced about <b>50.3 N·m</b>, setting the 50 N·m peak case.
      <div class="project-inline-grid">
        <figure><img src="/assets/wolfrom-hand-calcs.png" alt="Actuator hand calculations for continuous and peak output torque" width="892" height="838" loading="lazy" decoding="async"><figcaption>Arm load model and final design basis.</figcaption></figure>
        <figure><img src="/assets/wolfrom-ansys-load-case.png" alt="ANSYS combined load case and boundary conditions" width="1229" height="669" loading="lazy" decoding="async"><figcaption>Fixed mounting interfaces, frictionless lower face, and loads applied through Ra and the output bearing seat.</figcaption></figure>
      </div>
    </div>
  </details>

  <details class="project-disclosure">
    <summary>Static structural and mesh sensitivity</summary>
    <div class="project-disclosure-content">
      The preliminary integrated housing model used Structural Steel. Refining the mesh changed peak stress from <b>5.62 to 5.34 MPa</b>, about 5.1%, while deformation changed from <b>1.066 to 1.069 µm</b>, about 0.3%. I treat this as mesh sensitivity, not rigorous convergence.
      <div class="project-inline-grid">
        <figure><img src="/assets/wolfrom-ansys-stress.png" alt="ANSYS equivalent von Mises stress result" width="2048" height="855" loading="lazy" decoding="async"><figcaption>5.34 MPa peak equivalent stress.</figcaption></figure>
        <figure><img src="/assets/wolfrom-ansys-deformation.png" alt="ANSYS total deformation result" width="2158" height="896" loading="lazy" decoding="async"><figcaption>1.069 µm maximum deformation.</figcaption></figure>
      </div>
    </div>
  </details>

  <details class="project-disclosure">
    <summary>Topology optimization</summary>
    <div class="project-disclosure-content">
      I used density-based topology optimization with minimum compliance, a 50% mass response target, and a 3 mm minimum member size. Ra teeth and support, the bearing seat, mounting geometry, bolt regions, and mating faces stayed fixed. Whole-part mass moved from <b>153.4 g to 99.6 g</b>, about 35%. I used the result as a load-path study, then replaced the organic output with the shelled and ribbed housing shown above.
      <div class="project-inline-grid">
        <figure><img src="/assets/wolfrom-ansys-topology-setup.png" alt="Topology optimization preserved and design regions" width="2048" height="845" loading="lazy" decoding="async"><figcaption>Preserved functional interfaces.</figcaption></figure>
        <figure><img src="/assets/wolfrom-ansys-topology-result.png" alt="ANSYS topology density result" width="2048" height="852" loading="lazy" decoding="async"><figcaption>Density result used to identify the useful load paths.</figcaption></figure>
      </div>
    </div>
  </details>

  <details class="project-disclosure">
    <summary>KISSsoft gear analysis</summary>
    <div class="project-disclosure-content">
      The stock simple-planetary template does not cleanly represent the compound Wolfrom, so I configured the evaluated pair manually. The reported pair-level outputs were <b>1.913 / 0.000 / 1.913</b> transverse, overlap, and total contact ratio; <b>1.258 / 1.340</b> root safety; and <b>1.217 / 1.384</b> flank safety. These are not a system-level efficiency result or final gearbox validation.
      <div class="project-inline-grid">
        <figure><img src="/assets/wolfrom-kisssoft-results.png" alt="KISSsoft contact ratio and safety result table" width="890" height="248" loading="lazy" decoding="async"><figcaption>Pair-level contact and safety outputs.</figcaption></figure>
        <figure><img src="/assets/wolfrom-kisssoft-contact-stiffness.png" alt="KISSsoft contact and mesh stiffness plot" width="494" height="260" loading="lazy" decoding="async"><figcaption>Single-contact and total mesh stiffness over rotation.</figcaption></figure>
      </div>
    </div>
  </details>

  <strong>Status</strong><br><br>
  I am manufacturing the CNC aluminum structure and wire-EDM ring gears while building the dyno. The test sequence will start with contact patterns and load sharing, then measure breakaway torque, backdrive feel, output torque, and efficiency. No final backlash, torque, backdrive, or efficiency result is claimed yet.`;
```

- [ ] **Step 4: Point the Wolfrom project at the compressed description**

Replace the existing long inline `description` property with:

```js
description: wolfromDescription,
```

Keep the current tags, model, poster, gallery images, date, ordering, and excerpt.

- [ ] **Step 5: Remove the Wolfrom-only renderer injection**

Replace:

```js
const descriptionHtml = project.id === 'wolfrom-actuator'
  ? project.description.replace('<strong>Status</strong>', `${wolfromValidationSection}<strong>Status</strong>`)
  : project.description;
document.getElementById('detailDescription').innerHTML = descriptionHtml;
```

with:

```js
document.getElementById('detailDescription').innerHTML = project.description;
```

- [ ] **Step 6: Run focused tests**

Run:

```powershell
npx playwright test tmp/project-transition.spec.js --grep "Wolfrom page|Wolfrom disclosures|Wolfrom validation section stays" --reporter=line --workers=1
```

Expected: all focused tests PASS.

- [ ] **Step 7: Commit the compressed page**

Stage only `projects.html`:

```powershell
git add -- projects.html
git commit -m "Compress Wolfrom project details"
```

---

### Task 3: Visual and Regression Verification

**Files:**
- Verify: `projects.html`
- Verify: `tmp/project-transition.spec.js`
- Create for local inspection only: `tmp/wolfrom-compression-visual.spec.js`
- Create for local inspection only: `tmp/wolfrom-compressed-desktop.png`
- Create for local inspection only: `tmp/wolfrom-compressed-mobile.png`

**Interfaces:**
- Consumes: The compressed Wolfrom page from Task 2.
- Produces: Visual evidence and production-build verification.

- [ ] **Step 1: Capture desktop and mobile screenshots**

Create `tmp/wolfrom-compression-visual.spec.js`:

```js
import { test } from '@playwright/test';

test.use({ channel: 'chrome' });

test('capture compressed Wolfrom page', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5180/projects#wolfrom-actuator');
  await page.screenshot({ path: 'tmp/wolfrom-compressed-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: 'tmp/wolfrom-compressed-mobile.png', fullPage: true });
});
```

Run:

```powershell
npx playwright test tmp/wolfrom-compression-visual.spec.js --reporter=line --workers=1
```

Inspect both screenshots for:

- Original project typography.
- No metric cards or simulation kicker.
- Prototype photos visible before dropdowns.
- Five clear disclosure labels.
- No clipped captions, tables, or images.
- No horizontal overflow.

- [ ] **Step 2: Run the complete project interaction suite**

Run:

```powershell
npx playwright test tmp/project-transition.spec.js --reporter=line --workers=1
```

Expected: all existing and new tests PASS.

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm run build
```

Expected:

- Vite exits with code 0.
- `dist/projects.html` is generated.
- No new dependency or bundle is added for the dropdowns.

- [ ] **Step 4: Audit the scoped diff**

Run:

```powershell
git diff --check
git diff --stat HEAD^
git status --short
```

Expected:

- No whitespace errors.
- Product change is limited to `projects.html`.
- Local `tmp/` verification artifacts remain untracked.

- [ ] **Step 5: Push and verify production**

Run:

```powershell
git push origin main
git ls-remote origin refs/heads/main
```

Then confirm `https://aaditkannan.com/projects#wolfrom-actuator` contains `details class="project-disclosure"` after deployment.

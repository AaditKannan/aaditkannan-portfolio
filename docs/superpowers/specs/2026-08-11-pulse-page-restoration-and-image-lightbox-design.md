# Pulse Page Restoration and Site Image Lightbox Design

## Goal

Restore the technical depth of the `ns-us-pulse-generator` project page, use the supplied landscape prototype photo as its cover, and add a consistent full-size image viewer for meaningful images across the site.

## Pulse-Generator Page

The page should read as a substantial engineering case study. Its default visible state must contain enough information and visual evidence to communicate the research problem, architecture, implementation, test approach, measured result, and next revision without requiring visitors to open disclosures.

### Cover and Gallery

Use `IMG_6527.jpg` as the project card cover, first gallery image, and default gallery image. Store it under a stable `public/assets` name and generate an optimized WebP derivative. Keep the assembled enclosure, populated-board, bench-test, Revision 2 CAD, board render, layout, schematic, and relevant simulation assets in the gallery after the new cover.

### Visible Content

Keep these sections visible in the normal page flow:

- Overview and experiment purpose.
- Experiment target and measurement problem.
- V1 architecture and design loop.
- The interactive eight-state board viewer with 3D render, combined layout, top and bottom views, copper layers, silkscreen, and its existing expanded mode.
- A visible schematic/layout/simulation presentation using the existing assets.
- Physical implementation and bench characterization, including the assembled hardware and instrument setup.
- Demonstrated 30 V operation, approximately 100 ns-scale controller commands, and the measured load-dependent return-edge limitation.
- Revision 2 architecture and its 1 ns-class target, clearly labeled as a target rather than achieved V1 performance.
- Current Stage.

The writing should recover the useful technical substance from the pre-rewrite page while preserving the newer measured-result narrative. It should remove only repetitive bring-up logs, repair details, exhaustive parameter lists, and unhelpful component-value narration.

### Prototype Disclosure

Use one native, initially closed `<details class="project-disclosure">` titled `Earlier Microsecond Prototype`. It should contain the earlier prototype's explanation, physical board photograph, schematic, PCB layout, 3D render, and LTspice simulation. No other primary case-study section should be hidden in a disclosure.

### Skills

Keep the approved recruiter-facing project skills exactly:

- KiCad
- LTspice
- Python
- LabVIEW
- PCB Design
- Embedded Systems
- SMD Soldering
- Oscilloscope Testing

## Site-Wide Image Lightbox

Add one shared lightbox implementation loaded by Home, Resume, Projects, and Footage. It should enlarge meaningful content images without duplicating page-specific code.

### Included Images

- Project cards and project gallery main images.
- Inline project photographs, CAD renders, schematics, layouts, simulations, drawings, and result plots.
- The Resume profile photograph.
- Any future meaningful content image not explicitly opted out.

### Excluded Images

- Decorative/background posters and video fallback imagery.
- Hover-preview images.
- Gallery thumbnails, because the gallery main image is the enlargement target.
- Images inside an already-open lightbox.
- Embedded YouTube videos and other iframes.
- The interactive board-layer viewer, which keeps its specialized expanded viewer.

Excluded images use `data-lightbox-ignore`. Eligible images may use `data-lightbox-caption` when the nearby caption or alt text is not sufficient.

### Interaction

- Clicking an eligible image opens it in a fixed, near-full-viewport overlay.
- The overlay shows the highest-resolution source available from the image or its enclosing `<picture>`.
- Escape, backdrop click, and a close icon dismiss it.
- Previous/next controls and Left/Right arrow keys navigate images that belong to the same project gallery.
- Focus moves into the dialog when opened and returns to the triggering image when closed.
- Body scrolling is locked while open.
- Images use contain sizing and never overflow the viewport on desktop or mobile.
- Reduced-motion preferences disable nonessential transitions.

## Implementation Boundaries

- Preserve the existing board-layer lightbox and its layer-selection behavior.
- Implement generic image enlargement in shared `image-lightbox.css` and `image-lightbox.js` assets.
- Add the shared assets to the four deployable pages.
- Do not make videos or iframes behave like images.
- Do not alter unrelated project copy, navigation, theme behavior, or page widths.

## Verification

Extend `scripts/site-content.test.mjs` to protect the restored visible sections, the single prototype disclosure, the interactive board viewer, the new cover ordering, recruiter-facing skills, and shared lightbox inclusion on every page.

Run the content test and Vite production build. Then verify in a browser at desktop and mobile sizes that:

- The new landscape cover appears on the Projects card and first gallery frame.
- The visible pulse-generator page includes its technical text, layer viewer, schematic, layout, simulation, physical hardware, testing lesson, Revision 2, and Current Stage.
- Only the earlier microsecond prototype is collapsed.
- The board-layer expanded viewer still works.
- Eligible images open clearly at large size, close by all supported methods, and do not overflow.
- Project-gallery previous/next navigation works.
- Ignored decorative, thumbnail, hover-preview, and board-layer images do not open the generic lightbox.

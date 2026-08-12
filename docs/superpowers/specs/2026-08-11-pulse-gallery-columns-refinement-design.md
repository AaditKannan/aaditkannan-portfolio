# Pulse Gallery and Column Refinement Design

## Goal

Refine the `ns-us-pulse-generator` project detail so its gallery is visually varied, photographs do not show framing bars, the technical narrative retains desktop columns, and secondary detail is organized into useful disclosures without hiding the core case study.

## Reading Layout

- Restore a two-column text flow for the pulse-generator description on desktop.
- Keep the existing single-column flow at tablet and mobile widths.
- Let evidence that needs horizontal space span both desktop columns: the schematic/layout grid, interactive board-layer viewer, physical-hardware image grid, bench figure, and Revision 2 CAD grid.
- Keep section headings with their following paragraphs and prevent figures or disclosures from breaking awkwardly between columns.

## Visible Content and Disclosures

Keep the following material visible in normal page flow:

- Overview and experiment target.
- Measurement problem and V1 architecture.
- Design loop and interactive board-layer viewer.
- Physical implementation.
- Testing result, including 30 V operation, approximately 100 ns-scale controller commands, and the load-dependent return-edge lesson.
- The Revision 2 architectural response and 1 ns-class target, explicitly labeled as a target rather than a V1 result.
- Current Stage.

Use two initially closed disclosures:

1. `Revision 2 Architecture and Packaging` contains expanded R2 implementation detail and its CAD packaging views. The architectural change and target remain visible before the disclosure.
2. `Earlier Microsecond Prototype` retains the earlier prototype narrative, physical board, schematic, PCB layout, 3D render, and LTspice simulation.

No core V1 result or interactive board content is hidden in a disclosure.

## Gallery

Use six deliberately distinct gallery items in this order:

1. `/assets/pulse-v1-cover.jpg` - landscape project cover.
2. `/assets/ns-pulse-schematic-thumbnail.png` - complete current-board schematic.
3. `/assets/ns-pulse-board-layout.png` - combined PCB layout.
4. `/assets/ns-pulse-board-angle.png` - 3D board and enclosure render.
5. `/assets/pulse-v1-bench.jpeg` - bench characterization.
6. `/assets/pulse-r2-cad-front.png` - one Revision 2 packaging view.

Remove the populated-board photo, assembled-enclosure photo, and second Revision 2 CAD angle from the gallery because they duplicate adjacent subjects. They remain available in the visible case-study body where they support the corresponding text.

## Media Fit

- Keep a stable gallery frame.
- Photographs fill the frame with `object-fit: cover` so the cover and bench photographs do not show letterbox bars. Use deliberate object positions where needed to preserve the subject.
- Schematics, layouts, and CAD renders use `object-fit: contain` so technical content is not cropped.
- Technical assets receive a canvas color matching the asset background, preventing the contain area from reading as contrasting white bars.
- The click-to-enlarge lightbox continues to show the uncropped source with contain sizing.

## Boundaries

- Preserve the specialized eight-state board-layer viewer and its expanded mode.
- Preserve the generic site-wide image lightbox.
- Keep the approved recruiter-facing skills unchanged.
- Do not alter unrelated projects, navigation, theme behavior, or page widths.

## Verification

- Extend content tests to enforce the six-item gallery order, two disclosures, retained visible headings/results, and restored two-column pulse layout.
- Run the content suite, Vite production build, and `git diff --check`.
- Verify desktop and mobile in a browser.
- On desktop, confirm two text columns and full-width technical evidence with no overlap.
- Confirm the cover and bench photographs fill the gallery frame without bars.
- Confirm schematic, layout, and 3D render are present and uncropped in the gallery.
- Confirm both disclosures are initially closed and contain the intended secondary material.
- Confirm the generic image lightbox and specialized board-layer viewer still work.

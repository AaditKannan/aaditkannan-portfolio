# Wolfrom Project Page Compression Design

## Goal

Shorten the Wolfrom actuator page and return the simulation content to the existing project-page visual language. The visible page should explain the current design, show that physical prototypes were built, summarize the validation work, and state current status without requiring a long initial read.

The detailed engineering evidence remains available through native dropdowns.

## Scope

This change applies only to the `wolfrom-actuator` project detail content and its supporting styles in `projects.html`.

It does not change:

- Project routing or transitions.
- The project grid or card.
- Other project pages.
- The gallery component.
- The interactive 3D viewer.
- Existing simulation values or source assets.

## Visible Page Structure

### 1. Current Design Overview

Keep approximately two short paragraphs visible.

The overview should establish:

- Compact Wolfrom compound planetary actuator for humanoid-scale joints.
- `50.45:1` reduction.
- `50 N·m` peak output torque.
- `30 N·m` continuous design torque.
- Three compound planets at 120 degrees.
- Current focus on packaging, backdrivability, efficiency, and manufacturability.

Show the current integrated CAD cutaway. Remove the long basic explanation of why humanoid joints need backdrivability.

### 2. Prototype Iteration

Keep one short paragraph visible. It should explain that FDM prototypes were used to check:

- Gear meshing.
- Stack height.
- Bearing placement.
- Gear timing.
- Split-ring assembly.
- Teardown and assembly sequence.

Show two prototype images inline.

Add one closed `Prototype details` dropdown containing the useful plate-stack, goBILDA bench setup, fastener-access, alignment, and printed-hardware lessons. Do not repeat the same material elsewhere in the page.

### 3. Simulation and Redesign

Keep a short visible summary in the normal project-description typography. It should state the combined peak load case and the two primary structural results:

- `50 N·m` Ra torque reaction.
- `500 N` radial bearing load.
- `50 N·m` overturning moment.
- `5.34 MPa` peak von Mises stress.
- `1.069 µm` maximum deformation.

Show the manufacturable housing redesign as the visible simulation image.

Place detailed evidence in four closed dropdowns:

1. `Load case and hand calculations`
2. `Static structural and mesh sensitivity`
3. `Topology optimization`
4. `KISSsoft gear analysis`

Each dropdown should retain only the relevant images, values, and short interpretation already supported by the source material.

The KISSsoft dropdown must retain:

- `1.913 / 0.000 / 1.913` contact ratios.
- `1.258 / 1.340` root safety factors.
- `1.217 / 1.384` flank safety factors.
- The existing statement that these are pair-level outputs, not final system efficiency or completed gearbox validation.

### 4. Current Status

Keep one short visible paragraph.

It should state that the CNC aluminum and wire-EDM revision and dyno are in progress. It must not imply completed torque, efficiency, backlash, or backdrive validation.

## Content Reduction

Target approximately 350 to 450 visible words before any dropdown is opened.

Remove or heavily consolidate:

- The long general explanation of humanoid-joint backdrivability.
- Repeated explanations of the Wolfrom architecture.
- Repeated lists of ring-mesh, bearing, load-sharing, backlash, and manufacturing concerns.
- Repeated descriptions of old plate-stack CAD.
- Duplicate prototype and packaging captions.
- The standalone metric-card presentation.

Keep detailed content only once, either visible or inside the most relevant dropdown.

## Visual and Interaction Rules

- Use semantic `<details>` and `<summary>` elements.
- Dropdowns are closed by default.
- Do not add a dependency or custom accordion library.
- Use the existing `detail-description` font, size, line height, colors, spacing, and two-column behavior.
- Do not use the simulation-specific kicker, large `h3` headings, metric grid, standalone full-width report layout, or separate typography.
- Dropdown summaries should resemble the existing bold section headings.
- Use a simple divider and disclosure marker only. Do not style dropdowns as cards.
- Inline captions should match existing project captions.
- On mobile, dropdown content and images must remain inside the viewport.
- Existing gallery images remain available for larger viewing.

## Accessibility

- Native keyboard and screen-reader behavior comes from `<details>` and `<summary>`.
- Summary labels must describe the hidden content directly.
- Images retain meaningful alt text.
- The disclosure marker must not be the only indicator of the summary label.

## Verification

Verify:

- Visible copy is between approximately 350 and 450 words.
- All five dropdowns are closed on initial load.
- Each dropdown opens with keyboard and pointer input.
- Existing ANSYS and KISSsoft values remain unchanged.
- No simulation-specific font or metric-card styling remains active.
- No horizontal overflow at 390 px.
- Inline and gallery images load successfully.
- Project entry/exit transitions remain unchanged.
- Production build and the existing Playwright project suite pass.

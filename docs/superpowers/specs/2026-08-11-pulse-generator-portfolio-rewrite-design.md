# Pulse Generator Portfolio Rewrite Design

## Goal

Rewrite the `ns-us-pulse-generator` project detail so a portfolio visitor can understand the project in about one minute. The page should tell a concise `built -> tested -> learned -> redesigned` story without reading like a lab report.

## Content Structure

The visible introduction explains the research use case, the V1 architecture, the demonstrated 30 V and sub-microsecond operation, and the load-dependent return-edge lesson. It is followed by a strong assembled-hardware photograph.

Three native, initially closed `<details class="project-disclosure">` sections provide optional depth:

1. `Architecture Validation - V1 Board`
2. `Testing + Key Design Lesson`
3. `Revision 2`

The page ends with a visible `Current Stage` section. Only the important numbers remain: 30 V, approximately 100 ns-scale command timing, and a 1 ns-class Revision 2 target.

## Image Direction

- Lead image: `IMG_6524.jpeg`, showing the assembled enclosure and hardware.
- Architecture section: `IMG_6518.jpeg`, showing the populated V1 PCB inside the enclosure.
- Testing section: `IMG_6513.jpeg`, showing the V1 hardware connected to Keithley and Tektronix bench equipment.
- Revision 2 section: the two supplied CAD renders shown together as a compact inline grid.

Images use descriptive alternative text, short captions, lazy decoding below the lead image, and optimized WebP derivatives where practical. The existing Wolfrom detail treatment is the visual reference: native disclosures, restrained image corners, short captions, and no metric cards.

## Editorial Constraints

- Keep approximately 250-350 visible words outside the closed disclosures.
- Do not include repair logs, relay pin details, resistor values, PIO indices, exhaustive voltage steps, scope settings, timing tables, or speculative architecture options.
- Do not claim that V1 achieved a 1 ns pulse.
- Clearly distinguish demonstrated V1 performance from Revision 2 targets.
- Keep the existing project title, category, dates, filters, and Ramesh Lab relationship.

## Verification

Extend `scripts/site-content.test.mjs` to assert the three disclosure labels, the visible Current Stage section, the three retained performance numbers, the absence of superseded report-style headings, and references to all five supplied images. Run the content test and production build, then visually verify the deep-linked project detail on desktop and mobile.

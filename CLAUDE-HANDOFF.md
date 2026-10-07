# Claude handoff: portfolio project pages

Prepared 7 October 2026 for continuing the portfolio work in this repository.

This is a working brief for the next coding agent. It records the user's design direction and the current implementation so changes can continue without reverting to an earlier visual direction. The brief is not a request to redo the Wolfrom page from scratch. Read the current source before changing anything, because the live implementation is the source of truth where it differs from this handoff.

## The goal

Carry the strongest parts of the Wolfrom project page into the other technical project pages, especially Formula Electric cooling, while giving each project its own appropriate visual narrative. Keep the site coherent, readable, and technically credible. The Formula Electric page should not get a fake exploded CAD animation. Its distinctive interaction can animate the simulations and their evidence instead.

The user is likely to move this brief and the repository work to Claude due to usage limits. Make small, reviewable changes and leave the site in a usable state after each iteration.

## Non-negotiable design direction

- Keep the warm cream background, dark navy text, and serif type system already used by project detail pages. The project page font stack is `--font-latex: 'STIX Two Text', 'Latin Modern Roman', 'Computer Modern', 'Times New Roman', serif`. The warm light background is approximately `#f5f2ee` and the text is approximately `#0f172a`. Check existing variables in `projects.html` before adding new colors.
- Keep the refined, LaTeX-paper-like character: readable serif body copy, restrained headings, deliberate white space, real equations where they add value, captions, and understated section rules.
- Do not add all-caps labels, oversized status badges, dramatic marketing copy, decorative panels, gratuitous borders, boxed dropdowns, random rules, or invented content at the top or bottom of a page.
- Avoid em dashes. Use commas, parentheses, or separate sentences.
- The user repeatedly rejected unnecessary formatting and artificial polish. A layout should be explained by the content, not by a desire to add more visual components.
- Underline actual hyperlinks so they read as links, including Contents links and contextual links between sections. Keep links readable in both themes and preserve focus-visible states.
- Text on cream must be comfortably readable. Do not shrink labels or body text to make a dense layout fit. Avoid pale text on cream.
- Use two columns as a reading relationship, not a newspaper flow. Pair a bounded-width prose column with evidence that directly supports it. On desktop, a section can have prose on one side and a graph, photo, equation, or table on the other. Then the next section starts as its own row. Never let readers scroll down one very long column and back up another to match the explanation to the evidence.
- Keep table borders when they improve scanability. The user specifically said outlines on tables are okay. Do not extend table borders to every image, disclosure, or content group.
- Keep genuine project images prominent, especially physical build photos. Do not substitute CAD renders for evidence of fabrication or assembly when the text is about the build.
- Check the mobile version as a first-class layout. A long one-column project needs an intuitive, compact section menu. In `projects.html`, the project Contents UI becomes a dropdown on smaller screens. Preserve and verify it, including menu open/close, active-section state, anchors, and touch sizing.

## Repository and implementation map

- `projects.html` contains project detail markup as JavaScript template strings, project data, shared gallery/sidebar rendering, Contents generation, section links, theme rules, and project-specific CSS.
- `styles.css` is the shared site stylesheet. Avoid broad typography or navigation changes here unless a visible inconsistency genuinely requires it.
- `resume.html`, `index.html`, and `footage.html` are separate pages. Do not wholesale rewrite them as a side effect of changing project details.
- `wolfrom-explode.css` and `wolfrom-explode.js` implement the Wolfrom-specific scroll-driven 3D sequence and lazy-loaded interactive CAD mode.
- `scripts/site-content.test.mjs` contains content and structure assertions. Update it when an intentional content contract changes, and add checks for important new behavior.
- `public/assets/` contains supplied project evidence, including CAD images, ANSYS results, MATLAB plots, prototype photographs, Formula Electric cooling images, and `actuator.glb`.
- The current working tree contains substantial uncommitted edits and many untracked assets. They are part of the active work. First inspect `git status` and the relevant diff. Do not reset, clean, checkout, or overwrite files or assets to get back to an earlier state. Do not discard assets because Git currently lists them as untracked.
- The dev server has previously been available at `http://127.0.0.1:3000/projects.html`. If it is not running, use the existing `npm run dev` workflow. Do not leave duplicate dev servers running.

## Current Wolfrom page and decisions to preserve

The project is registered in `projects.html` as `id: 'wolfrom-actuator'`, titled **Wolfrom Robotic Actuator**. Its content is in `wolfromDescription` and its data entry near the projects array.

### Page flow

1. The project opens with a scroll-driven actuator architecture section, with the model on the left and the explanatory copy on the right. It is intentionally the first substantial content and should feel impressive immediately, not like a blank intro followed by the project.
2. The architecture animation explains the assembly stack and transitions back to the assembled model. It has an explicit “Skip animation” control. “Interact with model” switches into the CAD viewer on demand. The GLB must remain lazy and should not be preloaded on page entry.
3. A separate gallery and tools section follows the architecture. Gallery and skills belong in this intentional location, not stranded after a random content section.
4. The rest of the case study is divided into named, independently readable sections. On desktop, `layoutWolfromSections()` pairs each section's bounded prose with its relevant evidence. Long technical explanations and additional figures can span the row below. This prevents full-page columns from disconnecting images from their explanations.
5. The Contents menu points to the section IDs and tracks the active section. Links in the prose can jump to the same targets.

### Wolfrom layout implementation details

- The relevant layout helper is `layoutWolfromSections(description)` in `projects.html`. It maps a primary evidence item to each section, then creates `.wolfrom-section-body`, `.wolfrom-prose`, `.wolfrom-evidence`, and optional `.wolfrom-supplement` elements. The evidence map is intentionally section-specific. Do not replace it with `columns: 2` or a site-wide masonry layout.
- Short section breaks are currently drawn with a short, light top rule before subsequent `.latex-section` elements. Preserve this quiet use of a rule. Do not add a rule to every paragraph or every content block.
- The Contents menu is sticky/positioned beside the reading column on desktop and becomes a compact expandable menu on mobile. It is wired to `data-project-section` links and active-section tracking. Do not rename section IDs casually. If an ID changes, update every Contents link, cross-link, and test.
- `project-disclosure` is the native `<details>` style. It is deliberately unboxed and several disclosures start open if their contents are essential. Do not box or underline summaries as if they are buttons. Critical information must not be hidden only in a disclosure.
- Tables use `.project-data-table`, with restrained borders for legibility.
- Gallery and skills use `.wolfrom-gallery-section`, `.wolfrom-gallery-row`, `.wolfrom-gallery-slot`, and `.wolfrom-tools-slot`. Preserve their deliberate side-by-side placement and avoid reintroducing a second disconnected gallery elsewhere.
- Prototype board photos use `.wolfrom-build-board`. The board can have a subtle taped/posterboard quality, with large physical build images in one column and concise explanation in the other. It is intentionally distinct from CAD galleries.

### Wolfrom technical content and truthfulness

Preserve first-principles work and the actual decision trail. Do not trim useful calculations because there are many images or because the page is visually dense. The page currently contains:

- Ratio derivation for the three-stage compound Wolfrom arrangement, including tooth counts and the 50.45:1 result.
- Hand-derived elbow/load cases, planet mesh forces, bearing reactions, and the bearing rating issue. The hand calculations are not to be dropped. They remain valuable for load paths and mechanical sizing even though the user prefers KISSsoft for the upcoming efficiency prediction.
- MATLAB rolling-power and forward/backdrive efficiency screening. Treat assumptions and predictions as assumptions and predictions, not test results.
- KISSsoft and ANSYS screenshots. Keep captions precise about which gear pair or housing run each image shows. Pair-level KISSsoft evidence is not the same as the final, coupled three-stage output-efficiency calculation.
- Design decisions such as the two different ring-stage modules, 22.5 mm common centre distance, planet support issue, and floating-carrier load path. These are evidence-backed tradeoffs, not generic “design decisions” cards.
- The printed prototype is for geometry, fit, stack-up, timing, assembly, and access checks. It is not load-rated or validated at the 30 Nm or 50 Nm targets.
- Test and validation describes a proposed dyno, required sensors, measurements, and safe test sequence. It is a proposed architecture, not a completed or validated bench.
- Efficiency targets currently shown include forward efficiency greater than 80% and a derived backdrive efficiency target of at least 75% at 30 Nm and 30 rpm. Do not present the final coupled KISSsoft result as complete until it is.

The immediate next step is to rate the three stages separately in KISSsoft, couple those stage results through the Wolfrom train, and derive the total theoretical forward and backdrive efficiency. If that model clears the efficiency targets, proceed to a production-intent model using steel gears and aluminium housings. Keep later profile-shift work in the right order, after the stage-level efficiency gate. Bench testing still follows analysis and is required to validate the real actuator.

### Wolfrom image rules

- Avoid using an image with loose, floating bolts as the ordinary assembled hero or static architecture poster. The current poster uses `/assets/gear-train.png`, which is the no-loose-bolts version. Respect the user's repeated correction on this.
- Exploded views belong in the gallery or a deliberate exploded-view interaction. The wide exploded image is a gallery item, not a replacement for the assembled actuator's cover image.
- Keep the three-quarter section view available in the gallery. ANSYS images belong with simulation evidence, not in the physical build board.
- CAD exports with white backgrounds need careful presentation against cream. Prefer an unobtrusive image/canvas treatment or reliable background compositing. Do not put a glaring white rectangle on cream, but also do not apply a destructive transparency filter that erases light CAD geometry or section hatching. Verify the actual image at full gallery size and on the thumbnail strip.
- Add the `V1 prototype` label only to photographs that show the actual printed prototype. The current implementation uses a small white label over a dark translucent backing in the top corner of the build photos and the assembled physical-prototype gallery photo. Do not label renders or ANSYS/MATLAB figures as V1.
- Make sure gallery images have stable dimensions/aspect ratios and matching canvas colors before lazy-loaded assets arrive. The user has specifically reported a white flash during thumbnail loading.

## Extending the system to other project pages

### Shared structure, not copied content

Apply the reading logic, not Wolfrom's specific animation, colors, jargon, or exact section count. Every project should have:

1. A fast, informative opening that makes the project and the user's own contribution obvious.
2. A compact project info/skills presentation in the established location, with skills grouped in meaningful categories rather than a chopped-up tag cloud.
3. Sections ordered as a coherent technical argument: need or requirement, model/approach, evidence/results, decisions, build or implementation, validation, and next step where applicable.
4. Each section's relevant prose and figure/table/graph presented together in a two-column reading row when screen width allows. Use a controlled prose width. Avoid full-page CSS columns for projects with substantial figures or disclosures.
5. Additional evidence placed below its explanation when it cannot fit beside it without shrinking the figure or text.
6. A usable Contents menu for long pages, with functioning anchors and active state. On mobile, keep a compact expandable menu available so visitors are not forced to swipe through a very long page without navigation.

Do not force a section to have an image merely to create symmetry. A section with no appropriate evidence can use a bounded prose-only layout. Conversely, do not stack all figures at the end of a section just because a two-column row is difficult. Reorganize the row or use a lower evidence supplement.

Do not use a one-size-fits-all sticky interaction. Use one only when it helps explain a real sequence, and make sure its height, spacing, exit state, reduced-motion behavior, and mobile fallback are all handled.

### Formula Electric cooling page

The page content is `formulaElectricCoolingDescription` in `projects.html`, with project ID `formula-electric`. It concerns Berkeley Formula Electric's SN6 accumulator cooling. It already contains a substantial technical narrative and supplied evidence. Preserve it rather than rewriting it into a generic project summary.

The page currently covers:

- A 420-cell pack in ten 14s3p modules, five exhaust fans, a 35 °C ambient endurance case, and a 57 °C temperature target below the 60 °C ceiling.
- First-principles heat balance and current/load cases, including SN5 evidence and explicit distinctions between measured SN5 data and SN6 predictions.
- MATLAB airflow/fan modelling, inlet and divider losses, and exhaust-gap tradeoffs.
- ANSYS Icepak transient results. The current 50 A design case predicts a 54.6 °C hottest cell after 25 minutes but a 13.9 K pack temperature range, so uniformity remains a real problem.
- Proposed geometry changes and planned validation measurements. These are not yet completed validation results.
- Existing supporting assets with names such as `formula-cooling-transient-50a.jpg`, `formula-cooling-transient-50a-top.jpg`, `formula-cooling-airgap-trade.jpg`, `formula-cooling-endurance-model.jpg`, `formula-cooling-event-energy.jpg`, `formula-cooling-heat-budget.jpg`, and the hand-calculation images. Inspect the asset before assigning it. Do not infer its exact result from its filename alone.

The current markup uses independent `.latex-section` elements and the CSS for `formula-electric` currently lays them out as a two-column grid. Review how that behaves with long disclosures and figures. The desired direction is section-by-section pairing, like the Wolfrom reading rows, not a continuous newspaper column where a reader loses which text belongs to which image. Preserve the current section order unless there is a clear narrative reason to improve it, and keep the Contents menu synchronized.

### Formula Electric interaction idea

The user does not want a fake exploded actuator animation on the cooling page. The distinctive interaction can make the actual simulation work easier to understand. Propose and implement a restrained scrollytelling sequence only when it can be grounded in the supplied assets/data. Examples of valid stages:

1. Establish the pack and the 25-minute, 50 A design case.
2. Show the inlet, module 1, divider, module 2, and exhaust path. Identify where pressure loss and bypass occur.
3. Reveal the transient temperature field or temperature progression, tied to the exact 54.6 °C peak and 13.9 K spread.
4. Show the geometry change or comparison that addresses the downstream hot cells, if there is real evidence for it.
5. End with the measurements that will validate the model, not a false “success” state.

These are concepts, not permission to invent CFD frames, fabricated measurements, or final design outcomes. A good implementation could keep one simulation image or diagram in a stable visual region while concise copy changes as the user scrolls. It must not make all subsequent page content inherit a giant sticky section or force readers to scroll backward to continue reading. The regular section rows after the interaction should remain independent and unaffected by its special layout. Provide a visible skip/continue route if an interaction is long. Respect `prefers-reduced-motion`, provide a static fallback, avoid loading large media until needed, and keep the mobile path straightforward.

## Page-wide copy and information hierarchy

- State what the user designed, modeled, built, or measured. Prefer concrete actions and outcomes to promotional adjectives.
- Use direct factual headings such as “Cooling Problem,” “Airflow Model,” “What CFD Showed,” “Build,” and “Results and Validation.” Avoid dramatic invented headings such as “One actuator, 50.45:1.” Put the ratio in a specification sentence or caption instead.
- Keep “Skills” useful and organized. Group by discipline or method, for example “Mechanical design,” “Analysis,” and “Manufacturing,” rather than presenting a long stream of tiny dot-separated skills.
- Keep specs and status close to the relevant evidence. Do not append a generic status block to the top or bottom of every page.
- Maintain clear distinctions among measured, calculated, simulated, targeted, and planned values. Be especially careful with engineering performance claims.
- Where data is not supplied, use a compact “to be measured” or “target” label only if it is genuinely useful. Do not leave editorial placeholders such as “To be added” in polished public copy unless the user explicitly wants that reminder visible.
- Link supporting sections with underlined, working links. Verify the destination section ID and TOC behavior after content is rearranged.

## Responsive behavior and accessibility

- Desktop: give each section a paired prose/evidence layout with a comfortable text measure. Images should be large enough to inspect, never stretched to fill a box, and use `object-fit: contain` for diagrams and CAD unless a deliberate crop is needed for a photo.
- Tablet and mobile: stack each paired row in a deliberate order. Keep captions with their figures. Prevent horizontal overflow from tables, equations, or wide charts. A table can scroll within its own wrapper if necessary, but the whole page must not overflow sideways.
- Preserve sticky/expandable Contents behavior and ensure its links remain tappable. Close the menu after selecting a section if the current behavior does so.
- Buttons and links need keyboard focus styling, semantic labels, and adequate hit areas. Motion must not be the only way to understand a result.
- Respect `prefers-reduced-motion`. Use a static image/figure and legible prose when scroll or 3D effects are disabled or unsupported.
- Always test theme contrast, especially image labels and captions in both light and dark themes.

## Safe working process for the next agent

1. Read this file, then inspect `git status --short` and diffs before editing. Treat existing uncommitted changes and untracked assets as intentional user work.
2. Inspect `projects.html` at the relevant project ID and identify whether it already has explicit `<section class="latex-section">` blocks, a shared gallery, sidebar skills, Contents links, and page-specific CSS. Reuse these rather than replacing the page architecture.
3. Make a small scoped edit. Avoid a full-file formatter or broad CSS rewrite that obscures the user's existing changes.
4. Check the edited page in the local browser at desktop and mobile widths. Inspect the first viewport, an in-page section, TOC behavior, and the end of any special interaction. If browser interaction is unavailable, say so and run static checks instead.
5. Run `node scripts/site-content.test.mjs` and `npm run build`. The current build may emit a pre-existing large JavaScript chunk warning from Three.js. Do not “fix” that by removing the CAD viewer or its functionality without checking with the user.
6. Summarize what changed, what was tested, and any true missing input or unsupported result. Keep the user-facing handoff concise. Do not claim a simulation or validation result that the page only proposes.

## Acceptance checklist

- The established cream and serif visual language remains recognizable and consistent.
- No old all-caps, box-heavy, random decorative style has crept back in.
- Each section keeps related explanation and evidence together, with bounded text width.
- A long project has a useful Contents menu on desktop and mobile, with working and underlined links.
- Figures and tables are correctly sized, captions stay attached, and page width does not overflow.
- The project's unique interaction is grounded in its real work, skippable where appropriate, and has a reduced-motion/static fallback.
- Physical build photos are not confused with CAD or simulation images.
- Technical facts, targets, predictions, and measured results are labeled accurately.
- Existing Wolfrom calculations, design decisions, ANSYS/KISSsoft evidence, and proposed dyno content remain intact.
- `node scripts/site-content.test.mjs` and `npm run build` pass, or any existing failure is clearly distinguished from the new work.

# Project page review

Every project page goes through these passes before it is pushed. A page is done only when an
independent reviewer has checked it against this list and every finding is either fixed or
recorded below as a question for Aadit. CLAUDE-HANDOFF.md sets the visual direction; this file
sets the checks.

## 1. Read everything first

- Read the full description, the project data (title, date, category, excerpt, links, tags,
  skills, gallery), and look at every image at full size, including the card cover.
- Note what the project actually is, what Aadit personally did, and what the evidence shows.
  Nothing gets rewritten until this is clear.

## 2. Truth and ownership

- Every number, claim, and result stays as written unless Aadit corrects it. Keep the
  measured / predicted / target / planned distinctions.
- Ownership is stated accurately: solo work says "I", team work says what Aadit did within the
  team. Never inflate a role, and never write "my work" sections for solo projects.
- Nothing is invented: no outcomes, awards, metrics, or quotes that the source does not state.
  Anything unclear becomes a question for Aadit, never a guess.

## 3. Order and structure

- The page opens with what the project is and the result or status, then the problem, then the
  work, then what was learned or what comes next.
- Each section has one job. Facts appear once, in the section where they matter most.
- Headings say what the section is about, are in plain words, and match the Contents.
- Short projects stay short. A 250-word page does not need six sections.

## 4. Writing (Aadit's voice)

- First person, plain and specific, cause and effect visible ("so", "since", "because").
- No contractions, no em or en dashes (also none in code comments or tests), and none of
  "not X but Y", "not just", "rather than", "instead of".
- No filler, hype, or marketing language. Every sentence carries information.
- Captions state the takeaway, not just what the image is.

## 5. Images

- Every image is relevant, correctly captioned, and appears once on the page (the gallery can
  repeat a body figure only if it is the cover).
- CAD renders and white-background exports sit on the page colour: no grey boxes, window
  chrome, toolbars, gradient viewports, stray edge lines, or clipped content.
- Photos stay photos; physical builds use real photos as covers.
- Crops keep the full subject; the card cover is visually centred and nothing is cut off.
- WebP copies are regenerated whenever a PNG or JPEG is changed.

## 6. Layout

- Check at 1440 px and at phone width. In each row, text and evidence end within about 120 px
  of each other; no large empty columns, no figure piles, no squashed or stretched images.
- No dropdowns. Content is either worth showing or cut.
- Tables are readable at their width; wide tables span the row.

## 7. Verify and ship

- `node scripts/site-content.test.mjs` and `npm run build` pass; tests that pin old content are
  updated only for intentional changes.
- Check the page in the browser: renders, no console errors, Contents links work, images load.
- An independent reviewer (fresh agent) reads the finished page against this file and reports
  findings; fix them, then commit one page per commit and push.

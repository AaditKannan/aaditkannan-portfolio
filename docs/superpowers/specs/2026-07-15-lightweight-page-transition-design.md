# Lightweight Page Transition Design

## Goal

Keep navigation between the static pages visually continuous without delaying media loading, pausing the homepage video, or promoting the full Projects grid into a composited layer.

## Root Cause

The current shared transition animates every top-level body child with `opacity` and `transform`. This includes the homepage video wrapper and the Projects page `<main>` element. It also waits 145 ms before beginning navigation. The result is unnecessary large-layer compositing and a visible loading pause.

## Design

- Keep the existing same-origin link interception and hash-routing safeguards.
- Replace all content transforms and opacity animations with a fixed `html::after` color cover.
- Keep the navigation visually above the cover only while a transition is active.
- Fade the cover in for 70 ms before navigation and out for 120 ms after the destination begins rendering.
- Do not animate or mutate video, images, `<main>`, galleries, project cards, or other content containers.
- Restore each page's original navigation positioning instead of globally forcing `.nav-bar` to `position: fixed`.
- Continue to bypass transitions for reduced motion, modifier clicks, external links, downloads, and same-document hash changes.

## Verification

- Homepage video wrapper and Projects `<main>` retain `animation-name: none` and `transform: none` during transitions.
- Cross-page navigation no longer includes the previous 145 ms hold.
- Home, Resume, Projects, Connect, and Footage remain mutually navigable.
- Resume anchors, project hashes, browser back, project detail transitions, and mobile containment continue to pass.
- Production build includes the shared transition script.

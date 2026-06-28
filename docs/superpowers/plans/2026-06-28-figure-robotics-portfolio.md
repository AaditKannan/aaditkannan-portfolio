# Figure Robotics Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an 8-10 page Figure Robotics-targeted PDF portfolio from the existing aaditkannan.com project pages and assets.

**Architecture:** Generate a standalone PDF with ReportLab using curated project content and media from `public/assets`. Render the resulting PDF to PNG pages with Poppler and inspect the visuals before delivery.

**Tech Stack:** Python, ReportLab, Pillow, Poppler `pdftoppm`, existing static website assets.

## Global Constraints

- Do not simply export the website.
- Reframe content for Figure Robotics mechanical and hardware roles.
- Prioritize Wolfrom actuator, Formula Electric accumulator, Ramesh Lab ns/us pulse generator PCB, Custom Toolbox, and FIRST Robotics hardware.
- Include website and projects page links on the home/cover page.
- Keep the portfolio image-heavy, technical, and recruiter-readable.

---

### Task 1: Generate Portfolio PDF

**Files:**
- Create: `tools/build_figure_portfolio.py`
- Create: `output/pdf/aadit-kannan-figure-robotics-portfolio.pdf`

**Interfaces:**
- Consumes: curated assets from `public/assets`.
- Produces: a landscape PDF for review and delivery.

- [ ] **Step 1: Build the ReportLab script**

Write a script that defines pages for cover, Wolfrom actuator, Formula accumulator, pulse generator, toolbox, FIRST Robotics, and a closing capability summary.

- [ ] **Step 2: Run the generator**

Run: `python tools/build_figure_portfolio.py`

Expected: `output/pdf/aadit-kannan-figure-robotics-portfolio.pdf` exists.

### Task 2: Render And Verify

**Files:**
- Create: `tmp/pdfs/figure-portfolio-page-*.png`

**Interfaces:**
- Consumes: `output/pdf/aadit-kannan-figure-robotics-portfolio.pdf`.
- Produces: rendered PNGs for page inspection.

- [ ] **Step 1: Render PDF pages**

Run: `pdftoppm -png output/pdf/aadit-kannan-figure-robotics-portfolio.pdf tmp/pdfs/figure-portfolio-page`

Expected: one PNG per PDF page.

- [ ] **Step 2: Inspect rendered pages**

Open page renders and check for clipped text, broken images, unreadable captions, and layout collisions.

- [ ] **Step 3: Iterate if needed**

Patch the generator and rerun until pages are readable and polished.

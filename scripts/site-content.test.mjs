import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function readPage(file) {
  return readFileSync(join(root, file), 'utf8');
}

function topNav(html) {
  const match = html.match(/<nav class="nav-bar[^"]*">([\s\S]*?)<\/nav>/);
  assert.ok(match, 'Expected a top navigation block');
  return match[1];
}

const navPages = ['index.html', 'resume.html', 'projects.html', 'footage.html'];

for (const page of navPages) {
  const nav = topNav(readPage(page));
  assert.match(nav, /href="\/footage"[^>]*>\s*Footage\s*<\/a>/, `${page} should include Footage in top nav`);
  assert.match(nav, /href="\/resume"[^>]*>\s*Resume\s*<\/a>/, `${page} should label the resume page as Resume`);
  assert.doesNotMatch(nav, /href="\/connect"|>\s*CONNECT\s*<\/a>/, `${page} should not include Connect in top nav`);
}

const home = readPage('index.html');
const homeIntro = 'Aadit Kannan - MechE/EECS student at UC Berkeley interested in robotics, semiconductors, and space.';
assert.match(home, new RegExp(homeIntro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Home metadata should use the requested MechE/EECS intro');
assert.doesNotMatch(home, /ROBOTICS\s*\/\s*SEMICONDUCTORS\s*\/\s*SPACE/, 'Home page should not show the robotics/semiconductors/space interests line');
assert.doesNotMatch(home, /class="home-interests"/, 'Home page should not render an interests line under the subtitle');
assert.match(
  home,
  /\.footage-credit\s*{[\s\S]*font-size:\s*clamp\(13px,\s*1vw,\s*16px\)/,
  'Home footage attribution should use the larger footage-credit style'
);
assert.match(
  home,
  /class="footage-credit"[\s\S]*Site[\s\S]*href="\/footage"[\s\S]*filmed by me/,
  'Home should visibly credit site footage as filmed by me'
);

const resume = readPage('resume.html');
const projects = readPage('projects.html');
const footage = readPage('footage.html');
const deployableSource = [
  home,
  resume,
  projects,
  footage,
  readPage('vite.config.js'),
  readPage('vercel.json'),
].join('\n');

for (const [page, html] of Object.entries({ 'index.html': home, 'resume.html': resume, 'projects.html': projects, 'footage.html': footage })) {
  assert.match(html, /href="\/image-lightbox\.css"/, `${page} should load the shared image lightbox styles`);
  assert.match(html, /src="\/image-lightbox\.js"/, `${page} should load the shared image lightbox behavior`);
}
assert.ok(existsSync(join(root, 'image-lightbox.css')), 'Shared image lightbox stylesheet should exist');
assert.ok(existsSync(join(root, 'image-lightbox.js')), 'Shared image lightbox script should exist');
const imageLightbox = readPage('image-lightbox.js');
assert.match(imageLightbox, /role.*dialog|setAttribute\(['"]role['"],\s*['"]dialog['"]\)/s, 'Image lightbox should expose dialog semantics');
assert.match(imageLightbox, /aria-modal/, 'Image lightbox should be modal for assistive technology');
assert.match(imageLightbox, /Escape/, 'Image lightbox should close with Escape');
assert.match(imageLightbox, /ArrowLeft/, 'Image lightbox should support previous-image keyboard navigation');
assert.match(imageLightbox, /ArrowRight/, 'Image lightbox should support next-image keyboard navigation');
assert.match(imageLightbox, /event\.stopImmediatePropagation\(\)/, 'Image lightbox keyboard handling should not leak Escape into the project-detail view');
assert.match(imageLightbox, /document\.addEventListener\('keydown',[\s\S]*?\},\s*true\);/, 'Image lightbox keyboard handling should run in the capture phase');
assert.match(imageLightbox, /MutationObserver/, 'Image lightbox should discover dynamically rendered project images');
assert.match(imageLightbox, /data-lightbox-ignore/, 'Image lightbox should honor explicit image exclusions');
assert.match(imageLightbox, /IGNORE_SELECTOR[^\n]*\.project-card/, 'Project-card images should navigate to project details without opening the lightbox');
assert.match(home, /class="bg-poster"[^>]*data-lightbox-ignore/, 'Home background poster should not open in the lightbox');
assert.match(resume, /id="aboutPreviewImg"[^>]*data-lightbox-ignore/, 'Resume hover preview should not open in the lightbox');
assert.match(projects, /id="projectHoverPreviewImg"[^>]*data-lightbox-ignore/, 'Project hover preview should not open in the lightbox');
assert.match(projects, /class="gallery-thumb[^>]*data-lightbox-ignore/, 'Project gallery thumbnails should not open duplicate lightboxes');
const numberedRobotMentions = deployableSource.match(/\b\d+\+?(?:\s+[A-Za-z-]+){0,3}\s+robots\b/g) ?? [];
assert.deepEqual(numberedRobotMentions, ['5 robots'], 'The only numbered robot count across the deployable site should be 5 robots');

const contrastPattern = new RegExp(
  String.raw`\bno` + String.raw`t\b[^.!?;\n]{0,140}\bbu` + String.raw`t\b|\bno` +
    String.raw`t just\b|\bra` + String.raw`ther than\b|\bin` + String.raw`stead of\b`,
  'i'
);
assert.doesNotMatch(deployableSource, contrastPattern, 'Deployable site source should avoid contrast-copy phrasing');
assert.doesNotMatch(deployableSource, /x[- ]?ray diffraction|xrd/i, 'Deployable site source should not mention XRD or x-ray diffraction');
assert.doesNotMatch(deployableSource, /<span class="skill-pill">\s*(AFM|PFM|XRD)\s*<\/span>/i, 'Resume skill pills should not list AFM, PFM, or XRD');
assert.doesNotMatch(deployableSource, /tags:\s*\[[^\]]*['"](AFM|PFM|XRD)['"]/i, 'Project tags should not list AFM, PFM, or XRD as skills');
assert.doesNotMatch(deployableSource, /Thin-Film Characterization,\s*(XRD|AFM|PFM)/i, 'Resume technical skills should not list AFM, PFM, or XRD');
assert.doesNotMatch(deployableSource, /\bPLD\b|pulsed laser deposition|pldtracker|PLD Growth|Growth and Deposition Work/i, 'Deployable site source should not mention PLD growth work or PLDTracker');
assert.doesNotMatch(deployableSource, /anneal(?:ing)?|\bRHEED\b/i, 'Deployable site source should not mention annealing or RHEED');
assert.doesNotMatch(deployableSource, /\+?1?\s*\(?734\)?[\s)-]*546[\s-]*0380/, 'Deployable site source should not expose the phone number');
assert.doesNotMatch(deployableSource, /aaditkannan@berkeley\.edu/i, 'Deployable site source should not expose the raw Berkeley email address');
assert.doesNotMatch(deployableSource, /mailto:/i, 'Deployable site source should not include raw mailto links');
assert.match(home, /aaditkannan\[at\]berkeley\[dot\]edu/, 'Home footer should show the obfuscated Berkeley email');
const publicPdfAssets = readdirSync(join(root, 'public', 'assets')).filter((file) => file.endsWith('.pdf'));
const staleResumePdfAssets = [
  'AaditKannan_v33.pdf',
  'AaditKannanResumeJune.pdf',
  'KannanAaditResumeFebruary.pdf',
  'KannanAaditResumeJanuary.pdf',
  'KannanAaditResumeMarch13.pdf',
  'Kannan_Aadit_Resume_March.pdf',
  'NewResume.pdf',
];
for (const file of staleResumePdfAssets) {
  assert.equal(existsSync(join(root, 'public', 'assets', file)), false, `${file} should not be published`);
}
for (const file of publicPdfAssets) {
  const contents = readFileSync(join(root, 'public', 'assets', file)).toString('latin1');
  assert.doesNotMatch(contents, /aaditkannan@berkeley\.edu/i, `${file} should not include the raw Berkeley email bytes`);
  assert.doesNotMatch(contents, /mailto:/i, `${file} should not include raw mailto link bytes`);
}
assert.doesNotMatch(resume, /AaditKannanJulyResume\.pdf|Resume PDF|resume-pdf-wrapper|pdf-typing-text/i, 'Resume page should not link or render a resume PDF control');
assert.doesNotMatch(resume, /<section id="projects">|data-section="projects"|>\s*Projects\s*<span class="nav-cursor">/, 'Resume should not include a separate Projects section or sidebar item');
assert.doesNotMatch(resume, />Current Projects</, 'Resume should not use the Current Projects section label');
assert.doesNotMatch(resume, /current-projects|>\s*Current\s*</, 'Resume navigation should not use Current Projects wording or anchors');
assert.doesNotMatch(resume, /<section id="work-experience">|data-section="work-experience"|>\s*Work\s*</, 'Resume should not include a separate Work section or sidebar item');
assert.match(resume, /Mechanical engineering and EECS student at UC Berkeley interested in robotics, semiconductors, and space\./, 'Resume About intro should use the restored concise wording with semiconductors');
assert.match(resume, /<p class="subtitle">Electromechanical Engineer<\/p>/, 'Resume sidebar should use the Electromechanical Engineer subtitle');
assert.match(resume, /Designing the 588 V accumulator hardware and cooling system/, 'Resume About section should mention accumulator hardware and cooling');
assert.match(resume, /Researching beyond-CMOS memory and logic while building high-frequency pulse electronics/, 'Resume About section should connect beyond-CMOS research with high-frequency electronics');
assert.match(resume, /Building a compact high-ratio <a href="\/projects#wolfrom-actuator"[\s\S]*?>Wolfrom gearbox<\/a> for humanoid joints<\/li>/, 'Resume About section should keep Wolfrom to one concise line');
assert.match(resume, /Incoming Mechanical Engineering Intern at <a href="https:\/\/www\.spacex\.com\/"[\s\S]*?><strong>SpaceX<\/strong><\/a>/, 'Resume About section should include the incoming SpaceX role as a linked bold name');
assert.match(resume, /\.about-highlight\s*{[\s\S]*?color:\s*var\(--text-heading\);[\s\S]*?font-weight:\s*700;/, 'Resume About project and company links should be bold and heading-black');
assert.doesNotMatch(resume, /Led cooling design|14\.2&deg;C/, 'Formula Electric resume copy should separate the seasonal thermal result from the packaging bullet');
assert.doesNotMatch(resume, /92 CFM per fan|457 Pa|1\.13 kW pack heat/, 'Formula Electric resume copy should not read like a simulation report');
assert.doesNotMatch(resume, /focused on hands-on electromechanical hardware|Developing lab tools and workflows/, 'Resume About section should not use the newer lab-tools description');
assert.match(resume, /Designed 5 robots across 500\+ part CAD assemblies/, 'Resume robotics entry should use the requested 5 robots count');
assert.doesNotMatch(resume, /Designed 8 robots across/, 'Resume robotics entry should not use the old 8 robots count');
const technicalExperience = resume.match(/<section id="technical-experience">([\s\S]*?)<section id="education">/);
assert.ok(technicalExperience, 'Resume should include Technical Experience before Education');
assert.doesNotMatch(technicalExperience[1], /SpaceX/, 'SpaceX should stay in About instead of Technical Experience');
const firstTechnicalHeading = technicalExperience[1].match(/<h3>[\s\S]*?<\/h3>/);
assert.ok(firstTechnicalHeading, 'Technical Experience should include at least one entry');
assert.match(firstTechnicalHeading[0], /Formula Electric at Berkeley/, 'Formula Electric should be first in Technical Experience');
assert.ok(
  technicalExperience[1].indexOf('Formula Electric at Berkeley') < technicalExperience[1].indexOf('Ramesh Lab'),
  'Formula Electric should appear above Ramesh Lab in Technical Experience'
);
const formulaResumeEntry = technicalExperience[1].match(/HV Battery Pack Mechanical Engineer · Formula Electric at Berkeley[\s\S]*?<div class="entry-date">Sep 2025/);
assert.ok(formulaResumeEntry, 'Technical Experience should include the Formula Electric entry');
for (const checkpoint of [/Designed and optimized air-cooling architecture for a 420-cell accumulator/, /predicted 425 CFM operating airflow across five fans/, /Developed analytical heat-transfer models/, /guiding fan selection, inlet geometry, and accumulator packaging/, /reduced enclosure mass by 18%/, /sized conductors for 80 A peak current/]) {
  assert.match(formulaResumeEntry[0], checkpoint, `Formula Electric resume entry should retain ${checkpoint.source}`);
}
for (const skill of ['MATLAB', 'ANSYS Icepak CFD', 'Heat Transfer', 'SolidWorks/PDM', 'HV Systems']) {
  assert.match(formulaResumeEntry[0], new RegExp(`<span class="skill-pill">${skill.replace('/', '\\/')}<\\/span>`), `Formula Electric resume entry should include ${skill}`);
}
const undergraduateResearcher = technicalExperience[1].match(/Undergraduate Researcher[\s\S]*?<div class="entry-date">Jan 2026/);
assert.ok(undergraduateResearcher, 'Technical Experience should include the Undergraduate Researcher entry');
assert.doesNotMatch(undergraduateResearcher[0], /Altium/, 'Undergraduate Researcher skill pills should not include Altium');
assert.match(technicalExperience[1], />Intern · Posha/, 'Posha should be listed inside Technical Experience as Intern');
assert.doesNotMatch(technicalExperience[1], /Leitmotif/, 'Leitmotif should stay on Projects and not appear in Technical Experience');
assert.equal(existsSync(join(root, 'connect.html')), false, 'Connect page should be removed');
assert.doesNotMatch(readPage('vite.config.js'), /connect\.html/, 'Vite build entries should not include connect.html');
assert.doesNotMatch(readPage('vercel.json'), /connect\.html/, 'Vercel routes should not include connect.html');

assert.match(resume, /<html lang="en" data-theme="light">/, 'Resume should default to light theme before JavaScript runs');
assert.match(resume, /\.layout\s*{[\s\S]*max-width:\s*1520px/, 'Resume desktop layout should use a wider container');
assert.match(resume, /\.sidebar\s*{[\s\S]*width:\s*34%/, 'Resume sidebar should use less desktop width');
assert.match(resume, /\.content\s*{[\s\S]*width:\s*66%/, 'Resume content should use more desktop width');

for (const page of ['resume.html', 'projects.html', 'footage.html']) {
  const html = readPage(page);
  assert.match(html, /<html lang="en" data-theme="light">/, `${page} should default to light theme`);
  assert.doesNotMatch(html, /themeToggle|theme-toggle|localStorage\.setItem\('theme'/, `${page} should stay in the light theme with no dark-mode toggle`);
}

assert.match(projects, /main\s*{[\s\S]*max-width:\s*1520px/, 'Projects index should use the wider desktop container');
assert.match(projects, /\.projects-grid\s*{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'Projects grid columns should expand inside the wider container');
assert.match(projects, /\.detail-inner\s*{[\s\S]*max-width:\s*1520px/, 'Project detail view should use the wider desktop container');
assert.match(projects, /title: 'Wolfrom Robotic Actuator'/, 'Wolfrom project title should identify the robotic actuator');
assert.doesNotMatch(projects, /title: 'Wolfrom Compound Planetary Actuator'/, 'Wolfrom project should not use the old title');
const wolfromSource = projects.match(/const wolfromDescription = `([\s\S]*?)`;/);
assert.ok(wolfromSource, 'Projects should define the rebuilt Wolfrom case study');
for (const heading of ['Why this project', 'Requirements and constraints', 'First principles', 'Architecture', 'Load cases and hand calculations', 'Simulation', 'Build', 'Test and validation', 'Results and next steps']) {
  assert.match(wolfromSource[1], new RegExp(`<strong[^>]*>${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), `Wolfrom page should include ${heading}`);
}
assert.match(wolfromSource[1], /id="wolfrom-build"[\s\S]*?<summary>What went wrong<\/summary>/, 'Wolfrom Build should cover what went wrong');
const wolfromGallery = projects.match(/id: 'wolfrom-actuator'[\s\S]*?images: \[([\s\S]*?)\]\s*\n\s*}/)?.[1] || '';
assert.deepEqual(
  [...wolfromGallery.matchAll(/'([^']+)'/g)].map((match) => match[1]),
  ['/assets/exploded-landscape-tight-clear.png', '/assets/wolfrom-cover.jpg', '/assets/gear-train-clear.png', '/assets/cutaway-three-quarter-clear.png', '/assets/half-section-clear.png', '/assets/wolfrom-ansys-topology-result.png', '/assets/wolfrom-ansys-stress.png'],
  'Wolfrom should keep a focused CAD gallery'
);
assert.match(wolfromSource[1], /wolfrom-stand|wolfrom-bench|wolfrom-ansys-stress|wolfrom-kisssoft-results/, 'Wolfrom should retain the strongest physical and analysis evidence');
assert.match(projects, /href="\/wolfrom-explode\.css"/, 'Wolfrom should load the scoped exploded-view styles');
assert.match(projects, /src="\/wolfrom-explode\.js"/, 'Wolfrom should load the exploded-view behavior');
assert.match(wolfromSource[1], /class="latex-section wx"[^>]*data-model="\/assets\/actuator\.glb"/, 'Wolfrom Architecture should include the scroll-driven actuator viewer');
assert.match(wolfromSource[1], /src="\/assets\/exploded(?:-clear)?.png"/, 'Wolfrom viewer should include the static exploded fallback');
assert.match(wolfromSource[1], /src="\/assets\/wolfrom-hand-calcs(?:-clear)?.png"/, 'Wolfrom Load cases should keep the visible hand calculations');
assert.match(wolfromSource[1], /class="wx-poster"[^>]*src="\/assets\/gear-train\.png"/, 'The opening should show the CAD view without loose bolts while the real model loads');
assert.match(readPage('wolfrom-explode.css'), /\.wx-poster\s*{[^}]*opacity:\s*0;[^}]*animation:\s*wx-poster-in[^;]*\ds/, 'The loading poster should appear only after a delay so fast model loads do not flash a still image');
assert.match(wolfromSource[1], /id="wolfrom-packaging"[\s\S]*?src="\/assets\/gear-train(?:-clear)?.png"[\s\S]*?src="\/assets\/cutaway-three-quarter(?:-clear)?.png"/, 'Packaging should pair the bolt-free gear-train view with a three-quarter section view');
assert.match(wolfromSource[1], /id="wolfrom-why"[\s\S]*?class="wolfrom-gallery-slot"[\s\S]*?class="wolfrom-tools-slot"[\s\S]*?<\/section>\s*<section class="latex-section" id="wolfrom-requirements"/, 'The gallery and tools should sit with Why this project, directly after the model walkthrough');
assert.match(projects, /'wolfrom-why': '\.wolfrom-gallery-slot, \.wolfrom-tools-slot'/, 'The gallery should be the evidence column beside the Why prose');
assert.match(projects, /\.wolfrom-tools-slot'\)\.append\(document\.getElementById\('detailSidebar'\)\)/, 'Tools should sit below the gallery beside the Why prose');
assert.match(projects, /class="project-toc-toggle" aria-expanded="false" aria-controls="projectSectionLinks"/, 'Mobile Contents should provide an accessible disclosure control');
assert.match(projects, /projectToc\.classList\.remove\('is-menu-open'\)/, 'Jumping to a section should close the mobile Contents menu');
assert.match(projects, /\.project-toc-toggle:focus-visible/, 'The mobile navigation control should expose keyboard focus');
assert.match(projects, /aria-label="Show gallery image \$\{i \+ 1\}"/, 'Gallery thumbnails should be named keyboard-accessible buttons');
const wolfromBuild = wolfromSource[1].match(/id="wolfrom-build"[\s\S]*?<\/section>/)?.[0];
assert.doesNotMatch(wolfromBuild, /cutaway|render-side|gear-train\.png|hero-isometric/, 'Build should contain physical evidence, not CAD');
for (const photo of ['wolfrom-bench.jpg', 'wolfrom-cover.jpg', 'wolfrom-stand.jpg']) assert.ok(wolfromBuild.includes(photo), `Build should retain ${photo}`);
assert.match(wolfromSource[1], /class="matlab-panel"/, 'The supplied MATLAB results should be visible beside the physics and hand calculations');
assert.match(wolfromSource[1], /src="\/assets\/wolfrom-dyno\.svg"/, 'Validation should show the proposed dyno architecture');
assert.match(wolfromSource[1], /not a completed or validated bench/, 'The dyno proposal must not be mistaken for completed work');
assert.match(wolfromSource[1], /Output torque and DC power alone measure the integrated actuator/, 'Validation should distinguish gearbox and whole-actuator efficiency');
// Design choices sit beside the evidence that drove them.
const wolfromHandCalcs = wolfromSource[1].match(/id="wolfrom-hand-calculations"[\s\S]*?<\/section>/)?.[0] || '';
for (const evidence of ['392 N at 50 Nm', '20 Nm', 'no replacement has been selected', 'wind-up stiffness check']) assert.ok(wolfromHandCalcs.includes(evidence), `Hand calculations should carry the decision and its status: ${evidence}`);
assert.match(wolfromSource[1], /22\.5 mm centre distance, so one compound planet meets both rings with standard, unshifted teeth/, 'The module choice should be explained with the derivation');
assert.match(projects, /getElementById\('detailDescription'\)\.addEventListener\('click', scrollToProjectSection\)/, 'Evidence links in the case study should use the same section-jump behavior as Contents');
assert.match(projects, /topRow\.append\(document\.getElementById\('detailGallery'\), document\.getElementById\('detailSidebar'\)\)/, 'Shared gallery and sidebar should survive switching away from Wolfrom');
assert.match(projects, /top: max\(104px, calc\(50svh - var\(--toc-half-height/, 'Wolfrom contents should be vertically centered beside the reading area');
assert.match(wolfromSource[1], /30 Nm continuous and 50 Nm peak design targets/, 'Opening torque figures must be identified as design targets');
for (const sectionId of ['wolfrom-requirements', 'wolfrom-results']) {
  const section = wolfromSource[1].match(new RegExp(`<section[^>]*id="${sectionId}"[\\s\\S]*?<\\/section>`))?.[0];
  if (sectionId === 'wolfrom-requirements') {
    assert.match(section, /Forward efficiency<\/td><td>&gt;80%<\/td><td>Three-stage KISSsoft prediction pending; bench validation to follow/, `${sectionId} should keep the overall efficiency target pending until the coupled model is complete`);
    assert.match(section, /Backdrive efficiency<\/td><td>&ge;75% at 30 Nm, 30 rpm<\/td><td>Derived design target/, `${sectionId} should identify the derived backdrive goal and its operating point`);
  } else {
    // Results summarise what is established, without repeating the requirements table.
    assert.doesNotMatch(section, /<th>Target<\/th>/, 'Results should not duplicate the requirements table');
    assert.match(section, /Efficiency<\/td><td>[^<]*three-stage prediction pending/, `${sectionId} should keep the coupled efficiency result pending until the stage model is complete`);
    assert.match(section, /three-stage KISSsoft model[\s\S]*?steel gears and aluminium housings/, 'Next steps should prioritize the coupled KISSsoft model before the production-intent material model');
  }
}
assert.match(projects, /\.wolfrom-build-board figure::after \{ content: 'V1 prototype'/, 'Physical prototype photos should be visibly marked as V1');
assert.match(projects, /gallery-media-prototype::after[\s\S]*?content: 'V1 prototype'/, 'The assembled prototype gallery image should carry the V1 label');
assert.match(wolfromSource[1], /chosen loss-budget requirement, not an identity/, 'The backdrive target derivation must not imply that forward efficiency uniquely determines backdrive efficiency');
assert.match(wolfromSource[1], /75\.7% backdrive efficiency at 80% forward efficiency/, 'The backdrive goal should be screened against the existing MATLAB model');
assert.ok(existsSync(join(root, 'public', 'assets', 'actuator.glb')), 'The actuator GLB should be available to the viewer');

assert.match(wolfromSource[1], /id="wolfrom-build"[\s\S]*?lead-in chamfers[\s\S]*?first-layer chamfers[\s\S]*?<\/section>/, 'Wolfrom Build should cover the DFMA choices in the printed parts');

const formulaCooling = projects.match(/const formulaElectricCoolingDescription = `([\s\S]*?)`;\s*const formulaElectricAtticDescription/);
assert.ok(formulaCooling, 'Projects should define the Formula Electric cooling case study');
for (const heading of ['Overview', 'First-Principles Thermal Model', 'Airflow Architecture', 'Transient CFD', 'Analytical and CFD Comparison', 'Design Changes', 'Endurance Validation']) {
  assert.match(formulaCooling[1], new RegExp(`<strong[^>]*>${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/strong>`), `Formula Electric cooling page should visibly include ${heading}`);
}
for (const checkpoint of [/57 °C design target/, /0\.61 K predicted rise against 0\.6 K measured/, /39 A RMS/, /50 A design case/, /54\.6 °C/, /13\.9 K/, /above the 5 K uniformity goal/, /40 CFM at 780 Pa/, /flow within 10%/, /temperatures within 3 K/]) {
  assert.match(formulaCooling[1], checkpoint, `Formula Electric cooling case study should explain ${checkpoint.source}`);
}
assert.doesNotMatch(formulaCooling[1], /56 A RMS|226 W per branch|1\.72 kW|5\.4 °C spread|Current optimized steady-state run/, 'SN6 should retire the outdated steady-state design basis');
assert.match(projects, /description: formulaElectricCoolingDescription/, 'Formula Electric cooling project should render the Wolfrom-style cooling case study');
assert.doesNotMatch(formulaCooling[1], /cooling-section-nav|cooling-stat-grid|cooling-decision-grid/, 'Formula Electric content should use the established project-detail components');
assert.match(formulaCooling[1], /<details class="project-disclosure">/, 'SN6 should use the established disclosures for technical evidence');
assert.ok(formulaCooling[1].indexOf('<strong>First-Principles Thermal Model</strong>') < formulaCooling[1].indexOf('<strong>Transient CFD</strong>'), 'SN6 should establish the cooling need before presenting simulation results');
assert.match(projects, /\.project-priority-result img\s*{[\s\S]*?width:\s*100%\s*!important[\s\S]*?max-width:\s*760px\s*!important[\s\S]*?max-height:\s*520px/, 'SN6 optimized steady-state image should be prominent');
assert.match(projects, /\.project-baseline-velocity img\s*{[\s\S]*?max-width:\s*58%\s*!important/, 'SN6 baseline velocity image should stay secondary');
assert.match(projects, /\.project-hand-calcs img\s*{[\s\S]*?max-width:\s*180px\s*!important[\s\S]*?max-height:\s*220px/, 'SN6 hand calculations should stay compact until enlarged');
assert.match(projects, /id: 'formula-electric'[\s\S]*?title: 'Formula Electric - SN6 Cooling'[\s\S]*?date: '2026 - Present'[\s\S]*?displayOrder: 2/, 'Cooling should be a distinct current SN6 Formula Electric project, listed right after Wolfrom');
const formulaCoolingGallery = projects.match(/id: 'formula-electric'[\s\S]*?images: \[([\s\S]*?)\]\s*\n\s*}/)?.[1] || '';
assert.deepEqual(
  [...formulaCoolingGallery.matchAll(/'([^']+)'/g)].map((match) => match[1]),
  ['/assets/formula-cooling-transient-50a.jpg', '/assets/formula-cooling-transient-50a-top.jpg', '/assets/formula-cooling-rain-inlet.jpg'],
  'SN6 should keep the original CAD cover and a tight four-image gallery'
);
assert.doesNotMatch(formulaCoolingGallery, /velocity-baseline|temperature-map|variant-60-8|fan-system-curve/, 'Supporting simulations should stay in the SN6 page body');

for (const [id, label] of [['sn6-requirements', 'Requirements']]) {
  assert.match(formulaCooling[1], new RegExp(`id="${id}"[^>]*>\\s*<strong>${label}<\\/strong>`), `SN6 should include the ${label} section`);
}
for (const checkpoint of [/EV\.7\.5\.2/, /198 W per branch/, /47 CFM at 689 Pa/, /56 CFM at 623 Pa per fan/, /64\.9/, /16 W per module/, /7 K front-to-back gradient/, /Reliance's energy-balance fit/]) {
  assert.match(formulaCooling[1], checkpoint, `SN6 should keep ${checkpoint.source}`);
}
assert.match(projects, /'sn6-requirements': 'table'/, 'SN6 requirement evidence should sit beside its prose');
assert.doesNotMatch(formulaCooling[1], /id="sn6-conduction"/, 'Conduction belongs with the cooling-architecture comparison, not its own section');
assert.match(formulaCooling[1], /<td>Conduction to the casing<\/td>/, 'Conduction should be the fourth option in the architecture comparison');
assert.match(formulaCooling[1], /Liquid cooling was out of scope/, 'SN6 should say why liquid cooling was not pursued');
const formulaAttic = projects.match(/const formulaElectricAtticDescription = `([\s\S]*?)`;\s*\/\/ Projects data/);
assert.ok(formulaAttic, 'Projects should define a first-class Formula Electric attic case study');
for (const heading of ['Overview', 'Packaging the HV Hardware', 'Cutting Weight', 'Manufacturing']) {
  assert.match(formulaAttic[1], new RegExp(`<strong>${heading}<\\/strong>`), `Formula Electric attic page should visibly include ${heading}`);
}
for (const checkpoint of [/588 V/, /40g lateral/, /20g vertically/, /18%/, /6 mm polycarbonate/, /3 mm neoprene/]) {
  assert.match(formulaAttic[1], checkpoint, `Formula Electric attic case study should retain ${checkpoint.source}`);
}
assert.doesNotMatch(formulaAttic[1], /<details/, 'Formula Electric attic should stay fully visible without jumpy disclosures');
assert.doesNotMatch(formulaAttic[1], /shorted two segment busbars|Nobody was hurt/, 'Formula Electric attic should omit the busbar-short incident');
assert.match(projects, /id: 'formula-electric-attic'[\s\S]*?title: 'Formula Electric - SN5 HV Attic'[\s\S]*?date: '2025 - 2026'[\s\S]*?active: false[\s\S]*?displayOrder: 4/, 'Attic should be a distinct completed SN5 Formula Electric project');
assert.match(projects, /id: 'formula-electric-attic'[\s\S]*?images: \[\s*'\/assets\/accumimg\.png',\s*'\/assets\/img1\.png'/, 'SN5 should lead with the pack and attic CAD render, then the car photo');
assert.match(projects, /\.project-card\[data-id="formula-electric-attic"\] \.project-image img\s*{[\s\S]*?object-fit:\s*cover;/, 'SN5 should fill its card with the cover render');
assert.match(projects, /data-project-id="formula-electric-attic"\][\s\S]*?img\[src\$="\/img1\.png"\][\s\S]*?transform:\s*scale\(1\.32\)/, 'SN5 should zoom the car image in its project gallery');
assert.match(projects, /id: 'formula-electric'[\s\S]*?url: '#formula-electric-attic'/, 'Cooling should link to the prior attic project');
assert.match(projects, /id: 'formula-electric-attic'[\s\S]*?url: '#formula-electric'/, 'Attic should link to the current cooling project');
assert.match(projects, /data-project-id\^="formula-electric"[\s\S]*?max-width:\s*100%\s*!important/, 'Both Formula pages should keep feature images inside the established reading columns');
for (const image of [
  'formula-cooling-thermal-handcalcs.jpg',
  'formula-cooling-pack-energy-handcalcs.jpg',
  'formula-cooling-inlet-handcalcs.jpg',
  'formula-cooling-event-energy.jpg',
  'formula-cooling-airgap-trade.jpg',
  'formula-cooling-heat-budget.jpg',
  'formula-cooling-endurance-model.jpg',
  'formula-cooling-transient-50a.jpg',
  'formula-cooling-transient-50a-top.jpg',
  'formula-cooling-module-stackup.png',
]) {
  assert.match(projects, new RegExp(image.replace('.', '\\.')), `Formula Electric case study should use ${image}`);
  assert.ok(existsSync(join(root, 'public', 'assets', image)), `${image} should exist in public assets`);
}

const pulseGenerator = projects.match(/id: 'ns-us-pulse-generator'([\s\S]*?)id: 'field-station-toolbox'/);
assert.ok(pulseGenerator, 'Projects should include the pulse-generator entry');
const pulseGeneratorSource = pulseGenerator[1];
const pulseSkillTags = pulseGeneratorSource.match(/tags: \[([^\]]*)\]/);
assert.ok(pulseSkillTags, 'Pulse-generator project should include Skills tags');
assert.deepEqual(
  [...pulseSkillTags[1].matchAll(/'([^']+)'/g)].map((match) => match[1]),
  ['KiCad', 'LTspice', 'Python', 'LabVIEW', 'PCB Design', 'PCB Layout', 'Circuit Design', 'Circuit Simulation', 'Embedded Systems', 'RP2040', 'SMD Soldering', 'Test Automation', 'Oscilloscope Testing'],
  'Pulse-generator Skills should contain recruiter-readable software and transferable competencies'
);
assert.match(pulseGeneratorSource, /title: 'HV Nanosecond Pulse Generator PCB'/, 'Pulse-generator project should use the high-voltage nanosecond PCB title');
assert.doesNotMatch(projects, /Nanosecond Spin Transport Pulse Generator Board|Spin Transport Pulse Generator PCB/, 'Live project copy should not use the old spin transport title');
assert.doesNotMatch(projects, /Nanosecond Spin Transport Pulse Generator (?:Board|PCB)/, 'Live project copy should not use the overlong title');
assert.match(readPage('ns-us-pulse-generator.html'), /HV Nanosecond Pulse Generator PCB/, 'Pulse-generator redirect page should use the high-voltage nanosecond PCB title');
const pulseDisclosures = pulseGeneratorSource.match(/<details class="project-disclosure">/g) ?? [];
assert.equal(pulseDisclosures.length, 2, 'Pulse-generator detail should use two relevant secondary-detail disclosures');
assert.match(pulseGeneratorSource, /<summary>Next Revision Architecture and Packaging<\/summary>/, 'Pulse-generator detail should include the next-revision packaging disclosure');
assert.match(pulseGeneratorSource, /<summary>Earlier Microsecond Prototype<\/summary>/, 'Pulse-generator detail should include the earlier prototype disclosure');
assert.doesNotMatch(pulseGeneratorSource, /<summary>(Architecture Validation - V1 Board|Testing \+ Key Design Lesson|Revision 2)<\/summary>/, 'Core V2 technical work should remain visible without opening a disclosure');
for (const heading of ['Overview', 'Experiment Target', 'Measurement Problem', 'V2 Architecture', 'Design Loop', 'Testing + Key Design Lesson', 'Next Revision', 'Current Stage']) {
  assert.match(pulseGeneratorSource, new RegExp(`<strong>${heading.replace('+', '\\+')}<\\/strong>`), `Pulse-generator detail should visibly include ${heading}`);
}
assert.match(pulseGeneratorSource, /<strong>Current Stage<\/strong>/, 'Pulse-generator detail should end with a visible Current Stage section');
assert.match(pulseGeneratorSource, /This assembled four-layer instrument is <b>V2<\/b>/, 'Pulse-generator detail should identify the current instrument as V2');
assert.match(pulseGeneratorSource, /V1 was the earlier microsecond-only pulse-generator prototype/, 'Pulse-generator detail should identify V1 as the earlier microsecond-only board');
assert.match(pulseGeneratorSource, /class="board-layer-viewer"/, 'Pulse-generator detail should retain the interactive board-layer viewer');
for (const boardLayer of ['render', 'layout', 'top', 'copper', 'in1', 'in2', 'silk', 'bottom']) {
  assert.match(pulseGeneratorSource, new RegExp(`id="ns-layer-${boardLayer}"`), `Board viewer should include the ${boardLayer} state`);
}
for (const keyNumber of [/30 V/, /100 ns/, /1 ns-class/]) {
  assert.match(pulseGeneratorSource, keyNumber, `Pulse-generator detail should retain ${keyNumber.source}`);
}
for (const experimentTarget of [/0–30 V/, /1 ns to 1 ms/, /tens of pF/, /MΩ-scale/, /50 Ω/, /1 kHz/, /100 kHz/, /500 MHz/, /1 GHz/]) {
  assert.match(pulseGeneratorSource, experimentTarget, `Pulse-generator Experiment Target should include ${experimentTarget.source}`);
}
for (const image of [
  'ns-pulse-schematic-thumbnail.png',
  'ns-pulse-board-layout.png',
  'ns-pulse-board-angle.png',
  'pulse-v1-enclosure.jpeg',
  'pulse-v1-board.jpeg',
  'pulse-v1-bench.jpeg',
  'pulse-r2-cad-front.png',
  'pulse-r2-cad-rear.png',
  'pulse-v1-us-schematic.png',
  'pulse-v1-us-layout.png',
  'pulse-v1-us-render.png',
  'pulse-v1-ltspice.png',
]) {
  assert.match(pulseGeneratorSource, new RegExp(image.replace('.', '\\.')), `Pulse-generator detail should use ${image}`);
}
const pulseGallery = pulseGeneratorSource.match(/images: \[([^\]]*)\]/);
assert.ok(pulseGallery, 'Pulse-generator project should include a gallery');
const pulseGalleryImages = [...pulseGallery[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
assert.deepEqual(
  pulseGalleryImages,
  [
    '/assets/pulse-v1-cover.jpg',
    '/assets/ns-pulse-board-layout.png',
    '/assets/ns-pulse-board-angle.png',
    '/assets/ns-pulse-schematic-thumbnail.png',
    '/assets/pulse-v1-bench.jpeg',
    '/assets/pulse-r2-cad-front.png',
  ],
  'Pulse-generator gallery should show cover, layout, render, schematic, bench, then next-revision CAD'
);
const pulseDescriptionRule = projects.match(/\.detail-content\[data-project-id="ns-us-pulse-generator"\] \.detail-description\s*{([^}]*)}/);
assert.ok(pulseDescriptionRule, 'Projects should define a pulse-generator desktop description rule');
assert.doesNotMatch(pulseDescriptionRule[1], /columns:\s*2/, 'Pulse-generator detail should use paired reading rows, not newspaper columns');
for (const id of ['pcb-overview', 'pcb-target', 'pcb-measurement', 'pcb-architecture', 'pcb-design-loop', 'pcb-build', 'pcb-bringup', 'pcb-testing', 'pcb-next', 'pcb-current']) {
  assert.match(pulseGeneratorSource, new RegExp(`<section class="latex-section" id="${id}">`), `Pulse-generator detail should have a navigable ${id} section`);
}
assert.match(projects, /\.board-layer-viewer img\) \{/, 'The board viewer layers sit on a dark stage and must stay out of the cream blend');
assert.match(projects, /function layoutPulseGeneratorSections[\s\S]*?'pcb-target': 'table'[\s\S]*?'pcb-next': 'table'/, 'Pulse-generator target and revision tables should sit beside their prose');
assert.ok(pulseGeneratorSource.includes('f_c=') && pulseGeneratorSource.includes('RC='), 'Pulse-generator target should explain the DUT RC corner');
assert.match(pulseGeneratorSource, /<td>Active control of both edges<\/td>/, 'Pulse-generator next revision should compare V2 with the planned architecture');
assert.doesNotMatch(projects, /\.pulse-full-span\s*{/, 'Pulse-generator media should not escape the reading columns');
assert.doesNotMatch(pulseGeneratorSource, /pulse-full-span/, 'Every pulse-generator block should stay within a reading column');
assert.match(projects, /data-project-id="ns-us-pulse-generator"\] \.project-inline-grid\s*{[\s\S]*?grid-template-columns:\s*1fr/, 'Pulse technical media grids should stack within their reading column');
assert.match(projects, /data-project-id="ns-us-pulse-generator"\] \.board-layer-stage\s*{[\s\S]*?max-height:\s*420px/, 'Pulse board viewer should remain bounded on desktop');
assert.match(projects, /data-project-id="ns-us-pulse-generator"\] :is\(\.project-inline-grid, \.project-feature-figure, \.project-disclosure\) img\s*{[\s\S]*?max-height:\s*560px/, 'Pulse body and disclosure images should remain bounded inside their columns');
assert.match(projects, /gallery-media-photo[\s\S]*?object-fit:\s*cover/, 'Pulse photographs should fill the gallery frame without bars');
assert.match(projects, /#galleryMediaContainer \.gallery-media-photo img\s*{[\s\S]*?object-fit:\s*cover/, 'Pulse photo fitting should outrank the generic gallery-media selector');
assert.match(projects, /gallery-media-technical[\s\S]*?object-fit:\s*contain/, 'Pulse technical media should remain uncropped in the gallery');
assert.match(projects, /pulseGalleryPhotoAssets/, 'Gallery renderer should classify pulse photographs separately from technical media');
assert.match(projects, /galleryCanvasClass/, 'Gallery renderer should assign source-matched canvases to technical media');
for (const canvasClass of ['gallery-canvas-light', 'gallery-canvas-dark', 'gallery-canvas-render']) {
  assert.match(projects, new RegExp(`#galleryMediaContainer \\.${canvasClass}[\\s\\S]*?background:`), `Pulse gallery should style the ${canvasClass} canvas`);
}

// Wolfrom scroll animation: every part moves in exactly one step, so motion always matches the caption.
const explodeSource = readFileSync(join(root, 'wolfrom-explode.js'), 'utf8');
const moveLists = [...explodeSource.matchAll(/move: \[([^\]]*)\]/g)].map((match) => [...match[1].matchAll(/'([^']+)'/g)].map((name) => name[1]));
const movedParts = moveLists.flat();
assert.equal(new Set(movedParts).size, movedParts.length, 'No Wolfrom part should move in more than one animation step');
const explodeParts = [...explodeSource.slice(explodeSource.indexOf('const EXPLODE = {'), explodeSource.indexOf('};', explodeSource.indexOf('const EXPLODE = {'))).matchAll(/^\s+(\w+):\s+\{ dz:\s+(-?\d+)/gm)].filter((match) => Number(match[2]) !== 0).map((match) => match[1]);
assert.deepEqual([...explodeParts].sort(), [...movedParts].sort(), 'Every Wolfrom part that travels should belong to exactly one animation step');
assert.doesNotMatch(readPage('wolfrom-explode.css'), /--wx-view-h|--wx-copy-y|100dvh/, 'The Wolfrom stage should keep a fixed size while scrolling');

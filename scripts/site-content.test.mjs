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
  assert.match(nav, /href="\/footage"[^>]*>\s*FOOTAGE\s*<\/a>/, `${page} should include Footage in top nav`);
  assert.match(nav, /href="\/resume"[^>]*>\s*RESUME\s*<\/a>/, `${page} should label the resume page as Resume`);
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
assert.match(imageLightbox, /MutationObserver/, 'Image lightbox should discover dynamically rendered project images');
assert.match(imageLightbox, /data-lightbox-ignore/, 'Image lightbox should honor explicit image exclusions');
assert.match(home, /class="bg-poster"[^>]*data-lightbox-ignore/, 'Home background poster should not open in the lightbox');
assert.match(resume, /id="aboutPreviewImg"[^>]*data-lightbox-ignore/, 'Resume hover preview should not open in the lightbox');
assert.match(projects, /id="projectHoverPreviewImg"[^>]*data-lightbox-ignore/, 'Project hover preview should not open in the lightbox');
assert.match(projects, /class="gallery-thumb[^>]*data-lightbox-ignore/, 'Project gallery thumbnails should not open duplicate lightboxes');
const numberedRobotMentions = deployableSource.match(/\b\d+\+?(?:\s+[A-Za-z-]+){0,3}\s+robots\b/g) ?? [];
assert.deepEqual(numberedRobotMentions, ['5 robots'], 'The only numbered robot count across the deployable site should be 5 robots');

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
assert.match(resume, /href="\/assets\/AaditKannanJulyResume\.pdf"/, 'Resume PDF link should use July PDF');
assert.doesNotMatch(resume, /<section id="projects">|data-section="projects"|>\s*Projects\s*<span class="nav-cursor">/, 'Resume should not include a separate Projects section or sidebar item');
assert.doesNotMatch(resume, />Current Projects</, 'Resume should not use the Current Projects section label');
assert.doesNotMatch(resume, /current-projects|>\s*Current\s*</, 'Resume navigation should not use Current Projects wording or anchors');
assert.doesNotMatch(resume, /<section id="work-experience">|data-section="work-experience"|>\s*Work\s*</, 'Resume should not include a separate Work section or sidebar item');
assert.match(resume, /Mechanical engineering and EECS student at UC Berkeley interested in robotics, semiconductors, and space\./, 'Resume About intro should use the restored concise wording with semiconductors');
assert.doesNotMatch(resume, /focused on hands-on electromechanical hardware|Developing lab tools and workflows/, 'Resume About section should not use the newer lab-tools description');
assert.match(resume, /Designed 5 robots across 500\+ part CAD assemblies/, 'Resume robotics entry should use the requested 5 robots count');
assert.doesNotMatch(resume, /Designed 8 robots across/, 'Resume robotics entry should not use the old 8 robots count');
const technicalExperience = resume.match(/<section id="technical-experience">([\s\S]*?)<section id="education">/);
assert.ok(technicalExperience, 'Resume should include Technical Experience before Education');
const firstTechnicalHeading = technicalExperience[1].match(/<h3>[\s\S]*?<\/h3>/);
assert.ok(firstTechnicalHeading, 'Technical Experience should include at least one entry');
assert.match(firstTechnicalHeading[0], /Undergraduate Researcher/, 'Undergraduate Researcher should be first in Technical Experience');
const undergraduateResearcher = technicalExperience[1].match(/Undergraduate Researcher[\s\S]*?<div class="entry-date">Jan 2026/);
assert.ok(undergraduateResearcher, 'Technical Experience should include the Undergraduate Researcher entry');
assert.doesNotMatch(undergraduateResearcher[0], /Altium/, 'Undergraduate Researcher skill pills should not include Altium');
assert.match(technicalExperience[1], /Mechanical Engineering Intern · Posha/, 'Posha should be listed inside Technical Experience');
assert.doesNotMatch(technicalExperience[1], /Leitmotif/, 'Leitmotif should stay on Projects and not appear in Technical Experience');
assert.ok(existsSync(join(root, 'public', 'assets', 'AaditKannanJulyResume.pdf')), 'July resume PDF should exist in public assets');
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
  assert.match(html, /if \(saved === 'dark'\) document\.documentElement\.removeAttribute\('data-theme'\);/, `${page} should honor an explicit saved dark theme`);
}

assert.match(projects, /main\s*{[\s\S]*max-width:\s*1520px/, 'Projects index should use the wider desktop container');
assert.match(projects, /\.projects-grid\s*{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'Projects grid columns should expand inside the wider container');
assert.match(projects, /\.detail-inner\s*{[\s\S]*max-width:\s*1520px/, 'Project detail view should use the wider desktop container');

const pulseGenerator = projects.match(/id: 'ns-us-pulse-generator'([\s\S]*?)id: 'field-station-toolbox'/);
assert.ok(pulseGenerator, 'Projects should include the pulse-generator entry');
const pulseGeneratorSource = pulseGenerator[1];
const pulseSkillTags = pulseGeneratorSource.match(/tags: \[([^\]]*)\]/);
assert.ok(pulseSkillTags, 'Pulse-generator project should include Skills tags');
assert.deepEqual(
  [...pulseSkillTags[1].matchAll(/'([^']+)'/g)].map((match) => match[1]),
  ['KiCad', 'LTspice', 'Python', 'LabVIEW', 'PCB Design', 'Embedded Systems', 'SMD Soldering', 'Oscilloscope Testing'],
  'Pulse-generator Skills should contain recruiter-readable software and transferable competencies'
);
const pulseDisclosures = pulseGeneratorSource.match(/<details class="project-disclosure">/g) ?? [];
assert.equal(pulseDisclosures.length, 1, 'Pulse-generator detail should reserve one disclosure for the earlier prototype');
assert.match(pulseGeneratorSource, /<summary>Earlier Microsecond Prototype<\/summary>/, 'Pulse-generator detail should include the earlier prototype disclosure');
assert.doesNotMatch(pulseGeneratorSource, /<summary>(Architecture Validation — V1 Board|Testing \+ Key Design Lesson|Revision 2)<\/summary>/, 'Current technical work should remain visible without opening a disclosure');
for (const heading of ['Overview', 'Experiment Target', 'Measurement Problem', 'V1 Architecture', 'Design Loop', 'Testing + Key Design Lesson', 'Revision 2', 'Current Stage']) {
  assert.match(pulseGeneratorSource, new RegExp(`<strong>${heading.replace('+', '\\+')}<\\/strong>`), `Pulse-generator detail should visibly include ${heading}`);
}
assert.match(pulseGeneratorSource, /<strong>Current Stage<\/strong>/, 'Pulse-generator detail should end with a visible Current Stage section');
assert.match(pulseGeneratorSource, /class="board-layer-viewer"/, 'Pulse-generator detail should restore the interactive board-layer viewer');
for (const boardLayer of ['render', 'layout', 'top', 'copper', 'in1', 'in2', 'silk', 'bottom']) {
  assert.match(pulseGeneratorSource, new RegExp(`id="ns-layer-${boardLayer}"`), `Board viewer should include the ${boardLayer} state`);
}
for (const keyNumber of [/30 V/, /100 ns/, /1 ns-class/]) {
  assert.match(pulseGeneratorSource, keyNumber, `Pulse-generator detail should retain ${keyNumber.source}`);
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
  pulseGalleryImages.slice(0, 2),
  ['/assets/pulse-v1-cover.jpg', '/assets/pulse-v1-board.jpeg'],
  'Pulse-generator gallery should use the new landscape photo as its cover and the populated-board photo second'
);

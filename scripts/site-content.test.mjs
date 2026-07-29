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
const homeIntro = 'Aadit Kannan - MechE/EECS student at UC Berkeley.';
assert.match(home, new RegExp(homeIntro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Home metadata should use the requested MechE/EECS intro');
assert.doesNotMatch(home, /ROBOTICS\s*\/\s*SEMICONDUCTORS\s*\/\s*SPACE|robotics,\s*semiconductors,\s*and\s*space/i, 'Home page should not show the robotics/semiconductors/space interests line');
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
const deployableSource = [
  home,
  resume,
  projects,
  readPage('footage.html'),
  readPage('vite.config.js'),
  readPage('vercel.json'),
].join('\n');

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
assert.match(resume, /<h2 class="section-label">Projects<\/h2>/, 'Resume should label the project section as Projects');
assert.doesNotMatch(resume, />Current Projects</, 'Resume should not use the Current Projects section label');
assert.doesNotMatch(resume, /current-projects|>\s*Current\s*</, 'Resume navigation should not use Current Projects wording or anchors');
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

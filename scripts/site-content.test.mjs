import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
  assert.match(nav, /href="\/resume"[^>]*>\s*WORK\s*<\/a>/, `${page} should label resume/work page as Work`);
  assert.doesNotMatch(nav, /href="\/connect"|>\s*CONNECT\s*<\/a>/, `${page} should not include Connect in top nav`);
}

const home = readPage('index.html');
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
assert.match(resume, /href="\/assets\/AaditKannanJulyResume\.pdf"/, 'Resume PDF link should use July PDF');
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

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const generator = readFileSync(join(root, 'tools', 'build_figure_portfolio.py'), 'utf8');

assert.doesNotMatch(
  generator,
  /aaditkannan@berkeley\.edu|mailto:/i,
  'Portfolio generator should not emit raw email addresses or mailto links'
);
assert.match(
  generator,
  /aaditkannan\[at\]berkeley\[dot\]edu/,
  'Portfolio generator should use the public obfuscated email'
);
assert.doesNotMatch(
  generator,
  /\b(AFM|PFM|XRD)\b|x[- ]?ray diffraction/i,
  'Portfolio generator should not mention AFM, PFM, XRD, or x-ray diffraction'
);
assert.doesNotMatch(
  generator,
  /\bPLD\b|pulsed laser deposition|pldtracker|PLD Growth|Growth and Deposition Work/i,
  'Portfolio generator should not mention PLD growth work or PLDTracker'
);
assert.doesNotMatch(
  generator,
  /Nanosecond Spin Transport Pulse Generator Board|Spin Transport Pulse Generator PCB/,
  'Portfolio generator should not use the old spin transport title'
);
assert.match(
  generator,
  /HV Nanosecond Pulse Generator PCB/,
  'Portfolio generator should use the high-voltage nanosecond PCB title'
);

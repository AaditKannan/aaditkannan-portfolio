
let THREE;

/* ------------------------------------------------------------------ story ---- */
// Each step: where it starts in the story (0..1), its caption, the parts it highlights, and
// the parts it presents. The walk-through goes down the stack in assembly order, so every part
// is presented in exactly one step, with the parts above it already lifted out of the way.
const STEPS = [
  { from: 0.00, title: 'Humanoid elbow actuator',
    body: 'A motor, a three-stage compound Wolfrom gearbox and an ODrive controller share one stack 104 mm across and 81 mm long, geared 50.45:1. This printed V1 checks fit and assembly before a steel and aluminium build.',
    spec: 'Targets: 30 Nm continuous, 50 Nm peak', focus: [], move: [] },
  { from: 0.083, title: 'Bearing retainers',
    body: 'The outer ring clamps the bearing outer race to the housing and the inner ring clamps its inner race to the output ring gear. Recessed screws keep the output face flush.',
    spec: '12 x M2 inner, 6 x M3 outer', focus: ['retOuter', 'retInner', 'screws'], move: ['screws', 'retOuter', 'retInner'] },
  { from: 0.167, title: 'Output bearing',
    body: 'One thin-section four-point contact bearing carries every radial, axial and moment load at the joint, and the output ring gear rides directly in it.',
    spec: 'Kaydon KA030XP0, 76.2 mm bore', focus: ['bearing'], move: ['bearing'] },
  { from: 0.25, title: 'Output ring gear',
    body: 'It has three more teeth than the fixed ring on the same 22.5 mm centre distance, which gives 50.45:1 with standard, unshifted teeth. At 50 Nm each planet pushes on it with 494 N.',
    spec: '75 teeth, module 0.9, 6 mm face, 269 MPa root stress at 50 Nm', focus: ['ringOut'], move: ['ringOut'] },
  { from: 0.333, title: 'Carrier',
    body: 'The carrier floats and carries no net torque, yet its two plates react 40 percent of output torque against each other through three posts. The posts also set the stack height, so they still need a wind-up stiffness check.',
    spec: '20 Nm plate-to-plate at 50 Nm output', focus: ['carrierOut', 'carrierIn'], move: ['carrierOut'] },
  { from: 0.417, title: 'Compound planets',
    body: 'Each planet carries 57, 27 and 25 teeth on one body. The two ring meshes push on it in opposite directions 8 mm apart, a 4.2 Nm tilt at peak, so its 604ZZ bearings reach their assumed static rating at 45 Nm.',
    spec: 'Worst bearing load 392 N against about 350 N at 50 Nm', focus: ['planets', 'planetBrg', 'carrierIn'], move: ['planetBrgTop', 'planets', 'planetBrgBot', 'carrierIn'] },
  { from: 0.5, title: 'Sun gear',
    body: 'The sun bolts to the motor rotor through a flange, so the torque path has no press fit. It is the lightest-loaded stage, at 40 N per planet and 44 MPa root stress at 50 Nm.',
    spec: '33 teeth, module 0.5, 5 mm face', focus: ['sun'], move: ['sun'] },
  { from: 0.583, title: 'Fixed ring gear housing',
    body: 'The 72-tooth ring is part of the housing, so reaction torque runs through a solid wall. The ring meshes circulate 8 to 9 times output power, and below 94.3 percent ring-mesh efficiency the gearbox self-locks when backdriven.',
    spec: '72 teeth, module 1.0, 5 mm face, 454 N per planet at 50 Nm', focus: ['fixed', 'plate'], move: ['fixed'] },
  { from: 0.667, title: 'Motor',
    body: 'An outrunner drives the sun directly, shown with its magnet bell lifted off the 24 stator windings. It needs about 25 A for 30 Nm continuous and about 42 A of its 59.2 A peak for 50 Nm.',
    spec: 'MAD M6C10, 300 KV, 143 rpm output at 24 V', focus: ['motorBell', 'motorStator', 'motorHousing'], move: ['motorHousing', 'motorStator', 'motorBell'] },
  { from: 0.75, title: 'Controller',
    body: 'The drive sits below the motor and reads rotor angle from a magnet on the shaft, 1.5 mm from its encoder chip. Backdriving regenerates power, so the drive and braking hardware are set up for the bus.',
    spec: 'ODrive S1', focus: ['board', 'ctrlHousing', 'magnet'], move: ['ctrlHousing', 'board', 'magnet'] },
  { from: 0.833, title: 'Exploded assembly',
    body: 'The whole stack assembles along one axis from one direction. Bores, shaft ends and press fits carry lead-in chamfers so each part self-aligns as it goes in.',
    spec: '3 planets, 3 gear stages, FDM housings, SLA gears', focus: [], move: [] },
  { from: 0.917, title: 'Integrated actuator',
    body: 'Next, each stage gets rated in KISSsoft and the three are coupled into total forward and backdrive efficiency. If that model clears the targets, the build moves to steel gears and aluminium housings.',
    spec: 'Targets: >80% forward, ≥75% backdrive at 30 Nm, 30 rpm', focus: [], move: [] },
];

/* --------------------------------------------------------------- explosion --- */
// dz: axial travel when fully exploded [mm]. zc, hz: centre and half-height of the part in the
// assembled Onshape model [mm], used to frame the camera. Travel distances leave 6 to 10 mm of
// clearance between neighbouring parts, and a part higher in the stack always travels further,
// so separations only grow while parts move and the reassembly never passes parts through each other.
const EXPLODE = {
  screws:       { dz:  233, zc:  18.5,  hz:  5.0 },
  retOuter:     { dz:  214, zc:  21.45, hz:  2.3 },
  retInner:     { dz:  214, zc:  21.45, hz:  2.3 },
  bearing:      { dz:  203, zc:  16.05, hz:  3.2 },
  ringOut:      { dz:  186, zc:  15.2,  hz:  3.9 },
  carrierOut:   { dz:  163, zc:   8.7,  hz: 15.0 },
  planetBrgTop: { dz:  128, zc:  15.9,  hz:  2.0 },
  planets:      { dz:  116, zc:   9.55, hz:  9.6 },
  planetBrgBot: { dz:  106, zc:   1.9,  hz:  2.0 },
  carrierIn:    { dz:   80, zc:   6.35, hz: 13.1 },
  sun:          { dz:   57, zc:  -2.95, hz:  8.0 },
  fixed:        { dz:   17, zc:   7.35, hz: 11.8 },
  plate:        { dz:    0, zc:  -7.9,  hz:  9.5 },
  motorBell:    { dz:  -26, zc: -15.8,  hz: 14.3 },
  motorStator:  { dz:  -56, zc: -24.1,  hz:  9.0 },
  motorHousing: { dz:  -91, zc: -24.4,  hz: 16.0 },
  magnet:       { dz: -119, zc: -35.35, hz:  2.6 },
  board:        { dz: -129, zc: -45.75, hz:  9.3 },
  ctrlHousing:  { dz: -164, zc: -43.6,  hz: 13.5 },
};
// Scroll chooses the step; the parts then glide to that step's layout over MOVE_MS.
const MOVE_MS = 360;

// Where every part sits at each step, as axial offsets in mm. During the walk-through the current
// parts rise clear of everything still in place, opened up past their exploded spacing so each
// one can be seen, and the parts already covered stay assembled as one block well above them,
// high enough that it never hides the current part from the camera's raised viewpoint. That block
// only ever moves up, so scrolling on never drops it back onto the next part. Only "Exploded
// assembly" opens the full stack. All parts move together between neighbouring layouts, each of
// which is free of overlaps, and the stack order never changes, so nothing passes through
// anything at any point of the scroll. Early on, when little sits above, the current parts rise
// to PRESENT_Z, the middle of the walk-through frame, so they show beside their caption.
const GAP_ABOVE = 40, GAP_BELOW = 12, SPREAD = 1.4, PRESENT_Z = 60;
const EXPLODED_STEP = STEPS.findIndex(step => step.title === 'Exploded assembly');
const LAYOUT = [];
STEPS.forEach((step, k) => {
  const names = Object.keys(EXPLODE), prev = LAYOUT[k - 1] || {};
  const at = Object.fromEntries(names.map(n => [n, k === EXPLODED_STEP ? EXPLODE[n].dz : 0]));
  LAYOUT.push(at);
  if (!step.move.length) return;
  const ranks = step.move.map(n => EXPLODE[n].dz), base = Math.min(...ranks);
  const spread = n => step.move.includes(n) ? (EXPLODE[n].dz - base) * SPREAD : 0;
  const top = list => Math.max(...list.map(n => EXPLODE[n].zc + EXPLODE[n].hz + spread(n)));
  const bottom = list => Math.min(...list.map(n => EXPLODE[n].zc - EXPLODE[n].hz + spread(n)));
  const above = names.filter(n => EXPLODE[n].dz > Math.max(...ranks));
  const below = names.filter(n => EXPLODE[n].dz < base);
  let lift = below.length ? top(below) - bottom(step.move) + GAP_BELOW : 0;
  if (below.length) lift = Math.max(lift, PRESENT_Z - (top(step.move) + bottom(step.move)) / 2);
  if (above.length) {
    const block = Math.max(top(step.move) + lift - bottom(above) + GAP_ABOVE, ...above.map(n => prev[n] || 0));
    for (const n of above) at[n] = block;
    // When the block is already higher than it needs to be, centre the current parts in the space.
    if (below.length) lift = Math.max(lift, lift + (bottom(above) + block - GAP_ABOVE - (top(step.move) + lift)) / 2);
  }
  for (const n of step.move) at[n] = lift + spread(n);
});
const FOCUS_ALIAS = { planetBrg: ['planetBrgTop', 'planetBrgBot'] };


/* ---------------------------------------------------------------- materials -- */
const COL = {
  alu: 0xcfd2d6, graphite: 0x353940, white: 0xf1f1ee, steel: 0xb9bcc2, darkSteel: 0x3e4045,
  gun1: 0x716d67, gun2: 0x5d5955, gun3: 0x474543, black: 0x1c1c1e, copper: 0xb87333, pcb: 0xcdb98a, chip: 0x222226,
};
const mats = {};
function mat(name, opts = {}) {
  const key = name + JSON.stringify(opts);
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial({ color: COL[name], roughness: 0.55, metalness: 0.35, ...opts });
  return mats[key];
}

/* ----------------------------------------------------------------- geometry -- */
// All dimensions in millimetres, CAD frame: z is the gearbox axis, output up.
function ring(ri, ro, z0, z1, m) {                 // plain annulus
  const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
  const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 72 });
  const mesh = new THREE.Mesh(g, m); mesh.position.z = z0; return mesh;
}
function gearOutline(n, rPitch, mod, internal) {    // simple trapezoid teeth
  const pts = []; const add = internal ? -mod : mod, ded = internal ? 1.25 * mod : -1.25 * mod;
  const rt = rPitch + add, rr = rPitch + ded, pitch = Math.PI * 2 / n;
  for (let i = 0; i < n; i++) {
    const a = i * pitch;
    [[-0.25, rr], [-0.12, rt], [0.12, rt], [0.25, rr]].forEach(([f, r]) => pts.push(new THREE.Vector2(Math.cos(a + f * pitch) * r, Math.sin(a + f * pitch) * r)));
  }
  return pts;
}
function gear(n, mod, z0, z1, m, bore = 0) {        // external gear
  const s = new THREE.Shape(gearOutline(n, n * mod / 2, mod, false));
  if (bore) { const h = new THREE.Path(); h.absarc(0, 0, bore, 0, Math.PI * 2, true); s.holes.push(h); }
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 24 }), m);
  mesh.position.z = z0; return mesh;
}
function ringGear(n, mod, ro, z0, z1, m) {          // internal gear
  const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
  s.holes.push(new THREE.Path(gearOutline(n, n * mod / 2, mod, true).reverse()));
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false, curveSegments: 72 }), m);
  mesh.position.z = z0; return mesh;
}
function cyl(r, z0, z1, m, x = 0, y = 0, seg = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, z1 - z0, seg), m);
  mesh.rotation.x = Math.PI / 2; mesh.position.set(x, y, (z0 + z1) / 2); return mesh;
}
function polar(R, deg) { const a = deg * Math.PI / 180; return [R * Math.cos(a), R * Math.sin(a)]; }

let ventTex;
function ventTexture() {                            // diamond perforation for the vent windows
  if (ventTex) return ventTex;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#000';
  for (const [cx, cy] of [[16, 16], [48, 16], [0, 48], [32, 48], [64, 48], [32, -16], [0, -16], [64, -16]]) {
    x.beginPath(); x.moveTo(cx, cy - 13); x.lineTo(cx + 10, cy); x.lineTo(cx, cy + 13); x.lineTo(cx - 10, cy); x.closePath(); x.fill();
  }
  // second row offset
  for (const [cx, cy] of [[16, 80], [48, 80]]) { x.beginPath(); x.moveTo(cx, cy - 13); x.lineTo(cx + 10, cy); x.lineTo(cx, cy + 13); x.lineTo(cx - 10, cy); x.closePath(); x.fill(); }
  ventTex = new THREE.CanvasTexture(c); ventTex.wrapS = ventTex.wrapT = THREE.RepeatWrapping; return ventTex;
}
function housing(z0, z1, opts = {}) {               // vented housing: rails, six pillars, mesh windows
  const g = new THREE.Group(); const m = mat('alu');
  const rail = 3.2, ro = 52, ri = 47.5;
  g.add(ring(ri, ro, z0, z0 + rail, m), ring(ri, ro, z1 - rail, z1, m));
  for (let k = 0; k < 6; k++) {                     // pillars at the bolt positions
    const a0 = (k * 60 + 30 - 6) * Math.PI / 180;
    const s = new THREE.Shape(); s.absarc(0, 0, ro, a0, a0 + 12 * Math.PI / 180, false); s.absarc(0, 0, ri, a0 + 12 * Math.PI / 180, a0, true);
    const p = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: z1 - z0 - 2 * rail, bevelEnabled: false, curveSegments: 6 }), m);
    p.position.z = z0 + rail; g.add(p);
  }
  const h = z1 - z0 - 2 * rail;                     // perforated skin
  const tex = ventTexture().clone(); tex.needsUpdate = true; tex.repeat.set(72, Math.max(1, Math.round(h / 4.5)));
  const skin = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, h, 96, 1, true),
    new THREE.MeshStandardMaterial({ color: COL.alu, roughness: 0.6, metalness: 0.3, alphaMap: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
  skin.rotation.x = Math.PI / 2; skin.position.z = (z0 + z1) / 2; g.add(skin);
  if (opts.inner) opts.inner(g, m);
  return g;
}

function buildParts() {
  const P = {}; const G = () => new THREE.Group();

  // top screws
  P.screws = G();
  for (let k = 0; k < 12; k++) { const [x, y] = polar(36.25, k * 30); P.screws.add(cyl(1.9, 21.6, 24.2, mat('black'), x, y, 12)); }
  for (let k = 0; k < 6; k++) { const [x, y] = polar(48, k * 60 + 30); P.screws.add(cyl(2.7, 21.6, 24.2, mat('black'), x, y, 12)); }

  P.retOuter = G(); P.retOuter.add(ring(41.75, 52, 19.2, 23.7, mat('graphite')));
  P.retInner = G(); P.retInner.add(ring(32.5, 40.75, 19.2, 23.7, mat('white', { metalness: 0.1 })));

  P.bearing = G();
  P.bearing.add(ring(42.3, 44.45, 12.75, 19.1, mat('steel', { metalness: 0.7, roughness: 0.3 })), ring(38.1, 40.2, 12.75, 19.1, mat('steel', { metalness: 0.7, roughness: 0.3 })));
  for (let k = 0; k < 40; k++) { const [x, y] = polar(41.25, k * 9); const b = new THREE.Mesh(new THREE.SphereGeometry(1.59, 10, 8), mat('steel', { metalness: 0.8, roughness: 0.2 })); b.position.set(x, y, 15.9); P.bearing.add(b); }

  P.ringOut = G(); P.ringOut.add(ringGear(75, 0.9, 38.1, 11.35, 19.1, mat('darkSteel')));

  P.carrierOut = G(); P.carrierOut.add(ring(16.5, 31.5, 19.4, 23.7, mat('alu')));
  for (let k = 0; k < 3; k++) { const [x, y] = polar(22.5, k * 120); P.carrierOut.add(cyl(4.2, 23.0, 24.0, mat('black'), x, y, 16)); }

  P.planets = G(); P.planetBrgTop = G(); P.planetBrgBot = G();
  for (let k = 0; k < 3; k++) {
    const [x, y] = polar(22.5, k * 120); const pl = G(); pl.position.set(x, y, 0);
    pl.add(gear(57, 0.5, 0, 5, mat('gun1'), 3), gear(27, 1.0, 5, 13.1, mat('gun2'), 3), gear(25, 0.9, 13.1, 19.1, mat('gun3'), 3));
    P.planets.add(pl);
    const bm = mat('steel', { metalness: 0.75, roughness: 0.25 });
    const bt = ring(2, 6, 13.9, 17.9, bm); bt.position.x = x; bt.position.y = y; P.planetBrgTop.add(bt);
    const bb = ring(2, 6, -0.1, 3.9, bm); bb.position.x = x; bb.position.y = y; P.planetBrgBot.add(bb);
  }

  P.carrierIn = G(); P.carrierIn.add(ring(16.5, 29, -6.4, -0.5, mat('alu')), ring(27, 30, -6.7, -6.4, mat('white', { metalness: 0 })));
  for (let k = 0; k < 3; k++) { const [x, y] = polar(25.5, k * 120 + 60); P.carrierIn.add(cyl(3, -0.5, 19.4, mat('alu'), x, y, 16)); }
  for (let k = 0; k < 3; k++) { const [x, y] = polar(22.5, k * 120); P.carrierIn.add(cyl(2, -0.5, 4.5, mat('alu'), x, y, 12)); }

  P.sun = G(); const sm = mat('steel', { metalness: 0.6, roughness: 0.35 });
  P.sun.add(gear(33, 0.5, 0, 5, sm), cyl(7.5, -4.9, 0, sm), cyl(15, -7.9, -4.9, sm, 0, 0, 48));
  for (let k = 0; k < 4; k++) { const [x, y] = polar(11, k * 90 + 45); P.sun.add(cyl(2.7, -4.9, -3.4, mat('black'), x, y, 12)); }

  P.fixed = housing(-4.4, 19.1, { inner: (g, m) => {
    g.add(ring(40, 52, -4.4, -1.4, m), ring(45, 47.5, -1.4, 7.6, m), ringGear(72, 1.0, 47.5, 5.6, 10.6, m), ring(44.5, 47.5, 10.6, 19.1, m));
  } });

  P.plate = G(); P.plate.add(ring(30.25, 52, -8.4, -4.4, mat('alu')));

  P.motorBell = G(); const bk = mat('black', { roughness: 0.45 });
  P.motorBell.add(ring(34, 36, -36, -9.5, bk), ring(9, 36, -10.5, -9, bk), cyl(4, -38, -6, mat('steel')));
  P.motorStator = G();
  P.motorStator.add(ring(10, 24, -34, -14, mat('chip')));
  for (let k = 0; k < 24; k++) { const [x, y] = polar(28.5, k * 15); const c = new THREE.Mesh(new THREE.BoxGeometry(7.5, 5.6, 19), mat('copper', { metalness: 0.6, roughness: 0.4 })); c.position.set(x, y, -24); c.rotation.z = k * 15 * Math.PI / 180; P.motorStator.add(c); }

  P.motorHousing = housing(-36.1, -8.4, { inner: (g, m) => { g.add(ring(6, 52, -36.1, -33.1, m), ring(38, 47.5, -11.4, -8.4, m)); } });

  P.magnet = G(); P.magnet.add(cyl(4.5, -37.9, -32.8, mat('graphite')), cyl(3, -38.2, -35.4, mat('steel', { metalness: 0.8 })));

  P.board = G(); const bd = G(); bd.rotation.z = 134.3 * Math.PI / 180;
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(66, 50, 1.6), mat('pcb', { metalness: 0.05, roughness: 0.7 })); pcb.position.z = -44.6; bd.add(pcb);
  [[-18, 10, 12, 12, 2], [6, -8, 9, 9, 1.6], [20, 12, 7, 14, 3], [-8, -14, 16, 6, 4], [24, -14, 8, 8, 5]].forEach(([x, y, w, d, h]) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), mat('chip')); c.position.set(x, y, -45.4 - h / 2); bd.add(c); });
  P.board.add(bd);

  P.ctrlHousing = housing(-57.1, -36.1, { inner: (g, m) => { g.add(ring(0.01, 52, -57.1, -55.6, m)); } });
  return P;
}

/* ------------------------------------------------------------------ runtime -- */
const ease = t => t * t * (3 - 2 * t);
const clamp01 = t => Math.min(1, Math.max(0, t));

async function init(root) {
  THREE ??= await import('three');
  if (!root.isConnected) return;
  const canvas = root.querySelector('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { root.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa9adb5, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(120, -160, 260); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(-160, 120, -80); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(24, 1, 10, 6000);
  camera.up.set(0, 0, 1);

  const model = new THREE.Group(); scene.add(model);
  const parts = buildParts();
  const state = {};
  for (const [name, g] of Object.entries(parts)) {
    model.add(g); state[name] = { group: g, mats: [] };
    g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.base = o.material.color.clone(); state[name].mats.push(o.material); } });
  }

  // real CAD: actuator.glb is the Onshape assembly regrouped into nodes named wx_<part key>
  // (millimetre geometry in metres, Z up, meshopt-compressed). The generated model above stays
  // on screen until it has loaded, and remains if loading fails.
  let disposed = false;
  const url = root.dataset.model;
  const cadReady = url ? Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
  ]).then(async ([{ GLTFLoader }, { MeshoptDecoder }]) => {
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const windings = root.dataset.windings ? loader.loadAsync(root.dataset.windings).catch(() => null) : Promise.resolve(null);
      const gltf = await loader.loadAsync(url);
      if (disposed) {
        gltf.scene.traverse(o => {
          o.geometry?.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
        });
        return false;
      }
      const found = {};
      gltf.scene.traverse(o => { if (o.name && o.name.startsWith('wx_') && state[o.name.slice(3)]) found[o.name.slice(3)] = o; });
      if (Object.keys(found).length < 10) return false;
      for (const [key, st] of Object.entries(state)) {
        st.group.clear(); st.mats = [];
        const src = found[key]; if (!src) continue;
        src.scale.setScalar(1000); st.group.add(src);
        src.traverse(o => { if (!o.isMesh) return;
          o.material = o.material.clone(); o.material.roughness = 0.5; o.material.metalness = 0.3;
          o.material.color.convertSRGBToLinear();   // Onshape writes sRGB values into a linear field
          o.material.userData.base = o.material.color.clone(); st.mats.push(o.material); });
      }
      addWindings(state.motorStator, (await windings)?.scene);
      if (disposed) return false;
      rigGearTrain();
      root.classList.add('wx-loaded'); dirty = true;
      return true;
  }).catch(() => false) : Promise.resolve(false);

  // actuator.glb carries only the stator's central frame. The lamination stack, wire turns and
  // phase connections come from a separate simplified export (stator-windings.glb, millimetres,
  // already in the actuator frame) and join the stator part.
  function addWindings(st, scene) {
    if (!st || !scene) return;
    scene.traverse(o => { if (!o.isMesh) return;
      o.material = o.material.clone(); o.material.color.convertSRGBToLinear();
      o.geometry.computeVertexNormals();
      o.material.userData.base = o.material.color.clone(); st.mats.push(o.material); });
    st.group.add(scene);
  }

  // Gear train kinematics for the interactive model, from the tooth counts: sun 33T meshes the
  // planet 57T stage, the fixed ring 72T meshes the 27T stage, and the output ring 75T meshes the
  // 25T stage. With the fixed ring held, sun : carrier : output = 5.606 : 1 : 0.111, or 50.45:1.
  const TRAIN = (() => {
    const k = (57 * 72) / (33 * 27);
    return { carrier: 1 / (1 + k), planet: -(72 / 27) / (1 + k), output: (1 - (72 * 25) / (27 * 75)) / (1 + k) };
  })();
  const drive = { rpm: 0, angle: 0, rig: null };

  // Groups selected meshes of a part under a pivot on the actuator axis so they can turn on their own.
  function axisPivot(st, test) {
    const pivot = new THREE.Group(), picked = [];
    st.group.updateMatrixWorld(true);
    st.group.add(pivot);
    st.group.traverse(o => { if (o.isMesh && test(o.name)) picked.push(o); });
    picked.forEach(mesh => pivot.attach(mesh));
    return pivot;
  }

  // Re-cuts a part's merged CAD meshes triangle by triangle into `count` pieces chosen by
  // keyOf(x, y) at each triangle's centre, in the part's own frame. The original meshes are removed.
  function cutPart(st, count, keyOf) {
    const group = st.group; group.updateMatrixWorld(true);
    const toGroup = group.matrixWorld.clone().invert(), pieces = [], meshes = [];
    group.traverse(o => { if (o.isMesh) meshes.push(o); });
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    for (const mesh of meshes) {
      const m = new THREE.Matrix4().multiplyMatrices(toGroup, mesh.matrixWorld), nm = new THREE.Matrix3().getNormalMatrix(m);
      const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
      const pos = geo.attributes.position, nor = geo.attributes.normal;
      const buckets = Array.from({ length: count }, () => ({ p: [], n: [] }));
      for (let i = 0; i < pos.count; i += 3) {
        a.fromBufferAttribute(pos, i).applyMatrix4(m); b.fromBufferAttribute(pos, i + 1).applyMatrix4(m); c.fromBufferAttribute(pos, i + 2).applyMatrix4(m);
        const k = keyOf((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
        [a, b, c].forEach((v, j) => {
          buckets[k].p.push(v.x, v.y, v.z);
          if (nor) { n.fromBufferAttribute(nor, i + j).applyMatrix3(nm).normalize(); buckets[k].n.push(n.x, n.y, n.z); }
        });
      }
      buckets.forEach((bucket, k) => { if (bucket.p.length) pieces.push({ k, material: mesh.material, ...bucket }); });
      if (geo !== mesh.geometry) geo.dispose();
      mesh.geometry.dispose();
    }
    group.clear();
    return pieces;
  }

  // Builds a mesh from a cut piece, shifted so `origin` (x, y) becomes its local axis.
  function pieceMesh(piece, origin) {
    for (let i = 0; i < piece.p.length; i += 3) { piece.p[i] -= origin.x; piece.p[i + 1] -= origin.y; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(piece.p, 3));
    if (piece.n.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(piece.n, 3)); else geo.computeVertexNormals();
    return new THREE.Mesh(geo, piece.material);
  }

  // The three planets come from the CAD as merged meshes. Split them by angle and put each on a
  // pivot at its own pin, so every planet can spin while the carrier takes it around.
  function splitPlanets(st) {
    const third = Math.PI * 2 / 3;
    const pieces = cutPart(st, 3, (x, y) => ((Math.round(Math.atan2(y, x) / third) % 3) + 3) % 3);
    // Each pin sits at the middle of its planet's footprint.
    const boxes = [0, 1, 2].map(() => new THREE.Box3()), v = new THREE.Vector3();
    for (const piece of pieces) for (let i = 0; i < piece.p.length; i += 3) boxes[piece.k].expandByPoint(v.set(piece.p[i], piece.p[i + 1], 0));
    const pivots = boxes.map(box => { const pivot = new THREE.Group(); box.getCenter(pivot.position); pivot.position.z = 0; st.group.add(pivot); return pivot; });
    for (const piece of pieces) pivots[piece.k].add(pieceMesh(piece, pivots[piece.k].position));
    return pivots;
  }

  // The retainer screws are one merged mesh too: the inner ring (34 to 38 mm out) clamps the
  // output side and turns with it, and the outer ring (45 to 51 mm) holds the housing side still.
  function splitScrews(st) {
    const pieces = cutPart(st, 2, (x, y) => Math.hypot(x, y) < 41.5 ? 0 : 1);
    const pivot = new THREE.Group(); st.group.add(pivot);
    for (const piece of pieces) (piece.k === 0 ? pivot : st.group).add(pieceMesh(piece, { x: 0, y: 0 }));
    return pivot;
  }

  function rigGearTrain() {
    if (!state.planets || !state.bearing || !state.screws) return;
    drive.rig = {
      planets: splitPlanets(state.planets),
      innerScrews: splitScrews(state.screws),
      bearingInner: axisPivot(state.bearing, name => /Inner_Race/.test(name)),
      bearingCage: axisPivot(state.bearing, name => /Ball|Cage/.test(name)),
    };
  }

  // Sets every rotating part from the motor angle (radians).
  function applyDrive() {
    const rig = drive.rig; if (!rig) return;
    const motor = drive.angle, carrier = motor * TRAIN.carrier, output = motor * TRAIN.output;
    const turn = (names, angle) => names.forEach(name => { if (state[name]) state[name].group.rotation.z = angle; });
    turn(['sun', 'motorBell', 'magnet'], motor);
    turn(['carrierOut', 'carrierIn', 'planets', 'planetBrgTop', 'planetBrgBot'], carrier);
    turn(['ringOut', 'retInner'], output);
    rig.innerScrews.rotation.z = output;
    rig.planets.forEach(pivot => { pivot.rotation.z = motor * TRAIN.planet - carrier; });   // spin relative to the carrier
    rig.bearingInner.rotation.z = output;
    rig.bearingCage.rotation.z = output * 0.47;   // a rolling cage turns at a little under half the race speed
  }

  function showDriveSpeed() {
    els.spec.textContent = drive.rpm
      ? `Motor ${Math.round(drive.rpm)} rpm, output ${(drive.rpm * TRAIN.output).toFixed(1)} rpm (50.45:1)`
      : 'Onshape assembly';
  }

  const els = { step: root.querySelector('.wx-step'), title: root.querySelector('.wx-title'), body: root.querySelector('.wx-body'), spec: root.querySelector('.wx-spec'), cap: root.querySelector('.wx-caption'), fill: root.querySelector('.wx-step i') };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // target follows the scroll position; progress eases toward it so wheel steps glide.
  let progress = 0, target = 0, lastFrame = 0, shown = -1, dirty = true, swapTimer = 0;
  const dim = new THREE.Color(0xc9ccd1);
  // shown: the layout on screen as a fractional step; it glides toward the scrolled step.
  const glide = { at: 0, v: 0, init: false };
  let mode = 'animation', controls = null, modeRequest = 0;
  const events = new AbortController();
  const buttons = {
    explore: root.querySelector('[data-wx-explore]'),
    skip: root.querySelector('[data-wx-skip]'),
    replay: root.querySelector('[data-wx-replay]'),
    reset: root.querySelector('[data-wx-reset]'),
  };
  // Section view: a vertical plane through the actuator axis, facing the default CAD camera.
  // Slider 0 leaves the housing whole; 100 removes the near half down to the axis.
  drive.input = root.querySelector('[data-wx-drive]'); drive.label = drive.input?.closest('label');
  const section = { input: root.querySelector('[data-wx-section]'), plane: new THREE.Plane(new THREE.Vector3(-Math.SQRT1_2, Math.SQRT1_2, 0), 60) };
  section.label = section.input?.closest('label');
  function setSection(value) {
    const cut = clamp01(value / 100);
    section.plane.constant = 60 * (1 - cut);
    renderer.clippingPlanes = mode === 'cad' && cut > 0 ? [section.plane] : [];
    if (cut > 0) model.traverse(o => {
      if (!o.isMesh || o.material.side === THREE.DoubleSide) return;
      o.material.side = THREE.DoubleSide; o.material.needsUpdate = true;   // show cut walls from inside
    });
    if (section.input && +section.input.value !== value) section.input.value = value;
    dirty = true;
  }

  function scrollToSection(section) {
    const scroller = root.closest('.detail-content');
    if (!scroller || !section) return;
    const inset = parseFloat(getComputedStyle(root).getPropertyValue('--wx-top')) || 104;
    scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - inset), behavior: 'instant' });
  }

  function setMode(next) {
    clearTimeout(swapTimer);
    els.cap.classList.remove('is-swapping');
    shown = -1;
    mode = next;
    root.dataset.wxMode = mode;
    root.classList.toggle('wx-compact', mode !== 'animation');
    buttons.explore.hidden = mode === 'cad';
    buttons.skip.hidden = mode === 'skipped';
    buttons.skip.textContent = mode === 'cad' ? 'Continue reading' : 'Skip animation';
    buttons.replay.hidden = mode === 'animation';
    buttons.reset.hidden = mode !== 'cad';
    if (section.label) section.label.hidden = mode !== 'cad';
    if (drive.label) drive.label.hidden = mode !== 'cad';
    setSection(0);
    if (mode !== 'cad') {
      drive.rpm = 0; drive.angle = 0; applyDrive();
      if (drive.input) drive.input.value = 0;
    }
    canvas.setAttribute('aria-hidden', mode === 'cad' ? 'false' : 'true');
    if (mode === 'cad') {
      canvas.setAttribute('aria-label', 'Interactive Wolfrom actuator CAD model');
      canvas.tabIndex = 0;
    } else {
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-label');
    }
    if (controls) controls.enabled = mode === 'cad';
    progress = target = mode === 'animation' ? 0 : 1;
    glide.init = false;
    dirty = true;
  }

  function resetView() {
    resize();
    model.position.z = 0;
    for (const st of Object.values(state)) {
      st.group.position.z = 0;
      st.mats.forEach(m => m.color.copy(m.userData.base));
    }
    const distance = Math.max(140 / (2 * Math.tan(camera.fov * Math.PI / 360)), 130 / (2 * Math.tan(camera.fov * Math.PI / 360) * camera.aspect));
    camera.position.set(distance * 0.65, -distance * 0.65, -16 + distance * 0.4);
    controls.target.set(0, 0, -16);
    controls.minDistance = 140;
    controls.maxDistance = distance * 3;
    controls.autoRotate = !reduce;
    controls.update();
    setSection(0);
    dirty = true;
  }

  buttons.explore.addEventListener('click', async () => {
    const request = ++modeRequest;
    buttons.explore.disabled = true;
    buttons.explore.textContent = 'Loading CAD…';
    try {
      // Orbit controls are fetched only on request; the real assembly is shared with the story.
      const [loaded, { OrbitControls }] = await Promise.all([cadReady, import('three/addons/controls/OrbitControls.js')]);
      if (disposed || request !== modeRequest) return;
      if (!loaded) throw new Error('CAD unavailable');
      if (!controls) {
        controls = new OrbitControls(camera, canvas);
        controls.listenToKeyEvents(canvas);
        controls.addEventListener('change', () => { dirty = true; });
        controls.autoRotateSpeed = 1.2;
        // The model turns slowly on its own until the reader takes hold of it.
        controls.addEventListener('start', () => { controls.autoRotate = false; });
      }
      clearTimeout(swapTimer);
      els.cap.classList.remove('is-swapping');
      setMode('cad');
      resetView();
      els.title.textContent = 'Explore the actuator';
      els.body.textContent = window.matchMedia('(pointer: coarse)').matches
        ? 'Drag to rotate and pinch to zoom. The section slider cuts through to the gear stack, and the motor slider runs the gear train at its real ratios.'
        : 'Drag to rotate, scroll to zoom, and shift-drag to pan. The section slider cuts through to the gear stack, and the motor slider runs the gear train at its real ratios.';
      showDriveSpeed();
      scrollToSection(root);
    } catch {
      if (!disposed && request === modeRequest) buttons.explore.textContent = 'Retry loading CAD';
    } finally {
      if (!disposed) {
        buttons.explore.disabled = false;
        if (mode === 'cad') buttons.explore.textContent = 'Interact with model';
      }
    }
  }, { signal: events.signal });
  buttons.skip.addEventListener('click', () => {
    ++modeRequest;
    buttons.explore.textContent = 'Interact with model';
    setMode('skipped');
    scrollToSection(document.getElementById('wolfrom-why'));
  }, { signal: events.signal });
  buttons.replay.addEventListener('click', () => {
    ++modeRequest;
    setMode('animation');
    shown = -1;
    scrollToSection(root);
  }, { signal: events.signal });
  buttons.reset.addEventListener('click', resetView, { signal: events.signal });
  section.input?.addEventListener('input', () => {
    if (controls) controls.autoRotate = false;   // keep the cut facing the reader
    setSection(+section.input.value);
  }, { signal: events.signal });
  drive.input?.addEventListener('input', () => {
    drive.rpm = +drive.input.value;
    showDriveSpeed();
    dirty = true;
  }, { signal: events.signal });
  setMode(reduce ? 'skipped' : 'animation');

  // Phones: size the stage once from the window height. Mobile toolbars change the viewport
  // height while scrolling; following that would resize the canvas mid-animation.
  let stageWidth = 0, stageHeight = 0;
  function fixStageHeight() {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === stageWidth && Math.abs(h - stageHeight) < 160) return;
    stageWidth = w; stageHeight = h;
    if (window.matchMedia('(max-width: 768px)').matches) root.style.setProperty('--wx-stage-fixed', `${h - 128}px`);
    else root.style.removeProperty('--wx-stage-fixed');
    dirty = true;
  }
  fixStageHeight();
  window.addEventListener('resize', fixStageHeight, { signal: events.signal });

  // Reserve the tallest caption so the model area never resizes between steps.
  function fitCaptionHeight() {
    const fields = [els.title, els.body, els.spec];
    const saved = fields.map(el => el.textContent);
    root.style.setProperty('--wx-caption-h', '0px');
    let tallest = 0;
    for (const s of STEPS) {
      els.title.textContent = s.title; els.body.textContent = s.body; els.spec.textContent = s.spec;
      tallest = Math.max(tallest, els.cap.scrollHeight);
    }
    fields.forEach((el, i) => { el.textContent = saved[i]; });
    root.style.setProperty('--wx-caption-h', `${Math.ceil(tallest)}px`);
    dirty = true;
  }
  fitCaptionHeight();
  document.fonts?.ready.then(() => { if (!disposed) fitCaptionHeight(); });
  let captionTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(captionTimer); captionTimer = setTimeout(fitCaptionHeight, 150); }, { signal: events.signal });

  function setCaption(i) {
    if (i === shown) return; shown = i; const s = STEPS[i];
    els.step.setAttribute('aria-valuenow', i + 1); els.step.setAttribute('aria-valuetext', `Step ${i + 1} of ${STEPS.length}`);
    const write = () => { els.title.textContent = s.title; els.body.textContent = s.body; els.spec.textContent = s.spec; els.cap.classList.remove('is-swapping'); };
    if (reduce || els.title.textContent === '') { write(); return; }
    els.cap.classList.add('is-swapping'); clearTimeout(swapTimer); swapTimer = setTimeout(write, 80);
  }

  function readProgress() {
    const stageEl = root.querySelector('.wx-stage');
    const r = root.getBoundingClientRect(); const stage = stageEl.getBoundingClientRect();
    const travel = r.height - stage.height; const top = parseFloat(getComputedStyle(stageEl).top) || 0;
    const scroller = root.closest('.detail-content');
    let p;
    if (scroller) {
      // Count from the top of the page so the first scroll already advances the story while the
      // title moves away; the stage pins partway through and releases exactly at the end.
      const stickAt = Math.max(0, r.top - scroller.getBoundingClientRect().top + scroller.scrollTop - top);
      p = clamp01(scroller.scrollTop / (stickAt + travel));
    } else p = travel > 0 ? clamp01((top - r.top) / travel) : 0;
    if (Math.abs(p - target) > 0.0002) { target = p; dirty = true; }
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  }

  const phoneLayout = window.matchMedia('(max-width: 768px)');

  // Camera frame for step k: the whole actuator in that step's layout. The walk-through steps all
  // share one frame that fits every one of them, so the camera holds still while parts move.
  function frameFor(k) {
    const walk = k > 0 && k < EXPLODED_STEP;
    // A phone canvas is close to square, so the tall walk-through stack would render tiny. There
    // the camera keeps one zoom and pans to centre the current parts; the canvas edges fade
    // whatever sits beyond the frame (wolfrom-explode.css).
    if (walk && phoneLayout.matches) {
      let lo = Infinity, hi = -Infinity;
      for (const n of STEPS[k].move) { const e = EXPLODE[n], z = e.zc + LAYOUT[k][n]; lo = Math.min(lo, z - e.hz); hi = Math.max(hi, z + e.hz); }
      return { mid: (lo + hi) / 2, span: 150, zoom: 1 };
    }
    let lo = Infinity, hi = -Infinity;
    for (const layout of walk ? LAYOUT.slice(1, EXPLODED_STEP) : [LAYOUT[k]]) {
      for (const [n, e] of Object.entries(EXPLODE)) { const z = e.zc + layout[n]; lo = Math.min(lo, z - e.hz); hi = Math.max(hi, z + e.hz); }
    }
    const span = hi - lo + 24;
    const clear = k === 0 ? titleClearance(span) : { shift: 0, zoom: 1 };
    return { mid: (lo + hi) / 2 + clear.shift, span, zoom: clear.zoom };
  }

  // The page title overlays the top of the stage on the opening frame. Aim the camera a little
  // higher, just enough to put the assembled actuator below the title, keeping a bottom margin.
  function titleClearance(span) {
    const header = root.closest('.detail-content')?.querySelector('.detail-header');
    const inner = root.closest('.detail-inner');
    const h = canvas.clientHeight, w = canvas.clientWidth;
    if (!header || !inner || !h || !w) return { shift: 0, zoom: 1 };
    const titleBottom = header.offsetTop + header.offsetHeight + 20
      - (root.getBoundingClientRect().top - inner.getBoundingClientRect().top);
    const vFov = camera.fov * Math.PI / 180, hFov = 2 * Math.atan(Math.tan(vFov / 2) * (w / h)), elev = 0.42;
    const needH = span * Math.cos(elev) + 104 * Math.sin(elev) + 24, needW = 104 + 30;
    const dist = Math.max(needH / (2 * Math.tan(vFov / 2)), needW / (2 * Math.tan(hFov / 2))) * 1.04;
    // On short screens the actuator would not fit below the title, so also step the camera back.
    const fullPx = (81 * Math.cos(elev) + 104 * Math.sin(elev)) * h / (2 * dist * Math.tan(vFov / 2));
    const zoom = Math.max(1, fullPx / Math.max(1, h - titleBottom - 24));
    const pxPerMm = h / (2 * dist * zoom * Math.tan(vFov / 2));
    const above = (h - fullPx / zoom) / 2;
    const shift = Math.min(Math.max(0, titleBottom - above), Math.max(0, above - 8));
    return { shift: shift / pxPerMm, zoom };
  }
  phoneLayout.addEventListener?.('change', () => { dirty = true; }, { signal: events.signal });

  function frame(now = performance.now()) {
    if (mode === 'animation') readProgress();
    resize();
    const dt = Math.min(64, now - (lastFrame || now)); lastFrame = now;
    if (mode === 'animation' && progress !== target) {
      // Critically damped follow (about 110 ms) turns discrete wheel steps into smooth motion.
      progress = reduce ? target : progress + (target - progress) * (1 - Math.exp(-dt / 55));
      if (Math.abs(target - progress) < 0.00015) progress = target;
      dirty = true;
    }
    if (mode === 'cad') {
      if (controls?.autoRotate) controls.update(dt / 1000);   // marks the frame dirty through 'change'
      if (drive.rpm) { drive.angle += drive.rpm * Math.PI / 30 * dt / 1000; applyDrive(); dirty = true; }
    }
    if (dirty) {
      dirty = false;
      if (mode === 'cad') {
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
        return;
      }
      // which step: from the scroll position itself, so the caption responds immediately
      // Steps share the scroll evenly; the reassembled actuator holds for the last twelfth.
      let si = 0; for (let i = 0; i < STEPS.length; i++) if (target >= STEPS[i].from) si = i;
      setCaption(si);
      const focus = new Set(STEPS[si].focus.flatMap(f => FOCUS_ALIAS[f] || [f]));
      const fade = reduce ? 1 : 1 - Math.exp(-dt / 90);
      // Glide through every layout between here and the scrolled step on a critically damped
      // spring: it keeps its speed while the reader keeps scrolling and settles without overshoot.
      if (!glide.init || reduce) { glide.at = si; glide.v = 0; glide.init = true; }
      else if (glide.at !== si || glide.v) {
        const w = 6.6 / (MOVE_MS / 1000), t = dt / 1000, e0 = glide.at - si, decay = Math.exp(-w * t);
        const e = (e0 + (glide.v + w * e0) * t) * decay;
        glide.v = (glide.v - w * (glide.v + w * e0) * t) * decay;
        if (e * e0 <= 0 || (Math.abs(e) < 0.0005 && Math.abs(glide.v) < 0.01)) { glide.at = si; glide.v = 0; }
        else glide.at = si + e;
        dirty = true;
      }
      const a = Math.min(STEPS.length - 2, Math.floor(glide.at)), f = glide.at - a;
      for (const [name, st] of Object.entries(state)) {
        st.group.position.z = LAYOUT[a][name] + (LAYOUT[a + 1][name] - LAYOUT[a][name]) * f;
        // Highlights fade over about 200 ms; an instant colour flip reads as a glitch.
        const dimTarget = focus.size === 0 || focus.has(name) ? 0 : 0.6;
        st.dim = st.dim === undefined ? dimTarget : st.dim + (dimTarget - st.dim) * fade;
        if (Math.abs(dimTarget - st.dim) > 0.004) dirty = true; else st.dim = dimTarget;
        for (const m of st.mats) m.color.copy(m.userData.base).lerp(dim, st.dim);
      }
      // The camera follows the same glide, so the frame always fits the layout on screen.
      const fa = frameFor(a), fb = frameFor(a + 1);
      const cam = { mid: fa.mid + (fb.mid - fa.mid) * f, span: fa.span + (fb.span - fa.span) * f, zoom: fa.zoom + (fb.zoom - fa.zoom) * f };
      const mid = cam.mid, span = cam.span;
      const vFov = camera.fov * Math.PI / 180, hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const elev = 0.42;                                              // radians above the horizon
      const needH = span * Math.cos(elev) + 104 * Math.sin(elev) + 24, needW = 104 + 30;
      const dist = Math.max(needH / (2 * Math.tan(vFov / 2)), needW / (2 * Math.tan(hFov / 2))) * 1.04 * cam.zoom;
      const az = -0.9 + progress * 1.5;
      camera.position.set(Math.cos(az) * Math.cos(elev) * dist, Math.sin(az) * Math.cos(elev) * dist, mid + Math.sin(elev) * dist);
      camera.lookAt(0, 0, mid);
      els.fill.style.transform = `scaleX(${((glide.at + 1) / STEPS.length).toFixed(4)})`;   // follows the parts' glide
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);
  }

  let raf = 0; const io = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) { dirty = true; raf = requestAnimationFrame(frame); } }, { rootMargin: '200px' });
  io.observe(root);
  root.__wx = {
    state,
    dispose: () => {
      disposed = true;
      events.abort();
      controls?.dispose();
      cancelAnimationFrame(raf);
      clearTimeout(swapTimer);
      io.disconnect();
      const geometries = new Set(), materials = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      renderer.dispose();
    }
  };
}

window.initWolfromExplode = init;

const trackedViews = new Set();
const loadObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    loadObserver.unobserve(entry.target);
    entry.target.dataset.wxReady = 'true';
    init(entry.target);
  });
}, { rootMargin: '400px' });

function wireExplodedViews() {
  for (const root of trackedViews) {
    if (root.isConnected) continue;
    loadObserver.unobserve(root);
    root.__wx?.dispose();
    trackedViews.delete(root);
  }
  document.querySelectorAll('.wx:not([data-wx-ready])').forEach(root => {
    root.dataset.wxReady = 'pending';
    trackedViews.add(root);
    loadObserver.observe(root);
  });
}

wireExplodedViews();
new MutationObserver(wireExplodedViews).observe(document.body, { childList: true, subtree: true });

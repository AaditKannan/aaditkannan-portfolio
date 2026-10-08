
let THREE;

/* ------------------------------------------------------------------ story ---- */
// Each step: scroll window [from, to] (0..1 of the section), caption, and the parts to highlight.
const STEPS = [
  { from: 0.00, title: '50.45:1 in a 104 mm package',
    body: 'I’m designing and building a backdrivable actuator for a humanoid elbow, with the motor, gearbox, and controller in one package. The printed prototype checks the assembly before a load-rated metal build.',
    spec: '30 Nm continuous and 50 Nm peak design targets', focus: [] },
  { from: 0.10, title: 'Bearing retainers',
    body: 'Two rings clamp the output bearing: the outer one to the housing, the inner one to the output ring gear. Recessed screws keep the top face flush.',
    spec: '12 x M2 inner, 6 x M3 outer', focus: ['retOuter', 'retInner', 'screws'] },
  { from: 0.20, title: 'Output bearing',
    body: 'A single thin-section four-point bearing carries every external load on the joint: radial, axial and overturning moment.',
    spec: 'Kaydon KA030XP0, 76.2 mm bore', focus: ['bearing'] },
  { from: 0.29, title: 'Output ring gear',
    body: 'The output ring meshes with the upper planet stage. Its tooth count and module differ from the fixed ring while preserving the same centre distance.',
    spec: '75 teeth, module 0.9', focus: ['ringOut'] },
  { from: 0.38, title: 'Carrier',
    body: 'The carrier floats: it carries no net torque. Its two plates are still twisted against each other by 40 percent of the output torque, through three posts.',
    spec: '20 Nm plate-to-plate at 50 Nm output', focus: ['carrierOut', 'carrierIn'] },
  { from: 0.47, title: 'Compound planets',
    body: 'Each planet is three gears on one body. The two ring meshes push on it in opposite directions 8 mm apart, which tilts it. The small bearings that resist that tilt are the limiting part of the design.',
    spec: '57 / 27 / 25 teeth, 4.2 Nm tilt at peak', focus: ['planets', 'planetBrg'] },
  { from: 0.58, title: 'Sun gear',
    body: 'The sun gear bolts directly to the motor rotor through a flange, avoiding a press fit in the torque path.',
    spec: '33 teeth, module 0.5', focus: ['sun'] },
  { from: 0.66, title: 'Fixed ring gear housing',
    body: 'Ring-gear reaction torque runs through a solid wall to the mount plate. Power circulating through the two ring meshes is 8 to 9 times the output power, which amplifies mesh losses.',
    spec: '72 teeth, module 1.0', focus: ['fixed', 'plate'] },
  { from: 0.76, title: 'Motor',
    body: 'An outrunner drone motor: the magnet bell lifts off to show the stator and its 24 windings. At 50 Nm output it needs about 42 A of a 59 A peak rating.',
    spec: 'MAD M6C10, 300 KV', focus: ['motorBell', 'motorStator', 'motorHousing'] },
  { from: 0.86, title: 'Controller',
    body: 'The drive sits behind the motor and reads rotor angle from a magnet on the shaft, 1.5 mm from the encoder chip.',
    spec: 'ODrive S1', focus: ['board', 'ctrlHousing', 'magnet'] },
  { from: 0.95, title: 'Exploded assembly',
    body: 'The retainers, output support, gear train, motor, and controller are separated along the assembly axis.',
    spec: '3 planets, 3 gear stages, 1 output bearing', focus: [] },
  { from: 1.00, title: 'Integrated actuator',
    body: 'The gearbox, motor, and controller return to the assembled package. The sections below cover the load cases, calculations, and physical prototypes behind this design.',
    spec: '50.45:1 ratio, 30 Nm continuous / 50 Nm peak design targets', focus: [] },
];

/* --------------------------------------------------------------- explosion --- */
// dz: travel along the axis when fully exploded [mm]. zc: axial centre of the part when assembled [mm].
// win: [start, end] of scroll progress over which the part travels.
const EXPLODE = {
  screws:       { dz:  207, zc:     23, win: [0.08, 0.20] },
  retOuter:     { dz:  186, zc:     21, win: [0.09, 0.21] },
  retInner:     { dz:  174, zc:     21, win: [0.10, 0.22] },
  bearing:      { dz:  159, zc:     16, win: [0.19, 0.30] },
  ringOut:      { dz:  141, zc:     15, win: [0.28, 0.39] },
  carrierOut:   { dz:  120, zc:   21.5, win: [0.37, 0.47] },
  planetBrgTop: { dz:  111, zc:     16, win: [0.46, 0.56] },
  planets:      { dz:   99, zc:    9.5, win: [0.46, 0.57] },
  planetBrgBot: { dz:   87, zc:      2, win: [0.46, 0.58] },
  carrierIn:    { dz:   69, zc:      5, win: [0.40, 0.58] },
  sun:          { dz:   42, zc:   -1.5, win: [0.56, 0.66] },
  fixed:        { dz:   17, zc:      7, win: [0.64, 0.74] },
  plate:        { dz:    0, zc:   -6.4, win: [0, 1] },
  motorBell:    { dz:  -14, zc:    -23, win: [0.74, 0.86] },
  motorStator:  { dz:  -46, zc:    -24, win: [0.74, 0.86] },
  motorHousing: { dz:  -75, zc:    -22, win: [0.72, 0.86] },
  magnet:       { dz:  -98, zc:    -35, win: [0.84, 0.94] },
  board:        { dz:  -135, zc:    -45, win: [0.84, 0.95] },
  ctrlHousing:  { dz: -180, zc:  -46.6, win: [0.82, 0.95] },
};
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
      const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
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
      root.classList.add('wx-loaded'); dirty = true;
      return true;
  }).catch(() => false) : Promise.resolve(false);

  const els = { step: root.querySelector('.wx-step'), title: root.querySelector('.wx-title'), body: root.querySelector('.wx-body'), spec: root.querySelector('.wx-spec'), cap: root.querySelector('.wx-caption'), bar: root.querySelector('.wx-progress i') };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let progress = 0, shown = -1, dirty = true, swapTimer = 0;
  const dim = new THREE.Color(0xc9ccd1);
  const cam = { mid: -16, span: 81, init: false };
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
    setSection(0);
    canvas.setAttribute('aria-hidden', mode === 'cad' ? 'false' : 'true');
    if (mode === 'cad') {
      canvas.setAttribute('aria-label', 'Interactive Wolfrom actuator CAD model');
      canvas.tabIndex = 0;
    } else {
      canvas.removeAttribute('tabindex');
      canvas.removeAttribute('aria-label');
    }
    if (controls) controls.enabled = mode === 'cad';
    progress = mode === 'animation' ? 0 : 1;
    cam.init = false;
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
      }
      clearTimeout(swapTimer);
      els.cap.classList.remove('is-swapping');
      setMode('cad');
      resetView();
      els.step.textContent = '';
      els.title.textContent = 'Explore the actuator';
      els.body.textContent = window.matchMedia('(pointer: coarse)').matches
        ? 'Drag to rotate and pinch to zoom. Use the section slider to cut through to the gear stack.'
        : 'Drag to rotate, scroll to zoom, and shift-drag to pan. Use the section slider to cut through to the gear stack.';
      els.spec.textContent = 'Onshape assembly';
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
  section.input?.addEventListener('input', () => setSection(+section.input.value), { signal: events.signal });
  setMode(reduce ? 'skipped' : 'animation');

  // Reserve the tallest caption so the model area never resizes between steps.
  function fitCaptionHeight() {
    const fields = [els.step, els.title, els.body, els.spec];
    const saved = fields.map(el => el.textContent);
    root.style.setProperty('--wx-caption-h', '0px');
    let tallest = 0;
    for (const s of STEPS) {
      els.step.textContent = '00 / 00'; els.title.textContent = s.title; els.body.textContent = s.body; els.spec.textContent = s.spec;
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
    const write = () => { els.step.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(STEPS.length).padStart(2, '0'); els.title.textContent = s.title; els.body.textContent = s.body; els.spec.textContent = s.spec; els.cap.classList.remove('is-swapping'); };
    if (reduce || els.title.textContent === '') { write(); return; }
    els.cap.classList.add('is-swapping'); clearTimeout(swapTimer); swapTimer = setTimeout(write, 80);
  }

  function readProgress() {
    const r = root.getBoundingClientRect(); const stage = root.querySelector('.wx-stage').getBoundingClientRect();
    const travel = r.height - stage.height; const top = parseFloat(getComputedStyle(root.querySelector('.wx-stage')).top) || 0;
    // Start at the top of the reading row, then settle into the full-height pinned view.
    // This reveals the opening model and explanation immediately below the title.
    if (window.matchMedia('(min-width: 769px)').matches) {
      const entry = ease(clamp01(1 - (r.top - top) / 300));
      const openingHeight = Math.min(560, stage.height);
      const viewHeight = openingHeight + (stage.height - openingHeight) * entry;
      const copyHeight = root.querySelector('.wx-copy').getBoundingClientRect().height;
      const copyY = Math.max(0, (stage.height - copyHeight) / 2) * entry;
      const viewValue = `${viewHeight.toFixed(1)}px`, copyValue = `${copyY.toFixed(1)}px`;
      if (root.style.getPropertyValue('--wx-view-h') !== viewValue) root.style.setProperty('--wx-view-h', viewValue);
      if (root.style.getPropertyValue('--wx-copy-y') !== copyValue) root.style.setProperty('--wx-copy-y', copyValue);
    }
    const p = travel > 0 ? clamp01((top - r.top) / travel) : 0;
    if (Math.abs(p - progress) > 0.0005) { progress = p; dirty = true; }
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  }

  function frame() {
    if (mode === 'animation') readProgress();
    resize();
    if (dirty) {
      dirty = false;
      if (mode === 'cad') {
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
        return;
      }
      // which step
      const storyProgress = progress < 0.86 ? progress / 0.86 : 1;
      let si = 0; for (let i = 0; i < STEPS.length - 1; i++) if (storyProgress >= STEPS[i].from) si = i;
      if (progress >= 0.98) si = STEPS.length - 1;
      setCaption(si);
      const focus = new Set(STEPS[si].focus.flatMap(f => FOCUS_ALIAS[f] || [f]));
      // explode
      let zMin = -57, zMax = 24;
      const collapse = 1 - ease(clamp01((progress - 0.86) / 0.12));
      let upwardTravel = 0;
      for (const [name, st] of Object.entries(state)) {
        const e = EXPLODE[name]; const t = ease(clamp01((storyProgress - e.win[0]) / (e.win[1] - e.win[0]))) * collapse;
        st.group.position.z = e.dz * t;
        upwardTravel = Math.max(upwardTravel, st.group.position.z);
        zMin = Math.min(zMin, -57 + Math.min(0, e.dz * t)); zMax = Math.max(zMax, 24 + Math.max(0, e.dz * t));
        const lit = focus.size === 0 || focus.has(name);
        for (const m of st.mats) m.color.copy(m.userData.base).lerp(dim, lit ? 0 : 0.35);
        st.z = e.zc + e.dz * t;
      }
      // Hold the output side in place as the remaining assembly opens downward.
      model.position.z = -upwardTravel;
      // Keep every part inside the column; highlighting and captions identify the active component.
      let gMid = (zMin + zMax) / 2, gSpan = zMax - zMin;
      // Portrait screens frame the highlighted parts instead of the whole stack, so the
      // actuator fills the width. Steps with nothing highlighted still show everything.
      if (camera.aspect < 0.9 && focus.size) {
        let fMin = Infinity, fMax = -Infinity;
        for (const name of focus) {
          const st = state[name]; if (!st || st.z === undefined) continue;
          fMin = Math.min(fMin, st.z - 18); fMax = Math.max(fMax, st.z + 18);
        }
        if (fMin < fMax) { gMid = (fMin + fMax) / 2; gSpan = Math.max(fMax - fMin, 70); }
      }
      if (!cam.init || reduce) { cam.mid = gMid; cam.span = gSpan; cam.init = true; cam.t = performance.now(); }
      else { const now = performance.now(), k = 1 - Math.exp(-Math.min(250, now - (cam.t || now)) / 160); cam.t = now;
        cam.mid += (gMid - cam.mid) * k; cam.span += (gSpan - cam.span) * k; if (Math.abs(gMid - cam.mid) > 0.2 || Math.abs(gSpan - cam.span) > 0.2) dirty = true; }
      const mid = cam.mid + model.position.z, span = cam.span;
      const vFov = camera.fov * Math.PI / 180, hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const elev = 0.42;                                              // radians above the horizon
      const needH = span * Math.cos(elev) + 104 * Math.sin(elev) + 24, needW = 104 + 30;
      const dist = Math.max(needH / (2 * Math.tan(vFov / 2)), needW / (2 * Math.tan(hFov / 2))) * 1.04;
      const az = -0.9 + progress * 1.5;
      camera.position.set(Math.cos(az) * Math.cos(elev) * dist, Math.sin(az) * Math.cos(elev) * dist, mid + Math.sin(elev) * dist);
      camera.lookAt(0, 0, mid);
      els.bar.style.height = (progress * 100).toFixed(1) + '%';
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

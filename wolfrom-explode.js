
let THREE;

/* ------------------------------------------------------------------ story ---- */
// Each step: scroll window [from, to] (0..1 of the section), caption, and the parts to highlight.
// Each step: where it starts in the story (0..1), its caption, the parts it highlights, and
// the parts it moves. Every part moves in exactly one step, so motion always matches the text.
// Upper parts lift off top-down; the back of the stack drops away bottom-up (controller, then
// motor), which is the only order in which nothing has to pass through a part still in place.
const STEPS = [
  { from: 0.00, title: '50.45:1 in a 104 mm package',
    body: 'I am designing and building a backdrivable humanoid-elbow actuator with the motor, gearbox, and controller in one package. The printed prototype checks assembly before a load-rated metal build.',
    spec: '30 Nm continuous and 50 Nm peak design targets', focus: [], move: [] },
  { from: 0.083, title: 'Bearing retainers',
    body: 'Two rings clamp the output bearing, outer to the housing and inner to the output ring gear, with recessed screws so the top face sits flush.',
    spec: '12 x M2 inner, 6 x M3 outer', focus: ['retOuter', 'retInner', 'screws'], move: ['screws', 'retOuter', 'retInner'] },
  { from: 0.167, title: 'Output bearing',
    body: 'A single thin-section four-point bearing carries every external load on the joint: radial, axial and overturning moment.',
    spec: 'Kaydon KA030XP0, 76.2 mm bore', focus: ['bearing'], move: ['bearing'] },
  { from: 0.25, title: 'Output ring gear',
    body: 'The output ring meshes with the upper planet stage, and its tooth count and module differ from the fixed ring but keep the same centre distance.',
    spec: '75 teeth, module 0.9', focus: ['ringOut'], move: ['ringOut'] },
  { from: 0.333, title: 'Carrier',
    body: 'The carrier floats and carries no net torque, but its two plates still react 40 percent of output torque against each other through three posts.',
    spec: '20 Nm plate-to-plate at 50 Nm output', focus: ['carrierOut', 'carrierIn'], move: ['carrierOut'] },
  { from: 0.417, title: 'Compound planets',
    body: 'Each planet is three gears on one body, and the two ring meshes push on it in opposite directions 8 mm apart, which tilts it. The small bearings resisting that tilt are the limiting part.',
    spec: '57 / 27 / 25 teeth, 4.2 Nm tilt at peak', focus: ['planets', 'planetBrg', 'carrierIn'], move: ['planetBrgTop', 'planets', 'planetBrgBot', 'carrierIn'] },
  { from: 0.5, title: 'Sun gear',
    body: 'The sun gear bolts to the motor rotor through a flange, so the torque path has no press fit.',
    spec: '33 teeth, module 0.5', focus: ['sun'], move: ['sun'] },
  { from: 0.583, title: 'Fixed ring gear housing',
    body: 'Ring-gear reaction torque runs through a solid wall to the mount plate. Since the two ring meshes circulate 8 to 9 times the output power, any mesh loss is amplified.',
    spec: '72 teeth, module 1.0', focus: ['fixed', 'plate'], move: ['fixed'] },
  { from: 0.667, title: 'Controller',
    body: 'The drive sits behind the motor and reads rotor angle from a magnet on the shaft, 1.5 mm from the encoder chip.',
    spec: 'ODrive S1', focus: ['board', 'ctrlHousing', 'magnet'], move: ['ctrlHousing', 'board', 'magnet'] },
  { from: 0.75, title: 'Motor',
    body: 'An outrunner drone motor, with the magnet bell lifted off to show the stator and its 24 windings. At 50 Nm output it needs about 42 A of a 59 A peak rating.',
    spec: 'MAD M6C10, 300 KV', focus: ['motorBell', 'motorStator', 'motorHousing'], move: ['motorHousing', 'motorStator', 'motorBell'] },
  { from: 0.833, title: 'Exploded assembly',
    body: 'The retainers, output support, gear train, motor, and controller come apart along the assembly axis.',
    spec: '3 planets, 3 gear stages, 1 output bearing', focus: [], move: [] },
  { from: 0.917, title: 'Integrated actuator',
    body: 'The gearbox, motor, and controller reassemble into one package. The sections below cover the load cases, calculations, and physical prototypes behind it.',
    spec: '50.45:1 ratio, 30 Nm continuous / 50 Nm peak design targets', focus: [], move: [] },
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
// Scroll chooses the step; the step's parts then glide out over MOVE_MS, so a component is
// always separated and in view while its caption is up, however fast or slowly the reader scrolls.
// Parts move at one shared rate: a part from an earlier step always started earlier and so is
// always further out, which keeps every gap opening in both scroll directions.
const MOVE_MS = 360;
const STEP_OF = {};
STEPS.forEach((step, i) => { for (const name of step.move) STEP_OF[name] = i; });
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
  // target follows the scroll position; progress eases toward it so wheel steps glide.
  let progress = 0, target = 0, lastFrame = 0, shown = -1, dirty = true, swapTimer = 0;
  const dim = new THREE.Color(0xc9ccd1);
  const cam = { mid: -16, span: 81, zoom: 1, init: false, key: '', from: null, to: null, t: 1 };
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
    progress = target = mode === 'animation' ? 0 : 1;
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

  // Where the camera should end up for step si: framed on the step's parts at their end-of-step
  // positions (moved parts exploded, the rest where they are), wide enough to keep neighbours in
  // view on desktop. Steps with nothing highlighted frame the whole actuator.
  function frameFor(si) {
    const last = STEPS.length - 1;
    const outAt = name => STEP_OF[name] !== undefined && si >= STEP_OF[name] && si < last ? 1 : 0;
    const step = STEPS[si];
    let names = [...new Set([...step.move, ...step.focus.flatMap(f => FOCUS_ALIAS[f] || [f])])].filter(n => EXPLODE[n]);
    const overview = names.length === 0;
    if (overview) names = Object.keys(EXPLODE);
    let lo = Infinity, hi = -Infinity;
    for (const n of names) { const e = EXPLODE[n], z = e.zc + e.dz * outAt(n); lo = Math.min(lo, z - e.hz); hi = Math.max(hi, z + e.hz); }
    const minSpan = overview ? 0 : phoneLayout.matches ? 90 : 220;
    const span = Math.max(minSpan, hi - lo + 24);
    const clear = si === 0 ? titleClearance(span) : { shift: 0, zoom: 1 };
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
      const framed = STEPS[si].move.length ? new Set(STEPS[si].move) : focus;
      const fade = reduce ? 1 : 1 - Math.exp(-dt / 90);
      // explode
      const lastStep = STEPS.length - 1;
      for (const [name, st] of Object.entries(state)) {
        const e = EXPLODE[name];
        const want = STEP_OF[name] !== undefined && si >= STEP_OF[name] && si < lastStep ? 1 : 0;
        if (st.out === undefined || reduce) st.out = want;
        else if (st.out !== want) {
          st.out = want > st.out ? Math.min(want, st.out + dt / MOVE_MS) : Math.max(want, st.out - dt / MOVE_MS);
          dirty = true;
        }
        const t = ease(st.out);
        st.group.position.z = e.dz * t;
        // Highlights fade over about 200 ms; an instant colour flip reads as a glitch.
        const dimTarget = focus.size === 0 || focus.has(name) ? 0 : 0.6;
        st.dim = st.dim === undefined ? dimTarget : st.dim + (dimTarget - st.dim) * fade;
        if (Math.abs(dimTarget - st.dim) > 0.004) dirty = true; else st.dim = dimTarget;
        for (const m of st.mats) m.color.copy(m.userData.base).lerp(dim, st.dim);
        st.z = e.zc + e.dz * t;
      }
      // Presenter camera: each step glides to the place its parts end up, over the same time and
      // easing as their motion, so the component arrives at the centre beside its caption and the
      // previous one shifts out of the way. Overview steps frame the whole actuator.
      const goal = frameFor(si);
      const key = si + (phoneLayout.matches ? 'p' : 'd');
      if (!cam.init || reduce) { cam.mid = goal.mid; cam.span = goal.span; cam.zoom = goal.zoom; cam.init = true; cam.key = key; cam.t = 1; }
      else if (cam.key !== key) { cam.from = { mid: cam.mid, span: cam.span, zoom: cam.zoom }; cam.to = goal; cam.t = 0; cam.key = key; }
      if (cam.t < 1) {
        cam.t = Math.min(1, cam.t + dt / MOVE_MS); const k = ease(cam.t);
        cam.mid = cam.from.mid + (cam.to.mid - cam.from.mid) * k; cam.span = cam.from.span + (cam.to.span - cam.from.span) * k;
        cam.zoom = cam.from.zoom + (cam.to.zoom - cam.from.zoom) * k;
        dirty = true;
      }
      const mid = cam.mid, span = cam.span;
      const vFov = camera.fov * Math.PI / 180, hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const elev = 0.42;                                              // radians above the horizon
      const needH = span * Math.cos(elev) + 104 * Math.sin(elev) + 24, needW = 104 + 30;
      const dist = Math.max(needH / (2 * Math.tan(vFov / 2)), needW / (2 * Math.tan(hFov / 2))) * 1.04 * cam.zoom;
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

import * as THREE from 'three';

export type MatType = 'fabric' | 'leather' | 'wood' | 'metal';

/* ===== HELPER: Standard material ===== */
export function makeMat(color: string, type: MatType): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  if (type === 'leather') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.02 });
  if (type === 'wood') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0 });
  if (type === 'metal') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.85 });
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 });
}

// Lazy-initialized to avoid creating Three.js objects at module scope (crashes SSR compilation)
let _legMat: THREE.MeshStandardMaterial | null = null;
function getLegMat(): THREE.MeshStandardMaterial {
  if (!_legMat) {
    _legMat = new THREE.MeshStandardMaterial({ color: 0x3b2f28, roughness: 0.5, metalness: 0.1 });
    (_legMat as any)._isLeg = true;
  }
  // Always return a clone so _isLeg is set and the material can be independently disposed
  const clone = _legMat.clone();
  (clone as any)._isLeg = true;
  return clone;
}

// Helper to mark structural materials (frames, poles, etc.)
function structMat(color: number | string, roughness = 0.5, metalness = 0.1): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  (m as any)._isStruct = true;
  return m;
}

const legGeo = (h = 0.15, r = 0.025) => new THREE.CylinderGeometry(Math.max(0.01, r), Math.max(0.01, r), Math.max(0.01, h), 8);

/* ===== SEATING ===== */
export function createSofa(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 0.85), m);
  seat.position.y = 0.34; seat.castShadow = true; seat.receiveShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.14), m.clone());
  back.position.set(0, 0.67, -0.36); back.castShadow = true; g.add(back);
  [-1.0, 1.0].forEach(x => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.85), m.clone());
    arm.position.set(x, 0.52, 0); arm.castShadow = true; g.add(arm);
  });
  [[-0.9, 0.12, 0.32], [0.9, 0.12, 0.32], [-0.9, 0.12, -0.32], [0.9, 0.12, -0.32]].forEach(p => {
    const l = new THREE.Mesh(legGeo(), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  const cm = makeMat(col, mtype); cm.color.offsetHSL(0, 0, 0.04);
  [-0.52, 0, 0.52].forEach(x => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.65), cm);
    c.position.set(x, 0.49, 0.03); c.castShadow = true; g.add(c);
  });
  [-0.52, 0, 0.52].forEach(x => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.1), cm.clone());
    c.position.set(x, 0.62, -0.25); c.castShadow = true; g.add(c);
  });
  g.userData = { isFurniture: true, name: 'Modern Sofa', desc: '3-seat sofa, 210×90cm', matType: mtype, matColor: col };
  return g;
}

export function createArmchair(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.7), m);
  seat.position.y = 0.32; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.12), m.clone());
  back.position.set(0, 0.62, -0.29); back.castShadow = true; g.add(back);
  [-0.34, 0.34].forEach(x => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.7), m.clone());
    arm.position.set(x, 0.47, 0); arm.castShadow = true; g.add(arm);
  });
  [[-0.28, 0.1, 0.28], [0.28, 0.1, 0.28], [-0.28, 0.1, -0.28], [0.28, 0.1, -0.28]].forEach(p => {
    const l = new THREE.Mesh(legGeo(), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Armchair', desc: 'Accent chair, 75×80cm', matType: mtype, matColor: col };
  return g;
}

export function createOttoman(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), m);
  top.position.y = 0.3; top.castShadow = true; g.add(top);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.15, 24), m.clone());
  base.position.y = 0.12; base.castShadow = true; g.add(base);
  [[-0.18, 0.025, 0.18], [0.18, 0.025, 0.18], [-0.18, 0.025, -0.18], [0.18, 0.025, -0.18]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.05, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Ottoman', desc: 'Round ottoman, ⌀60cm', matType: mtype, matColor: col };
  return g;
}

/* ===== TABLES ===== */
export function createCoffeeTable(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), m);
  top.position.y = 0.38; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.5), m.clone());
  shelf.position.y = 0.1; shelf.receiveShadow = true; g.add(shelf);
  [[-0.52, 0.19, 0.24], [0.52, 0.19, 0.24], [-0.52, 0.19, -0.24], [0.52, 0.19, -0.24]].forEach(p => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.03), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Coffee Table', desc: 'Low table, 120×60cm', matType: mtype, matColor: col };
  return g;
}

export function createSideTable(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20), m);
  top.position.y = 0.5; top.castShadow = true; g.add(top);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.47, 10), getLegMat());
  stem.position.y = 0.26; stem.castShadow = true; g.add(stem);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.02, 16), getLegMat());
  base.position.y = 0.01; g.add(base);
  g.userData = { isFurniture: true, name: 'Side Table', desc: 'Round side table, ⌀45cm', matType: mtype, matColor: col };
  return g;
}

export function createConsole(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.035, 0.35), m);
  top.position.y = 0.72; top.castShadow = true; g.add(top);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.025, 0.3), m.clone());
  shelf.position.y = 0.25; g.add(shelf);
  [[-0.58, 0.36, 0.13], [0.58, 0.36, 0.13], [-0.58, 0.36, -0.13], [0.58, 0.36, -0.13]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.72, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Console', desc: 'Console table, 130×35cm', matType: mtype, matColor: col };
  return g;
}

/* ===== LIGHTING ===== */
export function createFloorLamp(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const metalMat = makeMat(col || '#333', 'metal');
  (metalMat as any)._isStruct = true;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 16), metalMat);
  base.position.y = 0.015; base.castShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), metalMat.clone());
  (pole.material as any)._isStruct = true;
  pole.position.y = 0.78; pole.castShadow = true; g.add(pole);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xf5e8d0, roughness: 0.9, side: THREE.DoubleSide });
  (shadeMat as any)._isStruct = true;
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.22, 16, 1, true), shadeMat);
  shade.position.y = 1.55; shade.castShadow = true; g.add(shade);
  const bulb = new THREE.PointLight(0xffe8c0, 0.6, 5);
  bulb.position.y = 1.5; g.add(bulb);
  g.userData = { isFurniture: true, name: 'Floor Lamp', desc: 'Arc floor lamp, h160cm', matType: 'metal' as MatType, matColor: col || '#333' };
  return g;
}

export function createPendant(col: string, _mtype: MatType, roomH = 3): THREE.Group {
  const g = new THREE.Group();
  const wireMat = structMat(0x333333);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.8, 6), wireMat);
  wire.position.y = roomH - 0.4; g.add(wire);
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: col || '#C17F4E', roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }));
  shade.position.y = roomH - 0.85; shade.castShadow = true; g.add(shade);
  const light = new THREE.PointLight(0xffe0a0, 0.8, 6);
  light.position.y = roomH - 0.9; g.add(light);
  g.userData = { isFurniture: true, name: 'Pendant Light', desc: 'Hanging pendant', matType: 'metal' as MatType, matColor: col || '#C17F4E' };
  return g;
}

export function createTableLamp(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const ceramicMat = makeMat(col || '#E8DCC8', 'fabric');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12), ceramicMat);
  base.position.y = 0.02; g.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.28, 12), ceramicMat.clone());
  body.position.y = 0.18; body.castShadow = true; g.add(body);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xfff5e6, roughness: 0.9, side: THREE.DoubleSide });
  (shadeMat as any)._isStruct = true;
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.16, 16, 1, true), shadeMat);
  shade.position.y = 0.4; g.add(shade);
  const light = new THREE.PointLight(0xffe8c0, 0.3, 3);
  light.position.y = 0.38; g.add(light);
  g.userData = { isFurniture: true, name: 'Table Lamp', desc: 'Ceramic lamp, h40cm', matType: 'fabric' as MatType, matColor: col || '#E8DCC8' };
  return g;
}

/* ===== DECOR ===== */
export function createBookshelf(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#B8956A', 'wood');
  [[-0.38, 0.9, 0], [0.38, 0.9, 0]].forEach(p => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.8, 0.35), m);
    s.position.set(...p as [number, number, number]); s.castShadow = true; g.add(s);
  });
  const backP = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.8, 0.02), m.clone());
  backP.position.set(0, 0.9, -0.165); g.add(backP);
  [0.01, 0.45, 0.9, 1.35, 1.79].forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.73, 0.025, 0.33), m.clone());
    shelf.position.set(0, y, 0.005); shelf.receiveShadow = true; g.add(shelf);
  });
  const bookColors = [0xC17F4E, 0x3D4F5F, 0x7A8B6F, 0x8A8478, 0xC49898];
  [0.23, 0.68, 1.13].forEach((sy, si) => {
    let bx = -0.3;
    for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
      const bw = 0.03 + Math.random() * 0.04;
      const bh = 0.25 + Math.random() * 0.15;
      const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.22), new THREE.MeshStandardMaterial({ color: bookColors[(si + i) % bookColors.length], roughness: 0.8 }));
      (book.material as any)._isStruct = true;
      book.position.set(bx + bw / 2, sy + bh / 2, 0.01); g.add(book);
      bx += bw + 0.005;
      if (bx > 0.28) break;
    }
  });
  g.userData = { isFurniture: true, name: 'Bookshelf', desc: 'Tall shelf, 80×180cm', matType: 'wood' as MatType, matColor: col || '#B8956A' };
  return g;
}

export function createPlant(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: col || '#C4A882', roughness: 0.7 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 14), potMat);
  pot.position.y = 0.11; pot.castShadow = true; g.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 14), new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 }));
  (soil.material as any)._isStruct = true;
  soil.position.y = 0.22; g.add(soil);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3f, roughness: 0.8 });
  (leafMat as any)._isStruct = true;
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x5c8c4f, roughness: 0.8 });
  (leafMat2 as any)._isStruct = true;
  for (let i = 0; i < 5; i++) {
    const r = 0.1 + Math.random() * 0.12;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.05, r), 10, 8), i % 2 === 0 ? leafMat : leafMat2);
    leaf.position.set((Math.random() - 0.5) * 0.2, 0.35 + Math.random() * 0.3, (Math.random() - 0.5) * 0.2);
    leaf.castShadow = true; g.add(leaf);
  }
  g.userData = { isFurniture: true, name: 'Plant', desc: 'Potted plant, h90cm', matType: 'fabric' as MatType, matColor: col || '#C4A882' };
  return g;
}

export function createRug(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#8A8478', 'fabric');
  m.opacity = 0.92; m.transparent = true;
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.015, 1.4), m);
  rug.position.y = 0.008; rug.receiveShadow = true; g.add(rug);
  const borderMat = makeMat(col || '#8A8478', 'fabric'); borderMat.color.offsetHSL(0, -0.1, -0.1);
  [[0, 0.01, 0.68, 2.02, 0.04], [0, 0.01, -0.68, 2.02, 0.04], [1.0, 0.01, 0, 0.02, 1.42], [-1.0, 0.01, 0, 0.02, 1.42]].forEach(([x, y, z, w, dd]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, dd), borderMat);
    b.position.set(x, y, z); g.add(b);
  });
  g.userData = { isFurniture: true, name: 'Rug', desc: 'Area rug, 200×140cm', matType: 'fabric' as MatType, matColor: col || '#8A8478' };
  return g;
}

export function createTVStand(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#3B3B3B', 'wood');
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.4), m);
  body.position.y = 0.22; body.castShadow = true; g.add(body);
  const topM = makeMat(col || '#3B3B3B', 'wood'); topM.color.offsetHSL(0, 0, 0.05);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.02, 0.42), topM);
  top.position.y = 0.43; top.castShadow = true; g.add(top);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.5 });
  [-0.36, 0.36].forEach(x => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.01), doorMat);
    door.position.set(x, 0.22, 0.2); g.add(door);
  });
  [[-0.7, 0.02, 0.16], [0.7, 0.02, 0.16], [-0.7, 0.02, -0.16], [0.7, 0.02, -0.16]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.04, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); g.add(l);
  });
  const tvMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 }); (tvMat as any)._isStruct = true;
  const tv = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.04), tvMat);
  tv.position.set(0, 0.82, 0); tv.castShadow = true; g.add(tv);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1, metalness: 0.2 }); (screenMat as any)._isStruct = true;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.62), screenMat);
  screen.position.set(0, 0.82, 0.022); g.add(screen);
  g.userData = { isFurniture: true, name: 'TV Stand', desc: 'Media console, 150×50cm', matType: 'wood' as MatType, matColor: col || '#3B3B3B' };
  return g;
}

/* ===== BEDROOM ===== */
export function createBed(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.8), makeMat('#5C4033', 'wood'));
  frame.position.y = 0.125; frame.castShadow = true; g.add(frame);
  // Mattress
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 1.7), m);
  mattress.position.y = 0.34; mattress.castShadow = true; g.add(mattress);
  // Headboard
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.08), makeMat('#5C4033', 'wood'));
  headboard.position.set(0, 0.65, -0.86); headboard.castShadow = true; g.add(headboard);
  // Pillows
  const pillowMat = makeMat(col, mtype); pillowMat.color.offsetHSL(0, -0.1, 0.1);
  [-0.45, 0.45].forEach(x => {
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.35), pillowMat);
    pillow.position.set(x, 0.48, -0.6); pillow.castShadow = true; g.add(pillow);
  });
  // Blanket fold
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 1.0), m.clone());
  blanket.position.set(0, 0.44, 0.25); blanket.castShadow = true; g.add(blanket);
  g.userData = { isFurniture: true, name: 'King Bed', desc: 'King bed, 200×180cm', matType: mtype, matColor: col };
  return g;
}

export function createNightstand(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), m);
  body.position.y = 0.225; body.castShadow = true; g.add(body);
  // Drawer line
  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.01), new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.5, metalness: 0.3 }));
  drawer.position.set(0, 0.3, 0.2); g.add(drawer);
  // Knob
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc4a882, metalness: 0.5 }));
  knob.position.set(0, 0.3, 0.21); g.add(knob);
  [[-0.2, 0.025, 0.16], [0.2, 0.025, 0.16], [-0.2, 0.025, -0.16], [0.2, 0.025, -0.16]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.05, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Nightstand', desc: 'Bedside table, 50×40cm', matType: mtype, matColor: col };
  return g;
}

export function createWardrobe(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#B8956A', 'wood');
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.6), m);
  body.position.y = 1.0; body.castShadow = true; g.add(body);
  // Top
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.03, 0.62), m.clone());
  top.position.y = 2.015; g.add(top);
  // Door split line
  const split = new THREE.Mesh(new THREE.BoxGeometry(0.01, 1.9, 0.01), new THREE.MeshStandardMaterial({ color: 0x8a7a6a }));
  split.position.set(0, 1.0, 0.3); g.add(split);
  // Handles
  [-0.15, 0.15].forEach(x => {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xc4a882, metalness: 0.5 }));
    handle.position.set(x, 1.0, 0.31); g.add(handle);
  });
  g.userData = { isFurniture: true, name: 'Wardrobe', desc: 'Tall closet, 120×60cm', matType: 'wood' as MatType, matColor: col || '#B8956A' };
  return g;
}

export function createDresser(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#B8956A', 'wood');
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.5), m);
  body.position.y = 0.4; body.castShadow = true; g.add(body);
  // Drawer lines
  [0.25, 0.5, 0.7].forEach(y => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.01, 0.01), new THREE.MeshStandardMaterial({ color: 0x8a7a6a }));
    line.position.set(0, y, 0.25); g.add(line);
  });
  // Knobs
  [0.15, 0.4, 0.65].forEach(y => {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc4a882, metalness: 0.5 }));
    knob.position.set(0, y, 0.26); g.add(knob);
  });
  [[-0.55, 0.025, 0.2], [0.55, 0.025, 0.2], [-0.55, 0.025, -0.2], [0.55, 0.025, -0.2]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.05, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Dresser', desc: 'Low cabinet, 120×50cm', matType: 'wood' as MatType, matColor: col || '#B8956A' };
  return g;
}

export function createVanityTable(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#B8956A', 'wood');
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.4), m);
  top.position.y = 0.72; top.castShadow = true; g.add(top);
  [[-0.38, 0.36, 0.15], [0.38, 0.36, 0.15], [-0.38, 0.36, -0.15], [0.38, 0.36, -0.15]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.72, 0.02), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  // Mirror (oval using ellipse)
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), new THREE.MeshStandardMaterial({ color: 0xc8d8e0, roughness: 0.1, metalness: 0.7 }));
  mirror.position.set(0, 1.1, -0.18); g.add(mirror);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.015, 8, 24), m.clone());
  frame.position.set(0, 1.1, -0.18); g.add(frame);
  g.userData = { isFurniture: true, name: 'Vanity Table', desc: 'Table with mirror, 90×40cm', matType: 'wood' as MatType, matColor: col || '#B8956A' };
  return g;
}

/* ===== KITCHEN ===== */
export function createKitchenIsland(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#E0C8A0', 'wood');
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 0.8), m);
  body.position.y = 0.425; body.castShadow = true; g.add(body);
  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.04, 0.82), new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.3, metalness: 0.1 }));
  counterTop.position.y = 0.87; counterTop.castShadow = true; g.add(counterTop);
  // Shelf
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.7), m.clone());
  shelf.position.y = 0.15; g.add(shelf);
  g.userData = { isFurniture: true, name: 'Kitchen Island', desc: 'Island counter, 150×80cm', matType: 'wood' as MatType, matColor: col || '#E0C8A0' };
  return g;
}

export function createBarStool(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16), m);
  seat.position.y = 0.72; seat.castShadow = true; g.add(seat);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.7, 8), makeMat('#333', 'metal'));
  post.position.y = 0.37; post.castShadow = true; g.add(post);
  // Footrest ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 16), makeMat('#333', 'metal'));
  ring.position.y = 0.25; ring.rotation.x = Math.PI / 2; g.add(ring);
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.02, 16), makeMat('#333', 'metal'));
  base.position.y = 0.01; g.add(base);
  g.userData = { isFurniture: true, name: 'Bar Stool', desc: 'Tall stool, h75cm', matType: mtype, matColor: col };
  return g;
}

export function createDiningTable(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.9), m);
  top.position.y = 0.74; top.castShadow = true; top.receiveShadow = true; g.add(top);
  [[-0.7, 0.36, 0.38], [0.7, 0.36, 0.38], [-0.7, 0.36, -0.38], [0.7, 0.36, -0.38]].forEach(p => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  // Invisible click helper for easier selection
  const tableClickMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthWrite: false });
  (tableClickMat as any)._isStruct = true;
  const tableClickBox = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.76, 0.7), tableClickMat);
  tableClickBox.position.set(0, 0.38, 0);
  tableClickBox.name = 'table_clickHelper';
  g.add(tableClickBox);
  g.userData = { isFurniture: true, name: 'Dining Table', desc: 'Dining table, 160×90cm', matType: mtype, matColor: col };
  return g;
}

export function createDiningChair(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  g.name = 'DiningChair';
  const m = makeMat(col, mtype);
  // Thicker seat for better raycasting/clicking
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), m);
  seat.name = 'chair_seat'; seat.position.y = 0.44; seat.castShadow = true; g.add(seat);
  // Thicker back for better clicking
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.05), m.clone());
  back.name = 'chair_back'; back.position.set(0, 0.66, -0.185); back.castShadow = true; g.add(back);
  [[-0.16, 0.21, 0.16], [0.16, 0.21, 0.16], [-0.16, 0.21, -0.16], [0.16, 0.21, -0.16]].forEach((p, i) => {
    const l = new THREE.Mesh(legGeo(0.42, 0.018), getLegMat()); l.name = `chair_leg_${i}`; l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  // Invisible click helper for easier selection
  const clickHelperMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthWrite: false });
  (clickHelperMat as any)._isStruct = true;
  const clickBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.5), clickHelperMat);
  clickBox.name = 'chair_clickHelper'; clickBox.position.set(0, 0.65, 0); g.add(clickBox);
  g.userData = { isFurniture: true, name: 'Dining Chair', desc: 'Wooden chair, 42×42cm', matType: mtype, matColor: col };
  return g;
}

export function createKitchenCounter(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#E0C8A0', 'wood');
  // Main section
  const main = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.88, 0.6), m);
  main.position.set(-0.3, 0.44, 0); main.castShadow = true; g.add(main);
  // L extension
  const ext = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.88, 1.2), m.clone());
  ext.position.set(-1.0, 0.44, 0.3); ext.castShadow = true; g.add(ext);
  // Countertop
  const ctm = new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.3, metalness: 0.1 });
  const ct1 = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.04, 0.62), ctm);
  ct1.position.set(-0.3, 0.9, 0); g.add(ct1);
  const ct2 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 1.22), ctm.clone());
  ct2.position.set(-1.0, 0.9, 0.3); g.add(ct2);
  g.userData = { isFurniture: true, name: 'Kitchen Counter', desc: 'L-shaped counter', matType: 'wood' as MatType, matColor: col || '#E0C8A0' };
  return g;
}

/* ===== OFFICE ===== */
export function createDesk(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.035, 0.7), m);
  top.position.y = 0.73; top.castShadow = true; g.add(top);
  // Drawer unit
  const drawers = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 0.55), m.clone());
  drawers.position.set(0.45, 0.35, 0); drawers.castShadow = true; g.add(drawers);
  // Legs on other side
  [[-0.6, 0.35, 0.28], [-0.6, 0.35, -0.28]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.7, 0.025), getLegMat()); l.position.set(...p as [number, number, number]); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Desk', desc: 'Office desk, 140×70cm', matType: mtype, matColor: col };
  return g;
}

export function createOfficeChair(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.48), m);
  seat.position.y = 0.45; seat.castShadow = true; g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.04), m.clone());
  back.position.set(0, 0.73, -0.22); back.castShadow = true; g.add(back);
  const chairMetal = structMat('#333333', 0.3, 0.7);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), chairMetal);
  post.position.y = 0.25; g.add(post);
  // Star base
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.02), chairMetal.clone()); (arm.material as any)._isStruct = true;
    arm.position.set(Math.cos(angle) * 0.12, 0.06, Math.sin(angle) * 0.12);
    arm.rotation.y = -angle; g.add(arm);
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), chairMetal.clone()); (wheel.material as any)._isStruct = true;
    wheel.position.set(Math.cos(angle) * 0.24, 0.04, Math.sin(angle) * 0.24); g.add(wheel);
  }
  g.userData = { isFurniture: true, name: 'Office Chair', desc: 'Swivel chair, h90cm', matType: mtype, matColor: col };
  return g;
}

export function createFilingCabinet(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#A0A0A8', 'metal');
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 0.4), m);
  body.position.y = 0.65; body.castShadow = true; g.add(body);
  // Drawer lines
  [0.35, 0.65, 0.95].forEach(y => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.01, 0.01), new THREE.MeshStandardMaterial({ color: 0x888 }));
    line.position.set(0, y, 0.2); g.add(line);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.015), new THREE.MeshStandardMaterial({ color: 0x666, metalness: 0.5 }));
    handle.position.set(0, y + 0.05, 0.21); g.add(handle);
  });
  g.userData = { isFurniture: true, name: 'Filing Cabinet', desc: 'Metal cabinet, 40×130cm', matType: 'metal' as MatType, matColor: col || '#A0A0A8' };
  return g;
}

export function createMonitorStand(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#333', 'metal');
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.35), m);
  stand.position.y = 0.04; stand.castShadow = true; g.add(stand);
  const monMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 }); (monMat as any)._isStruct = true;
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.38, 0.025), monMat);
  monitor.position.set(0, 0.3, 0); monitor.castShadow = true; g.add(monitor);
  const scrMat = new THREE.MeshStandardMaterial({ color: 0x111128, roughness: 0.1, metalness: 0.2 }); (scrMat as any)._isStruct = true;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.32), scrMat);
  screen.position.set(0, 0.3, 0.014); g.add(screen);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), m.clone()); (neck.material as any)._isStruct = true;
  neck.position.set(0, 0.13, 0); g.add(neck);
  g.userData = { isFurniture: true, name: 'Monitor Stand', desc: 'Monitor on stand, 60cm', matType: 'metal' as MatType, matColor: col || '#333' };
  return g;
}

/* ===== BATHROOM ===== */
export function createBathtub(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const outerMat = new THREE.MeshStandardMaterial({ color: col || '#F0EDE8', roughness: 0.3, metalness: 0.1 });
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.05 });
  const outer = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 0.75), outerMat);
  outer.position.y = 0.275; outer.castShadow = true; g.add(outer);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.4, 0.6), innerMat);
  inner.position.y = 0.35; g.add(inner);
  // Faucet
  const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), makeMat('#C0C0C0', 'metal'));
  faucet.position.set(0.7, 0.6, 0); g.add(faucet);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8), makeMat('#C0C0C0', 'metal'));
  spout.position.set(0.7, 0.65, 0.05); spout.rotation.x = Math.PI / 2; g.add(spout);
  g.userData = { isFurniture: true, name: 'Bathtub', desc: 'Standard tub, 170×75cm', matType: 'fabric' as MatType, matColor: col || '#F0EDE8' };
  return g;
}

export function createToilet(_col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xF5F5F0, roughness: 0.3, metalness: 0.05 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.35, 16), m);
  base.position.y = 0.175; base.castShadow = true; g.add(base);
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.04, 16), m.clone());
  seat.position.y = 0.37; g.add(seat);
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.18), m.clone());
  tank.position.set(0, 0.35, -0.15); tank.castShadow = true; g.add(tank);
  // Handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.06), makeMat('#C0C0C0', 'metal'));
  handle.position.set(0.15, 0.45, -0.15); g.add(handle);
  g.userData = { isFurniture: true, name: 'Toilet', desc: 'Standard toilet', matType: 'fabric' as MatType, matColor: '#F5F5F0' };
  return g;
}

export function createPedestalSink(_col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xF5F5F0, roughness: 0.3, metalness: 0.05 });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m);
  bowl.position.y = 0.78; bowl.castShadow = true; g.add(bowl);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.75, 10), m.clone());
  pedestal.position.y = 0.375; pedestal.castShadow = true; g.add(pedestal);
  // Faucet
  const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), makeMat('#C0C0C0', 'metal'));
  faucet.position.set(0, 0.92, -0.1); g.add(faucet);
  g.userData = { isFurniture: true, name: 'Pedestal Sink', desc: 'Classic sink, h90cm', matType: 'fabric' as MatType, matColor: '#F5F5F0' };
  return g;
}

export function createShower(_col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  // Frame
  const frameMat = makeMat('#C0C0C0', 'metal');
  const frameThickness = 0.02;
  // Base tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: 0xE8E4E0, roughness: 0.4 }));
  tray.position.y = 0.025; g.add(tray);
  // Vertical frame bars
  [[-0.44, 0, -0.44], [0.44, 0, -0.44], [-0.44, 0, 0.44], [0.44, 0, 0.44]].forEach(p => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, 2.0, frameThickness), frameMat);
    bar.position.set(p[0], 1.0, p[2]); g.add(bar);
  });
  // Top frame
  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, frameThickness, frameThickness), frameMat.clone());
  topFrame.position.set(0, 2.0, -0.44); g.add(topFrame);
  // Glass panels (transparent)
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xE0E8F0, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide });
  // Back glass
  const backGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.95), glassMat);
  backGlass.position.set(0, 1.0, -0.43); g.add(backGlass);
  // Side glass
  const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1.95), glassMat);
  sideGlass.position.set(0.43, 1.0, 0); sideGlass.rotation.y = Math.PI / 2; g.add(sideGlass);
  // Shower head
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), makeMat('#C0C0C0', 'metal'));
  head.position.set(0, 1.9, -0.3); g.add(head);
  g.userData = { isFurniture: true, name: 'Shower', desc: 'Glass shower stall, 90×90cm', matType: 'metal' as MatType, matColor: '#C0C0C0' };
  return g;
}

/* ===== FURNITURE FACTORY ===== */
export type BuilderFn = (col: string, mtype: MatType, roomH?: number) => THREE.Group;

export const builders: Record<string, BuilderFn> = {
  createSofa, createArmchair, createOttoman,
  createCoffeeTable, createSideTable, createConsole,
  createFloorLamp, createPendant, createTableLamp,
  createBookshelf, createPlant, createRug, createTVStand,
  createBed, createNightstand, createWardrobe, createDresser, createVanityTable,
  createKitchenIsland, createBarStool, createDiningTable, createDiningChair, createKitchenCounter,
  createDesk, createOfficeChair, createFilingCabinet, createMonitorStand,
  createBathtub, createToilet, createPedestalSink, createShower,
};

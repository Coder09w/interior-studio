'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ===== DATA ===== */
const categories = [
  { id: 'seating' as const, label: 'Seating', icon: 'fa-couch' },
  { id: 'tables' as const, label: 'Tables', icon: 'fa-table' },
  { id: 'lighting' as const, label: 'Lighting', icon: 'fa-lightbulb' },
  { id: 'decor' as const, label: 'Decor', icon: 'fa-leaf' },
];

type CategoryId = 'seating' | 'tables' | 'lighting' | 'decor';
type MatType = 'fabric' | 'leather' | 'wood' | 'metal';

interface FurnitureItemDef {
  name: string;
  desc: string;
  icon: string;
  fn: string;
}

const furnitureItems: Record<CategoryId, FurnitureItemDef[]> = {
  seating: [
    { name: 'Modern Sofa', desc: '3-seat sofa, 210×90cm', icon: 'fa-couch', fn: 'createSofa' },
    { name: 'Armchair', desc: 'Accent chair, 75×80cm', icon: 'fa-chair', fn: 'createArmchair' },
    { name: 'Ottoman', desc: 'Round ottoman, ⌀60cm', icon: 'fa-circle', fn: 'createOttoman' },
  ],
  tables: [
    { name: 'Coffee Table', desc: 'Low table, 120×60cm', icon: 'fa-table', fn: 'createCoffeeTable' },
    { name: 'Side Table', desc: 'Round side table, ⌀45cm', icon: 'fa-border-all', fn: 'createSideTable' },
    { name: 'Console', desc: 'Console table, 130×35cm', icon: 'fa-minus', fn: 'createConsole' },
  ],
  lighting: [
    { name: 'Floor Lamp', desc: 'Arc floor lamp, h160cm', icon: 'fa-lightbulb', fn: 'createFloorLamp' },
    { name: 'Pendant Light', desc: 'Hanging pendant', icon: 'fa-circle', fn: 'createPendant' },
    { name: 'Table Lamp', desc: 'Ceramic lamp, h40cm', icon: 'fa-lightbulb', fn: 'createTableLamp' },
  ],
  decor: [
    { name: 'Bookshelf', desc: 'Tall shelf, 80×180cm', icon: 'fa-book', fn: 'createBookshelf' },
    { name: 'Plant', desc: 'Potted plant, h90cm', icon: 'fa-leaf', fn: 'createPlant' },
    { name: 'Rug', desc: 'Area rug, 200×140cm', icon: 'fa-square', fn: 'createRug' },
    { name: 'TV Stand', desc: 'Media console, 150×50cm', icon: 'fa-tv', fn: 'createTVStand' },
  ],
};

const matColors: Record<MatType, string[]> = {
  fabric: ['#8A8478', '#7A8B6F', '#3D4F5F', '#C17F59', '#E8DCC8', '#C49898', '#4A4A4A', '#6B7D3F', '#B8706A', '#7B8EA0'],
  leather: ['#9A6B3C', '#2D2D2D', '#6B4226', '#6B2D3E', '#C4A882', '#F0EDE8'],
  wood: ['#B8956A', '#5C4033', '#D4A76A', '#8B4513', '#E0C8A0', '#3B3B3B'],
  metal: ['#C9A96E', '#C0C0C0', '#333333', '#B5A642', '#B87333', '#A0A0A8'],
};

const wallColorOptions = [
  { color: '#FAF8F4', label: 'Ivory' },
  { color: '#E8E2D8', label: 'Warm Gray' },
  { color: '#D4C8B8', label: 'Taupe' },
  { color: '#B8C4C0', label: 'Sage' },
  { color: '#C4B8A8', label: 'Sand' },
  { color: '#FFFFFF', label: 'White' },
];

/* ===== HELPER: Standard material ===== */
function makeMat(color: string, type: MatType): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  if (type === 'leather') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.02 });
  if (type === 'wood') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0 });
  if (type === 'metal') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.85 });
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 });
}

const legMat = new THREE.MeshStandardMaterial({ color: 0x3b2f28, roughness: 0.5, metalness: 0.1 });
const legGeo = (h = 0.15, r = 0.025) => new THREE.CylinderGeometry(Math.max(0.01, r), Math.max(0.01, r), Math.max(0.01, h), 8);

/* ===== FURNITURE BUILDERS ===== */
function createSofa(col: string, mtype: MatType): THREE.Group {
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
    const l = new THREE.Mesh(legGeo(), legMat); l.position.set(...(p as [number, number, number])); l.castShadow = true; g.add(l);
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

function createArmchair(col: string, mtype: MatType): THREE.Group {
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
    const l = new THREE.Mesh(legGeo(), legMat); l.position.set(...(p as [number, number, number])); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Armchair', desc: 'Accent chair, 75×80cm', matType: mtype, matColor: col };
  return g;
}

function createOttoman(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), m);
  top.position.y = 0.3; top.castShadow = true; g.add(top);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.15, 24), m.clone());
  base.position.y = 0.12; base.castShadow = true; g.add(base);
  [[-0.18, 0.025, 0.18], [0.18, 0.025, 0.18], [-0.18, 0.025, -0.18], [0.18, 0.025, -0.18]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.05, 0.02), legMat); l.position.set(...(p as [number, number, number])); g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Ottoman', desc: 'Round ottoman, ⌀60cm', matType: mtype, matColor: col };
  return g;
}

function createCoffeeTable(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), m);
  top.position.y = 0.38; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.5), m.clone());
  shelf.position.y = 0.1; shelf.receiveShadow = true; g.add(shelf);
  [[-0.52, 0.19, 0.24], [0.52, 0.19, 0.24], [-0.52, 0.19, -0.24], [0.52, 0.19, -0.24]].forEach(p => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.03), legMat); l.position.set(...(p as [number, number, number])); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Coffee Table', desc: 'Low table, 120×60cm', matType: mtype, matColor: col };
  return g;
}

function createSideTable(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20), m);
  top.position.y = 0.5; top.castShadow = true; g.add(top);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.47, 10), legMat);
  stem.position.y = 0.26; stem.castShadow = true; g.add(stem);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.02, 16), legMat);
  base.position.y = 0.01; g.add(base);
  g.userData = { isFurniture: true, name: 'Side Table', desc: 'Round side table, ⌀45cm', matType: mtype, matColor: col };
  return g;
}

function createConsole(col: string, mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col, mtype);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.035, 0.35), m);
  top.position.y = 0.72; top.castShadow = true; g.add(top);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.025, 0.3), m.clone());
  shelf.position.y = 0.25; g.add(shelf);
  [[-0.58, 0.36, 0.13], [0.58, 0.36, 0.13], [-0.58, 0.36, -0.13], [0.58, 0.36, -0.13]].forEach(p => {
    const l = new THREE.Mesh(legGeo(0.72, 0.02), legMat); l.position.set(...(p as [number, number, number])); l.castShadow = true; g.add(l);
  });
  g.userData = { isFurniture: true, name: 'Console', desc: 'Console table, 130×35cm', matType: mtype, matColor: col };
  return g;
}

function createFloorLamp(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const metalMat = makeMat(col || '#333', 'metal');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 16), metalMat);
  base.position.y = 0.015; base.castShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), metalMat.clone());
  pole.position.y = 0.78; pole.castShadow = true; g.add(pole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.22, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xf5e8d0, roughness: 0.9, side: THREE.DoubleSide }));
  shade.position.y = 1.55; shade.castShadow = true; g.add(shade);
  const bulb = new THREE.PointLight(0xffe8c0, 0.6, 5);
  bulb.position.y = 1.5; g.add(bulb);
  g.userData = { isFurniture: true, name: 'Floor Lamp', desc: 'Arc floor lamp, h160cm', matType: 'metal' as MatType, matColor: col || '#333' };
  return g;
}

function createPendant(col: string, _mtype: MatType, roomH: number): THREE.Group {
  const g = new THREE.Group();
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x333 }));
  wire.position.y = roomH - 0.4; g.add(wire);
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: col || '#C17F4E', roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }));
  shade.position.y = roomH - 0.85; shade.castShadow = true; g.add(shade);
  const light = new THREE.PointLight(0xffe0a0, 0.8, 6);
  light.position.y = roomH - 0.9; g.add(light);
  g.userData = { isFurniture: true, name: 'Pendant Light', desc: 'Hanging pendant', matType: 'metal' as MatType, matColor: col || '#C17F4E' };
  return g;
}

function createTableLamp(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const ceramicMat = makeMat(col || '#E8DCC8', 'fabric');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 12), ceramicMat);
  base.position.y = 0.02; g.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.28, 12), ceramicMat.clone());
  body.position.y = 0.18; body.castShadow = true; g.add(body);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 0.16, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xfff5e6, roughness: 0.9, side: THREE.DoubleSide }));
  shade.position.y = 0.4; g.add(shade);
  const light = new THREE.PointLight(0xffe8c0, 0.3, 3);
  light.position.y = 0.38; g.add(light);
  g.userData = { isFurniture: true, name: 'Table Lamp', desc: 'Ceramic lamp, h40cm', matType: 'fabric' as MatType, matColor: col || '#E8DCC8' };
  return g;
}

function createBookshelf(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#B8956A', 'wood');
  const sides = [[-0.38, 0.9, 0], [0.38, 0.9, 0]];
  sides.forEach(p => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.8, 0.35), m);
    s.position.set(...(p as [number, number, number])); s.castShadow = true; g.add(s);
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
      book.position.set(bx + bw / 2, sy + bh / 2, 0.01); g.add(book);
      bx += bw + 0.005;
      if (bx > 0.28) break;
    }
  });
  g.userData = { isFurniture: true, name: 'Bookshelf', desc: 'Tall shelf, 80×180cm', matType: 'wood' as MatType, matColor: col || '#B8956A' };
  return g;
}

function createPlant(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: col || '#C4A882', roughness: 0.7 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 14), potMat);
  pot.position.y = 0.11; pot.castShadow = true; g.add(pot);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 14), potMat.clone());
  rim.position.y = 0.22; rim.rotation.x = Math.PI / 2; g.add(rim);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 14), new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 }));
  soil.position.y = 0.22; g.add(soil);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3f, roughness: 0.8 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x5c8c4f, roughness: 0.8 });
  for (let i = 0; i < 5; i++) {
    const r = 0.1 + Math.random() * 0.12;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.05, r), 10, 8), i % 2 === 0 ? leafMat : leafMat2);
    leaf.position.set((Math.random() - 0.5) * 0.2, 0.35 + Math.random() * 0.3, (Math.random() - 0.5) * 0.2);
    leaf.castShadow = true; g.add(leaf);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x3d5c2e }));
  stem.position.y = 0.35; g.add(stem);
  g.userData = { isFurniture: true, name: 'Plant', desc: 'Potted plant, h90cm', matType: 'fabric' as MatType, matColor: col || '#C4A882' };
  return g;
}

function createRug(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#8A8478', 'fabric');
  m.opacity = 0.92; m.transparent = true;
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.015, 1.4), m);
  rug.position.y = 0.008; rug.receiveShadow = true; g.add(rug);
  const borderMat = makeMat(col || '#8A8478', 'fabric'); borderMat.color.offsetHSL(0, -0.1, -0.1);
  [[0, 0.01, 0.68, 2.02, 0.01, 0.04], [0, 0.01, -0.68, 2.02, 0.01, 0.04], [1.0, 0.01, 0, 0.02, 0.01, 1.42], [-1.0, 0.01, 0, 0.02, 0.01, 1.42]].forEach(([x, y, z, w, , dd]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, dd), borderMat);
    b.position.set(x, y, z); g.add(b);
  });
  g.userData = { isFurniture: true, name: 'Rug', desc: 'Area rug, 200×140cm', matType: 'fabric' as MatType, matColor: col || '#8A8478' };
  return g;
}

function createTVStand(col: string, _mtype: MatType): THREE.Group {
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
    const l = new THREE.Mesh(legGeo(0.04, 0.02), legMat); l.position.set(...(p as [number, number, number])); g.add(l);
  });
  const tv = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.04), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 }));
  tv.position.set(0, 0.82, 0); tv.castShadow = true; g.add(tv);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.62), new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1, metalness: 0.2 }));
  screen.position.set(0, 0.82, 0.022); g.add(screen);
  g.userData = { isFurniture: true, name: 'TV Stand', desc: 'Media console, 150×50cm', matType: 'wood' as MatType, matColor: col || '#3B3B3B' };
  return g;
}

/* Furniture factory */
type BuilderFn = (col: string, mtype: MatType, roomH?: number) => THREE.Group;

const builders: Record<string, BuilderFn> = {
  createSofa,
  createArmchair,
  createOttoman,
  createCoffeeTable,
  createSideTable,
  createConsole,
  createFloorLamp,
  createPendant: (col: string, mtype: MatType, roomH?: number) => createPendant(col, mtype, roomH || 3),
  createTableLamp,
  createBookshelf,
  createPlant,
  createRug,
  createTVStand,
};

/* ===== MAIN COMPONENT ===== */
export default function InteriorStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const placedItemsRef = useRef<THREE.Group[]>([]);
  const selectedObjRef = useRef<THREE.Group | null>(null);
  const isDragRef = useRef(false);
  const dragItemRef = useRef<THREE.Group | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef(new THREE.Vector3());
  const intersectionRef = useRef(new THREE.Vector3());
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const autoRotateRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCat, setCurrentCat] = useState<CategoryId>('seating');
  const [currentMatType, setCurrentMatType] = useState<MatType>('fabric');
  const [currentColor, setCurrentColor] = useState('#8A8478');
  const [roomW, setRoomW] = useState(8);
  const [roomD, setRoomD] = useState(6);
  const [roomH, setRoomH] = useState(3);
  const [wallCol, setWallCol] = useState('#FAF8F4');
  const [selectedName, setSelectedName] = useState('');
  const [selectedDesc, setSelectedDesc] = useState('');
  const [selectedMat, setSelectedMat] = useState('');
  const [itemPanelVisible, setItemPanelVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [autoRotActive, setAutoRotActive] = useState(false);

  // Refs for mutable state that doesn't need re-renders
  const roomWRef = useRef(8);
  const roomDRef = useRef(6);
  const roomHRef = useRef(3);
  const wallColRef = useRef('#FAF8F4');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  /* ===== BUILD ROOM ===== */
  const buildRoom = useCallback(() => {
    const roomGroup = roomGroupRef.current;
    const scene = sceneRef.current;
    if (!roomGroup || !scene) return;

    while (roomGroup.children.length) {
      const child = roomGroup.children[0];
      roomGroup.remove(child);
    }

    const w = roomWRef.current;
    const d = roomDRef.current;
    const h = roomHRef.current;
    const wc = wallColRef.current;

    // Floor - procedural wood texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512; floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d')!;
    ctx.fillStyle = '#B8956A'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const y = Math.random() * 512;
      ctx.strokeStyle = `rgba(90,60,30,${Math.random() * 0.12})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 15) ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * 4);
      ctx.stroke();
    }
    for (let x = 0; x < 512; x += 64) {
      ctx.strokeStyle = `rgba(60,40,20,0.15)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(w / 2, d / 2);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.65, metalness: 0 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor';
    roomGroup.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, metalness: 0 });
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    bw.position.set(0, h / 2, -d / 2); bw.receiveShadow = true; roomGroup.add(bw);
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
    lw.position.set(-w / 2, h / 2, 0); lw.rotation.y = Math.PI / 2; lw.receiveShadow = true; roomGroup.add(lw);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
    rw.position.set(w / 2, h / 2, 0); rw.rotation.y = -Math.PI / 2; rw.receiveShadow = true; roomGroup.add(rw);
    const fw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    fw.position.set(0, h / 2, d / 2); fw.rotation.y = Math.PI; roomGroup.add(fw);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0xFFFFF8, roughness: 1 }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = h; roomGroup.add(ceil);

    // Baseboards
    const bbMat = new THREE.MeshStandardMaterial({ color: 0xF0E8D8, roughness: 0.7 });
    const bbH = 0.08;
    const bb1 = new THREE.Mesh(new THREE.BoxGeometry(w, bbH, 0.02), bbMat);
    bb1.position.set(0, bbH / 2, -d / 2 + 0.01); roomGroup.add(bb1);
    const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, bbH, d), bbMat);
    bb2.position.set(-w / 2 + 0.01, bbH / 2, 0); roomGroup.add(bb2);

    // Window on back wall
    const winW = Math.min(w * 0.4, 3);
    const winH = Math.min(h * 0.5, 1.8);
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06), new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 }));
    winFrame.position.set(w * 0.15, h * 0.55, -d / 2 + 0.02); roomGroup.add(winFrame);
    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshStandardMaterial({ color: 0xC8DDE8, emissive: 0x8AB8D0, emissiveIntensity: 0.4, roughness: 0.1, metalness: 0.1 }));
    winGlass.position.set(w * 0.15, h * 0.55, -d / 2 + 0.04); roomGroup.add(winGlass);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.08), crossMat);
    cv.position.copy(winGlass.position).z += 0.01; roomGroup.add(cv);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.08), crossMat);
    ch.position.copy(winGlass.position).z += 0.01; roomGroup.add(ch);

    // Ceiling light (recessed spots)
    for (let x = -1; x <= 1; x += 2) {
      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 }));
      spot.position.set(x * 1.5, h - 0.015, 0); roomGroup.add(spot);
      const spotLight = new THREE.PointLight(0xFFEED0, 0.4, 8);
      spotLight.position.set(x * 1.5, h - 0.1, 0); roomGroup.add(spotLight);
    }

    // Grid helper
    const gridHelper = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 2, 0xCCBBAA, 0xDDD4C8);
    gridHelper.position.y = 0.002;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    (gridHelper.material as THREE.Material).transparent = true;
    roomGroup.add(gridHelper);
  }, []);

  /* ===== SELECT / DESELECT ===== */
  const selectItem = useCallback((obj: THREE.Group) => {
    // Deselect previous
    if (selectedObjRef.current) {
      selectedObjRef.current.traverse(c => {
        if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) {
          (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive);
        }
      });
    }
    selectedObjRef.current = obj;
    // Highlight
    obj.traverse(c => {
      if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial).emissive) {
        const mat = c.material as THREE.MeshStandardMaterial;
        mat._origEmissive = mat.emissive.getHex();
        mat.emissive.setHex(0x443322);
      }
    });
    setSelectedName(obj.userData.name || '');
    setSelectedDesc(obj.userData.desc || '');
    setSelectedMat(`${obj.userData.matType} — ${obj.userData.matColor}`);
    setItemPanelVisible(true);
  }, []);

  const deselectAll = useCallback(() => {
    if (selectedObjRef.current) {
      selectedObjRef.current.traverse(c => {
        if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) {
          (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive);
        }
      });
    }
    selectedObjRef.current = null;
    setItemPanelVisible(false);
    setSelectedMat('—');
  }, []);

  /* ===== ADD FURNITURE ===== */
  const addFurniture = useCallback((fnName: string, col: string, mtype: MatType) => {
    const fn = builders[fnName];
    if (!fn) return null;
    const item = fn(col, mtype, roomHRef.current);
    const w = roomWRef.current;
    const d = roomDRef.current;
    item.position.set((Math.random() - 0.5) * (w * 0.4), 0, (Math.random() - 0.5) * (d * 0.3));
    sceneRef.current?.add(item);
    placedItemsRef.current.push(item);
    selectItem(item);
    showToast(`Added ${item.userData.name}`);
    return item;
  }, [selectItem, showToast]);

  /* ===== DELETE SELECTED ===== */
  const deleteSelected = useCallback(() => {
    const selected = selectedObjRef.current;
    if (!selected) return;
    const name = selected.userData.name;
    sceneRef.current?.remove(selected);
    placedItemsRef.current = placedItemsRef.current.filter(i => i !== selected);
    selected.traverse(c => {
      if (c instanceof THREE.Mesh) {
        c.geometry?.dispose();
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
        else c.material?.dispose();
      }
    });
    selectedObjRef.current = null;
    setItemPanelVisible(false);
    showToast(`Removed ${name}`);
  }, [showToast]);

  /* ===== DUPLICATE SELECTED ===== */
  const duplicateSelected = useCallback(() => {
    const selected = selectedObjRef.current;
    if (!selected) return;
    const d = selected.userData;
    let matchFn: string | null = null;
    for (const cat of Object.values(furnitureItems)) {
      const found = cat.find(it => it.name === d.name);
      if (found) { matchFn = found.fn; break; }
    }
    if (matchFn && builders[matchFn]) {
      const item = builders[matchFn](d.matColor, d.matType, roomHRef.current);
      item.position.copy(selected.position).add(new THREE.Vector3(0.5, 0, 0.5));
      item.rotation.y = selected.rotation.y;
      sceneRef.current?.add(item);
      placedItemsRef.current.push(item);
      selectItem(item);
      showToast(`Duplicated ${d.name}`);
    }
  }, [selectItem, showToast]);

  /* ===== APPLY MATERIAL ===== */
  const applyMaterial = useCallback((color: string, type: MatType) => {
    const selected = selectedObjRef.current;
    if (!selected) { showToast('Select an item first'); return; }
    const newMat = makeMat(color, type);
    let idx = 0;
    selected.traverse(c => {
      if (c instanceof THREE.Mesh && c.material && !(c.material as any)._isLeg && !(c.material as any)._isStruct) {
        const m = newMat.clone();
        if (idx > 0) m.color.offsetHSL(0, 0, (idx % 3) * 0.02);
        (m as any)._origEmissive = m.emissive ? m.emissive.getHex() : 0;
        m.emissive.setHex(0x443322);
        c.material.dispose();
        c.material = m;
        idx++;
      }
    });
    selected.userData.matColor = color;
    selected.userData.matType = type;
    setSelectedMat(`${type} — ${color}`);
  }, [showToast]);

  /* ===== FIND PARENT FURNITURE ===== */
  const findParentFurniture = useCallback((obj: THREE.Object3D): THREE.Group | null => {
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (current.userData && current.userData.isFurniture) return current as THREE.Group;
      current = current.parent;
    }
    return null;
  }, []);

  /* ===== CAMERA ANIMATION ===== */
  const animateCamera = useCallback((pos: [number, number, number], target: [number, number, number], dur = 800) => {
    const camera = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!camera || !ctrl) return;
    const startPos = camera.position.clone();
    const startTarget = ctrl.target.clone();
    const endPos = new THREE.Vector3(...pos);
    const endTarget = new THREE.Vector3(...target);
    const startTime = performance.now();
    function step() {
      const t = Math.min(1, (performance.now() - startTime) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(startPos, endPos, ease);
      ctrl.target.lerpVectors(startTarget, endTarget, ease);
      ctrl.update();
      if (t < 1) requestAnimationFrame(step);
    }
    step();
  }, []);

  /* ===== DEFAULT FURNITURE ===== */
  const addDefaultFurniture = useCallback(() => {
    const w = roomWRef.current;
    const d = roomDRef.current;
    const sofa = addFurniture('createSofa', '#7A8B6F', 'fabric');
    if (sofa) { sofa.position.set(0, 0, -d / 2 + 1.2); sofa.rotation.y = 0; }
    const table = addFurniture('createCoffeeTable', '#B8956A', 'wood');
    if (table) { table.position.set(0, 0, 0); }
    const lamp = addFurniture('createFloorLamp', '#333333', 'metal');
    if (lamp) { lamp.position.set(-w / 2 + 1, 0, -d / 2 + 0.8); }
    const rug = addFurniture('createRug', '#C49898', 'fabric');
    if (rug) { rug.position.set(0, 0, -0.2); }
    const plant = addFurniture('createPlant', '#C4A882', 'fabric');
    if (plant) { plant.position.set(w / 2 - 0.8, 0, -d / 2 + 0.6); }
    const shelf = addFurniture('createBookshelf', '#B8956A', 'wood');
    if (shelf) { shelf.position.set(w / 2 - 0.6, 0, 0); shelf.rotation.y = -Math.PI / 2; }
    deselectAll();
  }, [addFurniture, deselectAll]);

  /* ===== THREE.JS INIT ===== */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F0E8);
    scene.fog = new THREE.FogExp2(0xF5F0E8, 0.018);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7, 6, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 2;
    controls.maxDistance = 22;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xFFE8D0, 0.5);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0xFFF5E6, 0x8B7355, 0.4);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFF0D8, 1.8);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 30;
    dirLight.shadow.bias = -0.001;
    dirLight.shadow.radius = 4;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xE0E8F0, 0.3);
    fillLight.position.set(-4, 5, -3);
    scene.add(fillLight);

    // Room group
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomGroupRef.current = roomGroup;

    // Build room
    buildRoom();
    // Add default furniture
    setTimeout(() => addDefaultFurniture(), 100);

    // Resize
    const onResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener('resize', onResize);

    // Pointer events
    const getMeshes = (): THREE.Mesh[] => {
      const meshes: THREE.Mesh[] = [];
      placedItemsRef.current.forEach(g => g.traverse(c => { if (c instanceof THREE.Mesh) meshes.push(c); }));
      return meshes;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(getMeshes(), false);
      if (hits.length > 0) {
        const furniture = findParentFurniture(hits[0].object);
        if (furniture) {
          selectItem(furniture);
          dragItemRef.current = furniture;
          isDragRef.current = true;
          controls.enabled = false;
          raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current);
          dragOffsetRef.current.copy(intersectionRef.current).sub(furniture.position);
          dragOffsetRef.current.y = 0;
          canvas.style.cursor = 'move';
        }
      } else {
        deselectAll();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragRef.current || !dragItemRef.current) return;
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current)) {
        const newPos = intersectionRef.current.sub(dragOffsetRef.current);
        const hw = roomWRef.current / 2 - 0.3;
        const hd = roomDRef.current / 2 - 0.3;
        dragItemRef.current.position.x = Math.max(-hw, Math.min(hw, newPos.x));
        dragItemRef.current.position.z = Math.max(-hd, Math.min(hd, newPos.z));
      }
    };

    const onPointerUp = () => {
      isDragRef.current = false;
      dragItemRef.current = null;
      controls.enabled = true;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []); // buildRoom, addDefaultFurniture, selectItem, deselectAll, findParentFurniture intentionally omitted to run once

  // Handle canvas resize when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const parent = canvas?.parentElement;
      if (canvas && renderer && camera && parent) {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }, 420);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  /* ===== RESET ROOM ===== */
  const resetRoom = useCallback(() => {
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) {
          c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
          else c.material?.dispose();
        }
      });
    });
    placedItemsRef.current = [];
    selectedObjRef.current = null;
    setItemPanelVisible(false);

    roomWRef.current = 8; roomDRef.current = 6; roomHRef.current = 3; wallColRef.current = '#FAF8F4';
    setRoomW(8); setRoomD(6); setRoomH(3); setWallCol('#FAF8F4');
    buildRoom();
    addDefaultFurniture();
    showToast('Room reset');
  }, [buildRoom, addDefaultFurniture, showToast]);

  /* ===== SCREENSHOT ===== */
  const takeScreenshot = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = 'interior-design.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
    showToast('Screenshot saved');
  }, [showToast]);

  /* ===== ROTATE ===== */
  const rotateSelected = useCallback((direction: 'left' | 'right') => {
    if (selectedObjRef.current) {
      selectedObjRef.current.rotation.y += direction === 'left' ? Math.PI / 12 : -Math.PI / 12;
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--int-bg)', color: 'var(--int-fg)', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Font Awesome icons */}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      {/* Sidebar */}
      <aside
        className="int-scrollbar h-screen overflow-y-auto transition-all duration-400"
        style={{
          width: sidebarOpen ? 310 : 0,
          minWidth: sidebarOpen ? 310 : 0,
          background: 'var(--int-card)',
          borderRight: sidebarOpen ? '1px solid var(--int-border)' : 'none',
          overflow: sidebarOpen ? 'auto' : 'hidden',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--int-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--int-accent)' }}>
              <i className="fas fa-couch text-white text-xs" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Interior Studio</h1>
              <p className="text-[10px]" style={{ color: 'var(--int-muted)' }}>3D Design Previewer</p>
            </div>
          </div>
        </div>

        {/* Furniture Library */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--int-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2.5" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--int-muted)' }}>Furniture Library</p>
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCurrentCat(cat.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap border"
                style={{
                  background: currentCat === cat.id ? 'var(--int-accent)' : 'var(--int-ivory)',
                  color: currentCat === cat.id ? '#fff' : 'var(--int-muted)',
                  borderColor: currentCat === cat.id ? 'var(--int-accent)' : 'transparent',
                }}
              >
                <i className={`fas ${cat.icon} mr-1`} />{cat.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {furnitureItems[currentCat].map(item => (
              <button
                key={item.name}
                onClick={() => addFurniture(item.fn, currentColor, currentMatType)}
                className="p-2.5 rounded-[10px] border cursor-pointer transition-all text-left anim-fade-up hover:-translate-y-0.5"
                style={{
                  background: 'var(--int-ivory)',
                  borderColor: 'var(--int-border)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--int-accent)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(193,127,78,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--int-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'var(--int-warm)' }}>
                  <i className={`fas ${item.icon} text-xs`} style={{ color: 'var(--int-accent)' }} />
                </div>
                <p className="text-xs font-semibold leading-tight">{item.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--int-muted)' }}>{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Material Selection */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--int-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2.5" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--int-muted)' }}>Material & Color</p>
          <p className="text-[11px] mb-2" style={{ color: 'var(--int-muted)' }}>Select a placed item, then pick a material</p>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(['fabric', 'leather', 'wood', 'metal'] as MatType[]).map(t => (
              <button
                key={t}
                onClick={() => { setCurrentMatType(t); }}
                className="text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all"
                style={{
                  borderColor: currentMatType === t ? 'var(--int-accent)' : 'var(--int-border)',
                  background: currentMatType === t ? 'rgba(193,127,78,0.1)' : 'transparent',
                  color: currentMatType === t ? 'var(--int-accent)' : 'var(--int-muted)',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {matColors[currentMatType].map(c => (
              <button
                key={c}
                onClick={() => {
                  setCurrentColor(c);
                  if (selectedObjRef.current) applyMaterial(c, currentMatType);
                }}
                className="w-8 h-8 rounded-lg cursor-pointer transition-all border-2"
                style={{
                  background: c,
                  borderColor: currentColor === c ? 'var(--int-accent)' : 'transparent',
                  boxShadow: currentColor === c ? '0 0 0 2px rgba(193,127,78,0.3)' : 'none',
                }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px]" style={{ color: 'var(--int-muted)' }}>Applied:</span>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--int-accent)' }}>{selectedMat}</span>
          </div>
        </div>

        {/* Room Settings */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--int-border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2.5" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--int-muted)' }}>Room Settings</p>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-medium">Width</span>
              <span className="text-[10px]" style={{ color: 'var(--int-muted)' }}>{roomW.toFixed(1)}m</span>
            </div>
            <input
              type="range" className="int-range" min="4" max="14" value={roomW} step="0.5"
              onChange={e => {
                const v = parseFloat(e.target.value);
                setRoomW(v); roomWRef.current = v; buildRoom();
              }}
            />
          </div>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-medium">Depth</span>
              <span className="text-[10px]" style={{ color: 'var(--int-muted)' }}>{roomD.toFixed(1)}m</span>
            </div>
            <input
              type="range" className="int-range" min="4" max="12" value={roomD} step="0.5"
              onChange={e => {
                const v = parseFloat(e.target.value);
                setRoomD(v); roomDRef.current = v; buildRoom();
              }}
            />
          </div>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-medium">Ceiling Height</span>
              <span className="text-[10px]" style={{ color: 'var(--int-muted)' }}>{roomH.toFixed(1)}m</span>
            </div>
            <input
              type="range" className="int-range" min="2.5" max="5" value={roomH} step="0.25"
              onChange={e => {
                const v = parseFloat(e.target.value);
                setRoomH(v); roomHRef.current = v; buildRoom();
              }}
            />
          </div>
          <div>
            <span className="text-[11px] font-medium">Wall Color</span>
            <div className="flex gap-2 mt-2">
              {wallColorOptions.map((wc, i) => (
                <button
                  key={wc.color}
                  onClick={() => {
                    setWallCol(wc.color);
                    wallColRef.current = wc.color;
                    buildRoom();
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer transition-all border-2"
                  style={{
                    background: wc.color,
                    borderColor: wallCol === wc.color ? 'var(--int-accent)' : 'transparent',
                    boxShadow: i === 0 && wallCol === '#FAF8F4' ? '0 0 0 2px rgba(193,127,78,0.3)' : wallCol === wc.color ? '0 0 0 2px rgba(193,127,78,0.3)' : 'none',
                  }}
                  title={wc.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2.5" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--int-muted)' }}>Actions</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={resetRoom}
              className="w-full py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border-none hover:brightness-92"
              style={{ background: 'var(--int-accent)', color: '#fff' }}
            >
              <i className="fas fa-undo text-xs" />Reset Room
            </button>
            <button
              onClick={takeScreenshot}
              className="w-full py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-92"
              style={{ background: 'var(--int-ivory)', color: 'var(--int-fg)', border: '1px solid var(--int-border)' }}
            >
              <i className="fas fa-camera text-xs" />Screenshot
            </button>
            <button
              onClick={deleteSelected}
              className="w-full py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-92"
              style={{ background: '#fff', color: '#c0392b', border: '1px solid #e8d0d0' }}
            >
              <i className="fas fa-trash-alt text-xs" />Delete Selected
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewer */}
      <main className="flex-1 relative" style={{ background: 'var(--int-ivory)' }}>
        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            borderColor: 'var(--int-border)',
            color: 'var(--int-fg)',
          }}
        >
          <i className="fas fa-bars text-[13px]" />
        </button>

        {/* Info overlay */}
        <div className="absolute top-4 left-16 z-10 rounded-xl px-4 py-3 border" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderColor: 'var(--int-border)' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Living Room</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--int-muted)' }}>
            {roomW.toFixed(1)}m × {roomD.toFixed(1)}m — Click item to select · Drag to move
          </p>
        </div>

        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }} />

        {/* View controls */}
        <div className="absolute bottom-5 right-5 flex gap-2 z-10">
          <button
            onClick={() => animateCamera([0, 10, 0.01], [0, 0, 0])}
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 13 }}
            title="Top View"
          >
            <i className="fas fa-border-all" />
          </button>
          <button
            onClick={() => animateCamera([0, 2, roomDRef.current], [0, 1, 0])}
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 13 }}
            title="Front View"
          >
            <i className="fas fa-square" />
          </button>
          <button
            onClick={() => animateCamera([7, 6, 9], [0, 1, 0])}
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 13 }}
            title="Perspective"
          >
            <i className="fas fa-cube" />
          </button>
          <button
            onClick={() => {
              const newVal = !autoRotateRef.current;
              autoRotateRef.current = newVal;
              setAutoRotActive(newVal);
              if (controlsRef.current) {
                controlsRef.current.autoRotate = newVal;
                controlsRef.current.autoRotateSpeed = 1.5;
              }
            }}
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              borderColor: autoRotActive ? 'var(--int-accent)' : 'var(--int-border)',
              color: autoRotActive ? 'var(--int-accent)' : 'var(--int-fg)',
              fontSize: 13,
            }}
            title="Auto Rotate"
          >
            <i className="fas fa-sync-alt" />
          </button>
        </div>

        {/* Selected item panel */}
        {itemPanelVisible && (
          <div
            className="absolute bottom-5 left-5 z-10 rounded-xl p-4 border"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              borderColor: 'var(--int-border)',
              minWidth: 210,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedName}</h4>
              <button onClick={deselectAll} className="text-xs cursor-pointer" style={{ color: 'var(--int-muted)' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--int-muted)' }}>{selectedDesc}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => rotateSelected('left')}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 11 }}
                title="Rotate Left"
              >
                <i className="fas fa-undo" />
              </button>
              <button
                onClick={() => rotateSelected('right')}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 11 }}
                title="Rotate Right"
              >
                <i className="fas fa-redo" />
              </button>
              <button
                onClick={duplicateSelected}
                className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center cursor-pointer border transition-all"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: 'var(--int-border)', color: 'var(--int-fg)', fontSize: 11 }}
                title="Duplicate"
              >
                <i className="fas fa-clone" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      <div
        className="fixed z-[1000] pointer-events-none"
        style={{
          bottom: 24,
          left: '50%',
          transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
          opacity: toastVisible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="px-5 py-2.5 rounded-[10px] text-[13px] font-medium" style={{ background: 'var(--int-dark)', color: '#fff' }}>
          {toastMsg}
        </div>
      </div>
    </div>
  );
}

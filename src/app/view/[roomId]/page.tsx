'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Sofa,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

type MatType = 'fabric' | 'leather' | 'wood' | 'metal';

interface FurnitureItem {
  fn: string;
  col: string;
  mtype: MatType;
  x: number;
  y: number;
  z: number;
  ry: number;
}

interface RoomData {
  name: string;
  roomType: string;
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorType: string;
  windowCount: number;
  windowWall: string;
  lightMood: string;
  furniture: string;
}

// ─── Helper: Standard material ───────────────────────────────────────────────

function makeMat(color: string, type: MatType): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  if (type === 'leather') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.02 });
  if (type === 'wood') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0 });
  if (type === 'metal') return new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.85 });
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 });
}

const legMat = new THREE.MeshStandardMaterial({ color: 0x3b2f28, roughness: 0.5, metalness: 0.1 });
const legGeo = (h = 0.15, r = 0.025) => new THREE.CylinderGeometry(Math.max(0.01, r), Math.max(0.01, r), Math.max(0.01, h), 8);

// ─── Furniture Builders ──────────────────────────────────────────────────────

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
  return g;
}

function createRug(col: string, _mtype: MatType): THREE.Group {
  const g = new THREE.Group();
  const m = makeMat(col || '#5A4E42', 'fabric');
  m.opacity = 0.92; m.transparent = true;
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.015, 1.4), m);
  rug.position.y = 0.008; rug.receiveShadow = true; g.add(rug);
  const borderMat = makeMat(col || '#5A4E42', 'fabric'); borderMat.color.offsetHSL(0, -0.1, -0.1);
  [[0, 0.01, 0.68, 2.02, 0.01, 0.04], [0, 0.01, -0.68, 2.02, 0.01, 0.04], [1.0, 0.01, 0, 0.02, 0.01, 1.42], [-1.0, 0.01, 0, 0.02, 0.01, 1.42]].forEach(([x, y, z, w, , dd]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, dd), borderMat);
    b.position.set(x, y, z); g.add(b);
  });
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
  return g;
}

// ─── Furniture factory ───────────────────────────────────────────────────────

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

// ─── Build Room ──────────────────────────────────────────────────────────────

function buildRoom(
  scene: THREE.Scene,
  w: number,
  d: number,
  h: number,
  wallColor: string,
  floorType: string,
  windowCount: number,
  lightMood: string
): THREE.Group {
  const roomGroup = new THREE.Group();

  // Floor
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512; floorCanvas.height = 512;
  const ctx = floorCanvas.getContext('2d')!;

  if (floorType === 'hardwood') {
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
  } else if (floorType === 'marble') {
    ctx.fillStyle = '#E8E0D8'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(160,140,130,${Math.random() * 0.15})`;
      ctx.lineWidth = Math.random() * 3 + 0.5;
      ctx.beginPath();
      const sx = Math.random() * 512;
      const sy = Math.random() * 512;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 5; j++) ctx.lineTo(sx + (Math.random() - 0.5) * 200, sy + (Math.random() - 0.5) * 200);
      ctx.stroke();
    }
  } else if (floorType === 'concrete') {
    ctx.fillStyle = '#B0A898'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(${100 + Math.random() * 60},${90 + Math.random() * 50},${80 + Math.random() * 40},${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 8, Math.random() * 8);
    }
  } else if (floorType === 'carpet') {
    ctx.fillStyle = '#A89888'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${140 + Math.random() * 40},${120 + Math.random() * 40},${100 + Math.random() * 40},${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
  } else {
    // tile
    ctx.fillStyle = '#D8D0C8'; ctx.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        if ((Math.floor(x / 64) + Math.floor(y / 64)) % 2 === 0) {
          ctx.fillStyle = '#CCC4BC'; ctx.fillRect(x + 1, y + 1, 62, 62);
        }
      }
    }
  }

  const floorTex = new THREE.CanvasTexture(floorCanvas);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(w / 2, d / 2);
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.65, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor';
  roomGroup.add(floor);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9, metalness: 0 });
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  bw.position.set(0, h / 2, -d / 2); bw.receiveShadow = true; roomGroup.add(bw);
  const lw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
  lw.position.set(-w / 2, h / 2, 0); lw.rotation.y = Math.PI / 2; lw.receiveShadow = true; roomGroup.add(lw);
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone());
  rw.position.set(w / 2, h / 2, 0); rw.rotation.y = -Math.PI / 2; rw.receiveShadow = true; roomGroup.add(rw);
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
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

  // Windows
  for (let wi = 0; wi < Math.min(windowCount, 3); wi++) {
    const winW = Math.min(w * 0.3, 2.5);
    const winH = Math.min(h * 0.45, 1.6);
    const xOff = (wi - (Math.min(windowCount, 3) - 1) / 2) * (winW + 0.5);
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06), new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 }));
    winFrame.position.set(xOff, h * 0.55, -d / 2 + 0.02); roomGroup.add(winFrame);
    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshStandardMaterial({ color: 0xC8DDE8, emissive: 0x8AB8D0, emissiveIntensity: 0.4, roughness: 0.1, metalness: 0.1 }));
    winGlass.position.set(xOff, h * 0.55, -d / 2 + 0.04); roomGroup.add(winGlass);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.08), crossMat);
    cv.position.copy(winGlass.position).z += 0.01; roomGroup.add(cv);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.08), crossMat);
    ch.position.copy(winGlass.position).z += 0.01; roomGroup.add(ch);
  }

  // Ceiling lights
  const lightConfigs: Record<string, { color: number; intensity: number; ambientIntensity: number }> = {
    daylight: { color: 0xFFEED0, intensity: 0.4, ambientIntensity: 0.5 },
    golden: { color: 0xFFD8A0, intensity: 0.6, ambientIntensity: 0.35 },
    evening: { color: 0xFFAA70, intensity: 0.5, ambientIntensity: 0.25 },
    night: { color: 0x8899BB, intensity: 0.3, ambientIntensity: 0.15 },
  };
  const lightCfg = lightConfigs[lightMood] || lightConfigs.daylight;

  for (let x = -1; x <= 1; x += 2) {
    const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 }));
    spot.position.set(x * 1.5, h - 0.015, 0); roomGroup.add(spot);
    const spotLight = new THREE.PointLight(lightCfg.color, lightCfg.intensity, 8);
    spotLight.position.set(x * 1.5, h - 0.1, 0); roomGroup.add(spotLight);
  }

  scene.add(roomGroup);
  return roomGroup;
}

// ─── Viewer Component ────────────────────────────────────────────────────────

function RoomViewer({ roomData }: { roomData: RoomData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const { width, depth, height, wallColor, floorType, windowCount, lightMood, furniture } = roomData;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F0E8);
    scene.fog = new THREE.FogExp2(0xF5F0E8, 0.018);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(width * 0.8, height * 2, depth * 1.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 2;
    controls.maxDistance = 22;
    controls.target.set(0, height / 2, 0);

    // Lighting
    const lightConfigs: Record<string, { ambientColor: number; ambientIntensity: number; dirColor: number; dirIntensity: number }> = {
      daylight: { ambientColor: 0xFFE8D0, ambientIntensity: 0.5, dirColor: 0xFFF0D8, dirIntensity: 1.8 },
      golden: { ambientColor: 0xFFDDB0, ambientIntensity: 0.35, dirColor: 0xFFE0B0, dirIntensity: 1.5 },
      evening: { ambientColor: 0xFFCCAA, ambientIntensity: 0.25, dirColor: 0xFFCC90, dirIntensity: 1.2 },
      night: { ambientColor: 0x8899BB, ambientIntensity: 0.15, dirColor: 0x6677AA, dirIntensity: 0.8 },
    };
    const lCfg = lightConfigs[lightMood] || lightConfigs.daylight;

    const ambientLight = new THREE.AmbientLight(lCfg.ambientColor, lCfg.ambientIntensity);
    scene.add(ambientLight);
    const hemiLight = new THREE.HemisphereLight(0xFFF5E6, 0x8B7355, 0.4);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(lCfg.dirColor, lCfg.dirIntensity);
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

    // Build room
    buildRoom(scene, width, depth, height, wallColor, floorType, windowCount, lightMood);

    // Place furniture
    try {
      const items: FurnitureItem[] = JSON.parse(furniture || '[]');
      items.forEach((item) => {
        const fn = builders[item.fn];
        if (fn) {
          const obj = fn(item.col, item.mtype, height);
          obj.position.set(item.x, item.y, item.z);
          obj.rotation.y = item.ry || 0;
          scene.add(obj);
        }
      });
    } catch (e) {
      console.error('Error parsing furniture:', e);
    }

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
      renderer.dispose();
    };
  }, [width, depth, height, wallColor, floorType, windowCount, lightMood, furniture]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" style={{ cursor: 'grab' }} />
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ViewRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/public/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setRoomData(data);
      } else if (res.status === 404) {
        setError('Room not found');
      } else {
        setError('Failed to load room');
      }
    } catch {
      setError('Failed to load room');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Loading
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: '#C17F4E' }}
          />
          <p style={{ color: '#5A4E42' }} className="text-sm">
            Loading room…
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !roomData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertCircle
            className="w-12 h-12"
            style={{ color: '#5A4E42' }}
          />
          <h2
            className="text-xl font-semibold"
            style={{ color: '#2D2D2D' }}
          >
            {error || 'Room not found'}
          </h2>
          <p style={{ color: '#5A4E42' }} className="text-sm">
            This room may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F5F0E8' }}>
      {/* 3D Canvas - Full Screen */}
      <div className="flex-1 relative">
        <RoomViewer roomData={roomData} />

        {/* Room name overlay */}
        <div className="absolute top-4 left-4">
          <div
            className="px-4 py-2 rounded-lg shadow-md"
            style={{ backgroundColor: '#FFFFFFCC' }}
          >
            <h1
              className="text-base font-semibold"
              style={{ color: '#2D2D2D' }}
            >
              {roomData.name}
            </h1>
            <p className="text-xs" style={{ color: '#5A4E42' }}>
              {roomData.width}m × {roomData.depth}m × {roomData.height}m
            </p>
          </div>
        </div>

        {/* Watermark badge */}
        <div className="absolute bottom-4 left-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm"
            style={{ backgroundColor: '#FFFFFFE6' }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: '#C17F4E' }}
            >
              <Sofa className="w-3 h-3 text-white" />
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: '#5A4E42' }}
            >
              Interior Studio
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="absolute bottom-4 right-4">
          <Link href="/auth/signup">
            <Button
              className="font-medium text-white shadow-lg cursor-pointer"
              style={{ backgroundColor: '#C17F4E' }}
            >
              <Sofa className="w-4 h-4 mr-1.5" />
              Open in Interior Studio
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { builders, makeMat } from '@/lib/furniture-builders';
import type { MatType } from '@/lib/furniture-builders';
import { categories, furnitureItems, matColors, wallColorOptions, roomTypeDefaults } from '@/lib/furniture-data';
import type { CategoryId } from '@/lib/furniture-data';

/* ===== TYPES ===== */
interface FurnitureData {
  fn: string;
  name: string;
  desc: string;
  matType: string;
  matColor: string;
  position: { x: number; y: number; z: number };
  rotation: number;
}

interface RoomInfo {
  id: string;
  name: string;
  roomType: string;
}

/* ===== MOBILE DETECTION ===== */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || 'ontouchstart' in window;
}

/* ===== FLOOR TEXTURE GENERATORS (OPTIMIZED) ===== */
const texCache = new Map<string, THREE.CanvasTexture>();
function getCachedTex(key: string, gen: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const existing = texCache.get(key);
  if (existing) return existing;
  const t = gen();
  texCache.set(key, t);
  return t;
}

function makeHardwoodTexture(w: number, d: number): THREE.CanvasTexture {
  return getCachedTex(`hw_${w}_${d}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#B8956A'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 30; i++) {
      const y = Math.random() * 256;
      ctx.strokeStyle = `rgba(90,60,30,${Math.random() * 0.12})`; ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < 256; x += 15) ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * 4);
      ctx.stroke();
    }
    for (let x = 0; x < 256; x += 32) {
      ctx.strokeStyle = 'rgba(60,40,20,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
    return t;
  });
}

function makeMarbleTexture(w: number, d: number): THREE.CanvasTexture {
  return getCachedTex(`mb_${w}_${d}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#F0EDE8'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = `rgba(160,150,140,${Math.random() * 0.15 + 0.03})`; ctx.lineWidth = Math.random() * 1.5 + 0.3;
      ctx.beginPath(); const sy = Math.random() * 256;
      ctx.moveTo(0, sy);
      for (let x = 0; x < 256; x += 10) ctx.lineTo(x, sy + Math.sin(x * 0.02 + i * 0.5) * (10 + Math.random() * 15));
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 3, d / 3);
    return t;
  });
}

function makeConcreteTexture(w: number, d: number): THREE.CanvasTexture {
  return getCachedTex(`cn_${w}_${d}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#B8B4B0'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256; const y = Math.random() * 256;
      ctx.fillStyle = `rgba(${130 + Math.random() * 30},${125 + Math.random() * 30},${120 + Math.random() * 30},${Math.random() * 0.15})`;
      ctx.fillRect(x, y, Math.random() * 3, Math.random() * 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
    return t;
  });
}

function makeCarpetTexture(w: number, d: number, color = '#B8A898'): THREE.CanvasTexture {
  return getCachedTex(`cp_${w}_${d}_${color}`, () => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color; ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(${150 + Math.random() * 50},${140 + Math.random() * 50},${130 + Math.random() * 50},${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
    return t;
  });
}

function makeTileTexture(w: number, d: number): THREE.CanvasTexture {
  return getCachedTex(`tl_${w}_${d}`, () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#E8E4E0'; ctx.fillRect(0, 0, 256, 256);
    const tileSize = 32;
    ctx.strokeStyle = 'rgba(180,170,160,0.4)'; ctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += tileSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
    for (let y = 0; y <= 256; y += tileSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); }
    for (let i = 0; i < 250; i++) {
      ctx.fillStyle = `rgba(${200 + Math.random() * 40},${195 + Math.random() * 40},${190 + Math.random() * 40},${Math.random() * 0.05})`;
      const tx = Math.floor(Math.random() * 8) * tileSize; const ty = Math.floor(Math.random() * 8) * tileSize;
      ctx.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
    return t;
  });
}

/* ===== LIGHTING MOODS ===== */
const lightMoods: Record<string, { bg: number; fog: number; ambient: [number, number]; dir: [number, number]; exposure: number }> = {
  daylight: { bg: 0xF5F0E8, fog: 0xF5F0E8, ambient: [0xFFE8D0, 0.5], dir: [0xFFF0D8, 1.8], exposure: 1.1 },
  golden: { bg: 0xF0E0C8, fog: 0xF0E0C8, ambient: [0xFFD8A0, 0.6], dir: [0xFFE0A0, 2.0], exposure: 1.2 },
  evening: { bg: 0xD8C8B0, fog: 0xD8C8B0, ambient: [0xFFC880, 0.35], dir: [0xFFE8C0, 1.0], exposure: 0.9 },
  night: { bg: 0x2A2825, fog: 0x2A2825, ambient: [0xFFE0A0, 0.12], dir: [0xFFE0A0, 0.3], exposure: 0.6 },
};

/* ===== FLOOR COLOR OPTIONS ===== */
const floorColorOptions = [
  { color: '#B8956A', label: 'Natural' },
  { color: '#8B7355', label: 'Walnut' },
  { color: '#5C4033', label: 'Dark' },
  { color: '#D4A76A', label: 'Honey' },
  { color: '#A08060', label: 'Amber' },
  { color: '#F0EDE8', label: 'Light' },
  { color: '#E0C8A0', label: 'Birch' },
  { color: '#6B4226', label: 'Mahogany' },
];

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
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<Array<{ type: string; data: FurnitureData | null; item: THREE.Group | null; oldPos?: THREE.Vector3; oldRot?: number }>>([]);
  const historyIdxRef = useRef(-1);

  // Touch rotation refs for two-finger rotate
  const touchStartAngleRef = useRef<number | null>(null);
  const touchItemStartRotRef = useRef<number>(0);
  const touchStartDistRef = useRef<number | null>(null);

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentCat, setCurrentCat] = useState<CategoryId>('seating');
  const [currentMatType, setCurrentMatType] = useState<MatType>('fabric');
  const [currentColor, setCurrentColor] = useState('#8A8478');
  const [roomW, setRoomW] = useState(8);
  const [roomD, setRoomD] = useState(6);
  const [roomH, setRoomH] = useState(3);
  const [wallCol, setWallCol] = useState('#FAF8F4');
  const [floorType, setFloorType] = useState('hardwood');
  const [floorColor, setFloorColor] = useState('#B8956A');
  const [doorWall, setDoorWall] = useState('none');
  const [windowCount, setWindowCount] = useState(1);
  const [windowWall, setWindowWall] = useState('back');
  const [lightMood, setLightMood] = useState('daylight');
  const [selectedName, setSelectedName] = useState('');
  const [selectedDesc, setSelectedDesc] = useState('');
  const [selectedMat, setSelectedMat] = useState('');
  const [itemPanelVisible, setItemPanelVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [autoRotActive, setAutoRotActive] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [designName, setDesignName] = useState('Untitled Room');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [itemCount, setItemCount] = useState(0);
  const [rooms, setRooms] = useState<RoomInfo[]>([{ id: 'default', name: 'Living Room', roomType: 'living' }]);
  const [currentRoomId, setCurrentRoomId] = useState('default');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'furniture' | 'room' | 'material' | null>(null);

  // Refs for Three.js callbacks
  const roomWRef = useRef(8); const roomDRef = useRef(6); const roomHRef = useRef(3);
  const wallColRef = useRef('#FAF8F4'); const floorTypeRef = useRef('hardwood');
  const floorColorRef = useRef('#B8956A');
  const doorWallRef = useRef('none'); const windowCountRef = useRef(1);
  const windowWallRef = useRef('back'); const lightMoodRef = useRef('daylight');
  const snapToGridRef = useRef(false);
  const roomStatesRef = useRef<Map<string, FurnitureData[]>>(new Map());

  // Refs for scene lights (to update on mood change)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Ref for triggering renders from outside useEffect
  const needsRenderRef = useRef<(() => void) | null>(null);

  // Ref for debouncing save status updates
  const saveStatusRef = useRef<'saved' | 'saving' | 'unsaved'>('saved');

  // Debounced buildRoom ref
  const buildRoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ceiling Edit Mode
  const [ceilingEditMode, setCeilingEditMode] = useState(false);
  const ceilingEditModeRef = useRef(false);
  const [selectedCeilingLightIdx, setSelectedCeilingLightIdx] = useState(-1);
  const [selectedLightX, setSelectedLightX] = useState(0);
  const [selectedLightZ, setSelectedLightZ] = useState(0);
  const selectedCeilingLightRef = useRef<THREE.Group | null>(null);
  const ceilingDragItemRef = useRef<THREE.Group | null>(null);
  const savedCameraPosRef = useRef(new THREE.Vector3(7, 6, 9));
  const savedCameraTargetRef = useRef(new THREE.Vector3(0, 1, 0));
  const ceilingGridRef = useRef<THREE.GridHelper | null>(null);
  const ceilingSpotPositionsRef = useRef<Array<{ x: number; z: number }>>([
    { x: -1.5, z: 0 },
    { x: 1.5, z: 0 },
  ]);

  // Mark the Three.js scene as needing a re-render
  const markSceneDirty = useCallback(() => {
    needsRenderRef.current?.();
  }, []);

  // Debounced save status - only triggers React re-render if not already unsaved
  const markUnsaved = useCallback(() => {
    if (saveStatusRef.current !== 'unsaved') {
      saveStatusRef.current = 'unsaved';
      setSaveStatus('unsaved');
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  /* ===== SERIALIZE / DESERIALIZE FURNITURE ===== */
  const serializeFurniture = useCallback((): FurnitureData[] => {
    return placedItemsRef.current.map(item => ({
      fn: item.userData.fn || '',
      name: item.userData.name || '',
      desc: item.userData.desc || '',
      matType: item.userData.matType || 'fabric',
      matColor: item.userData.matColor || '#8A8478',
      position: { x: item.position.x, y: item.position.y, z: item.position.z },
      rotation: item.rotation.y,
    }));
  }, []);

  const loadFurnitureData = useCallback((data: FurnitureData[]) => {
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); }
      });
    });
    placedItemsRef.current = [];
    selectedObjRef.current = null;
    setItemPanelVisible(false);

    data.forEach(d => {
      const fn = builders[d.fn];
      if (!fn) return;
      const item = fn(d.matColor, d.matType as MatType, roomHRef.current);
      item.position.set(d.position.x, d.position.y, d.position.z);
      item.rotation.y = d.rotation;
      item.userData.fn = d.fn;
      item.userData.isFurniture = true;
      item.name = d.fn;
      sceneRef.current?.add(item);
      placedItemsRef.current.push(item);
    });
    setItemCount(placedItemsRef.current.length);
    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== BUILD ROOM ===== */
  const buildRoom = useCallback(() => {
    const roomGroup = roomGroupRef.current;
    const scene = sceneRef.current;
    if (!roomGroup || !scene) return;

    // Dispose old children
    while (roomGroup.children.length) {
      const child = roomGroup.children[0];
      roomGroup.remove(child);
      child.traverse(c => {
        if (c instanceof THREE.Mesh) { c.geometry?.dispose(); (c.material as THREE.Material)?.dispose(); }
      });
    }

    const w = roomWRef.current, d = roomDRef.current, h = roomHRef.current;
    const wc = wallColRef.current, ft = floorTypeRef.current;
    const fc = floorColorRef.current;
    const dw = doorWallRef.current, wcnt = windowCountRef.current, wwall = windowWallRef.current;
    const mood = lightMoodRef.current;

    // Texture cache is keyed by dimensions/type, so stale entries are simply unused
    // (removed texCache.clear() to allow reuse across dimension slider adjustments)

    // Floor texture
    let floorTex: THREE.CanvasTexture;
    let floorRoughness = 0.65;
    switch (ft) {
      case 'marble': floorTex = makeMarbleTexture(w, d); floorRoughness = 0.2; break;
      case 'concrete': floorTex = makeConcreteTexture(w, d); floorRoughness = 0.85; break;
      case 'carpet': floorTex = makeCarpetTexture(w, d, fc); floorRoughness = 0.95; break;
      case 'tile': floorTex = makeTileTexture(w, d); floorRoughness = 0.5; break;
      default: floorTex = makeHardwoodTexture(w, d);
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: floorTex, roughness: floorRoughness, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor'; roomGroup.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, metalness: 0 });
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); bw.position.set(0, h / 2, -d / 2); bw.receiveShadow = true; bw.name = 'wall_back'; roomGroup.add(bw);
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone()); lw.position.set(-w / 2, h / 2, 0); lw.rotation.y = Math.PI / 2; lw.receiveShadow = true; lw.name = 'wall_left'; roomGroup.add(lw);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone()); rw.position.set(w / 2, h / 2, 0); rw.rotation.y = -Math.PI / 2; rw.receiveShadow = true; rw.name = 'wall_right'; roomGroup.add(rw);
    const fw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    fw.position.set(0, h / 2, d / 2); fw.rotation.y = Math.PI; fw.name = 'wall_front'; roomGroup.add(fw);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0xFFFFF8, roughness: 1, side: THREE.DoubleSide }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = h; ceil.name = 'ceiling'; roomGroup.add(ceil);

    // Baseboards
    const bbMat = new THREE.MeshStandardMaterial({ color: 0xF0E8D8, roughness: 0.7 }); const bbH = 0.08;
    const bb1 = new THREE.Mesh(new THREE.BoxGeometry(w, bbH, 0.02), bbMat); bb1.position.set(0, bbH / 2, -d / 2 + 0.01); bb1.name = 'baseboard_back'; roomGroup.add(bb1);
    const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, bbH, d), bbMat); bb2.position.set(-w / 2 + 0.01, bbH / 2, 0); bb2.name = 'baseboard_left'; roomGroup.add(bb2);

    // Windows
    const addWindow = (wall: string, offset: number) => {
      const winW = Math.min(w * 0.3, 2.2), winH = Math.min(h * 0.45, 1.6);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06), new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 }));
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshStandardMaterial({ color: 0xC8DDE8, emissive: 0x8AB8D0, emissiveIntensity: mood === 'night' ? 0.1 : 0.4, roughness: 0.1, metalness: 0.1 }));
      const crossMat = new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 });
      const cv = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.06), crossMat);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.06), crossMat);

      if (wall === 'back') {
        const xOff = wcnt === 1 ? w * 0.15 : (wcnt === 2 ? offset * (w * 0.3) : offset * (w * 0.25));
        frame.position.set(xOff, h * 0.55, -d / 2 + 0.02);
        glass.position.set(xOff, h * 0.55, -d / 2 + 0.04);
        cv.position.copy(frame.position); ch.position.copy(frame.position);
      } else if (wall === 'left') {
        const zOff = wcnt === 1 ? 0 : offset * (d * 0.3);
        frame.position.set(-w / 2 + 0.02, h * 0.55, zOff); frame.rotation.y = Math.PI / 2;
        glass.position.set(-w / 2 + 0.04, h * 0.55, zOff); glass.rotation.y = Math.PI / 2;
        cv.position.copy(frame.position); cv.rotation.y = Math.PI / 2;
        ch.position.copy(frame.position); ch.rotation.y = Math.PI / 2;
      } else {
        const zOff = wcnt === 1 ? 0 : offset * (d * 0.3);
        frame.position.set(w / 2 - 0.02, h * 0.55, zOff); frame.rotation.y = -Math.PI / 2;
        glass.position.set(w / 2 - 0.04, h * 0.55, zOff); glass.rotation.y = -Math.PI / 2;
        cv.position.copy(frame.position); cv.rotation.y = -Math.PI / 2;
        ch.position.copy(frame.position); ch.rotation.y = -Math.PI / 2;
      }
      roomGroup.add(frame, glass, cv, ch);
    };
    for (let i = 0; i < wcnt; i++) addWindow(wwall, i - Math.floor(wcnt / 2));

    // Door
    if (dw !== 'none') {
      const doorW = 0.9, doorH = 2.1;
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(dw === 'back' || dw === 'front' ? doorW + 0.1 : 0.08, doorH + 0.1, dw === 'left' || dw === 'right' ? doorW + 0.1 : 0.08), new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 }));
      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(dw === 'back' || dw === 'front' ? doorW : 0.04, doorH, dw === 'left' || dw === 'right' ? doorW : 0.04), new THREE.MeshStandardMaterial({ color: 0xC4B8A8, roughness: 0.6 }));
      if (dw === 'back') { doorFrame.position.set(0, doorH / 2, -d / 2 + 0.03); doorPanel.position.set(0.2, doorH / 2, -d / 2 + 0.05); }
      else if (dw === 'left') { doorFrame.position.set(-w / 2 + 0.03, doorH / 2, 0); doorPanel.position.set(-w / 2 + 0.05, doorH / 2, 0.2); }
      else if (dw === 'right') { doorFrame.position.set(w / 2 - 0.03, doorH / 2, 0); doorPanel.position.set(w / 2 - 0.05, doorH / 2, 0.2); }
      roomGroup.add(doorFrame, doorPanel);
    }

    // Ceiling spots (from persisted positions)
    const spotPositions = ceilingSpotPositionsRef.current;
    spotPositions.forEach((pos, idx) => {
      const spotGroup = new THREE.Group();
      spotGroup.name = `ceilingSpot_${idx}`;
      spotGroup.userData.isCeilingSpot = true;
      spotGroup.userData.spotIndex = idx;

      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 }));
      spot.name = `ceilingSpotMesh_${idx}`;
      spotGroup.add(spot);

      const spotLight = new THREE.PointLight(mood === 'night' ? 0xFFE8C0 : 0xFFEED0, mood === 'night' ? 0.1 : 0.4, 8);
      spotLight.position.set(0, -0.085, 0);
      spotGroup.add(spotLight);

      spotGroup.position.set(pos.x, h - 0.015, pos.z);
      roomGroup.add(spotGroup);
    });
    roomGroup.userData.ceilingSpotCount = spotPositions.length;

    // Grid helper
    const gridHelper = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 2, 0xCCBBAA, 0xDDD4C8);
    gridHelper.position.y = 0.002; gridHelper.name = 'grid';
    (gridHelper.material as THREE.Material).opacity = 0.25; (gridHelper.material as THREE.Material).transparent = true;
    roomGroup.add(gridHelper);

    // Update scene lighting
    const moodData = lightMoods[mood] || lightMoods.daylight;
    scene.background = new THREE.Color(moodData.bg);
    scene.fog = new THREE.FogExp2(moodData.fog, 0.018);
    if (rendererRef.current) rendererRef.current.toneMappingExposure = moodData.exposure;

    // Update actual scene lights
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(moodData.ambient[0]);
      ambientLightRef.current.intensity = moodData.ambient[1];
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(moodData.dir[0]);
      dirLightRef.current.intensity = moodData.dir[1];
    }

    // Store built dimensions for in-place preview scaling
    roomGroup.userData.builtW = w;
    roomGroup.userData.builtD = d;
    roomGroup.userData.builtH = h;

    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== DEBOUNCED BUILD ROOM ===== */
  const debouncedBuildRoom = useCallback(() => {
    if (buildRoomTimeoutRef.current) clearTimeout(buildRoomTimeoutRef.current);
    buildRoomTimeoutRef.current = setTimeout(() => {
      buildRoom();
      buildRoomTimeoutRef.current = null;
    }, 80);
  }, [buildRoom]);

  /* ===== UPDATE ROOM VISUAL PREVIEW (instant in-place wall scaling) ===== */
  const updateRoomVisualPreview = useCallback((newW: number, newD: number, newH: number) => {
    const roomGroup = roomGroupRef.current;
    if (!roomGroup) return;

    const ow = roomGroup.userData.builtW as number || 8;
    const od = roomGroup.userData.builtD as number || 6;
    const oh = roomGroup.userData.builtH as number || 3;

    roomGroup.traverse(c => {
      if (!(c instanceof THREE.Mesh)) return;
      switch (c.name) {
        case 'wall_back':
          c.scale.set(newW / ow, newH / oh, 1);
          c.position.set(0, newH / 2, -newD / 2);
          break;
        case 'wall_left':
          c.scale.set(newD / od, newH / oh, 1);
          c.position.set(-newW / 2, newH / 2, 0);
          break;
        case 'wall_right':
          c.scale.set(newD / od, newH / oh, 1);
          c.position.set(newW / 2, newH / 2, 0);
          break;
        case 'wall_front':
          c.scale.set(newW / ow, newH / oh, 1);
          c.position.set(0, newH / 2, newD / 2);
          break;
        case 'ceiling':
          c.scale.set(newW / ow, newD / od, 1);
          c.position.y = newH;
          break;
        case 'floor':
          c.scale.set(newW / ow, newD / od, 1);
          break;
        case 'baseboard_back':
          c.scale.set(newW / ow, 1, 1);
          c.position.set(0, 0.04, -newD / 2 + 0.01);
          break;
        case 'baseboard_left':
          c.scale.set(1, 1, newD / od);
          c.position.set(-newW / 2 + 0.01, 0.04, 0);
          break;
        case 'grid':
          c.visible = false; // hide grid during preview for perf
          break;
      }
    });

    // Update ceiling spot positions (only y coordinate for height changes)
    roomGroup.children.forEach(child => {
      if (child.name && child.name.startsWith('ceilingSpot_')) {
        child.position.y = newH - 0.015;
      }
    });

    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== CAMERA ===== */
  const animateCamera = useCallback((pos: [number, number, number], target: [number, number, number], dur = 800) => {
    const camera = cameraRef.current, ctrl = controlsRef.current; if (!camera || !ctrl) return;
    const startPos = camera.position.clone(), startTarget = ctrl.target.clone();
    const endPos = new THREE.Vector3(...pos), endTarget = new THREE.Vector3(...target);
    const startTime = performance.now();
    // Capture non-null references for closure
    const cam = camera;
    const ctl = ctrl;
    function step() { const t = Math.min(1, (performance.now() - startTime) / dur); const ease = 1 - Math.pow(1 - t, 3); cam.position.lerpVectors(startPos, endPos, ease); ctl.target.lerpVectors(startTarget, endTarget, ease); ctl.update(); if (t < 1) requestAnimationFrame(step); }
    step();
  }, []);

  /* ===== CEILING EDIT MODE ===== */
  const enterCeilingEditMode = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const roomGroup = roomGroupRef.current;
    if (!camera || !controls || !roomGroup) return;

    // Save current camera state
    savedCameraPosRef.current.copy(camera.position);
    savedCameraTargetRef.current.copy(controls.target);

    const h = roomHRef.current;
    const w = roomWRef.current;
    const d = roomDRef.current;

    // Animate camera to floor looking up
    animateCamera([0, 0.3, 0], [0, h, 0], 800);

    // Hide furniture
    placedItemsRef.current.forEach(item => { item.visible = false; });

    // Make walls semi-transparent
    roomGroup.traverse(c => {
      if (c instanceof THREE.Mesh) {
        if (c.name === 'wall_back' || c.name === 'wall_left' || c.name === 'wall_right') {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat._origOpacity = mat.opacity;
          mat._origTransparent = mat.transparent;
          mat.transparent = true;
          mat.opacity = 0.15;
          mat.needsUpdate = true;
        }
        if (c.name === 'wall_front') {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat._origOpacity = mat.opacity;
          mat.opacity = 0.08;
          mat.needsUpdate = true;
        }
        // Make floor very faint
        if (c.name === 'floor') {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat._origOpacity = mat.opacity;
          mat._origTransparent = mat.transparent;
          mat.transparent = true;
          mat.opacity = 0.1;
          mat.needsUpdate = true;
        }
        // Add glow to ceiling spots
        if (c.name && c.name.startsWith('ceilingSpotMesh_')) {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat._origEmissiveCeil = mat.emissive.getHex();
          mat.emissive.setHex(0xFFDD44);
          mat.emissiveIntensity = 0.6;
          mat.needsUpdate = true;
        }
      }
    });

    // Add ceiling grid helper
    const scene = sceneRef.current;
    if (scene) {
      const ceilGrid = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 4, 0xC17F4E, 0xDDC8A8);
      ceilGrid.rotation.x = Math.PI / 2;
      ceilGrid.position.y = h - 0.001;
      (ceilGrid.material as THREE.Material).opacity = 0.35;
      (ceilGrid.material as THREE.Material).transparent = true;
      ceilGrid.name = 'ceilingEditGrid';
      scene.add(ceilGrid);
      ceilingGridRef.current = ceilGrid;
    }

    // Update OrbitControls for ceiling view
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = Math.PI * 0.5;
    controls.minDistance = 0.5;
    controls.maxDistance = 15;

    ceilingEditModeRef.current = true;
    setCeilingEditMode(true);
    setSelectedCeilingLightIdx(-1);
    selectedCeilingLightRef.current = null;
    markSceneDirty();
    showToast('Ceiling Light Editor — Click ceiling to add, drag to move');
  }, [animateCamera, markSceneDirty, showToast]);

  const exitCeilingEditMode = useCallback(() => {
    const controls = controlsRef.current;
    const roomGroup = roomGroupRef.current;
    if (!controls || !roomGroup) return;

    // Restore camera
    animateCamera(
      [savedCameraPosRef.current.x, savedCameraPosRef.current.y, savedCameraPosRef.current.z],
      [savedCameraTargetRef.current.x, savedCameraTargetRef.current.y, savedCameraTargetRef.current.z],
      800
    );

    // Show furniture
    placedItemsRef.current.forEach(item => { item.visible = true; });

    // Restore walls
    roomGroup.traverse(c => {
      if (c instanceof THREE.Mesh) {
        if (c.name === 'wall_back' || c.name === 'wall_left' || c.name === 'wall_right' || c.name === 'floor') {
          const mat = c.material as THREE.MeshStandardMaterial;
          if (mat._origTransparent !== undefined) mat.transparent = mat._origTransparent;
          if (mat._origOpacity !== undefined) mat.opacity = mat._origOpacity;
          mat.needsUpdate = true;
        }
        if (c.name === 'wall_front') {
          const mat = c.material as THREE.MeshStandardMaterial;
          if (mat._origOpacity !== undefined) mat.opacity = mat._origOpacity;
          mat.needsUpdate = true;
        }
        // Remove glow from ceiling spots
        if (c.name && c.name.startsWith('ceilingSpotMesh_')) {
          const mat = c.material as THREE.MeshStandardMaterial;
          if (mat._origEmissiveCeil !== undefined) mat.emissive.setHex(mat._origEmissiveCeil);
          mat.emissiveIntensity = 1;
          mat.needsUpdate = true;
        }
      }
    });

    // Remove ceiling grid
    const scene = sceneRef.current;
    if (scene && ceilingGridRef.current) {
      scene.remove(ceilingGridRef.current);
      ceilingGridRef.current = null;
    }

    // Restore OrbitControls
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = 0;
    controls.minDistance = 2;
    controls.maxDistance = 22;

    ceilingEditModeRef.current = false;
    setCeilingEditMode(false);
    setSelectedCeilingLightIdx(-1);
    selectedCeilingLightRef.current = null;
    ceilingDragItemRef.current = null;
    markSceneDirty();
  }, [animateCamera, markSceneDirty]);

  const addCeilingLight = useCallback(() => {
    const positions = ceilingSpotPositionsRef.current;
    const w = roomWRef.current;
    const d = roomDRef.current;
    const h = roomHRef.current;
    const roomGroup = roomGroupRef.current;
    const mood = lightMoodRef.current;
    if (!roomGroup) return;

    // Add position near center with slight random offset
    const newPos = {
      x: (Math.random() - 0.5) * (w * 0.4),
      z: (Math.random() - 0.5) * (d * 0.4),
    };
    positions.push(newPos);

    const idx = positions.length - 1;
    const spotGroup = new THREE.Group();
    spotGroup.name = `ceilingSpot_${idx}`;
    spotGroup.userData.isCeilingSpot = true;
    spotGroup.userData.spotIndex = idx;

    const spot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 })
    );
    spot.name = `ceilingSpotMesh_${idx}`;
    // Apply glow if in edit mode
    if (ceilingEditModeRef.current) {
      (spot.material as THREE.MeshStandardMaterial).emissive.setHex(0xFFDD44);
      (spot.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
    }
    spotGroup.add(spot);

    const spotLight = new THREE.PointLight(
      mood === 'night' ? 0xFFE8C0 : 0xFFEED0,
      mood === 'night' ? 0.1 : 0.4,
      8
    );
    spotLight.position.set(0, -0.085, 0);
    spotGroup.add(spotLight);

    spotGroup.position.set(newPos.x, h - 0.015, newPos.z);
    roomGroup.add(spotGroup);
    roomGroup.userData.ceilingSpotCount = positions.length;

    markSceneDirty();
    showToast(`Added ceiling light #${idx + 1}`);
  }, [markSceneDirty, showToast]);

  const deleteSelectedCeilingLight = useCallback(() => {
    const idx = selectedCeilingLightIdx;
    if (idx < 0) return;
    const positions = ceilingSpotPositionsRef.current;
    if (idx >= positions.length) return;

    positions.splice(idx, 1);
    selectedCeilingLightRef.current = null;
    setSelectedCeilingLightIdx(-1);

    // Rebuild room to refresh spot indices
    buildRoom();

    // Re-apply ceiling edit mode styling if still in edit mode
    if (ceilingEditModeRef.current) {
      const roomGroup = roomGroupRef.current;
      if (roomGroup) {
        roomGroup.traverse(c => {
          if (c instanceof THREE.Mesh && c.name && c.name.startsWith('ceilingSpotMesh_')) {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.emissive.setHex(0xFFDD44);
            mat.emissiveIntensity = 0.6;
            mat.needsUpdate = true;
          }
        });
      }
      // Re-hide furniture and make walls transparent
      placedItemsRef.current.forEach(item => { item.visible = false; });
      roomGroup?.traverse(c => {
        if (c instanceof THREE.Mesh) {
          if (c.name === 'wall_back' || c.name === 'wall_left' || c.name === 'wall_right') {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.transparent = true; mat.opacity = 0.15; mat.needsUpdate = true;
          }
          if (c.name === 'wall_front') {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.opacity = 0.08; mat.needsUpdate = true;
          }
          if (c.name === 'floor') {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.transparent = true; mat.opacity = 0.1; mat.needsUpdate = true;
          }
        }
      });
    }

    showToast('Removed ceiling light');
  }, [selectedCeilingLightIdx, buildRoom, showToast]);

  /* ===== UPDATE WALL/FLOOR COLOR IN-PLACE ===== */
  const updateWallColor = useCallback((color: string) => {
    const roomGroup = roomGroupRef.current;
    if (!roomGroup) return;
    wallColRef.current = color;
    roomGroup.traverse(c => {
      if (c instanceof THREE.Mesh && (c.name === 'wall_back' || c.name === 'wall_left' || c.name === 'wall_right' || c.name === 'wall_front')) {
        (c.material as THREE.MeshStandardMaterial).color.set(color);
        (c.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    });
    markSceneDirty();
  }, [markSceneDirty]);

  const updateFloorColor = useCallback((color: string) => {
    const roomGroup = roomGroupRef.current;
    if (!roomGroup) return;
    floorColorRef.current = color;
    roomGroup.traverse(c => {
      if (c instanceof THREE.Mesh && c.name === 'floor') {
        const ft = floorTypeRef.current;
        if (ft === 'carpet') {
          const w = roomWRef.current, d = roomDRef.current;
          const newTex = makeCarpetTexture(w, d, color);
          (c.material as THREE.MeshStandardMaterial).map = newTex;
          (c.material as THREE.MeshStandardMaterial).needsUpdate = true;
        } else {
          (c.material as THREE.MeshStandardMaterial).color.set(color);
          (c.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      }
    });
    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== SELECT / DESELECT ===== */
  const selectItem = useCallback((obj: THREE.Group) => {
    if (selectedObjRef.current) {
      selectedObjRef.current.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive!); });
    }
    selectedObjRef.current = obj;
    obj.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial).emissive) { const mat = c.material as THREE.MeshStandardMaterial; mat._origEmissive = mat.emissive.getHex(); mat.emissive.setHex(0x221100); } });
    setCurrentMatType((obj.userData.matType as MatType) || 'fabric');
    setCurrentColor(obj.userData.matColor || '#8A8478');
    setSelectedName(obj.userData.name || ''); setSelectedDesc(obj.userData.desc || ''); setSelectedMat(`${obj.userData.matType} — ${obj.userData.matColor}`);
    setItemPanelVisible(true);
    markSceneDirty();
  }, [markSceneDirty]);

  const deselectAll = useCallback(() => {
    if (selectedObjRef.current) { selectedObjRef.current.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive!); }); }
    selectedObjRef.current = null; setItemPanelVisible(false); setSelectedMat('—');
    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== ADD / DELETE / DUPLICATE ===== */
  const addFurniture = useCallback((fnName: string, col: string, mtype: MatType) => {
    const fn = builders[fnName]; if (!fn) return null;
    const item = fn(col, mtype, roomHRef.current);
    const w = roomWRef.current, d = roomDRef.current;
    let px = (Math.random() - 0.5) * (w * 0.4), pz = (Math.random() - 0.5) * (d * 0.3);
    if (snapToGridRef.current) { px = Math.round(px * 2) / 2; pz = Math.round(pz * 2) / 2; }
    item.position.set(px, 0, pz);
    item.userData.fn = fnName;
    sceneRef.current?.add(item); placedItemsRef.current.push(item);
    selectItem(item); setItemCount(placedItemsRef.current.length);
    markUnsaved();
    markSceneDirty();
    showToast(`Added ${item.userData.name}`);
    return item;
  }, [selectItem, showToast, markUnsaved, markSceneDirty]);

  const deleteSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    const name = selected.userData.name;
    sceneRef.current?.remove(selected); placedItemsRef.current = placedItemsRef.current.filter(i => i !== selected);
    selected.traverse(c => { if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); } });
    selectedObjRef.current = null; setItemPanelVisible(false); setItemCount(placedItemsRef.current.length);
    markUnsaved(); markSceneDirty(); showToast(`Removed ${name}`);
  }, [showToast, markUnsaved, markSceneDirty]);

  const duplicateSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    const d = selected.userData;
    const fn = builders[d.fn || '']; if (!fn) return;
    const item = fn(d.matColor, d.matType, roomHRef.current);
    item.position.copy(selected.position).add(new THREE.Vector3(0.5, 0, 0.5));
    item.rotation.y = selected.rotation.y; item.userData.fn = d.fn;
    sceneRef.current?.add(item); placedItemsRef.current.push(item);
    selectItem(item); setItemCount(placedItemsRef.current.length);
    markUnsaved(); markSceneDirty(); showToast(`Duplicated ${d.name}`);
  }, [selectItem, showToast, markUnsaved, markSceneDirty]);

  const applyMaterial = useCallback((color: string, type: MatType) => {
    const selected = selectedObjRef.current; if (!selected) { showToast('Select an item first'); return; }
    // Determine material properties based on type
    let roughness: number, metalness: number;
    switch (type) {
      case 'leather': roughness = 0.45; metalness = 0.02; break;
      case 'wood': roughness = 0.6; metalness = 0; break;
      case 'metal': roughness = 0.25; metalness = 0.85; break;
      default: roughness = 0.85; metalness = 0;
    }
    selected.traverse(c => {
      if (c instanceof THREE.Mesh && c.material && !(c.material as any)._isLeg && !(c.material as any)._isStruct) {
        // Skip invisible helper meshes
        if ((c.material as THREE.MeshStandardMaterial).visible === false) return;
        const mat = c.material as THREE.MeshStandardMaterial;
        mat.color.set(color);
        mat.roughness = roughness;
        mat.metalness = metalness;
        mat.needsUpdate = true;
      }
    });
    selected.userData.matColor = color; selected.userData.matType = type;
    setSelectedMat(`${type} — ${color}`); markUnsaved(); markSceneDirty();
  }, [showToast, markUnsaved, markSceneDirty]);

  const findParentFurniture = useCallback((obj: THREE.Object3D): THREE.Group | null => {
    let current: THREE.Object3D | null = obj;
    while (current) { if (current.userData && current.userData.isFurniture) return current as THREE.Group; current = current.parent; }
    return null;
  }, []);

  /* ===== ROOM SWITCHING ===== */
  const switchRoom = useCallback((roomId: string) => {
    roomStatesRef.current.set(currentRoomId, serializeFurniture());
    const saved = roomStatesRef.current.get(roomId);
    if (saved) loadFurnitureData(saved);
    else { placedItemsRef.current.forEach(item => { sceneRef.current?.remove(item); }); placedItemsRef.current = []; setItemCount(0); }
    setCurrentRoomId(roomId); deselectAll();
  }, [currentRoomId, serializeFurniture, loadFurnitureData, deselectAll]);

  const addNewRoom = useCallback(() => {
    const id = `room_${Date.now()}`;
    const typeLabel: Record<string, string> = { living: 'Living Room', bedroom: 'Bedroom', kitchen: 'Kitchen', bathroom: 'Bathroom', office: 'Office', dining: 'Dining Room' };
    const name = newRoomName || typeLabel[newRoomType] || 'New Room';
    const newRoom: RoomInfo = { id, name, roomType: newRoomType };
    setRooms(prev => [...prev, newRoom]);

    roomStatesRef.current.set(currentRoomId, serializeFurniture());
    const defaults = roomTypeDefaults[newRoomType];
    if (defaults) {
      roomWRef.current = defaults.width; roomDRef.current = defaults.depth; roomHRef.current = defaults.height;
      setRoomW(defaults.width); setRoomD(defaults.depth); setRoomH(defaults.height);
      const furnitureData: FurnitureData[] = defaults.defaultFurniture.map(f => ({
        fn: f.fn, name: '', desc: '', matType: f.mat, matColor: f.color,
        position: { x: f.pos[0], y: f.pos[1], z: f.pos[2] }, rotation: f.rot || 0,
      }));
      roomStatesRef.current.set(id, furnitureData);
    } else {
      roomStatesRef.current.set(id, []);
    }

    setCurrentRoomId(id);
    buildRoom();
    const saved = roomStatesRef.current.get(id);
    if (saved) loadFurnitureData(saved);
    setShowAddRoom(false); setNewRoomName(''); setNewRoomType('bedroom');
    showToast(`Added ${name}`);
  }, [currentRoomId, serializeFurniture, loadFurnitureData, buildRoom, newRoomName, newRoomType, showToast]);

  /* ===== DEFAULT FURNITURE ===== */
  const addDefaultFurniture = useCallback(() => {
    const defaults = roomTypeDefaults['living'];
    if (!defaults) return;
    defaults.defaultFurniture.forEach(f => {
      const fn = builders[f.fn]; if (!fn) return;
      const item = fn(f.color, f.mat, roomHRef.current);
      item.position.set(f.pos[0], f.pos[1], f.pos[2]);
      if (f.rot) item.rotation.y = f.rot;
      item.userData.fn = f.fn;
      sceneRef.current?.add(item); placedItemsRef.current.push(item);
    });
    setItemCount(placedItemsRef.current.length); deselectAll(); markSceneDirty();
  }, [deselectAll, markSceneDirty]);

  /* ===== THREE.JS INIT ===== */
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);

    const canvas = canvasRef.current; if (!canvas) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xF5F0E8); scene.fog = new THREE.FogExp2(0xF5F0E8, 0.018); sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.set(7, 6, 9); cameraRef.current = camera;

    // Performance: lower pixel ratio on mobile, limit to 1.5x
    const pr = mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, preserveDrawingBuffer: true, powerPreference: mobile ? 'low-power' : 'high-performance' });
    renderer.setPixelRatio(pr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = mobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.48; controls.minDistance = 2; controls.maxDistance = 22;
    controls.target.set(0, 1, 0);
    // Better touch settings for mobile
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    controls.enablePan = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xFFE8D0, 0.5);
    scene.add(ambientLight); ambientLightRef.current = ambientLight;
    scene.add(new THREE.HemisphereLight(0xFFF5E6, 0x8B7355, 0.4));
    const dirLight = new THREE.DirectionalLight(0xFFF0D8, 1.8); dirLight.position.set(4, 8, 5); dirLight.castShadow = true;
    // Lower shadow map on mobile for perf
    const shadowSize = mobile ? 1024 : 2048;
    dirLight.shadow.mapSize.set(shadowSize, shadowSize);
    dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10; dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10; dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 30; dirLight.shadow.bias = -0.001;
    if (!mobile) dirLight.shadow.radius = 4;
    scene.add(dirLight); dirLightRef.current = dirLight;
    scene.add(new THREE.DirectionalLight(0xE0E8F0, 0.3).translateX(-4).translateY(5).translateZ(-3));

    const roomGroup = new THREE.Group(); scene.add(roomGroup); roomGroupRef.current = roomGroup;
    buildRoom(); setTimeout(() => addDefaultFurniture(), 100);

    const onResize = () => {
      const p = canvas.parentElement; if (!p) return;
      renderer.setSize(p.clientWidth, p.clientHeight);
      camera.aspect = p.clientWidth / p.clientHeight;
      camera.updateProjectionMatrix();
    };
    onResize(); window.addEventListener('resize', onResize);

    const getMeshes = (): THREE.Mesh[] => { const m: THREE.Mesh[] = []; placedItemsRef.current.forEach(g => g.traverse(c => { if (c instanceof THREE.Mesh) m.push(c); })); return m; };

    // Ceiling drag plane (for dragging lights on ceiling)
    const ceilingDragPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), roomHRef.current);

    // Single pointer down for selecting & starting drag
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && touchStartAngleRef.current !== null) return; // ignore if two-finger gesture active
      const r = canvas.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      // === CEILING EDIT MODE INTERACTION ===
      if (ceilingEditModeRef.current) {
        // Check ceiling spot meshes first
        const spotMeshes: THREE.Mesh[] = [];
        roomGroup.traverse(c => {
          if (c instanceof THREE.Mesh && c.name && c.name.startsWith('ceilingSpotMesh_')) spotMeshes.push(c);
        });
        const spotHits = raycasterRef.current.intersectObjects(spotMeshes, false);

        if (spotHits.length > 0) {
          // Find parent ceiling spot group
          const hitMesh = spotHits[0].object;
          let parentSpot: THREE.Group | null = null;
          let p: THREE.Object3D | null = hitMesh;
          while (p) {
            if (p.name && p.name.startsWith('ceilingSpot_') && p.userData.isCeilingSpot) {
              parentSpot = p as THREE.Group; break;
            }
            p = p.parent;
          }
          if (parentSpot) {
            // Deselect previous
            if (selectedCeilingLightRef.current) {
              selectedCeilingLightRef.current.traverse(cc => {
                if (cc instanceof THREE.Mesh && cc.name && cc.name.startsWith('ceilingSpotMesh_')) {
                  (cc.material as THREE.MeshStandardMaterial).emissive.setHex(0xFFDD44);
                  (cc.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
                }
              });
            }
            // Select this spot
            selectedCeilingLightRef.current = parentSpot;
            setSelectedCeilingLightIdx(parentSpot.userData.spotIndex);
            setSelectedLightX(parentSpot.position.x);
            setSelectedLightZ(parentSpot.position.z);
            ceilingDragItemRef.current = parentSpot;
            isDragRef.current = true;
            controls.enabled = false;

            // Update ceiling drag plane height
            ceilingDragPlane.constant = roomHRef.current;

            // Highlight selected spot
            parentSpot.traverse(cc => {
              if (cc instanceof THREE.Mesh && cc.name && cc.name.startsWith('ceilingSpotMesh_')) {
                (cc.material as THREE.MeshStandardMaterial).emissive.setHex(0xFF8800);
                (cc.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.0;
              }
            });

            if (raycasterRef.current.ray.intersectPlane(ceilingDragPlane, intersectionRef.current)) {
              dragOffsetRef.current.copy(intersectionRef.current).sub(parentSpot.position);
              dragOffsetRef.current.y = 0;
            }
            canvas.style.cursor = 'move';
          }
        } else {
          // Check if clicking on ceiling mesh itself to add a new light
          const ceilMeshes: THREE.Mesh[] = [];
          roomGroup.traverse(c => {
            if (c instanceof THREE.Mesh && c.name === 'ceiling') ceilMeshes.push(c);
          });
          const ceilHits = raycasterRef.current.intersectObjects(ceilMeshes, false);

          if (ceilHits.length > 0) {
            // Add new ceiling light at click position
            const hitPoint = ceilHits[0].point;
            const positions = ceilingSpotPositionsRef.current;
            const hw = roomWRef.current / 2 - 0.2, hd = roomDRef.current / 2 - 0.2;
            const nx = Math.max(-hw, Math.min(hw, hitPoint.x));
            const nz = Math.max(-hd, Math.min(hd, hitPoint.z));
            positions.push({ x: nx, z: nz });

            const h = roomHRef.current;
            const mood = lightMoodRef.current;
            const idx = positions.length - 1;
            const spotGroup = new THREE.Group();
            spotGroup.name = `ceilingSpot_${idx}`;
            spotGroup.userData.isCeilingSpot = true;
            spotGroup.userData.spotIndex = idx;

            const spotMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16),
              new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 })
            );
            spotMesh.name = `ceilingSpotMesh_${idx}`;
            (spotMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xFFDD44);
            (spotMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
            spotGroup.add(spotMesh);

            const spotLight = new THREE.PointLight(
              mood === 'night' ? 0xFFE8C0 : 0xFFEED0,
              mood === 'night' ? 0.1 : 0.4, 8
            );
            spotLight.position.set(0, -0.085, 0);
            spotGroup.add(spotLight);

            spotGroup.position.set(nx, h - 0.015, nz);
            roomGroup.add(spotGroup);
            roomGroup.userData.ceilingSpotCount = positions.length;
          }
          // Deselect current
          if (selectedCeilingLightRef.current) {
            selectedCeilingLightRef.current.traverse(cc => {
              if (cc instanceof THREE.Mesh && cc.name && cc.name.startsWith('ceilingSpotMesh_')) {
                (cc.material as THREE.MeshStandardMaterial).emissive.setHex(0xFFDD44);
                (cc.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
              }
            });
          }
          selectedCeilingLightRef.current = null;
          setSelectedCeilingLightIdx(-1);
          setSelectedLightX(0);
          setSelectedLightZ(0);
        }
        needsRenderRef.current?.();
        return;
      }

      // === NORMAL FURNITURE INTERACTION ===
      const hits = raycasterRef.current.intersectObjects(getMeshes(), false);
      if (hits.length > 0) {
        let f: THREE.Group | null = null;
        for (const hit of hits) {
          const parent = findParentFurniture(hit.object);
          if (parent) { f = parent; break; }
        }
        if (f) {
          selectItem(f); dragItemRef.current = f; isDragRef.current = true;
          controls.enabled = false;
          raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current);
          dragOffsetRef.current.copy(intersectionRef.current).sub(f.position);
          dragOffsetRef.current.y = 0;
          canvas.style.cursor = 'move';
        }
      } else { deselectAll(); }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && touchStartAngleRef.current !== null) return; // two-finger gesture active

      // === CEILING EDIT MODE DRAG ===
      if (ceilingEditModeRef.current && isDragRef.current && ceilingDragItemRef.current) {
        const r = canvas.getBoundingClientRect();
        pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointerRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycasterRef.current.setFromCamera(pointerRef.current, camera);
        if (raycasterRef.current.ray.intersectPlane(ceilingDragPlane, intersectionRef.current)) {
          const np = intersectionRef.current.sub(dragOffsetRef.current);
          const hw = roomWRef.current / 2 - 0.2, hd = roomDRef.current / 2 - 0.2;
          const nx = Math.max(-hw, Math.min(hw, np.x));
          const nz = Math.max(-hd, Math.min(hd, np.z));
          ceilingDragItemRef.current.position.x = nx;
          ceilingDragItemRef.current.position.z = nz;
          // Update position in ref
          const idx = ceilingDragItemRef.current.userData.spotIndex;
          if (idx >= 0 && idx < ceilingSpotPositionsRef.current.length) {
            ceilingSpotPositionsRef.current[idx].x = nx;
            ceilingSpotPositionsRef.current[idx].z = nz;
          }
          markUnsaved();
        }
        needsRenderRef.current?.();
        return;
      }

      // === NORMAL FURNITURE DRAG ===
      if (!isDragRef.current || !dragItemRef.current) return;
      const r = canvas.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current)) {
        const np = intersectionRef.current.sub(dragOffsetRef.current);
        const hw = roomWRef.current / 2 - 0.3, hd = roomDRef.current / 2 - 0.3;
        let nx = Math.max(-hw, Math.min(hw, np.x)), nz = Math.max(-hd, Math.min(hd, np.z));
        if (snapToGridRef.current) { nx = Math.round(nx * 2) / 2; nz = Math.round(nz * 2) / 2; }
        dragItemRef.current.position.x = nx; dragItemRef.current.position.z = nz;
        markUnsaved();
      }
    };
    const onPointerUp = () => {
      // Ceiling edit mode
      if (ceilingEditModeRef.current) {
        // Update state with final position after drag
        if (selectedCeilingLightRef.current) {
          setSelectedLightX(selectedCeilingLightRef.current.position.x);
          setSelectedLightZ(selectedCeilingLightRef.current.position.z);
        }
        isDragRef.current = false;
        ceilingDragItemRef.current = null;
        controls.enabled = true;
        canvas.style.cursor = 'crosshair';
        needsRenderRef.current?.();
        return;
      }
      // Normal mode
      isDragRef.current = false; dragItemRef.current = null; controls.enabled = true; canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointermove', onPointerMove); canvas.addEventListener('pointerup', onPointerUp);

    // ===== TWO-FINGER ROTATION GESTURE =====
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2 && selectedObjRef.current) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        const dx = t2.clientX - t1.clientX, dy = t2.clientY - t1.clientY;
        touchStartAngleRef.current = Math.atan2(dy, dx);
        touchItemStartRotRef.current = selectedObjRef.current.rotation.y;
        touchStartDistRef.current = Math.hypot(dx, dy);
        controls.enabled = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && selectedObjRef.current && touchStartAngleRef.current !== null) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        const dx = t2.clientX - t1.clientX, dy = t2.clientY - t1.clientY;
        const currentAngle = Math.atan2(dy, dx);
        const angleDelta = currentAngle - touchStartAngleRef.current;
        selectedObjRef.current.rotation.y = touchItemStartRotRef.current + angleDelta;
        markUnsaved();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartAngleRef.current = null;
        touchStartDistRef.current = null;
        controls.enabled = true;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // Keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (e.key === 'd' || e.key === 'D') { if (!e.ctrlKey && !e.metaKey) duplicateSelected(); }
      else if (e.key === 'r' || e.key === 'R') { if (!e.ctrlKey && !e.metaKey && selectedObjRef.current) { selectedObjRef.current.rotation.y += Math.PI / 12; markUnsaved(); markSceneDirty(); } }
      else if (e.key === 'Escape') { if (ceilingEditModeRef.current) { exitCeilingEditMode(); } else { deselectAll(); } }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); }
    };
    window.addEventListener('keydown', onKeyDown);

    // Optimized render loop - only render when needed or controls moving
    let needsRender = true;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (controls.update() || needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    };
    // Mark needs render on interactions
    const markDirty = () => { needsRender = true; };
    needsRenderRef.current = () => { needsRender = true; };
    canvas.addEventListener('pointerdown', markDirty);
    canvas.addEventListener('pointermove', markDirty);
    animate();

    // Auto-save timer
    autoSaveTimerRef.current = setInterval(() => {
      if (saveStatusRef.current === 'unsaved') { saveStatusRef.current = 'saving'; setSaveStatus('saving'); setTimeout(() => { saveStatusRef.current = 'saved'; setSaveStatus('saved'); }, 1000); }
    }, 60000);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('pointerdown', markDirty); canvas.removeEventListener('pointermove', markDirty);
      window.removeEventListener('keydown', onKeyDown);
      renderer.dispose();
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, []);

  // Resize on sidebar/panel toggle
  useEffect(() => {
    const t = setTimeout(() => {
      const c = canvasRef.current, r = rendererRef.current, cam = cameraRef.current, p = c?.parentElement;
      if (c && r && cam && p) { r.setSize(p.clientWidth, p.clientHeight); cam.aspect = p.clientWidth / p.clientHeight; cam.updateProjectionMatrix(); }
    }, 420);
    return () => clearTimeout(t);
  }, [sidebarOpen, mobilePanel]);

  const resetRoom = useCallback(() => {
    placedItemsRef.current.forEach(item => { sceneRef.current?.remove(item); item.traverse(c => { if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); } }); });
    placedItemsRef.current = []; selectedObjRef.current = null; setItemPanelVisible(false);
    roomWRef.current = 8; roomDRef.current = 6; roomHRef.current = 3; wallColRef.current = '#FAF8F4'; floorTypeRef.current = 'hardwood'; floorColorRef.current = '#B8956A'; doorWallRef.current = 'none'; windowCountRef.current = 1; windowWallRef.current = 'back'; lightMoodRef.current = 'daylight';
    setRoomW(8); setRoomD(6); setRoomH(3); setWallCol('#FAF8F4'); setFloorType('hardwood'); setFloorColor('#B8956A'); setDoorWall('none'); setWindowCount(1); setWindowWall('back'); setLightMood('daylight');
    // Reset ceiling spot positions
    ceilingSpotPositionsRef.current = [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }];
    // Exit ceiling edit mode if active
    if (ceilingEditModeRef.current) { ceilingEditModeRef.current = false; setCeilingEditMode(false); }
    buildRoom(); addDefaultFurniture(); showToast('Room reset');
  }, [buildRoom, addDefaultFurniture, showToast]);

  const takeScreenshot = useCallback(() => {
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current; if (!r || !s || !c) return;
    r.render(s, c); const link = document.createElement('a'); link.download = `${designName.replace(/\s+/g, '_')}.png`; link.href = r.domElement.toDataURL('image/png'); link.click(); showToast('Screenshot saved');
  }, [showToast, designName]);

  const rotateSelected = useCallback((dir: 'left' | 'right') => { if (selectedObjRef.current) { selectedObjRef.current.rotation.y += dir === 'left' ? Math.PI / 12 : -Math.PI / 12; markUnsaved(); markSceneDirty(); } }, [markUnsaved, markSceneDirty]);

  const shareRoom = useCallback(() => { if (currentRoomId) { navigator.clipboard.writeText(`${window.location.origin}/view/${currentRoomId}`); showToast('Share link copied!'); } }, [currentRoomId, showToast]);

  // Filtered furniture items
  const filteredItems = searchQuery ? furnitureItems[currentCat].filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) : furnitureItems[currentCat];

  const floorTypeOptions = [
    { id: 'hardwood', label: 'Hardwood', color: '#B8956A' },
    { id: 'marble', label: 'Marble', color: '#F0EDE8' },
    { id: 'concrete', label: 'Concrete', color: '#B8B4B0' },
    { id: 'carpet', label: 'Carpet', color: '#B8A898' },
    { id: 'tile', label: 'Tile', color: '#E8E4E0' },
  ];

  const lightMoodOptions = [
    { id: 'daylight', label: 'Daylight', icon: '☀️' },
    { id: 'golden', label: 'Golden', icon: '🌅' },
    { id: 'evening', label: 'Evening', icon: '🌆' },
    { id: 'night', label: 'Night', icon: '🌙' },
  ];

  /* ===== MOBILE BOTTOM PANEL CONTENT ===== */
  const renderMobilePanel = () => {
    if (!mobilePanel) return null;
    const panelContent: Record<string, React.ReactNode> = {
      furniture: (
        <div className="h-full overflow-y-auto int-scrollbar">
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto px-3 pt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCurrentCat(cat.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer transition-all whitespace-nowrap border"
                style={{ background: currentCat === cat.id ? '#C17F4E' : '#FAF8F4', color: currentCat === cat.id ? '#fff' : '#8A8478', borderColor: currentCat === cat.id ? '#C17F4E' : 'transparent' }}>
                <i className={`fas ${cat.icon} mr-0.5`} />{cat.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="px-3 py-1">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: '#E2DDD4', background: '#FAF8F4' }} />
          </div>
          {/* Items grid */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {filteredItems.map(item => (
              <button key={item.name} onClick={() => { addFurniture(item.fn, currentColor, currentMatType); setMobilePanel(null); }} className="p-2 rounded-lg border cursor-pointer transition-all text-center"
                style={{ background: '#FAF8F4', borderColor: '#E2DDD4' }}>
                <div className="w-7 h-7 rounded flex items-center justify-center mx-auto mb-1" style={{ background: '#F0E8D8' }}><i className={`fas ${item.icon} text-[9px]`} style={{ color: '#C17F4E' }} /></div>
                <p className="text-[9px] font-semibold leading-tight">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      ),
      material: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: '#8A8478' }}>Material & Color</p>
          <div className="flex gap-1 mb-2 flex-wrap">
            {(['fabric', 'leather', 'wood', 'metal'] as MatType[]).map(t => (
              <button key={t} onClick={() => setCurrentMatType(t)} className="text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-all"
                style={{ borderColor: currentMatType === t ? '#C17F4E' : '#E2DDD4', background: currentMatType === t ? 'rgba(193,127,78,0.1)' : 'transparent', color: currentMatType === t ? '#C17F4E' : '#8A8478' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matColors[currentMatType].map(c => (
              <button key={c} onClick={() => { setCurrentColor(c); if (selectedObjRef.current) applyMaterial(c, currentMatType); }} className="w-8 h-8 rounded-lg cursor-pointer transition-all border-2"
                style={{ background: c, borderColor: currentColor === c ? '#C17F4E' : 'transparent', boxShadow: currentColor === c ? '0 0 0 2px rgba(193,127,78,0.3)' : 'none' }} title={c} />
            ))}
          </div>
          {/* Wall Color */}
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] mt-3 mb-2" style={{ color: '#8A8478' }}>Wall Color</p>
          <div className="flex flex-wrap gap-1.5">
            {wallColorOptions.map(wc => (
              <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }} className="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: wc.color, borderColor: wallCol === wc.color ? '#C17F4E' : 'transparent' }} title={wc.label} />
            ))}
            <div className="relative">
              <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
              <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
          {/* Floor Color */}
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] mt-3 mb-2" style={{ color: '#8A8478' }}>Floor Color</p>
          <div className="flex flex-wrap gap-1.5">
            {floorColorOptions.map(fc => (
              <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }} className="w-8 h-8 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: fc.color, borderColor: floorColor === fc.color ? '#C17F4E' : 'transparent' }} title={fc.label} />
            ))}
            <div className="relative">
              <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
              <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>
      ),
      room: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: '#8A8478' }}>Room Settings</p>
          {[
            { label: 'Width', val: roomW, min: 4, max: 14, step: 0.5, setter: [setRoomW, (v: number) => roomWRef.current = v] },
            { label: 'Depth', val: roomD, min: 4, max: 12, step: 0.5, setter: [setRoomD, (v: number) => roomDRef.current = v] },
            { label: 'Height', val: roomH, min: 2.5, max: 5, step: 0.25, setter: [setRoomH, (v: number) => roomHRef.current = v] },
          ].map(({ label, val, min, max, step, setter }) => (
            <div key={label as string} className="mb-2">
              <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium">{label as string}</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{(val as number).toFixed(1)}m</span></div>
              <input type="range" className="int-range" min={min as number} max={max as number} value={val as number} step={step as number} onChange={e => { const v = parseFloat(e.target.value); (setter as any)[0](v); (setter as any)[1](v); updateRoomVisualPreview(roomWRef.current, roomDRef.current, roomHRef.current); debouncedBuildRoom(); markUnsaved(); }} onMouseUp={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} onTouchEnd={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} />
            </div>
          ))}
          {/* Wall Color */}
          <div className="mb-2"><span className="text-[10px] font-medium">Wall Color</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {wallColorOptions.map(wc => (
                <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }} className="w-6 h-6 rounded-md cursor-pointer border-2 transition-all"
                  style={{ background: wc.color, borderColor: wallCol === wc.color ? '#C17F4E' : 'transparent' }} title={wc.label} />
              ))}
              <div className="relative">
                <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-6 h-6" />
                <div className="w-6 h-6 rounded-md border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                  <i className="fas fa-eyedropper text-[6px] text-white drop-shadow" />
                </div>
              </div>
            </div>
          </div>
          {/* Floor Type */}
          <div className="mb-2"><span className="text-[10px] font-medium">Flooring</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {floorTypeOptions.map(ft => (
                <button key={ft.id} onClick={() => { setFloorType(ft.id); floorTypeRef.current = ft.id; buildRoom(); markUnsaved(); }} className="w-6 h-6 rounded-md cursor-pointer border-2 transition-all"
                  style={{ background: ft.color, borderColor: floorType === ft.id ? '#C17F4E' : 'transparent' }} title={ft.label} />
              ))}
            </div>
          </div>
          {/* Floor Color */}
          <div className="mb-2"><span className="text-[10px] font-medium">Floor Color</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {floorColorOptions.map(fc => (
                <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }} className="w-6 h-6 rounded-md cursor-pointer border-2 transition-all"
                  style={{ background: fc.color, borderColor: floorColor === fc.color ? '#C17F4E' : 'transparent' }} title={fc.label} />
              ))}
              <div className="relative">
                <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-6 h-6" />
                <div className="w-6 h-6 rounded-md border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                  <i className="fas fa-eyedropper text-[6px] text-white drop-shadow" />
                </div>
              </div>
            </div>
          </div>
          {/* Lighting */}
          <div><span className="text-[10px] font-medium">Lighting</span>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {lightMoodOptions.map(lm => (
                <button key={lm.id} onClick={() => { setLightMood(lm.id); lightMoodRef.current = lm.id; buildRoom(); markUnsaved(); }} className="px-2 py-1 rounded text-[9px] font-medium cursor-pointer border transition-all"
                  style={{ borderColor: lightMood === lm.id ? '#C17F4E' : '#E2DDD4', color: lightMood === lm.id ? '#C17F4E' : '#8A8478', background: lightMood === lm.id ? 'rgba(193,127,78,0.08)' : 'transparent' }}>
                  {lm.icon} {lm.label}
                </button>
              ))}
            </div>
          </div>
          {/* Ceiling Light Edit - Mobile */}
          <div className="mt-3">
            <button onClick={ceilingEditMode ? exitCeilingEditMode : enterCeilingEditMode}
              className="w-full py-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
              style={{ borderColor: ceilingEditMode ? '#C17F4E' : '#E2DDD4', color: ceilingEditMode ? '#C17F4E' : '#8A8478', background: ceilingEditMode ? 'rgba(193,127,78,0.1)' : 'transparent' }}>
              <i className="fas fa-lightbulb text-[9px]" />{ceilingEditMode ? 'Exit Light Editor' : 'Edit Ceiling Lights'}
            </button>
          </div>
        </div>
      ),
    };
    return panelContent[mobilePanel];
  };

  /* ===== DESKTOP SIDEBAR CONTENT ===== */
  const renderDesktopSidebar = () => (
    <aside className="int-scrollbar h-screen overflow-y-auto" style={{ width: sidebarOpen ? 310 : 0, minWidth: sidebarOpen ? 310 : 0, background: '#FFFFFF', borderRight: sidebarOpen ? '1px solid #E2DDD4' : 'none', overflow: sidebarOpen ? 'auto' : 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#E2DDD4' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C17F4E' }}><i className="fas fa-couch text-white text-xs" /></div>
          <div><h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Interior Studio</h1><p className="text-[10px]" style={{ color: '#8A8478' }}>3D Design Previewer</p></div>
        </div>
      </div>

      {/* Furniture Library */}
      <div className="p-4 border-b" style={{ borderColor: '#E2DDD4' }}>
        <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#8A8478' }}>Furniture Library</p>
        <div className="relative mb-2">
          <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: '#8A8478' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search furniture..." className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: '#E2DDD4', background: '#FAF8F4' }} />
        </div>
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCurrentCat(cat.id)} className="px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all whitespace-nowrap border"
              style={{ background: currentCat === cat.id ? '#C17F4E' : '#FAF8F4', color: currentCat === cat.id ? '#fff' : '#8A8478', borderColor: currentCat === cat.id ? '#C17F4E' : 'transparent' }}>
              <i className={`fas ${cat.icon} mr-0.5`} />{cat.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {filteredItems.map(item => (
            <button key={item.name} onClick={() => addFurniture(item.fn, currentColor, currentMatType)} className="p-2 rounded-lg border cursor-pointer transition-all text-left hover:-translate-y-0.5"
              style={{ background: '#FAF8F4', borderColor: '#E2DDD4' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C17F4E'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2DDD4'; }}>
              <div className="w-6 h-6 rounded flex items-center justify-center mb-1" style={{ background: '#F0E8D8' }}><i className={`fas ${item.icon} text-[9px]`} style={{ color: '#C17F4E' }} /></div>
              <p className="text-[10px] font-semibold leading-tight">{item.name}</p>
              <p className="text-[8px]" style={{ color: '#8A8478' }}>{item.desc}</p>
            </button>
          ))}
          {filteredItems.length === 0 && <p className="text-xs col-span-2 text-center py-4" style={{ color: '#8A8478' }}>No items found</p>}
        </div>
      </div>

      {/* Material & Color */}
      <div className="p-4 border-b" style={{ borderColor: '#E2DDD4' }}>
        <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#8A8478' }}>Material & Color</p>
        <div className="flex gap-1 mb-2 flex-wrap">
          {(['fabric', 'leather', 'wood', 'metal'] as MatType[]).map(t => (
            <button key={t} onClick={() => setCurrentMatType(t)} className="text-[10px] px-2 py-1 rounded-full border cursor-pointer transition-all"
              style={{ borderColor: currentMatType === t ? '#C17F4E' : '#E2DDD4', background: currentMatType === t ? 'rgba(193,127,78,0.1)' : 'transparent', color: currentMatType === t ? '#C17F4E' : '#8A8478' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {matColors[currentMatType].map(c => (
            <button key={c} onClick={() => { setCurrentColor(c); if (selectedObjRef.current) applyMaterial(c, currentMatType); }} className="w-7 h-7 rounded-lg cursor-pointer transition-all border-2"
              style={{ background: c, borderColor: currentColor === c ? '#C17F4E' : 'transparent', boxShadow: currentColor === c ? '0 0 0 2px rgba(193,127,78,0.3)' : 'none' }} title={c} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2"><span className="text-[9px]" style={{ color: '#8A8478' }}>Applied:</span><span className="text-[10px] font-semibold" style={{ color: '#C17F4E' }}>{selectedMat}</span></div>
      </div>

      {/* Room Settings */}
      <div className="p-4 border-b" style={{ borderColor: '#E2DDD4' }}>
        <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#8A8478' }}>Room Settings</p>
        {[
          { label: 'Width', val: roomW, min: 4, max: 14, step: 0.5, setter: [setRoomW, (v: number) => roomWRef.current = v] },
          { label: 'Depth', val: roomD, min: 4, max: 12, step: 0.5, setter: [setRoomD, (v: number) => roomDRef.current = v] },
          { label: 'Ceiling Height', val: roomH, min: 2.5, max: 5, step: 0.25, setter: [setRoomH, (v: number) => roomHRef.current = v] },
        ].map(({ label, val, min, max, step, setter }) => (
          <div key={label as string} className="mb-2">
            <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium">{label as string}</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{(val as number).toFixed(1)}m</span></div>
            <input type="range" className="int-range" min={min as number} max={max as number} value={val as number} step={step as number} onChange={e => { const v = parseFloat(e.target.value); (setter as any)[0](v); (setter as any)[1](v); buildRoom(); markUnsaved(); }} />
          </div>
        ))}

        {/* Wall Color */}
        <div className="mb-2"><span className="text-[10px] font-medium">Wall Color</span>
          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
            {wallColorOptions.map(wc => (
              <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: wc.color, borderColor: wallCol === wc.color ? '#C17F4E' : 'transparent' }} title={wc.label} />
            ))}
            <div className="relative">
              <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7" />
              <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Floor Type */}
        <div className="mb-2"><span className="text-[10px] font-medium">Flooring</span>
          <div className="flex gap-1.5 mt-1.5">
            {floorTypeOptions.map(ft => (
              <button key={ft.id} onClick={() => { setFloorType(ft.id); floorTypeRef.current = ft.id; buildRoom(); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: ft.color, borderColor: floorType === ft.id ? '#C17F4E' : 'transparent' }} title={ft.label} />
            ))}
          </div>
        </div>

        {/* Floor Color */}
        <div className="mb-2"><span className="text-[10px] font-medium">Floor Color</span>
          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
            {floorColorOptions.map(fc => (
              <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: fc.color, borderColor: floorColor === fc.color ? '#C17F4E' : 'transparent' }} title={fc.label} />
            ))}
            <div className="relative">
              <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7" />
              <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E2DDD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Door */}
        <div className="mb-2"><span className="text-[10px] font-medium">Door</span>
          <div className="flex gap-1 mt-1.5">
            {['none', 'back', 'left', 'right'].map(dw => (
              <button key={dw} onClick={() => { setDoorWall(dw); doorWallRef.current = dw; buildRoom(); markUnsaved(); }} className="px-2 py-1 rounded text-[9px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: doorWall === dw ? '#C17F4E' : '#E2DDD4', color: doorWall === dw ? '#C17F4E' : '#8A8478', background: doorWall === dw ? 'rgba(193,127,78,0.08)' : 'transparent' }}>
                {dw === 'none' ? 'None' : dw.charAt(0).toUpperCase() + dw.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Windows */}
        <div className="mb-2">
          <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium">Windows</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{windowCount}</span></div>
          <input type="range" className="int-range" min={1} max={3} value={windowCount} step={1} onChange={e => { const v = parseInt(e.target.value); setWindowCount(v); windowCountRef.current = v; buildRoom(); markUnsaved(); }} />
          <div className="flex gap-1 mt-1">
            {['back', 'left', 'right'].map(ww => (
              <button key={ww} onClick={() => { setWindowWall(ww); windowWallRef.current = ww; buildRoom(); markUnsaved(); }} className="px-2 py-0.5 rounded text-[9px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: windowWall === ww ? '#C17F4E' : '#E2DDD4', color: windowWall === ww ? '#C17F4E' : '#8A8478' }}>
                {ww.charAt(0).toUpperCase() + ww.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Mood */}
        <div><span className="text-[10px] font-medium">Lighting</span>
          <div className="flex gap-1.5 mt-1.5">
            {lightMoodOptions.map(lm => (
              <button key={lm.id} onClick={() => { setLightMood(lm.id); lightMoodRef.current = lm.id; buildRoom(); markUnsaved(); }} className="px-2 py-1 rounded text-[9px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: lightMood === lm.id ? '#C17F4E' : '#E2DDD4', color: lightMood === lm.id ? '#C17F4E' : '#8A8478', background: lightMood === lm.id ? 'rgba(193,127,78,0.08)' : 'transparent' }}>
                {lm.icon} {lm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ceiling Light Edit */}
        <div className="mt-3">
          <button onClick={ceilingEditMode ? exitCeilingEditMode : enterCeilingEditMode}
            className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border transition-all"
            style={{ borderColor: ceilingEditMode ? '#C17F4E' : '#E2DDD4', color: ceilingEditMode ? '#C17F4E' : '#8A8478', background: ceilingEditMode ? 'rgba(193,127,78,0.1)' : 'transparent' }}>
            <i className="fas fa-lightbulb text-[10px]" />{ceilingEditMode ? 'Exit Light Editor' : 'Edit Ceiling Lights'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[1.8px] mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#8A8478' }}>Actions</p>
        <div className="flex flex-col gap-1.5">
          <button onClick={resetRoom} className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border-none" style={{ background: '#C17F4E', color: '#fff' }}><i className="fas fa-undo text-[10px]" />Reset Room</button>
          <button onClick={takeScreenshot} className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer" style={{ background: '#FAF8F4', color: '#2D2D2D', border: '1px solid #E2DDD4' }}><i className="fas fa-camera text-[10px]" />Screenshot</button>
          <button onClick={deleteSelected} className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer" style={{ background: '#fff', color: '#c0392b', border: '1px solid #e8d0d0' }}><i className="fas fa-trash-alt text-[10px]" />Delete Selected</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-screen overflow-hidden`} style={{ background: '#F5F0E8', color: '#2D2D2D', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[['Delete', 'Remove selected'], ['D', 'Duplicate'], ['R', 'Rotate 15°'], ['Escape', 'Deselect'], ['Two fingers', 'Rotate item (mobile)']].map(([k, d]) => (
                <div key={k} className="flex justify-between"><span style={{ color: '#8A8478' }}>{d}</span><kbd className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: '#F5F0E8' }}>{k}</kbd></div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 rounded-lg text-sm font-medium cursor-pointer border" style={{ borderColor: '#E2DDD4' }}>Close</button>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowAddRoom(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Add Room</h3>
            <div className="mb-3">
              <label className="text-xs font-medium mb-1 block">Room Name</label>
              <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="e.g. Master Bedroom" className="w-full px-3 py-2 rounded-lg text-sm border" style={{ borderColor: '#E2DDD4' }} />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium mb-1 block">Room Type</label>
              <div className="flex flex-wrap gap-1.5">
                {['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining'].map(t => (
                  <button key={t} onClick={() => setNewRoomType(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all"
                    style={{ borderColor: newRoomType === t ? '#C17F4E' : '#E2DDD4', background: newRoomType === t ? 'rgba(193,127,78,0.1)' : 'transparent', color: newRoomType === t ? '#C17F4E' : '#8A8478' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addNewRoom} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none" style={{ background: '#C17F4E' }}>Add Room</button>
          </div>
        </div>
      )}

      {/* ===== DESKTOP: Sidebar + Main ===== */}
      {!isMobile && renderDesktopSidebar()}

      {/* ===== Main 3D Viewer ===== */}
      <main className={`flex-1 relative ${isMobile ? 'h-[55vh]' : ''}`} style={{ background: '#FAF8F4' }}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2DDD4' }}>
          {!isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-bars text-xs" /></button>
          )}
          <input value={designName} onChange={e => { setDesignName(e.target.value); markUnsaved(); }} className="px-2 py-1 rounded text-sm font-semibold border-none outline-none" style={{ background: 'transparent', maxWidth: isMobile ? 120 : 180, fontFamily: "'Outfit', sans-serif" }} />
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: saveStatus === 'saved' ? '#7A8B6F' : saveStatus === 'saving' ? '#C17F4E' : '#8A8478', background: saveStatus === 'saved' ? 'rgba(122,139,111,0.1)' : 'rgba(138,132,120,0.1)' }}>
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>

          {/* Room tabs */}
          <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
            {rooms.map(room => (
              <button key={room.id} onClick={() => switchRoom(room.id)} className="px-3 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-all whitespace-nowrap border"
                style={{ background: currentRoomId === room.id ? '#C17F4E' : '#FAF8F4', color: currentRoomId === room.id ? '#fff' : '#8A8478', borderColor: currentRoomId === room.id ? '#C17F4E' : '#E2DDD4' }}>
                {room.name}
              </button>
            ))}
            <button onClick={() => setShowAddRoom(true)} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#8A8478' }}><i className="fas fa-plus text-[8px]" /></button>
          </div>

          {/* Right actions */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              <button onClick={() => setSnapToGrid(!snapToGrid)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: snapToGrid ? '#C17F4E' : '#E2DDD4', color: snapToGrid ? '#C17F4E' : '#8A8478' }} title="Snap to Grid"><i className="fas fa-th text-[9px]" /></button>
              <button onClick={shareRoom} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} title="Share"><i className="fas fa-share-alt text-[9px]" /></button>
              <button onClick={() => setShowShortcuts(true)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} title="Shortcuts"><i className="fas fa-keyboard text-[9px]" /></button>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#F0E8D8', color: '#8A8478' }}>{itemCount} items</span>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: ceilingEditMode ? 'crosshair' : 'grab', paddingTop: 44 }} />

        {/* Ceiling Edit Mode Floating Panel */}
        {ceilingEditMode && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 rounded-xl p-3 border" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: '#C17F4E', minWidth: 280 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(193,127,78,0.15)' }}><i className="fas fa-lightbulb text-[10px]" style={{ color: '#C17F4E' }} /></div>
                <h3 className="text-xs font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#C17F4E' }}>Ceiling Light Editor</h3>
              </div>
              <button onClick={exitCeilingEditMode} className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-times text-[9px]" /></button>
            </div>
            <div className="flex gap-1.5 mb-2">
              <button onClick={addCeilingLight} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: '#C17F4E', color: '#fff', border: 'none' }}>
                <i className="fas fa-plus text-[8px]" />Add Light
              </button>
              <button onClick={deleteSelectedCeilingLight} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: '#fff', color: selectedCeilingLightIdx >= 0 ? '#c0392b' : '#8A8478', border: `1px solid ${selectedCeilingLightIdx >= 0 ? '#e8d0d0' : '#E2DDD4'}` }} disabled={selectedCeilingLightIdx < 0}>
                <i className="fas fa-trash-alt text-[8px]" />Delete
              </button>
            </div>
            {selectedCeilingLightIdx >= 0 && (
              <div className="p-2 rounded-lg mb-1" style={{ background: '#FAF8F4' }}>
                <p className="text-[9px] font-bold mb-1" style={{ color: '#8A8478' }}>LIGHT #{selectedCeilingLightIdx + 1} POSITION</p>
                <div className="mb-1">
                  <div className="flex justify-between"><span className="text-[9px]">X</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{selectedLightX.toFixed(2)}m</span></div>
                  <input type="range" className="int-range" min={-roomW / 2 + 0.2} max={roomW / 2 - 0.2} step={0.1}
                    value={selectedLightX}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      const idx = selectedCeilingLightIdx;
                      if (idx >= 0 && idx < ceilingSpotPositionsRef.current.length) {
                        ceilingSpotPositionsRef.current[idx].x = v;
                        setSelectedLightX(v);
                        const roomGroup = roomGroupRef.current;
                        if (roomGroup) {
                          const spot = roomGroup.getObjectByName(`ceilingSpot_${idx}`);
                          if (spot) { spot.position.x = v; markSceneDirty(); }
                        }
                        markUnsaved();
                      }
                    }} />
                </div>
                <div>
                  <div className="flex justify-between"><span className="text-[9px]">Z</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{selectedLightZ.toFixed(2)}m</span></div>
                  <input type="range" className="int-range" min={-roomD / 2 + 0.2} max={roomD / 2 - 0.2} step={0.1}
                    value={selectedLightZ}
                    onChange={e => {
                      const v = parseFloat(e.target.value);
                      const idx = selectedCeilingLightIdx;
                      if (idx >= 0 && idx < ceilingSpotPositionsRef.current.length) {
                        ceilingSpotPositionsRef.current[idx].z = v;
                        setSelectedLightZ(v);
                        const roomGroup = roomGroupRef.current;
                        if (roomGroup) {
                          const spot = roomGroup.getObjectByName(`ceilingSpot_${idx}`);
                          if (spot) { spot.position.z = v; markSceneDirty(); }
                        }
                        markUnsaved();
                      }
                    }} />
                </div>
              </div>
            )}
            <p className="text-[8px] text-center" style={{ color: '#8A8478' }}>
              {selectedCeilingLightIdx >= 0 ? 'Drag light or use sliders to reposition' : 'Click ceiling to add • Click light to select'}
            </p>
          </div>
        )}

        {/* View controls - Desktop */}
        {!isMobile && (
          <div className="absolute bottom-5 right-5 flex gap-1.5 z-10">
            {[
              { id: 'top', icon: 'fa-border-all', pos: [0, 10, 0.01] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
              { id: 'front', icon: 'fa-square', pos: [0, 2, roomDRef.current] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
              { id: 'persp', icon: 'fa-cube', pos: [7, 6, 9] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
            ].map(v => (
              <button key={v.id} onClick={() => animateCamera(v.pos, v.target)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: '#E2DDD4', fontSize: 11 }}><i className={`fas ${v.icon}`} /></button>
            ))}
            <button onClick={() => { autoRotateRef.current = !autoRotateRef.current; setAutoRotActive(autoRotateRef.current); if (controlsRef.current) { controlsRef.current.autoRotate = autoRotateRef.current; controlsRef.current.autoRotateSpeed = 1.5; } }}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: autoRotActive ? '#C17F4E' : '#E2DDD4', color: autoRotActive ? '#C17F4E' : '#2D2D2D', fontSize: 11 }}><i className="fas fa-sync-alt" /></button>
          </div>
        )}

        {/* Selected item panel */}
        {itemPanelVisible && (
          <div className={`absolute z-10 rounded-xl p-3 border ${isMobile ? 'bottom-2 left-2 right-2' : 'bottom-5 left-5'}`} style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#E2DDD4', minWidth: isMobile ? 'auto' : 200 }}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedName}</h4>
              <button onClick={deselectAll} className="text-xs cursor-pointer" style={{ color: '#8A8478' }}><i className="fas fa-times" /></button>
            </div>
            <p className="text-[10px]" style={{ color: '#8A8478' }}>{selectedDesc}</p>
            <div className="flex gap-1.5 mt-2">
              <button onClick={() => rotateSelected('left')} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Rotate Left"><i className="fas fa-undo" /></button>
              <button onClick={() => rotateSelected('right')} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Rotate Right"><i className="fas fa-redo" /></button>
              <button onClick={duplicateSelected} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Duplicate"><i className="fas fa-clone" /></button>
              <button onClick={deleteSelected} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#e8d0d0', color: '#c0392b', fontSize: 10 }} title="Delete"><i className="fas fa-trash-alt" /></button>
            </div>
            {isMobile && (
              <p className="text-[9px] mt-1.5" style={{ color: '#8A8478' }}><i className="fas fa-hand-pointer mr-1" />Tap item to select. Use two fingers to rotate.</p>
            )}
          </div>
        )}

        {/* Mobile: two-finger rotate hint */}
        {isMobile && selectedObjRef.current && !itemPanelVisible && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10 }}>
            <i className="fas fa-hand-pointer mr-1" />Tap to select &bull; Two fingers to rotate
          </div>
        )}
      </main>

      {/* ===== MOBILE: Bottom Edit Panel ===== */}
      {isMobile && (
        <div className="h-[45vh] bg-white border-t flex flex-col" style={{ borderColor: '#E2DDD4' }}>
          {/* Tab bar */}
          <div className="flex border-b" style={{ borderColor: '#E2DDD4' }}>
            <button onClick={() => setMobilePanel(mobilePanel === 'furniture' ? null : 'furniture')}
              className={`flex-1 py-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${mobilePanel === 'furniture' ? 'border-b-2' : ''}`}
              style={{ color: mobilePanel === 'furniture' ? '#C17F4E' : '#8A8478', borderColor: mobilePanel === 'furniture' ? '#C17F4E' : 'transparent', background: mobilePanel === 'furniture' ? 'rgba(193,127,78,0.05)' : 'transparent' }}>
              <i className="fas fa-couch" />Furniture
            </button>
            <button onClick={() => setMobilePanel(mobilePanel === 'material' ? null : 'material')}
              className={`flex-1 py-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${mobilePanel === 'material' ? 'border-b-2' : ''}`}
              style={{ color: mobilePanel === 'material' ? '#C17F4E' : '#8A8478', borderColor: mobilePanel === 'material' ? '#C17F4E' : 'transparent', background: mobilePanel === 'material' ? 'rgba(193,127,78,0.05)' : 'transparent' }}>
              <i className="fas fa-palette" />Colors
            </button>
            <button onClick={() => setMobilePanel(mobilePanel === 'room' ? null : 'room')}
              className={`flex-1 py-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${mobilePanel === 'room' ? 'border-b-2' : ''}`}
              style={{ color: mobilePanel === 'room' ? '#C17F4E' : '#8A8478', borderColor: mobilePanel === 'room' ? '#C17F4E' : 'transparent', background: mobilePanel === 'room' ? 'rgba(193,127,78,0.05)' : 'transparent' }}>
              <i className="fas fa-sliders-h" />Room
            </button>
            <button onClick={takeScreenshot}
              className="flex-1 py-2.5 text-[10px] font-semibold flex items-center justify-center gap-1"
              style={{ color: '#8A8478' }}>
              <i className="fas fa-camera" />Capture
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {mobilePanel ? renderMobilePanel() : (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#F0E8D8' }}>
                  <i className="fas fa-hand-pointer text-lg" style={{ color: '#C17F4E' }} />
                </div>
                <p className="text-xs font-semibold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Tap a tab to start editing</p>
                <p className="text-[10px]" style={{ color: '#8A8478' }}>Add furniture, change colors, or adjust room settings</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={resetRoom} className="px-4 py-2 rounded-lg text-[10px] font-semibold cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#8A8478' }}>
                    <i className="fas fa-undo mr-1" />Reset
                  </button>
                  <button onClick={() => setShowAddRoom(true)} className="px-4 py-2 rounded-lg text-[10px] font-semibold cursor-pointer border" style={{ borderColor: '#C17F4E', color: '#C17F4E' }}>
                    <i className="fas fa-plus mr-1" />Add Room
                  </button>
                </div>
                <p className="text-[9px] mt-3" style={{ color: '#8A8478' }}>{itemCount} items placed &bull; <i className="fas fa-hand-pointer mr-0.5" />Tap item in 3D view to select &bull; Two fingers to rotate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <div className="fixed z-[1000] pointer-events-none" style={{ bottom: isMobile ? '47vh' : 24, left: '50%', transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)', opacity: toastVisible ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#333', color: '#fff' }}>{toastMsg}</div>
      </div>
    </div>
  );
}

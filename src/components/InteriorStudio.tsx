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

/* ===== FLOOR TEXTURE GENERATORS ===== */
function makeHardwoodTexture(w: number, d: number): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#B8956A'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * 512;
    ctx.strokeStyle = `rgba(90,60,30,${Math.random() * 0.12})`; ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x < 512; x += 15) ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * 4);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 64) {
    ctx.strokeStyle = 'rgba(60,40,20,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
  return t;
}

function makeMarbleTexture(w: number, d: number): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#F0EDE8'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(160,150,140,${Math.random() * 0.15 + 0.03})`; ctx.lineWidth = Math.random() * 1.5 + 0.3;
    ctx.beginPath(); const sy = Math.random() * 512;
    ctx.moveTo(0, sy);
    for (let x = 0; x < 512; x += 10) ctx.lineTo(x, sy + Math.sin(x * 0.02 + i * 0.5) * (10 + Math.random() * 15));
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 3, d / 3);
  return t;
}

function makeConcreteTexture(w: number, d: number): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#B8B4B0'; ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512; const y = Math.random() * 512;
    ctx.fillStyle = `rgba(${130 + Math.random() * 30},${125 + Math.random() * 30},${120 + Math.random() * 30},${Math.random() * 0.15})`;
    ctx.fillRect(x, y, Math.random() * 3, Math.random() * 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
  return t;
}

function makeCarpetTexture(w: number, d: number, color = '#B8A898'): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(${150 + Math.random() * 50},${140 + Math.random() * 50},${130 + Math.random() * 50},${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
  return t;
}

function makeTileTexture(w: number, d: number): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#E8E4E0'; ctx.fillRect(0, 0, 512, 512);
  const tileSize = 64;
  ctx.strokeStyle = 'rgba(180,170,160,0.4)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += tileSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let y = 0; y <= 512; y += tileSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(${200 + Math.random() * 40},${195 + Math.random() * 40},${190 + Math.random() * 40},${Math.random() * 0.05})`;
    const tx = Math.floor(Math.random() * 8) * tileSize; const ty = Math.floor(Math.random() * 8) * tileSize;
    ctx.fillRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2, d / 2);
  return t;
}

/* ===== LIGHTING MOODS ===== */
const lightMoods: Record<string, { bg: number; fog: number; ambient: [number, number]; dir: [number, number]; exposure: number }> = {
  daylight: { bg: 0xF5F0E8, fog: 0xF5F0E8, ambient: [0xFFE8D0, 0.5], dir: [0xFFF0D8, 1.8], exposure: 1.1 },
  golden: { bg: 0xF0E0C8, fog: 0xF0E0C8, ambient: [0xFFD8A0, 0.6], dir: [0xFFE0A0, 2.0], exposure: 1.2 },
  evening: { bg: 0xD8C8B0, fog: 0xD8C8B0, ambient: [0xFFC880, 0.35], dir: [0xFFE8C0, 1.0], exposure: 0.9 },
  night: { bg: 0x2A2825, fog: 0x2A2825, ambient: [0xFFE0A0, 0.12], dir: [0xFFE0A0, 0.3], exposure: 0.6 },
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
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<Array<{ type: string; data: FurnitureData | null; item: THREE.Group | null; oldPos?: THREE.Vector3; oldRot?: number }>>([]);
  const historyIdxRef = useRef(-1);

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
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [designName, setDesignName] = useState('Untitled Room');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [itemCount, setItemCount] = useState(0);
  const [rooms, setRooms] = useState<RoomInfo[]>([{ id: 'default', name: 'Living Room', roomType: 'living' }]);
  const [currentRoomId, setCurrentRoomId] = useState('default');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');

  // Refs for Three.js callbacks
  const roomWRef = useRef(8); const roomDRef = useRef(6); const roomHRef = useRef(3);
  const wallColRef = useRef('#FAF8F4'); const floorTypeRef = useRef('hardwood');
  const doorWallRef = useRef('none'); const windowCountRef = useRef(1);
  const windowWallRef = useRef('back'); const lightMoodRef = useRef('daylight');
  const snapToGridRef = useRef(false);
  const roomStatesRef = useRef<Map<string, FurnitureData[]>>(new Map());

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
    // Clear current
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); }
      });
    });
    placedItemsRef.current = [];
    selectedObjRef.current = null;
    setItemPanelVisible(false);

    // Add each item
    data.forEach(d => {
      const fn = builders[d.fn];
      if (!fn) return;
      const item = fn(d.matColor, d.matType as MatType, roomHRef.current);
      item.position.set(d.position.x, d.position.y, d.position.z);
      item.rotation.y = d.rotation;
      item.userData.fn = d.fn;
      sceneRef.current?.add(item);
      placedItemsRef.current.push(item);
    });
    setItemCount(placedItemsRef.current.length);
  }, []);

  /* ===== BUILD ROOM ===== */
  const buildRoom = useCallback(() => {
    const roomGroup = roomGroupRef.current;
    const scene = sceneRef.current;
    if (!roomGroup || !scene) return;
    while (roomGroup.children.length) roomGroup.remove(roomGroup.children[0]);

    const w = roomWRef.current, d = roomDRef.current, h = roomHRef.current;
    const wc = wallColRef.current, ft = floorTypeRef.current;
    const dw = doorWallRef.current, wcnt = windowCountRef.current, wwall = windowWallRef.current;
    const mood = lightMoodRef.current;

    // Floor texture
    let floorTex: THREE.CanvasTexture;
    let floorRoughness = 0.65;
    switch (ft) {
      case 'marble': floorTex = makeMarbleTexture(w, d); floorRoughness = 0.2; break;
      case 'concrete': floorTex = makeConcreteTexture(w, d); floorRoughness = 0.85; break;
      case 'carpet': floorTex = makeCarpetTexture(w, d); floorRoughness = 0.95; break;
      case 'tile': floorTex = makeTileTexture(w, d); floorRoughness = 0.5; break;
      default: floorTex = makeHardwoodTexture(w, d);
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: floorTex, roughness: floorRoughness, metalness: 0 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor'; roomGroup.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, metalness: 0 });
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); bw.position.set(0, h / 2, -d / 2); bw.receiveShadow = true; roomGroup.add(bw);
    const lw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone()); lw.position.set(-w / 2, h / 2, 0); lw.rotation.y = Math.PI / 2; lw.receiveShadow = true; roomGroup.add(lw);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat.clone()); rw.position.set(w / 2, h / 2, 0); rw.rotation.y = -Math.PI / 2; rw.receiveShadow = true; roomGroup.add(rw);
    const fw = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: wc, roughness: 0.9, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
    fw.position.set(0, h / 2, d / 2); fw.rotation.y = Math.PI; roomGroup.add(fw);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: 0xFFFFF8, roughness: 1 }));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = h; roomGroup.add(ceil);

    // Baseboards
    const bbMat = new THREE.MeshStandardMaterial({ color: 0xF0E8D8, roughness: 0.7 }); const bbH = 0.08;
    roomGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(w, bbH, 0.02), bbMat), { position: new THREE.Vector3(0, bbH / 2, -d / 2 + 0.01) }));
    roomGroup.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.02, bbH, d), bbMat), { position: new THREE.Vector3(-w / 2 + 0.01, bbH / 2, 0) }));

    // Windows
    const addWindow = (wall: string, offset: number) => {
      const winW = Math.min(w * 0.3, 2.2), winH = Math.min(h * 0.45, 1.6);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06), new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 }));
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshStandardMaterial({ color: 0xC8DDE8, emissive: 0x8AB8D0, emissiveIntensity: mood === 'night' ? 0.1 : 0.4, roughness: 0.1, metalness: 0.1 }));
      const crossMat = new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.5 });
      const cv = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.08), crossMat);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.08), crossMat);

      if (wall === 'back') {
        const xOff = wcnt === 1 ? w * 0.15 : (wcnt === 2 ? offset * (w * 0.3) : offset * (w * 0.25));
        frame.position.set(xOff, h * 0.55, -d / 2 + 0.02);
        glass.position.set(xOff, h * 0.55, -d / 2 + 0.04);
        cv.position.copy(glass.position).z += 0.01; ch.position.copy(glass.position).z += 0.01;
      } else if (wall === 'left') {
        const zOff = wcnt === 1 ? 0 : offset * (d * 0.3);
        frame.position.set(-w / 2 + 0.02, h * 0.55, zOff); frame.rotation.y = Math.PI / 2;
        glass.position.set(-w / 2 + 0.04, h * 0.55, zOff); glass.rotation.y = Math.PI / 2;
        cv.position.copy(glass.position).x += 0.01; ch.position.copy(glass.position).x += 0.01;
      } else {
        const zOff = wcnt === 1 ? 0 : offset * (d * 0.3);
        frame.position.set(w / 2 - 0.02, h * 0.55, zOff); frame.rotation.y = -Math.PI / 2;
        glass.position.set(w / 2 - 0.04, h * 0.55, zOff); glass.rotation.y = -Math.PI / 2;
        cv.position.copy(glass.position).x -= 0.01; ch.position.copy(glass.position).x -= 0.01;
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

    // Ceiling spots
    for (let x = -1; x <= 1; x += 2) {
      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 }));
      spot.position.set(x * 1.5, h - 0.015, 0); roomGroup.add(spot);
      const spotLight = new THREE.PointLight(mood === 'night' ? 0xFFE8C0 : 0xFFEED0, mood === 'night' ? 0.1 : 0.4, 8);
      spotLight.position.set(x * 1.5, h - 0.1, 0); roomGroup.add(spotLight);
    }

    // Grid helper
    const gridHelper = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 2, 0xCCBBAA, 0xDDD4C8);
    gridHelper.position.y = 0.002;
    (gridHelper.material as THREE.Material).opacity = 0.25; (gridHelper.material as THREE.Material).transparent = true;
    roomGroup.add(gridHelper);

    // Update scene lighting based on mood
    const moodData = lightMoods[mood] || lightMoods.daylight;
    scene.background = new THREE.Color(moodData.bg);
    scene.fog = new THREE.FogExp2(moodData.fog, 0.018);
    if (rendererRef.current) rendererRef.current.toneMappingExposure = moodData.exposure;
  }, []);

  /* ===== SELECT / DESELECT ===== */
  const selectItem = useCallback((obj: THREE.Group) => {
    if (selectedObjRef.current) {
      selectedObjRef.current.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive); });
    }
    selectedObjRef.current = obj;
    obj.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial).emissive) { const mat = c.material as THREE.MeshStandardMaterial; mat._origEmissive = mat.emissive.getHex(); mat.emissive.setHex(0x443322); } });
    setSelectedName(obj.userData.name || ''); setSelectedDesc(obj.userData.desc || ''); setSelectedMat(`${obj.userData.matType} — ${obj.userData.matColor}`);
    setItemPanelVisible(true);
  }, []);

  const deselectAll = useCallback(() => {
    if (selectedObjRef.current) { selectedObjRef.current.traverse(c => { if (c instanceof THREE.Mesh && c.material && (c.material as THREE.MeshStandardMaterial)._origEmissive !== undefined) (c.material as THREE.MeshStandardMaterial).emissive.setHex((c.material as THREE.MeshStandardMaterial)._origEmissive); }); }
    selectedObjRef.current = null; setItemPanelVisible(false); setSelectedMat('—');
  }, []);

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
    setSaveStatus('unsaved');
    showToast(`Added ${item.userData.name}`);
    return item;
  }, [selectItem, showToast]);

  const deleteSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    const name = selected.userData.name;
    sceneRef.current?.remove(selected); placedItemsRef.current = placedItemsRef.current.filter(i => i !== selected);
    selected.traverse(c => { if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); } });
    selectedObjRef.current = null; setItemPanelVisible(false); setItemCount(placedItemsRef.current.length);
    setSaveStatus('unsaved'); showToast(`Removed ${name}`);
  }, [showToast]);

  const duplicateSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    const d = selected.userData;
    const fn = builders[d.fn || '']; if (!fn) return;
    const item = fn(d.matColor, d.matType, roomHRef.current);
    item.position.copy(selected.position).add(new THREE.Vector3(0.5, 0, 0.5));
    item.rotation.y = selected.rotation.y; item.userData.fn = d.fn;
    sceneRef.current?.add(item); placedItemsRef.current.push(item);
    selectItem(item); setItemCount(placedItemsRef.current.length);
    setSaveStatus('unsaved'); showToast(`Duplicated ${d.name}`);
  }, [selectItem, showToast]);

  const applyMaterial = useCallback((color: string, type: MatType) => {
    const selected = selectedObjRef.current; if (!selected) { showToast('Select an item first'); return; }
    const newMat = makeMat(color, type); let idx = 0;
    selected.traverse(c => {
      if (c instanceof THREE.Mesh && c.material && !(c.material as any)._isLeg && !(c.material as any)._isStruct) {
        const m = newMat.clone(); if (idx > 0) m.color.offsetHSL(0, 0, (idx % 3) * 0.02);
        (m as any)._origEmissive = m.emissive ? m.emissive.getHex() : 0; m.emissive.setHex(0x443322);
        c.material.dispose(); c.material = m; idx++;
      }
    });
    selected.userData.matColor = color; selected.userData.matType = type;
    setSelectedMat(`${type} — ${color}`); setSaveStatus('unsaved');
  }, [showToast]);

  const findParentFurniture = useCallback((obj: THREE.Object3D): THREE.Group | null => {
    let current: THREE.Object3D | null = obj;
    while (current) { if (current.userData && current.userData.isFurniture) return current as THREE.Group; current = current.parent; }
    return null;
  }, []);

  /* ===== CAMERA ===== */
  const animateCamera = useCallback((pos: [number, number, number], target: [number, number, number], dur = 800) => {
    const camera = cameraRef.current, ctrl = controlsRef.current; if (!camera || !ctrl) return;
    const startPos = camera.position.clone(), startTarget = ctrl.target.clone();
    const endPos = new THREE.Vector3(...pos), endTarget = new THREE.Vector3(...target);
    const startTime = performance.now();
    function step() { const t = Math.min(1, (performance.now() - startTime) / dur); const ease = 1 - Math.pow(1 - t, 3); camera.position.lerpVectors(startPos, endPos, ease); ctrl.target.lerpVectors(startTarget, endTarget, ease); ctrl.update(); if (t < 1) requestAnimationFrame(step); }
    step();
  }, []);

  /* ===== ROOM SWITCHING ===== */
  const switchRoom = useCallback((roomId: string) => {
    // Save current room state
    roomStatesRef.current.set(currentRoomId, serializeFurniture());
    // Load new room
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

    // Save current, switch to new
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
    setItemCount(placedItemsRef.current.length); deselectAll();
  }, [deselectAll]);

  /* ===== THREE.JS INIT ===== */
  useEffect(() => {
    // Mobile detection
    if (window.innerWidth < 768) setShowMobileWarning(true);

    const canvas = canvasRef.current; if (!canvas) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xF5F0E8); scene.fog = new THREE.FogExp2(0xF5F0E8, 0.018); sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.set(7, 6, 9); cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.outputColorSpace = THREE.SRGBColorSpace; rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.maxPolarAngle = Math.PI * 0.48; controls.minDistance = 2; controls.maxDistance = 22; controls.target.set(0, 1, 0); controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xFFE8D0, 0.5)); scene.add(new THREE.HemisphereLight(0xFFF5E6, 0x8B7355, 0.4));
    const dirLight = new THREE.DirectionalLight(0xFFF0D8, 1.8); dirLight.position.set(4, 8, 5); dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048); dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10; dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10; dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 30; dirLight.shadow.bias = -0.001; dirLight.shadow.radius = 4; scene.add(dirLight);
    scene.add(new THREE.DirectionalLight(0xE0E8F0, 0.3).translateX(-4).translateY(5).translateZ(-3));

    const roomGroup = new THREE.Group(); scene.add(roomGroup); roomGroupRef.current = roomGroup;
    buildRoom(); setTimeout(() => addDefaultFurniture(), 100);

    const onResize = () => { const p = canvas.parentElement; if (!p) return; renderer.setSize(p.clientWidth, p.clientHeight); camera.aspect = p.clientWidth / p.clientHeight; camera.updateProjectionMatrix(); };
    onResize(); window.addEventListener('resize', onResize);

    const getMeshes = (): THREE.Mesh[] => { const m: THREE.Mesh[] = []; placedItemsRef.current.forEach(g => g.traverse(c => { if (c instanceof THREE.Mesh) m.push(c); })); return m; };
    const onPointerDown = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointerRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1; raycasterRef.current.setFromCamera(pointerRef.current, camera); const hits = raycasterRef.current.intersectObjects(getMeshes(), false); if (hits.length > 0) { const f = findParentFurniture(hits[0].object); if (f) { selectItem(f); dragItemRef.current = f; isDragRef.current = true; controls.enabled = false; raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current); dragOffsetRef.current.copy(intersectionRef.current).sub(f.position); dragOffsetRef.current.y = 0; canvas.style.cursor = 'move'; } } else { deselectAll(); } };
    const onPointerMove = (e: PointerEvent) => { if (!isDragRef.current || !dragItemRef.current) return; const r = canvas.getBoundingClientRect(); pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointerRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1; raycasterRef.current.setFromCamera(pointerRef.current, camera); if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current)) { const np = intersectionRef.current.sub(dragOffsetRef.current); const hw = roomWRef.current / 2 - 0.3, hd = roomDRef.current / 2 - 0.3; let nx = Math.max(-hw, Math.min(hw, np.x)), nz = Math.max(-hd, Math.min(hd, np.z)); if (snapToGridRef.current) { nx = Math.round(nx * 2) / 2; nz = Math.round(nz * 2) / 2; } dragItemRef.current.position.x = nx; dragItemRef.current.position.z = nz; setSaveStatus('unsaved'); } };
    const onPointerUp = () => { isDragRef.current = false; dragItemRef.current = null; controls.enabled = true; canvas.style.cursor = 'grab'; };

    canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointermove', onPointerMove); canvas.addEventListener('pointerup', onPointerUp);

    // Keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (e.key === 'd' || e.key === 'D') { if (!e.ctrlKey && !e.metaKey) duplicateSelected(); }
      else if (e.key === 'r' || e.key === 'R') { if (!e.ctrlKey && !e.metaKey && selectedObjRef.current) { selectedObjRef.current.rotation.y += Math.PI / 12; setSaveStatus('unsaved'); } }
      else if (e.key === 'Escape') deselectAll();
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); /* undo */ }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); /* redo */ }
    };
    window.addEventListener('keydown', onKeyDown);

    const animate = () => { animFrameRef.current = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();

    // Auto-save timer
    autoSaveTimerRef.current = setInterval(() => {
      if (saveStatus === 'unsaved') { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 1000); }
    }, 60000);

    return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener('resize', onResize); canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerup', onPointerUp); window.removeEventListener('keydown', onKeyDown); renderer.dispose(); if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, []);

  // Resize on sidebar toggle
  useEffect(() => { const t = setTimeout(() => { const c = canvasRef.current, r = rendererRef.current, cam = cameraRef.current, p = c?.parentElement; if (c && r && cam && p) { r.setSize(p.clientWidth, p.clientHeight); cam.aspect = p.clientWidth / p.clientHeight; cam.updateProjectionMatrix(); } }, 420); return () => clearTimeout(t); }, [sidebarOpen]);

  const resetRoom = useCallback(() => {
    placedItemsRef.current.forEach(item => { sceneRef.current?.remove(item); item.traverse(c => { if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); } }); });
    placedItemsRef.current = []; selectedObjRef.current = null; setItemPanelVisible(false);
    roomWRef.current = 8; roomDRef.current = 6; roomHRef.current = 3; wallColRef.current = '#FAF8F4'; floorTypeRef.current = 'hardwood'; doorWallRef.current = 'none'; windowCountRef.current = 1; windowWallRef.current = 'back'; lightMoodRef.current = 'daylight';
    setRoomW(8); setRoomD(6); setRoomH(3); setWallCol('#FAF8F4'); setFloorType('hardwood'); setDoorWall('none'); setWindowCount(1); setWindowWall('back'); setLightMood('daylight');
    buildRoom(); addDefaultFurniture(); showToast('Room reset');
  }, [buildRoom, addDefaultFurniture, showToast]);

  const takeScreenshot = useCallback(() => {
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current; if (!r || !s || !c) return;
    r.render(s, c); const link = document.createElement('a'); link.download = `${designName.replace(/\s+/g, '_')}.png`; link.href = r.domElement.toDataURL('image/png'); link.click(); showToast('Screenshot saved');
  }, [showToast, designName]);

  const rotateSelected = useCallback((dir: 'left' | 'right') => { if (selectedObjRef.current) { selectedObjRef.current.rotation.y += dir === 'left' ? Math.PI / 12 : -Math.PI / 12; setSaveStatus('unsaved'); } }, []);

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F0E8', color: '#2D2D2D', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      {/* Mobile Warning */}
      {showMobileWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F0E8D8' }}>
              <i className="fas fa-desktop text-xl" style={{ color: '#C17F4E' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Best on Desktop</h3>
            <p className="text-sm mb-4" style={{ color: '#8A8478' }}>Interior Studio is optimized for desktop browsers. For the full 3D editing experience, please use a desktop.</p>
            <button onClick={() => setShowMobileWarning(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none" style={{ background: '#C17F4E' }}>Continue anyway</button>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[['Delete', 'Remove selected'], ['D', 'Duplicate'], ['R', 'Rotate 15°'], ['Escape', 'Deselect'], ['Ctrl+Z', 'Undo'], ['Ctrl+Y', 'Redo']].map(([k, d]) => (
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

      {/* Sidebar */}
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
          {/* Search */}
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
            { label: 'Width', val: roomW, min: 4, max: 14, step: 0.5, setter: [setRoomW, v => roomWRef.current = v] },
            { label: 'Depth', val: roomD, min: 4, max: 12, step: 0.5, setter: [setRoomD, v => roomDRef.current = v] },
            { label: 'Ceiling Height', val: roomH, min: 2.5, max: 5, step: 0.25, setter: [setRoomH, v => roomHRef.current = v] },
          ].map(({ label, val, min, max, step, setter }) => (
            <div key={label} className="mb-2">
              <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium">{label}</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{val.toFixed(1)}m</span></div>
              <input type="range" className="int-range" min={min} max={max} value={val} step={step} onChange={e => { const v = parseFloat(e.target.value); setter[0](v); setter[1](v); buildRoom(); setSaveStatus('unsaved'); }} />
            </div>
          ))}

          {/* Wall Color */}
          <div className="mb-2"><span className="text-[10px] font-medium">Wall Color</span>
            <div className="flex gap-1.5 mt-1.5">
              {wallColorOptions.map(wc => (
                <button key={wc.color} onClick={() => { setWallCol(wc.color); wallColRef.current = wc.color; buildRoom(); setSaveStatus('unsaved'); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                  style={{ background: wc.color, borderColor: wallCol === wc.color ? '#C17F4E' : 'transparent' }} title={wc.label} />
              ))}
            </div>
          </div>

          {/* Floor Type */}
          <div className="mb-2"><span className="text-[10px] font-medium">Flooring</span>
            <div className="flex gap-1.5 mt-1.5">
              {floorTypeOptions.map(ft => (
                <button key={ft.id} onClick={() => { setFloorType(ft.id); floorTypeRef.current = ft.id; buildRoom(); setSaveStatus('unsaved'); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                  style={{ background: ft.color, borderColor: floorType === ft.id ? '#C17F4E' : 'transparent' }} title={ft.label} />
              ))}
            </div>
          </div>

          {/* Door */}
          <div className="mb-2"><span className="text-[10px] font-medium">Door</span>
            <div className="flex gap-1 mt-1.5">
              {['none', 'back', 'left', 'right'].map(dw => (
                <button key={dw} onClick={() => { setDoorWall(dw); doorWallRef.current = dw; buildRoom(); setSaveStatus('unsaved'); }} className="px-2 py-1 rounded text-[9px] font-medium cursor-pointer border transition-all"
                  style={{ borderColor: doorWall === dw ? '#C17F4E' : '#E2DDD4', color: doorWall === dw ? '#C17F4E' : '#8A8478', background: doorWall === dw ? 'rgba(193,127,78,0.08)' : 'transparent' }}>
                  {dw === 'none' ? 'None' : dw.charAt(0).toUpperCase() + dw.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Windows */}
          <div className="mb-2">
            <div className="flex justify-between mb-0.5"><span className="text-[10px] font-medium">Windows</span><span className="text-[9px]" style={{ color: '#8A8478' }}>{windowCount}</span></div>
            <input type="range" className="int-range" min={1} max={3} value={windowCount} step={1} onChange={e => { const v = parseInt(e.target.value); setWindowCount(v); windowCountRef.current = v; buildRoom(); setSaveStatus('unsaved'); }} />
            <div className="flex gap-1 mt-1">
              {['back', 'left', 'right'].map(ww => (
                <button key={ww} onClick={() => { setWindowWall(ww); windowWallRef.current = ww; buildRoom(); setSaveStatus('unsaved'); }} className="px-2 py-0.5 rounded text-[9px] font-medium cursor-pointer border transition-all"
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
                <button key={lm.id} onClick={() => { setLightMood(lm.id); lightMoodRef.current = lm.id; buildRoom(); setSaveStatus('unsaved'); }} className="px-2 py-1 rounded text-[9px] font-medium cursor-pointer border transition-all"
                  style={{ borderColor: lightMood === lm.id ? '#C17F4E' : '#E2DDD4', color: lightMood === lm.id ? '#C17F4E' : '#8A8478', background: lightMood === lm.id ? 'rgba(193,127,78,0.08)' : 'transparent' }}>
                  {lm.icon} {lm.label}
                </button>
              ))}
            </div>
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

      {/* Main Viewer */}
      <main className="flex-1 relative" style={{ background: '#FAF8F4' }}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E2DDD4' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-bars text-xs" /></button>
          <input value={designName} onChange={e => { setDesignName(e.target.value); setSaveStatus('unsaved'); }} className="px-2 py-1 rounded text-sm font-semibold border-none outline-none" style={{ background: 'transparent', maxWidth: 180, fontFamily: "'Outfit', sans-serif" }} />
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
          <div className="flex items-center gap-1">
            <button onClick={() => setSnapToGrid(!snapToGrid)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: snapToGrid ? '#C17F4E' : '#E2DDD4', color: snapToGrid ? '#C17F4E' : '#8A8478' }} title="Snap to Grid"><i className="fas fa-th text-[9px]" /></button>
            <button onClick={shareRoom} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} title="Share"><i className="fas fa-share-alt text-[9px]" /></button>
            <button onClick={() => setShowShortcuts(true)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} title="Shortcuts"><i className="fas fa-keyboard text-[9px]" /></button>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#F0E8D8', color: '#8A8478' }}>{itemCount} items</span>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab', paddingTop: 44 }} />

        {/* View controls */}
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

        {/* Selected item panel */}
        {itemPanelVisible && (
          <div className="absolute bottom-5 left-5 z-10 rounded-xl p-3 border" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#E2DDD4', minWidth: 200 }}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedName}</h4>
              <button onClick={deselectAll} className="text-xs cursor-pointer" style={{ color: '#8A8478' }}><i className="fas fa-times" /></button>
            </div>
            <p className="text-[10px]" style={{ color: '#8A8478' }}>{selectedDesc}</p>
            <div className="flex gap-1.5 mt-2">
              <button onClick={() => rotateSelected('left')} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Rotate Left"><i className="fas fa-undo" /></button>
              <button onClick={() => rotateSelected('right')} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Rotate Right"><i className="fas fa-redo" /></button>
              <button onClick={duplicateSelected} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', fontSize: 10 }} title="Duplicate"><i className="fas fa-clone" /></button>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      <div className="fixed z-[1000] pointer-events-none" style={{ bottom: 24, left: '50%', transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)', opacity: toastVisible ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#333', color: '#fff' }}>{toastMsg}</div>
      </div>
    </div>
  );
}

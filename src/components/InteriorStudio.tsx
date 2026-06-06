'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { builders, makeMat } from '@/lib/furniture-builders';
import EditorLoader from '@/components/EditorLoader';
import type { MatType } from '@/lib/furniture-builders';
import { categories, furnitureItems, matColors, wallColorOptions, roomTypeDefaults, colorNames } from '@/lib/furniture-data';
import type { CategoryId } from '@/lib/furniture-data';
import { SKINS_DICTIONARY, applySkinToSkeleton, SKINS_LIST } from '@/lib/skin-system';
import { DESIGN_PRESETS, getPresetsForRoom, getPresetById } from '@/lib/design-presets';
import type { DesignPreset, RoomType as PresetRoomType } from '@/lib/design-presets';

// Guest mode restrictions — limited subset of basic items
const GUEST_ALLOWED_FURNITURE = new Set(['createSofa', 'createCoffeeTable', 'createBed', 'createArmchair', 'createDesk', 'createOfficeChair', 'createBookshelf', 'createRug', 'createFloorLamp', 'createTableLamp']);
const GUEST_ALLOWED_CATEGORIES = new Set<CategoryId>(['seating', 'tables', 'bedroom', 'office', 'lighting', 'decor']);
const GUEST_MAX_ROOMS = 6;
const GUEST_MAX_ITEMS = 30;
const GUEST_COLORS_PER_TYPE = 12;

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
const TEX_CACHE_MAX = 20;
const texCache = new Map<string, THREE.CanvasTexture>();
function getCachedTex(key: string, gen: () => THREE.CanvasTexture): THREE.CanvasTexture {
  const existing = texCache.get(key);
  if (existing) return existing;
  // Evict stale entries for the same texture type
  const typePrefix = key.split('_')[0] + '_';
  for (const [k, v] of texCache) {
    if (k.startsWith(typePrefix) && k !== key) {
      v.dispose();
      texCache.delete(k);
    }
  }
  // LRU eviction if cache is too large
  if (texCache.size >= TEX_CACHE_MAX) {
    const oldest = texCache.keys().next().value;
    if (oldest) { texCache.get(oldest)?.dispose(); texCache.delete(oldest); }
  }
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
    for (let i = 0; i < 200; i++) {
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
const lightMoods: Record<string, { bg: number; fog: number; ambient: [number, number]; dir: [number, number]; hemi: [number, number, number]; fill: [number, number]; exposure: number }> = {
  daylight: { bg: 0xF5F0E8, fog: 0xF5F0E8, ambient: [0xFFE8D0, 0.5], dir: [0xFFF0D8, 0.5], hemi: [0xFFF5E6, 0x8B7355, 0.3], fill: [0xE0E8F0, 0.15], exposure: 0.9 },
  golden: { bg: 0xF0E0C8, fog: 0xF0E0C8, ambient: [0xFFD8A0, 0.35], dir: [0xFFE0A0, 0.4], hemi: [0xFFF0C0, 0x8B7355, 0.2], fill: [0xFFE8C0, 0.1], exposure: 0.95 },
  evening: { bg: 0x5C4A38, fog: 0x5C4A38, ambient: [0xFFC880, 0.2], dir: [0xFFE8C0, 0.25], hemi: [0xD8A070, 0x6B5340, 0.15], fill: [0xFFC880, 0.06], exposure: 0.85 },
  night: { bg: 0x2A2825, fog: 0x2A2825, ambient: [0xFFE0A0, 0.08], dir: [0xFFE0A0, 0.08], hemi: [0x1A1A2E, 0x0D0D15, 0.05], fill: [0x4455AA, 0.02], exposure: 1.05 },
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
export default function InteriorStudio({ initialRoomType }: { initialRoomType?: string }) {
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
  const meshCacheRef = useRef<THREE.Mesh[]>([]);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef(new THREE.Vector3());
  const intersectionRef = useRef(new THREE.Vector3());
  const lastDragWorldRef = useRef(new THREE.Vector3()); // tracks previous drag world pos for delta-based drag
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const autoRotateRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Phase 1.7 — Debounced save after drag interaction ends.
  // Saves to localStorage 500ms after the user finishes dragging,
  // so they don't lose work between the 30s auto-save intervals.
  const dragSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<FurnitureData[][]>([[]]);
  const historyIdxRef = useRef(0);

  // Touch rotation refs for two-finger rotate
  const touchStartAngleRef = useRef<number | null>(null);
  const touchItemStartRotRef = useRef<number>(0);
  const touchStartDistRef = useRef<number | null>(null);

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarDark, setSidebarDark] = useState(false); // dark editor sidebar toggle
  const [currentCat, setCurrentCat] = useState<CategoryId>('seating');
  const [currentMatType, setCurrentMatType] = useState<MatType>('fabric');
  const [currentColor, setCurrentColor] = useState('#5A4E42');
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
  const [shadowsEnabled, setShadowsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Phase 1.7 — Debounced search query. The input updates instantly (no lag),
  // but the heavy filter + re-render only fires 300ms after the user stops typing.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [designName, setDesignName] = useState('Untitled Room');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [itemCount, setItemCount] = useState(0);
  const [rooms, setRooms] = useState<RoomInfo[]>([{ id: 'default', name: 'Living Room', roomType: 'living' }]);
  const [currentRoomId, setCurrentRoomId] = useState('default');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('bedroom');
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'furniture' | 'room' | 'material' | 'skin' | 'skeleton' | 'presets' | null>(null);
  const [roomManagerOpen, setRoomManagerOpen] = useState(false);
  const [editingRoomName, setEditingRoomName] = useState<string | null>(null);
  const [editingRoomNameValue, setEditingRoomNameValue] = useState('');
  const [ceilingLightPreset, setCeilingLightPreset] = useState<'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'>('recessed');
  const [snapshots, setSnapshots] = useState<Array<{ name: string; data: FurnitureData[]; roomSettings: Record<string, unknown>; timestamp: number }>>([]);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  // Skin System state
  const [activeSkin, setActiveSkin] = useState<string>('default');

  // Onboarding / Preset selection state
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState<'room' | 'preset' | 'blank'>('room');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState<PresetRoomType>('living');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [hasCachedDesign, setHasCachedDesign] = useState(false);

  // Phase 1.7 — Debounce search query: input updates instantly, but the
  // expensive useMemo filter only recalculates 300ms after typing stops.
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchQuery]);

  // Apply initialRoomType from URL query param (e.g. ?room=bedroom)
  useEffect(() => {
    if (initialRoomType && ['living', 'bedroom', 'kitchen', 'dining', 'office', 'bathroom'].includes(initialRoomType)) {
      setSelectedRoomType(initialRoomType as PresetRoomType);
      // Skip to preset selection if a room type was specified
      setOnboardingStep('preset');
    }
  }, [initialRoomType]);

  // Guest mode state
  const [isGuest, setIsGuest] = useState(true); // default to guest until we verify auth

  // Loading state — minimum display time for loader
  const [sceneReady, setSceneReady] = useState(false);

  // WebGL support state
  const [webglError, setWebglError] = useState<string | null>(null);

  // Refs for Three.js callbacks
  const roomWRef = useRef(8); const roomDRef = useRef(6); const roomHRef = useRef(3);
  const wallColRef = useRef('#FAF8F4'); const floorTypeRef = useRef('hardwood');
  const floorColorRef = useRef('#B8956A');
  const doorWallRef = useRef('none'); const windowCountRef = useRef(1);
  const windowWallRef = useRef('back'); const lightMoodRef = useRef('daylight');
  const snapToGridRef = useRef(false);
  const shadowsEnabledRef = useRef(true);
  const isMobileRef = useRef(false);
  const ceilingLightPresetRef = useRef<'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'>('recessed');
  const roomStatesRef = useRef<Map<string, FurnitureData[]>>(new Map());
  const currentRoomIdRef = useRef('default');
  const designNameRef = useRef('Untitled Room');
  const activeSkinRef = useRef('default');

  // Ref to store cached room data for restoring after onboarding
  const cachedRoomDataRef = useRef<Record<string, unknown> | null>(null);

  // Refs for scene lights (to update on mood change)
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Ref for triggering renders from outside useEffect
  const needsRenderRef = useRef<(() => void) | null>(null);

  // Ref for debouncing save status updates
  const saveStatusRef = useRef<'saved' | 'saving' | 'unsaved'>('saved');

  // Debounced buildRoom ref
  const buildRoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus trap handler for modal dialogs
  const trapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const container = e.currentTarget as HTMLElement;
    const focusable = container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

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

  /* ===== CEILING LIGHT PRESETS ===== */
  const ceilingLightPresets = [
    { id: 'recessed', label: 'Recessed', icon: 'fa-circle', desc: 'Standard flush ceiling spots' },
    { id: 'chandelier', label: 'Chandelier', icon: 'fa-gem', desc: 'Elegant hanging chandelier' },
    { id: 'track', label: 'Track Light', icon: 'fa-grip-lines', desc: 'Directional track lights' },
    { id: 'panel', label: 'Panel Light', icon: 'fa-square', desc: 'Modern LED panel' },
    { id: 'pendant', label: 'Pendant Row', icon: 'fa-ellipsis', desc: 'Row of hanging pendants' },
  ];

  /* ===== SERIALIZE / DESERIALIZE FURNITURE ===== */
  const serializeFurniture = useCallback((): FurnitureData[] => {
    return placedItemsRef.current.map(item => ({
      fn: item.userData.fn || '',
      name: item.userData.name || '',
      desc: item.userData.desc || '',
      matType: item.userData.matType || 'fabric',
      matColor: item.userData.matColor || '#5A4E42',
      position: { x: item.position.x, y: item.position.y, z: item.position.z },
      rotation: item.rotation.y,
    }));
  }, []);

  const loadFurnitureData = useCallback((data: FurnitureData[]) => {
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat.map?.dispose();
          c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach(m => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); }); else c.material?.dispose();
        }
      });
    });
    placedItemsRef.current = [];
    meshCacheRef.current = []; // Invalidate mesh cache
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

  /* ===== UNDO / REDO ===== */
  const pushHistory = useCallback(() => {
    const current = serializeFurniture();
    const newHistory = historyRef.current.slice(0, historyIdxRef.current + 1);
    newHistory.push(current);
    if (newHistory.length > 50) newHistory.shift();
    historyRef.current = newHistory;
    historyIdxRef.current = newHistory.length - 1;
  }, [serializeFurniture]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    loadFurnitureData(historyRef.current[historyIdxRef.current]);
    markUnsaved();
    showToast('Undo');
  }, [loadFurnitureData, markUnsaved, showToast]);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    loadFurnitureData(historyRef.current[historyIdxRef.current]);
    markUnsaved();
    showToast('Redo');
  }, [loadFurnitureData, markUnsaved, showToast]);

  /* ===== SAVE ROOM ===== */
  const saveRoom = useCallback(async () => {
    roomStatesRef.current.set(currentRoomId, serializeFurniture());
    setSaveStatus('saving');

    // Persist to localStorage
    try {
      const roomData = {
        furniture: JSON.stringify(serializeFurniture()),
        width: roomWRef.current,
        depth: roomDRef.current,
        height: roomHRef.current,
        wallColor: wallColRef.current,
        floorType: floorTypeRef.current,
        floorColor: floorColorRef.current,
        doorWall: doorWallRef.current,
        windowCount: windowCountRef.current,
        windowWall: windowWallRef.current,
        lightMood: lightMoodRef.current,
        ceilingLightPreset: ceilingLightPresetRef.current,
        designName,
        activeSkin,
      };
      const savedRooms = JSON.parse(localStorage.getItem('instod_rooms') || '{}');
      savedRooms[currentRoomId] = roomData;
      localStorage.setItem('instod_rooms', JSON.stringify(savedRooms));

      // Also save all room states
      const allRoomStates: Record<string, FurnitureData[]> = {};
      roomStatesRef.current.forEach((val, key) => { allRoomStates[key] = val; });
      localStorage.setItem('instod_room_states', JSON.stringify(allRoomStates));
    } catch (_e) {
      // localStorage quota exceeded or unavailable — inform the user
      showToast('Save failed — storage may be full');
    }

    setTimeout(() => {
      setSaveStatus('saved');
      saveStatusRef.current = 'saved';
      showToast('Room saved!');
    }, 500);
  }, [currentRoomId, serializeFurniture, showToast, designName]);

  /* ===== BUILD ROOM ===== */
  const buildRoom = useCallback(() => {
    const roomGroup = roomGroupRef.current;
    const scene = sceneRef.current;
    if (!roomGroup || !scene) return;

    // Dispose old children — including shadow maps and textures to prevent GPU memory leaks
    while (roomGroup.children.length) {
      const child = roomGroup.children[0];
      roomGroup.remove(child);
      child.traverse(c => {
        if (c instanceof THREE.Mesh) {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat.map?.dispose(); // Dispose texture before material
          c.geometry?.dispose();
          if (Array.isArray(mat)) mat.forEach(m => m.dispose()); else mat?.dispose();
        }
        // Dispose shadow map textures for SpotLights and PointLights
        if ((c instanceof THREE.SpotLight || c instanceof THREE.PointLight) && c.shadow?.map) {
          c.shadow.map.dispose();
          c.shadow.map = null;
        }
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

    // Ceiling spots (from persisted positions, style based on preset)
    // === SIMPLE LIGHTING: PointLights with low arbitrary intensity (no candela/decay) ===
    const spotPositions = ceilingSpotPositionsRef.current;
    const preset = ceilingLightPresetRef.current;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333, roughness: 0.3, metalness: 0.8 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xB8860B, roughness: 0.35, metalness: 0.7 });
    const isNight = mood === 'night';
    const isEvening = mood === 'evening';
    const isDark = isNight || isEvening;
    const lightColor = isDark ? 0xFFE8C0 : 0xFFEED0;
    // Simple intensity values (old-style, no physically correct candela)
    const mainIntensity = isDark ? 0.5 : 0.8;
    const secondaryIntensity = isDark ? 0.4 : 0.6;
    // Exposure guard
    const clampExposure = (v: number) => Math.max(0.3, Math.min(v, 1.15));

    // Helper: emissive bulb mesh
    const createBulb = (radius: number): THREE.Mesh => {
      const bulbGeo = new THREE.SphereGeometry(radius, 12, 12);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xFFF5E0,
        emissive: isDark ? 0xFFE8A0 : 0xFFEED0,
        emissiveIntensity: isDark ? 1.5 : 1.0,
        roughness: 0.2,
        metalness: 0.0,
      });
      return new THREE.Mesh(bulbGeo, bulbMat);
    };

    if (preset === 'chandelier') {
      // Central chandelier fixture — simple PointLight
      const chandGroup = new THREE.Group();
      chandGroup.name = 'ceilingSpot_0';
      chandGroup.userData.isCeilingSpot = true;
      chandGroup.userData.spotIndex = 0;
      // Mounting plate
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 16), metalMat);
      chandGroup.add(mount);
      // Rod
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), metalMat);
      rod.position.y = -0.22;
      chandGroup.add(rod);
      // Central hub
      const hub = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), brassMat);
      hub.position.y = -0.42;
      chandGroup.add(hub);
      // Arms with crystals
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const armLen = 0.3;
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, armLen, 6), brassMat);
        arm.rotation.z = Math.PI / 2;
        arm.position.set(Math.cos(angle) * armLen / 2, -0.42, Math.sin(angle) * armLen / 2);
        arm.rotation.y = -angle;
        chandGroup.add(arm);
        // Crystal drop
        const crystal = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshStandardMaterial({
          color: 0xFFFFFF, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85,
          emissive: lightColor, emissiveIntensity: isDark ? 0.5 : 0.3,
        }));
        crystal.position.set(Math.cos(angle) * armLen, -0.48, Math.sin(angle) * armLen);
        chandGroup.add(crystal);
      }
      // Central PointLight
      const centralLight = new THREE.PointLight(lightColor, mainIntensity, 10);
      centralLight.position.set(0, -0.5, 0);
      chandGroup.add(centralLight);
      // Central emissive bulb
      const centralBulb = createBulb(0.05);
      centralBulb.position.set(0, -0.5, 0);
      chandGroup.add(centralBulb);
      chandGroup.position.set(spotPositions[0]?.x || 0, h - 0.02, spotPositions[0]?.z || 0);
      roomGroup.add(chandGroup);
      roomGroup.userData.ceilingSpotCount = 1;
    } else if (preset === 'track') {
      // Track light — simple PointLights
      const trackLen = w * 0.6;
      const trackBar = new THREE.Mesh(new THREE.BoxGeometry(trackLen, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.4, metalness: 0.7 }));
      trackBar.name = 'ceilingTrack';
      trackBar.position.set(0, h - 0.02, spotPositions[0]?.z || 0);
      roomGroup.add(trackBar);
      const numHeads = Math.min(4, spotPositions.length);
      for (let i = 0; i < numHeads; i++) {
        const headGroup = new THREE.Group();
        headGroup.name = `ceilingSpot_${i}`;
        headGroup.userData.isCeilingSpot = true;
        headGroup.userData.spotIndex = i;
        // Track connector
        const connector = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), metalMat);
        headGroup.add(connector);
        // Head housing
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.08, 12), metalMat);
        head.position.y = -0.06;
        headGroup.add(head);
        // Emissive bulb at head opening
        const bulb = createBulb(0.03);
        bulb.position.set(0, -0.1, 0);
        headGroup.add(bulb);
        // Simple PointLight
        const headLight = new THREE.PointLight(lightColor, secondaryIntensity, 8);
        headLight.position.set(0, -0.1, 0);
        headGroup.add(headLight);
        const xOffset = (i - (numHeads - 1) / 2) * (trackLen / (numHeads + 1));
        headGroup.position.set(xOffset, h - 0.04, spotPositions[0]?.z || 0);
        roomGroup.add(headGroup);
      }
      roomGroup.userData.ceilingSpotCount = numHeads;
    } else if (preset === 'panel') {
      // LED panel light — simple PointLight
      const panelW = Math.min(w * 0.5, 2.5);
      const panelD = Math.min(d * 0.3, 1.2);
      const panelGroup = new THREE.Group();
      panelGroup.name = 'ceilingSpot_0';
      panelGroup.userData.isCeilingSpot = true;
      panelGroup.userData.spotIndex = 0;
      // Panel frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(panelW + 0.04, 0.03, panelD + 0.04), metalMat);
      panelGroup.add(frame);
      // Emissive panel surface
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xFFEED0, emissive: isDark ? 0xFFE8A0 : 0xFFEED0,
        emissiveIntensity: isDark ? 1.5 : 0.8, roughness: 0.3,
      });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(panelW, panelD), panelMat);
      panel.rotation.x = Math.PI / 2;
      panel.position.y = -0.016;
      panelGroup.add(panel);
      // Simple PointLight
      const panelLight = new THREE.PointLight(lightColor, mainIntensity, 12);
      panelLight.position.set(0, -0.3, 0);
      panelGroup.add(panelLight);
      panelGroup.position.set(spotPositions[0]?.x || 0, h - 0.015, spotPositions[0]?.z || 0);
      roomGroup.add(panelGroup);
      roomGroup.userData.ceilingSpotCount = 1;
    } else if (preset === 'pendant') {
      // Row of hanging pendant lights — simple PointLights
      const numPendants = Math.min(3, spotPositions.length);
      for (let i = 0; i < numPendants; i++) {
        const pendGroup = new THREE.Group();
        pendGroup.name = `ceilingSpot_${i}`;
        pendGroup.userData.isCeilingSpot = true;
        pendGroup.userData.spotIndex = i;
        // Ceiling mount
        const pMount = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.02, 12), metalMat);
        pendGroup.add(pMount);
        // Rod
        const pRod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), metalMat);
        pRod.position.y = -0.26;
        pendGroup.add(pRod);
        // Shade (cone/cylinder)
        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.6, metalness: 0.3 }));
        shade.position.y = -0.53;
        pendGroup.add(shade);
        // Inner glow — emissive shade interior
        const innerGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.1, 0.08, 12), new THREE.MeshStandardMaterial({
          color: 0xFFF0D0, emissive: lightColor, emissiveIntensity: isDark ? 1.0 : 0.5, roughness: 0.5,
        }));
        innerGlow.position.y = -0.54;
        pendGroup.add(innerGlow);
        // Emissive bulb
        const bulb = createBulb(0.025);
        bulb.position.set(0, -0.58, 0);
        pendGroup.add(bulb);
        // Simple PointLight
        const pendLight = new THREE.PointLight(lightColor, secondaryIntensity, 8);
        pendLight.position.set(0, -0.5, 0);
        pendGroup.add(pendLight);
        const px = (i - (numPendants - 1) / 2) * 1.2;
        pendGroup.position.set(spotPositions[i]?.x || px, h - 0.01, spotPositions[i]?.z || 0);
        roomGroup.add(pendGroup);
      }
      roomGroup.userData.ceilingSpotCount = numPendants;
    } else {
      // Default recessed spots — simple PointLights
      spotPositions.forEach((pos, idx) => {
        const spotGroup = new THREE.Group();
        spotGroup.name = `ceilingSpot_${idx}`;
        spotGroup.userData.isCeilingSpot = true;
        spotGroup.userData.spotIndex = idx;

        // Recessed housing
        const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.03, 16), metalMat);
        housing.name = `ceilingSpotMesh_${idx}`;
        spotGroup.add(housing);

        // Emissive recessed ring (the "on" indicator)
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xFFEED0, emissive: lightColor, emissiveIntensity: isDark ? 1.5 : 0.8,
          roughness: 0.3, metalness: 0.0,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.11, 16), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.016;
        spotGroup.add(ring);

        // Emissive bulb
        const bulb = createBulb(0.03);
        bulb.position.set(0, -0.06, 0);
        spotGroup.add(bulb);

        // Simple PointLight
        const spot = new THREE.PointLight(lightColor, mainIntensity, 10);
        spot.position.set(0, -0.06, 0);
        spotGroup.add(spot);

        spotGroup.position.set(pos.x, h - 0.015, pos.z);
        roomGroup.add(spotGroup);
      });
      roomGroup.userData.ceilingSpotCount = spotPositions.length;
    }

    // Room fill light
    const roomFillIntensity = isDark ? 0.3 : 0.5;
    const roomFill = new THREE.PointLight(lightColor, roomFillIntensity, 0);
    roomFill.position.set(0, h * 0.7, 0);
    roomFill.name = 'roomFillLight';
    roomGroup.add(roomFill);

    // Grid helper
    const gridHelper = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 2, 0xCCBBAA, 0xDDD4C8);
    gridHelper.position.y = 0.002; gridHelper.name = 'grid';
    (gridHelper.material as THREE.Material).opacity = 0.25; (gridHelper.material as THREE.Material).transparent = true;
    roomGroup.add(gridHelper);

    // Update scene lighting
    const moodData = lightMoods[mood] || lightMoods.daylight;
    scene.background = new THREE.Color(moodData.bg);
    scene.fog = new THREE.FogExp2(moodData.fog, 0.018);
    if (rendererRef.current) rendererRef.current.toneMappingExposure = clampExposure(moodData.exposure);

    // Update actual scene lights
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(moodData.ambient[0]);
      ambientLightRef.current.intensity = moodData.ambient[1];
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(moodData.dir[0]);
      dirLightRef.current.intensity = moodData.dir[1];
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(moodData.hemi[0]);
      hemiLightRef.current.groundColor.setHex(moodData.hemi[1]);
      hemiLightRef.current.intensity = moodData.hemi[2];
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(moodData.fill[0]);
      fillLightRef.current.intensity = moodData.fill[1];
    }

    // Store built dimensions for in-place preview scaling
    roomGroup.userData.builtW = w;
    roomGroup.userData.builtD = d;
    roomGroup.userData.builtH = h;

    markSceneDirty();
  }, [markSceneDirty]);

  /* ===== UPDATE LIGHTING MOOD (no room rebuild — just scene lights + background) ===== */
  const updateLightingMood = useCallback((mood: string) => {
    const scene = sceneRef.current;
    const roomGroup = roomGroupRef.current;
    if (!scene || !roomGroup) return;

    const moodData = lightMoods[mood] || lightMoods.daylight;
    const isNight = mood === 'night';
    const isEvening = mood === 'evening';
    const isDark = isNight || isEvening;

    // Update scene background & fog
    scene.background = new THREE.Color(moodData.bg);
    scene.fog = new THREE.FogExp2(moodData.fog, 0.018);

    // Exposure
    const clampExposure = (v: number) => Math.max(0.3, Math.min(v, 1.15));
    if (rendererRef.current) rendererRef.current.toneMappingExposure = clampExposure(moodData.exposure);

    // Update scene lights
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(moodData.ambient[0]);
      ambientLightRef.current.intensity = moodData.ambient[1];
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(moodData.dir[0]);
      dirLightRef.current.intensity = moodData.dir[1];
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(moodData.hemi[0]);
      hemiLightRef.current.groundColor.setHex(moodData.hemi[1]);
      hemiLightRef.current.intensity = moodData.hemi[2];
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(moodData.fill[0]);
      fillLightRef.current.intensity = moodData.fill[1];
    }

    // Update window glass emissive intensity in-place (avoid full rebuild)
    const lightColor = isDark ? 0xFFE8C0 : 0xFFEED0;
    roomGroup.traverse(c => {
      if (!(c instanceof THREE.Mesh)) return;
      // Window glass — update emissive intensity
      const mat = c.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        const emHex = mat.emissive.getHex();
        // Glass windows have emissive 0x8AB8D0
        if (emHex === 0x8AB8D0) {
          mat.emissiveIntensity = isDark ? 0.1 : 0.4;
        }
      }
    });

    // Update ceiling spot light colors & emissive in-place
    const mainIntensity = isDark ? 0.5 : 0.8;
    const secondaryIntensity = isDark ? 0.4 : 0.6;
    roomGroup.traverse(c => {
      if (c instanceof THREE.PointLight) {
        c.color.setHex(lightColor);
        // Differentiate between room fill light and ceiling spots
        if (c.name === 'roomFillLight') {
          c.intensity = isDark ? 0.3 : 0.5;
        } else {
          // Ceiling spot — track head vs single fixture
          c.intensity = (c.userData?.isSecondary) ? secondaryIntensity : mainIntensity;
        }
      }
      // Update emissive bulb/ring materials in ceiling fixtures
      if (c instanceof THREE.Mesh) {
        const m = c.material as THREE.MeshStandardMaterial;
        if (m && m.emissive && m.emissiveIntensity > 0.3) {
          const emHex = m.emissive.getHex();
          // Bulb emissive (warm tones) — update color and intensity
          if (emHex === 0xFFEED0 || emHex === 0xFFE8A0 || emHex === 0xFFE8C0 || emHex === 0xFFF0C0) {
            m.emissive.setHex(isDark ? 0xFFE8A0 : 0xFFEED0);
            m.emissiveIntensity = isDark ? 1.5 : (m.emissiveIntensity > 1.0 ? 1.0 : m.emissiveIntensity);
          }
        }
      }
    });

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
      const ceilGrid = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) * 4, 0x8A7E72, 0xDDC8A8);
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
    const MAX_CEILING_LIGHTS = 6;
    if (positions.length >= MAX_CEILING_LIGHTS) {
      showToast(`Maximum ${MAX_CEILING_LIGHTS} ceiling lights allowed`);
      return;
    }
    const w = roomWRef.current;
    const d = roomDRef.current;

    // Add position near center with slight random offset
    const newPos = {
      x: (Math.random() - 0.5) * (w * 0.4),
      z: (Math.random() - 0.5) * (d * 0.4),
    };
    positions.push(newPos);

    // Rebuild room to properly create the new light (avoids duplicate objects)
    buildRoom();

    // Re-apply ceiling edit mode styling since buildRoom resets materials
    if (ceilingEditModeRef.current) {
      const roomGroup = roomGroupRef.current;
      if (roomGroup) {
        roomGroup.traverse(c => {
          if (!(c instanceof THREE.Mesh)) return;
          if (c.name && c.name.startsWith('ceilingSpotMesh_')) {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.emissive.setHex(0xFFDD44);
            mat.emissiveIntensity = 0.6;
            mat.needsUpdate = true;
          }
          if (c.name === 'wall_back' || c.name === 'wall_left' || c.name === 'wall_right') {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.15;
            mat.needsUpdate = true;
          }
          if (c.name === 'floor') {
            const mat = c.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.1;
            mat.needsUpdate = true;
          }
        });
      }
    }

    const idx = positions.length - 1;
    markSceneDirty();
    showToast(`Added ceiling light #${idx + 1}`);
  }, [buildRoom, markSceneDirty, showToast]);

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
    setCurrentColor(obj.userData.matColor || '#5A4E42');
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
    // Guest mode restrictions
    if (isGuest) {
      if (!GUEST_ALLOWED_FURNITURE.has(fnName)) {
        showToast('Sign in to unlock all furniture');
        return null;
      }
      if (placedItemsRef.current.length >= GUEST_MAX_ITEMS) {
        showToast(`Guest limit: ${GUEST_MAX_ITEMS} items. Sign in for more!`);
        return null;
      }
    }
    const fn = builders[fnName]; if (!fn) return null;
    pushHistory();
    const item = fn(col, mtype, roomHRef.current);
    const w = roomWRef.current, d = roomDRef.current;
    let px = (Math.random() - 0.5) * (w * 0.4), pz = (Math.random() - 0.5) * (d * 0.3);
    if (snapToGridRef.current) { px = Math.round(px * 2) / 2; pz = Math.round(pz * 2) / 2; }
    item.position.set(px, 0, pz);
    item.userData.fn = fnName;
    sceneRef.current?.add(item); placedItemsRef.current.push(item);
    meshCacheRef.current = []; // Invalidate mesh cache
    selectItem(item); setItemCount(placedItemsRef.current.length);
    markUnsaved();
    markSceneDirty();
    showToast(`Added ${item.userData.name}`);
    return item;
  }, [pushHistory, selectItem, showToast, markUnsaved, markSceneDirty, isGuest]);

  const deleteSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    pushHistory();
    const name = selected.userData.name;
    sceneRef.current?.remove(selected); placedItemsRef.current = placedItemsRef.current.filter(i => i !== selected);
    selected.traverse(c => { if (c instanceof THREE.Mesh) { const mat = c.material as THREE.MeshStandardMaterial; mat.map?.dispose(); c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); }); else c.material?.dispose(); } });
    meshCacheRef.current = []; // Invalidate mesh cache
    selectedObjRef.current = null; setItemPanelVisible(false); setItemCount(placedItemsRef.current.length);
    markUnsaved(); markSceneDirty(); showToast(`Removed ${name}`);
  }, [pushHistory, showToast, markUnsaved, markSceneDirty]);

  const duplicateSelected = useCallback(() => {
    const selected = selectedObjRef.current; if (!selected) return;
    pushHistory();
    const d = selected.userData;
    const fn = builders[d.fn || '']; if (!fn) return;
    const item = fn(d.matColor, d.matType, roomHRef.current);
    item.position.copy(selected.position).add(new THREE.Vector3(0.5, 0, 0.5));
    item.rotation.y = selected.rotation.y; item.userData.fn = d.fn;
    sceneRef.current?.add(item); placedItemsRef.current.push(item);
    meshCacheRef.current = []; // Invalidate mesh cache
    selectItem(item); setItemCount(placedItemsRef.current.length);
    markUnsaved(); markSceneDirty(); showToast(`Duplicated ${d.name}`);
  }, [pushHistory, selectItem, showToast, markUnsaved, markSceneDirty]);

  const applyMaterial = useCallback((color: string, type: MatType) => {
    const selected = selectedObjRef.current; if (!selected) { showToast('Select an item first'); return; }
    pushHistory();
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
  }, [pushHistory, showToast, markUnsaved, markSceneDirty]);

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
    setCurrentRoomId(roomId); currentRoomIdRef.current = roomId; deselectAll();
  }, [currentRoomId, serializeFurniture, loadFurnitureData, deselectAll]);

  const addNewRoom = useCallback(() => {
    if (isGuest && rooms.length >= GUEST_MAX_ROOMS) {
      showToast(`Guest limit: ${GUEST_MAX_ROOMS} rooms — sign up for unlimited`);
      return;
    }
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

    setCurrentRoomId(id); currentRoomIdRef.current = id;
    buildRoom();
    const saved = roomStatesRef.current.get(id);
    if (saved) loadFurnitureData(saved);
    setShowAddRoom(false); setNewRoomName(''); setNewRoomType('bedroom');
    showToast(`Added ${name}`);
  }, [currentRoomId, serializeFurniture, loadFurnitureData, buildRoom, newRoomName, newRoomType, showToast]);

  const deleteRoom = useCallback((roomId: string) => {
    if (rooms.length <= 1) {
      showToast('Cannot delete the last room');
      return;
    }
    const newRooms = rooms.filter(r => r.id !== roomId);
    roomStatesRef.current.delete(roomId);
    if (currentRoomId === roomId) {
      switchRoom(newRooms[0].id);
    }
    setRooms(newRooms);
    showToast('Room deleted');
  }, [rooms, currentRoomId, switchRoom, showToast]);

  const renameRoom = useCallback((roomId: string, newName: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name: newName } : r));
    showToast('Room renamed');
  }, [showToast]);

  /* ===== DEFAULT FURNITURE ===== */
  const addDefaultFurniture = useCallback(() => {
    const defaults = roomTypeDefaults['living'];
    if (!defaults) return;
    defaults.defaultFurniture.forEach(f => {
      const fn = builders[f.fn]; if (!fn) return;
      const item = fn(f.color, f.mat as MatType, roomHRef.current);
      item.position.set(f.pos[0], f.pos[1], f.pos[2]);
      if (f.rot) item.rotation.y = f.rot;
      item.userData.fn = f.fn;
      sceneRef.current?.add(item); placedItemsRef.current.push(item);
    });
    setItemCount(placedItemsRef.current.length); deselectAll(); markSceneDirty();
  }, [deselectAll, markSceneDirty]);

  /* ===== LOAD DESIGN PRESET ===== */
  const loadPreset = useCallback((preset: DesignPreset) => {
    // Clear existing furniture
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); }
      });
    });
    placedItemsRef.current = [];
    selectedObjRef.current = null;
    setItemPanelVisible(false);

    // Apply room settings from preset
    roomWRef.current = preset.roomWidth; setRoomW(preset.roomWidth);
    roomDRef.current = preset.roomDepth; setRoomD(preset.roomDepth);
    roomHRef.current = preset.roomHeight; setRoomH(preset.roomHeight);
    wallColRef.current = preset.wallColor; setWallCol(preset.wallColor);
    floorTypeRef.current = preset.floorType; setFloorType(preset.floorType);
    floorColorRef.current = preset.floorColor; setFloorColor(preset.floorColor);
    lightMoodRef.current = preset.lightMood; setLightMood(preset.lightMood);
    setDesignName(preset.name); designNameRef.current = preset.name;

    // Rebuild room
    buildRoom();

    // Add preset furniture
    setTimeout(() => {
      preset.furniture.forEach(f => {
        const fn = builders[f.fn]; if (!fn) return;
        const item = fn(f.color, f.mat as MatType, roomHRef.current);
        item.position.set(f.pos[0], f.pos[1], f.pos[2]);
        if (f.rot) item.rotation.y = f.rot;
        item.userData.fn = f.fn;
        item.userData.isFurniture = true;
        item.name = f.fn;
        sceneRef.current?.add(item); placedItemsRef.current.push(item);
      });
      setItemCount(placedItemsRef.current.length);

      // Apply skin if specified
      if (preset.skin && preset.skin !== 'default') {
        const skin = SKINS_DICTIONARY[preset.skin];
        if (skin) {
          setActiveSkin(preset.skin); activeSkinRef.current = preset.skin;
          const sc = sceneRef.current, rg = roomGroupRef.current;
          if (sc && rg) applySkinToSkeleton(sc, rg, placedItemsRef.current, skin, ambientLightRef.current, dirLightRef.current, rendererRef.current, hemiLightRef.current, fillLightRef.current);
        }
      }

      markSceneDirty();
      historyRef.current = [serializeFurniture()]; historyIdxRef.current = 0;
    }, 200);

    setShowOnboarding(false);
    // Show tutorial for first-time users
    if (!localStorage.getItem('instod_tutorial_seen')) {
      setTimeout(() => setShowTutorial(true), 600);
    }
    markUnsaved();
  }, [buildRoom, deselectAll, markSceneDirty, markUnsaved, serializeFurniture]);

  /* ===== RESTORE CACHED DESIGN ===== */
  const restoreCachedDesign = useCallback(() => {
    const savedRoom = cachedRoomDataRef.current;
    if (!savedRoom) return;

    // Clear existing furniture
    placedItemsRef.current.forEach(item => {
      sceneRef.current?.remove(item);
      item.traverse(c => {
        if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); }
      });
    });
    placedItemsRef.current = [];
    selectedObjRef.current = null;
    setItemPanelVisible(false);

    // Apply cached room settings (cast from unknown types)
    const r = savedRoom as Record<string, any>;
    if (r.width) { roomWRef.current = r.width; setRoomW(r.width); }
    if (r.depth) { roomDRef.current = r.depth; setRoomD(r.depth); }
    if (r.height) { roomHRef.current = r.height; setRoomH(r.height); }
    if (r.wallColor) { wallColRef.current = r.wallColor; setWallCol(r.wallColor); }
    if (r.floorType) { floorTypeRef.current = r.floorType; setFloorType(r.floorType); }
    if (r.floorColor) { floorColorRef.current = r.floorColor; setFloorColor(r.floorColor); }
    if (r.doorWall) { doorWallRef.current = r.doorWall; setDoorWall(r.doorWall); }
    if (r.windowCount) { windowCountRef.current = r.windowCount; setWindowCount(r.windowCount); }
    if (r.windowWall) { windowWallRef.current = r.windowWall; setWindowWall(r.windowWall); }
    if (r.lightMood) { lightMoodRef.current = r.lightMood; setLightMood(r.lightMood); }
    if (r.ceilingLightPreset) { ceilingLightPresetRef.current = r.ceilingLightPreset; setCeilingLightPreset(r.ceilingLightPreset); }
    if (r.designName) { setDesignName(r.designName); designNameRef.current = r.designName; }
    if (r.activeSkin) { setActiveSkin(r.activeSkin); activeSkinRef.current = r.activeSkin; }

    // Rebuild room with cached settings
    buildRoom();

    // Load cached furniture after room is built
    setTimeout(() => {
      if (r.furniture) {
        loadFurnitureData(r.furniture as FurnitureData[]);
      }

      // Apply skin if cached
      if (r.activeSkin && r.activeSkin !== 'default') {
        const skin = SKINS_DICTIONARY[r.activeSkin as string];
        if (skin) {
          const sc = sceneRef.current, rg = roomGroupRef.current;
          if (sc && rg) applySkinToSkeleton(sc, rg, placedItemsRef.current, skin, ambientLightRef.current, dirLightRef.current, rendererRef.current, hemiLightRef.current, fillLightRef.current);
        }
      }

      markSceneDirty();
      historyRef.current = [serializeFurniture()]; historyIdxRef.current = 0;
    }, 200);

    setShowOnboarding(false);
    markUnsaved();
  }, [buildRoom, loadFurnitureData, markSceneDirty, markUnsaved, serializeFurniture]);

  /* ===== THREE.JS INIT ===== */
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    isMobileRef.current = mobile;

    // WebGL support check
    const testCanvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | null = null;
    try { gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'); } catch {}
    if (!gl) {
      setWebglError('Your browser or device does not support WebGL, which is required for the 3D room editor. Please try a modern browser like Chrome, Firefox, or Edge.');
      return;
    }

    const canvas = canvasRef.current; if (!canvas) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xF5F0E8); scene.fog = new THREE.FogExp2(0xF5F0E8, 0.018); sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100); camera.position.set(7, 6, 9); cameraRef.current = camera;

    // Performance: lower pixel ratio on mobile, limit to 1.5x
    const pr = mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, preserveDrawingBuffer: false, powerPreference: mobile ? 'low-power' : 'high-performance' });
    renderer.setPixelRatio(pr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = mobile ? THREE.BasicShadowMap : THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9; renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.5;
    controls.panSpeed = 0.5;
    controls.maxPolarAngle = Math.PI * 0.48; controls.minDistance = 2; controls.maxDistance = 22;
    controls.target.set(0, 1, 0);
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    controls.enablePan = true;
    // Smoother touch on mobile
    if (mobile) {
      controls.rotateSpeed = 0.35;
      controls.panSpeed = 0.35;
      controls.dampingFactor = 0.18;
    }
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xFFE8D0, 0.5);
    scene.add(ambientLight); ambientLightRef.current = ambientLight;
    const hemiLight = new THREE.HemisphereLight(0xFFF5E6, 0x8B7355, 0.3);
    scene.add(hemiLight); hemiLightRef.current = hemiLight;
    const dirLight = new THREE.DirectionalLight(0xFFF0D8, 0.5); dirLight.position.set(4, 8, 5); dirLight.castShadow = true;
    // Lower shadow map on mobile for perf
    const shadowSize = mobile ? 1024 : 2048;
    dirLight.shadow.mapSize.set(shadowSize, shadowSize);
    dirLight.shadow.camera.left = -10; dirLight.shadow.camera.right = 10; dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -10; dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 30; dirLight.shadow.bias = -0.001;
    // Tighten shadow camera bounds based on room size for better shadow quality
    const shadowBound = Math.max(roomWRef.current, roomDRef.current) * 0.75;
    dirLight.shadow.camera.left = -shadowBound; dirLight.shadow.camera.right = shadowBound;
    dirLight.shadow.camera.top = shadowBound; dirLight.shadow.camera.bottom = -shadowBound;
    if (!mobile) dirLight.shadow.radius = 4;
    scene.add(dirLight); dirLightRef.current = dirLight;
    const fillLight = new THREE.DirectionalLight(0xE0E8F0, 0.15);
    fillLight.position.set(-4, 5, -3);
    scene.add(fillLight); fillLightRef.current = fillLight;

    const roomGroup = new THREE.Group(); scene.add(roomGroup); roomGroupRef.current = roomGroup;
    buildRoom(); setTimeout(() => {
      // Load saved room state from localStorage — ONLY store, do NOT auto-apply
      // The user must explicitly choose to continue or start fresh via onboarding
      try {
        // Check if user is authenticated (has session)
        fetch('/api/auth/session').then(r => r.json()).then(session => {
          if (session?.user) setIsGuest(false);
        }).catch(() => { /* guest mode */ });

        const savedRooms = JSON.parse(localStorage.getItem('instod_rooms') || '{}');
        const savedRoom = savedRooms['default'];
        if (savedRoom) {
          // Only store cached data for later use — do NOT apply settings here
          cachedRoomDataRef.current = savedRoom;
          setHasCachedDesign(true);
        }
        // Also load saved room states map
        const savedStates = JSON.parse(localStorage.getItem('instod_room_states') || '{}');
        Object.entries(savedStates).forEach(([key, val]) => {
          roomStatesRef.current.set(key, val as FurnitureData[]);
        });
      } catch (_e) {
        // Ignore localStorage errors
      }
      // Always add default furniture — onboarding will handle loading presets
      addDefaultFurniture();
      historyRef.current = [serializeFurniture()]; historyIdxRef.current = 0;
    }, 100);

    // Minimum loading display time (2.5s) so the loader animation completes properly
    const minLoadTimer = setTimeout(() => {
      setSceneReady(true);
    }, 2500);

    const onResize = () => {
      const p = canvas.parentElement; if (!p) return;
      renderer.setSize(p.clientWidth, p.clientHeight);
      camera.aspect = p.clientWidth / p.clientHeight;
      camera.updateProjectionMatrix();
    };
    onResize(); window.addEventListener('resize', onResize);
    // Use ResizeObserver for container-aware resizing (prevents flicker on panel toggle)
    const resizeObserver = new ResizeObserver(() => { onResize(); });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    // Cached mesh array — rebuilt only when furniture changes, not on every click
    const rebuildMeshCache = () => { meshCacheRef.current = []; placedItemsRef.current.forEach(g => g.traverse(c => { if (c instanceof THREE.Mesh) meshCacheRef.current.push(c); })); };
    const getMeshes = (): THREE.Mesh[] => { if (meshCacheRef.current.length === 0 && placedItemsRef.current.length > 0) rebuildMeshCache(); return meshCacheRef.current; };

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

            // Simple PointLight (old-style, no candela)
            const isNight = mood === 'night';
            const lightCol = isNight ? 0xFFE8C0 : 0xFFEED0;
            const sLight = new THREE.PointLight(lightCol, isNight ? 0.5 : 0.8, 10);
            sLight.position.set(0, -0.06, 0);
            spotGroup.add(sLight);

            // Emissive bulb
            const bMat = new THREE.MeshStandardMaterial({
              color: 0xFFF5E0, emissive: isNight ? 0xFFE8A0 : 0xFFEED0,
              emissiveIntensity: isNight ? 1.5 : 1.0, roughness: 0.2, metalness: 0.0,
            });
            const bMesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), bMat);
            bMesh.position.set(0, -0.06, 0);
            spotGroup.add(bMesh);

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
          // Store initial drag world position for delta-based movement
          lastDragWorldRef.current.copy(intersectionRef.current);
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
        // Delta-based drag: compute how much the intersection point moved since last frame
        const dx = intersectionRef.current.x - lastDragWorldRef.current.x;
        const dz = intersectionRef.current.z - lastDragWorldRef.current.z;
        // Sensitivity factor: 0.7 slows drag to feel controllable without being sluggish
        const sensitivity = 0.7;
        const scaledDx = dx * sensitivity;
        const scaledDz = dz * sensitivity;
        // Apply delta to current position (not raw intersection, so camera angle doesn't distort)
        let nx = dragItemRef.current.position.x + scaledDx;
        let nz = dragItemRef.current.position.z + scaledDz;
        // Calculate furniture bounding box for wall constraint
        const bbox = new THREE.Box3().setFromObject(dragItemRef.current);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const halfFurnW = size.x / 2;
        const halfFurnD = size.z / 2;
        const hw = roomWRef.current / 2 - halfFurnW - 0.05;
        const hd = roomDRef.current / 2 - halfFurnD - 0.05;
        nx = Math.max(-hw, Math.min(hw, nx)); nz = Math.max(-hd, Math.min(hd, nz));
        if (snapToGridRef.current) { nx = Math.round(nx * 2) / 2; nz = Math.round(nz * 2) / 2; }
        dragItemRef.current.position.x = nx; dragItemRef.current.position.z = nz;
        // Update last drag world position for next frame's delta
        lastDragWorldRef.current.copy(intersectionRef.current);
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
        // Phase 1.7 — Debounced save after ceiling light drag
        if (dragSaveTimeoutRef.current) clearTimeout(dragSaveTimeoutRef.current);
        dragSaveTimeoutRef.current = setTimeout(() => { saveRoom(); }, 500);
        return;
      }
      // Normal mode - push history if we were dragging
      if (isDragRef.current && dragItemRef.current) {
        pushHistory();
        // Phase 1.7 — Debounced save after furniture drag (500ms).
        // The Three.js scene already updated optimistically during drag.
        // Now persist to localStorage after a short delay, allowing
        // rapid sequential drags to batch into a single save.
        if (dragSaveTimeoutRef.current) clearTimeout(dragSaveTimeoutRef.current);
        dragSaveTimeoutRef.current = setTimeout(() => { saveRoom(); }, 500);
      }
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
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
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
    // Only mark dirty on pointermove when actually dragging something
    canvas.addEventListener('pointermove', () => { if (isDragRef.current || dragItemRef.current) needsRender = true; });
    animate();

    // Auto-save timer — actually persists room data to localStorage
    autoSaveTimerRef.current = setInterval(() => {
      if (saveStatusRef.current === 'unsaved') {
        saveStatusRef.current = 'saving';
        setSaveStatus('saving');
        try {
          const rid = currentRoomIdRef.current;
          const furnitureData = serializeFurniture(); // Serialize once, not twice
          roomStatesRef.current.set(rid, furnitureData);
          const roomData = {
            furniture: JSON.stringify(furnitureData),
            width: roomWRef.current,
            depth: roomDRef.current,
            height: roomHRef.current,
            wallColor: wallColRef.current,
            floorType: floorTypeRef.current,
            floorColor: floorColorRef.current,
            doorWall: doorWallRef.current,
            windowCount: windowCountRef.current,
            windowWall: windowWallRef.current,
            lightMood: lightMoodRef.current,
            ceilingLightPreset: ceilingLightPresetRef.current,
            designName: designNameRef.current,
            activeSkin: activeSkinRef.current,
          };
          const savedRooms = JSON.parse(localStorage.getItem('instod_rooms') || '{}');
          savedRooms[rid] = roomData;
          localStorage.setItem('instod_rooms', JSON.stringify(savedRooms));
          const allRoomStates: Record<string, FurnitureData[]> = {};
          roomStatesRef.current.forEach((val, key) => { allRoomStates[key] = val; });
          localStorage.setItem('instod_room_states', JSON.stringify(allRoomStates));
          saveStatusRef.current = 'saved';
          setSaveStatus('saved');
        } catch (_e) {
          // localStorage quota exceeded or unavailable
          saveStatusRef.current = 'unsaved';
          setSaveStatus('unsaved');
          showToast('Auto-save failed — storage full');
        }
      }
    }, 30000); // Reduced from 60s to 30s for better safety

    // Handle WebGL context loss — save data and warn user
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      // Immediately persist current state to localStorage before it's lost
      try {
        const rid = currentRoomIdRef.current;
        const furnitureData = serializeFurniture();
        roomStatesRef.current.set(rid, furnitureData);
        const roomData = {
          furniture: JSON.stringify(furnitureData),
          width: roomWRef.current, depth: roomDRef.current, height: roomHRef.current,
          wallColor: wallColRef.current, floorType: floorTypeRef.current, floorColor: floorColorRef.current,
          doorWall: doorWallRef.current, windowCount: windowCountRef.current, windowWall: windowWallRef.current,
          lightMood: lightMoodRef.current, ceilingLightPreset: ceilingLightPresetRef.current,
          designName: designNameRef.current, activeSkin: activeSkinRef.current,
        };
        const savedRooms = JSON.parse(localStorage.getItem('instod_rooms') || '{}');
        savedRooms[rid] = roomData;
        localStorage.setItem('instod_rooms', JSON.stringify(savedRooms));
      } catch { /* best effort */ }
      showToast('Graphics error — your work has been saved. Please refresh the page.');
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
      showToast('Graphics restored — rebuilding room...');
      buildRoom();
    }, false);

    // Save on page close/navigate away
    const beforeUnload = () => {
      try {
        const rid = currentRoomIdRef.current;
        const furnitureData = serializeFurniture();
        roomStatesRef.current.set(rid, furnitureData);
        const roomData = {
          furniture: JSON.stringify(furnitureData),
          width: roomWRef.current, depth: roomDRef.current, height: roomHRef.current,
          wallColor: wallColRef.current, floorType: floorTypeRef.current, floorColor: floorColorRef.current,
          doorWall: doorWallRef.current, windowCount: windowCountRef.current, windowWall: windowWallRef.current,
          lightMood: lightMoodRef.current, ceilingLightPreset: ceilingLightPresetRef.current,
          designName: designNameRef.current, activeSkin: activeSkinRef.current,
        };
        const savedRooms = JSON.parse(localStorage.getItem('instod_rooms') || '{}');
        savedRooms[rid] = roomData;
        localStorage.setItem('instod_rooms', JSON.stringify(savedRooms));
        const allRoomStates: Record<string, FurnitureData[]> = {};
        roomStatesRef.current.forEach((val, key) => { allRoomStates[key] = val; });
        localStorage.setItem('instod_room_states', JSON.stringify(allRoomStates));
      } catch (_e) { /* best effort */ }
    };
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('beforeunload', beforeUnload);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('pointerdown', markDirty); canvas.removeEventListener('pointermove', markDirty);
      window.removeEventListener('keydown', onKeyDown);
      // Dispose Three.js resources to prevent GPU memory leaks
      renderer.dispose();
      scene.traverse(c => {
        if (c instanceof THREE.Mesh) {
          const mat = c.material as THREE.MeshStandardMaterial;
          mat.map?.dispose(); c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach(m => { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); }); else c.material?.dispose();
        }
        if ((c instanceof THREE.SpotLight || c instanceof THREE.PointLight) && c.shadow?.map) {
          c.shadow.map.dispose(); c.shadow.map = null;
        }
      });
      // Dispose texture cache
      texCache.forEach(v => v.dispose()); texCache.clear();
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if (dragSaveTimeoutRef.current) clearTimeout(dragSaveTimeoutRef.current);
      clearTimeout(minLoadTimer);
    };
  }, []);

  // Resize on sidebar toggle only — mobile panel changes do NOT resize the canvas
  // (the canvas uses flex-1 min-h-0 so CSS handles the layout; programmatic resize
  //  causes a blank flash on mobile when the bottom panel opens/closes)
  useEffect(() => {
    const t = setTimeout(() => {
      const c = canvasRef.current, r = rendererRef.current, cam = cameraRef.current, p = c?.parentElement;
      if (c && r && cam && p) { r.setSize(p.clientWidth, p.clientHeight); cam.aspect = p.clientWidth / p.clientHeight; cam.updateProjectionMatrix(); }
    }, 200);
    return () => clearTimeout(t);
  }, [sidebarOpen]);

  const resetRoom = useCallback(() => {
    placedItemsRef.current.forEach(item => { sceneRef.current?.remove(item); item.traverse(c => { if (c instanceof THREE.Mesh) { c.geometry?.dispose(); if (Array.isArray(c.material)) c.material.forEach(m => m.dispose()); else c.material?.dispose(); } }); });
    placedItemsRef.current = []; selectedObjRef.current = null; setItemPanelVisible(false);
    roomWRef.current = 8; roomDRef.current = 6; roomHRef.current = 3; wallColRef.current = '#FAF8F4'; floorTypeRef.current = 'hardwood'; floorColorRef.current = '#B8956A'; doorWallRef.current = 'none'; windowCountRef.current = 1; windowWallRef.current = 'back'; lightMoodRef.current = 'daylight'; ceilingLightPresetRef.current = 'recessed';
    setRoomW(8); setRoomD(6); setRoomH(3); setWallCol('#FAF8F4'); setFloorType('hardwood'); setFloorColor('#B8956A'); setDoorWall('none'); setWindowCount(1); setWindowWall('back'); setLightMood('daylight'); setCeilingLightPreset('recessed');
    // Reset ceiling spot positions
    ceilingSpotPositionsRef.current = [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }];
    // Exit ceiling edit mode if active
    if (ceilingEditModeRef.current) { ceilingEditModeRef.current = false; setCeilingEditMode(false); }
    buildRoom(); addDefaultFurniture(); pushHistory(); showToast('Room reset');
  }, [buildRoom, addDefaultFurniture, pushHistory, showToast]);

  const takeScreenshot = useCallback(() => {
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current; if (!r || !s || !c) return;
    r.render(s, c); const link = document.createElement('a'); link.download = `${designName.replace(/\s+/g, '_')}.png`; link.href = r.domElement.toDataURL('image/png'); link.click(); showToast('Screenshot saved');
  }, [showToast, designName]);

  /* ===== APPLY SKIN ===== */
  const applySkin = useCallback((skinId: string) => {
    const skin = SKINS_DICTIONARY[skinId];
    if (!skin) return;

    const scene = sceneRef.current;
    const roomGroup = roomGroupRef.current;
    if (!scene || !roomGroup) return;

    setActiveSkin(skinId); activeSkinRef.current = skinId;
    applySkinToSkeleton(
      scene,
      roomGroup,
      placedItemsRef.current,
      skin,
      ambientLightRef.current,
      dirLightRef.current,
      rendererRef.current,
      hemiLightRef.current,
      fillLightRef.current
    );
    markSceneDirty();
    markUnsaved();
    showToast(`Applied "${skin.name}" theme`);
  }, [markSceneDirty, markUnsaved, showToast]);

  const rotateSelected = useCallback((dir: 'left' | 'right') => { if (selectedObjRef.current) { pushHistory(); selectedObjRef.current.rotation.y += dir === 'left' ? Math.PI / 12 : -Math.PI / 12; markUnsaved(); markSceneDirty(); } }, [pushHistory, markUnsaved, markSceneDirty]);

  const shareRoom = useCallback(() => { if (currentRoomId) { navigator.clipboard.writeText(`${window.location.origin}/view/${currentRoomId}`); showToast('Share link copied!'); } else { showToast('Save the room first to share it'); } }, [currentRoomId, showToast]);

  /* ===== SNAPSHOT ===== */
  const takeSnapshot = useCallback(() => {
    const name = snapshotName.trim() || `Snapshot ${snapshots.length + 1}`;
    const data = serializeFurniture();
    const roomSettings = {
      width: roomWRef.current, depth: roomDRef.current, height: roomHRef.current,
      wallColor: wallColRef.current, floorType: floorTypeRef.current, floorColor: floorColorRef.current,
      doorWall: doorWallRef.current, windowCount: windowCountRef.current, windowWall: windowWallRef.current,
      lightMood: lightMoodRef.current, ceilingLightPreset: ceilingLightPresetRef.current,
      ceilingSpotPositions: [...ceilingSpotPositionsRef.current],
    };
    setSnapshots(prev => [...prev, { name, data, roomSettings, timestamp: Date.now() }]);
    setSnapshotName('');
    showToast(`Snapshot "${name}" saved`);
  }, [snapshotName, snapshots, serializeFurniture, showToast, ceilingLightPreset]);

  const restoreSnapshot = useCallback((idx: number) => {
    const snap = snapshots[idx];
    if (!snap) return;
    // Restore furniture
    loadFurnitureData(snap.data);
    // Restore room settings
    const rs = snap.roomSettings as any;
    if (rs.width) { roomWRef.current = rs.width; setRoomW(rs.width); }
    if (rs.depth) { roomDRef.current = rs.depth; setRoomD(rs.depth); }
    if (rs.height) { roomHRef.current = rs.height; setRoomH(rs.height); }
    if (rs.wallColor) { wallColRef.current = rs.wallColor; setWallCol(rs.wallColor); }
    if (rs.floorType) { floorTypeRef.current = rs.floorType; setFloorType(rs.floorType); }
    if (rs.floorColor) { floorColorRef.current = rs.floorColor; setFloorColor(rs.floorColor); }
    if (rs.doorWall) { doorWallRef.current = rs.doorWall; setDoorWall(rs.doorWall); }
    if (rs.windowCount) { windowCountRef.current = rs.windowCount; setWindowCount(rs.windowCount); }
    if (rs.windowWall) { windowWallRef.current = rs.windowWall; setWindowWall(rs.windowWall); }
    if (rs.lightMood) { lightMoodRef.current = rs.lightMood; setLightMood(rs.lightMood); }
    if (rs.ceilingLightPreset) { ceilingLightPresetRef.current = rs.ceilingLightPreset; setCeilingLightPreset(rs.ceilingLightPreset); }
    if (rs.ceilingSpotPositions) { ceilingSpotPositionsRef.current = rs.ceilingSpotPositions; }
    buildRoom();
    pushHistory();
    markUnsaved();
    setShowSnapshots(false);
    showToast(`Restored "${snap.name}"`);
  }, [snapshots, loadFurnitureData, buildRoom, pushHistory, markUnsaved, showToast]);

  const deleteSnapshot = useCallback((idx: number) => {
    setSnapshots(prev => prev.filter((_, i) => i !== idx));
    showToast('Snapshot deleted');
  }, [showToast]);

  /* ===== EXPORT HD ===== */
  const exportHD = useCallback(() => {
    const r = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (!r || !s || !c) return;
    const origW = r.getSize(new THREE.Vector2()).x;
    const origH = r.getSize(new THREE.Vector2()).y;
    const scale = 2;
    r.setSize(origW * scale, origH * scale);
    r.setPixelRatio(scale);
    c.aspect = (origW * scale) / (origH * scale);
    c.updateProjectionMatrix();
    r.render(s, c);
    const link = document.createElement('a');
    link.download = `${designName.replace(/\s+/g, '_')}_HD.png`;
    link.href = r.domElement.toDataURL('image/png');
    link.click();
    // Restore original size
    r.setSize(origW, origH);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    c.aspect = origW / origH;
    c.updateProjectionMatrix();
    r.render(s, c);
    showToast('HD screenshot saved (2x resolution)');
  }, [showToast, designName]);

  /* ===== 2D FLOOR PLAN EXPORT ===== */
  const exportFloorPlan = useCallback(() => {
    const w = roomWRef.current, d = roomDRef.current;
    const scale = 100; // pixels per meter
    const canvas = document.createElement('canvas');
    canvas.width = w * scale + 80;
    canvas.height = d * scale + 80;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ox = 40, oy = 40; // offset

    // Floor
    ctx.fillStyle = '#FAF8F4';
    ctx.fillRect(ox, oy, w * scale, d * scale);

    // Walls
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 3;
    ctx.strokeRect(ox, oy, w * scale, d * scale);

    // Door
    if (doorWallRef.current !== 'none') {
      ctx.strokeStyle = '#C4B8A8';
      ctx.lineWidth = 2;
      const doorW = 0.9 * scale;
      const doorH = 0.9 * scale;
      if (doorWallRef.current === 'back') {
        ctx.beginPath(); ctx.moveTo(ox + w * scale / 2 - doorW / 2, oy); ctx.lineTo(ox + w * scale / 2 + doorW / 2, oy); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox + w * scale / 2 + doorW / 2, oy, doorH, Math.PI, Math.PI / 2, true); ctx.strokeStyle = '#C4B8A8'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      } else if (doorWallRef.current === 'left') {
        ctx.beginPath(); ctx.moveTo(ox, oy + d * scale / 2 - doorW / 2); ctx.lineTo(ox, oy + d * scale / 2 + doorW / 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox, oy + d * scale / 2 + doorW / 2, doorH, -Math.PI / 2, 0, false); ctx.strokeStyle = '#C4B8A8'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      } else if (doorWallRef.current === 'right') {
        ctx.beginPath(); ctx.moveTo(ox + w * scale, oy + d * scale / 2 - doorW / 2); ctx.lineTo(ox + w * scale, oy + d * scale / 2 + doorW / 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox + w * scale, oy + d * scale / 2 + doorW / 2, doorH, Math.PI, Math.PI / 2, true); ctx.strokeStyle = '#C4B8A8'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // Windows
    ctx.strokeStyle = '#8AB8D0';
    ctx.lineWidth = 4;
    for (let i = 0; i < windowCountRef.current; i++) {
      const winW = Math.min(w * 0.3, 2.2) * scale;
      const offset = (i - Math.floor(windowCountRef.current / 2));
      if (windowWallRef.current === 'back') {
        const xp = ox + (windowCountRef.current === 1 ? w * 0.15 * scale : w * scale / 2 + offset * w * 0.3 * scale);
        ctx.beginPath(); ctx.moveTo(xp - winW / 2, oy); ctx.lineTo(xp + winW / 2, oy); ctx.stroke();
      } else if (windowWallRef.current === 'left') {
        const yp = oy + (windowCountRef.current === 1 ? d * scale / 2 : d * scale / 2 + offset * d * 0.3 * scale);
        ctx.beginPath(); ctx.moveTo(ox, yp - winW / 2); ctx.lineTo(ox, yp + winW / 2); ctx.stroke();
      } else if (windowWallRef.current === 'right') {
        const yp = oy + (windowCountRef.current === 1 ? d * scale / 2 : d * scale / 2 + offset * d * 0.3 * scale);
        ctx.beginPath(); ctx.moveTo(ox + w * scale, yp - winW / 2); ctx.lineTo(ox + w * scale, yp + winW / 2); ctx.stroke();
      }
    }

    // Furniture items
    placedItemsRef.current.forEach(item => {
      if (!item.userData.fn) return;
      const fx = ox + (item.position.x + w / 2) * scale;
      const fz = oy + (item.position.z + d / 2) * scale;
      // Estimate size based on furniture type
      const sizes: Record<string, [number, number]> = {
        sofa: [2.0, 0.9], armchair: [0.9, 0.9], loveseat: [1.5, 0.9], coffeetable: [1.1, 0.6],
        sidetable: [0.5, 0.5], diningtable: [1.6, 0.9], desk: [1.4, 0.7], console: [1.2, 0.4],
        bookshelf: [1.2, 0.4], tvstand: [1.5, 0.4], bed: [2.0, 1.6], nightstand: [0.5, 0.4],
        wardrobe: [1.6, 0.6], dresser: [1.2, 0.5], crib: [1.2, 0.7], bunkbed: [1.2, 2.0],
        kitchencounter: [2.4, 0.6], kitchenisland: [1.8, 0.8], fridge: [0.7, 0.7], stove: [0.6, 0.6],
        sink: [0.6, 0.5], bathtub: [1.7, 0.8], shower: [1.0, 1.0], toilet: [0.4, 0.6],
        vanity: [0.8, 0.5], officechair: [0.6, 0.6], filingcabinet: [0.4, 0.5],
        plant: [0.4, 0.4], rug: [2.0, 1.5], lamp: [0.3, 0.3], floorlamp: [0.3, 0.3],
        pendantlight: [0.3, 0.3], artwork: [0.8, 0.04], mirror: [0.8, 0.04],
      };
      const [sw, sd] = sizes[item.userData.fn] || [0.6, 0.6];
      const fw = sw * scale;
      const fd = sd * scale;
      ctx.save();
      ctx.translate(fx, fz);
      ctx.rotate(item.rotation.y);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.strokeStyle = '#8A7E72';
      ctx.lineWidth = 1;
      ctx.fillRect(-fw / 2, -fd / 2, fw, fd);
      ctx.strokeRect(-fw / 2, -fd / 2, fw, fd);
      // Label
      ctx.fillStyle = '#5A4E42';
      ctx.font = '9px DM Sans';
      ctx.textAlign = 'center';
      ctx.fillText(item.userData.name || item.userData.fn, 0, 3);
      ctx.restore();
    });

    // Dimension labels
    ctx.fillStyle = '#5A4E42';
    ctx.font = '11px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`${w.toFixed(1)}m`, ox + w * scale / 2, oy - 8);
    ctx.save();
    ctx.translate(ox - 8, oy + d * scale / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${d.toFixed(1)}m`, 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#2D2D2D';
    ctx.font = 'bold 14px Outfit';
    ctx.textAlign = 'left';
    ctx.fillText(designName + ' — Floor Plan', ox, oy + d * scale + 24);

    // Export
    const link = document.createElement('a');
    link.download = `${designName.replace(/\s+/g, '_')}_floorplan.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Floor plan exported');
  }, [designName, showToast]);

  // Filtered furniture items
  // Phase 1.7 — Uses debouncedSearch instead of searchQuery so the filter
  // only recalculates 300ms after the user stops typing, preventing rapid
  // re-renders on every keystroke in the furniture catalog.
  const filteredItems = useMemo(() => debouncedSearch ? furnitureItems[currentCat].filter(i => i.name.toLowerCase().includes(debouncedSearch.toLowerCase())) : furnitureItems[currentCat], [debouncedSearch, currentCat]);

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
            {categories.filter(cat => !isGuest || GUEST_ALLOWED_CATEGORIES.has(cat.id)).map(cat => (
              <button key={cat.id} onClick={() => setCurrentCat(cat.id)}
                className={`cursor-pointer transition-all whitespace-nowrap ${currentCat === cat.id ? 'int-cat-tab-active' : 'int-cat-tab'}`}>
                <i className={`fas ${cat.icon} mr-0.5`} />{cat.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="px-3 py-1">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="int-search-input" style={{ paddingLeft: '14px' }} />
          </div>
          {/* Items grid */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {filteredItems.map(item => {
              const isLocked = isGuest && !GUEST_ALLOWED_FURNITURE.has(item.fn);
              return (
              <button key={item.name} onClick={() => { if (isLocked) { showToast('Sign in to unlock this item'); return; } addFurniture(item.fn, currentColor, currentMatType); }} className="int-furniture-card text-center relative"
                style={{ background: isLocked ? '#F8F6F2' : undefined }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-1 text-sm relative" style={{ background: isLocked ? '#E8E4DE' : '#F0E8D8', color: isLocked ? '#A09080' : '#5A4E42' }}>
                  <i className={`fas ${item.icon}`} />
                </div>
                <p className="text-[12px] font-semibold leading-tight" style={{ color: isLocked ? '#A09080' : '#2D2D2D' }}>{item.name}</p>
                {isLocked && (
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'rgba(250,248,244,0.75)' }}>
                    <i className="fas fa-lock text-[12px] mb-0.5" style={{ color: '#C17F4E' }} />
                    <span className="text-[9px] font-bold" style={{ color: '#C17F4E' }}>Sign In</span>
                  </div>
                )}
              </button>
              );
            })}
          </div>
        </div>
      ),
      material: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="int-section-header">Material & Color</p>
          <div className="flex gap-1 mb-2 flex-wrap">
            {(['fabric', 'leather', 'wood', 'metal'] as MatType[]).map(t => (
              <button key={t} onClick={() => setCurrentMatType(t)}
                className={`cursor-pointer transition-all ${currentMatType === t ? 'int-mat-pill-active' : 'int-mat-pill'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(isGuest ? matColors[currentMatType].slice(0, GUEST_COLORS_PER_TYPE) : matColors[currentMatType]).map(c => (
              <button key={c} onClick={() => { setCurrentColor(c); if (selectedObjRef.current) applyMaterial(c, currentMatType); }}
                className={`int-color-swatch ${currentColor === c ? 'int-color-swatch-active' : ''}`}
                style={{ background: c }} aria-label={colorNames[c] || c} role="radio" aria-checked={currentColor === c} />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-1"><span className="text-[10px]" style={{ color: '#5A4E42' }}>Color:</span><span className="text-[11px] font-semibold" style={{ color: '#2D2D2D' }}>{colorNames[currentColor] || currentColor}</span></div>
          {/* Wall Color */}
          <p className="int-section-header" style={{ marginTop: '12px' }}>Wall Color</p>
          <div className="flex flex-wrap gap-1.5">
            {wallColorOptions.map(wc => (
              <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }}
                className={`int-color-swatch ${wallCol === wc.color ? 'int-color-swatch-active' : ''}`}
                style={{ background: wc.color }} aria-label={wc.label} role="radio" aria-checked={wallCol === wc.color} />
            ))}
            <div className="relative">
              <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
              <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[10px] text-white drop-shadow" />
              </div>
            </div>
          </div>
          {/* Floor Color */}
          <p className="int-section-header" style={{ marginTop: '12px' }}>Floor Color</p>
          <div className="flex flex-wrap gap-1.5">
            {floorColorOptions.map(fc => (
              <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }}
                className={`int-color-swatch ${floorColor === fc.color ? 'int-color-swatch-active' : ''}`}
                style={{ background: fc.color }} aria-label={fc.label} role="radio" aria-checked={floorColor === fc.color} />
            ))}
            <div className="relative">
              <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
              <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[10px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>
      ),
      skin: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="int-section-header">Design Themes</p>
          <div className="grid grid-cols-2 gap-2">
            {SKINS_LIST.filter(s => s.id !== 'default').map(skin => (
              <button key={skin.id} onClick={() => applySkin(skin.id)}
                className="p-3 rounded-xl border-2 cursor-pointer transition-all text-left"
                style={{
                  borderColor: activeSkin === skin.id ? skin.accent : '#E8DFD4',
                  background: activeSkin === skin.id ? `${skin.accent}10` : '#FFFFFF',
                }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: activeSkin === skin.id ? skin.accent : '#F0E8D8', color: activeSkin === skin.id ? '#fff' : '#5A4E42' }}>
                    <i className={`fas ${skin.icon} text-xs`} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold" style={{ color: activeSkin === skin.id ? skin.accent : '#2D2D2D' }}>{skin.name}</p>
                  </div>
                </div>
                <p className="text-[11px] leading-tight" style={{ color: '#7A6E62' }}>{skin.description}</p>
                {/* Color preview bar */}
                <div className="int-skin-colorbar" style={{
                  background: `linear-gradient(90deg, ${Object.values(skin.slots).filter(Boolean).slice(0, 5).map((s: any) => s.color).join(', ')})`
                }} />
              </button>
            ))}
          </div>
          {activeSkin !== 'default' && (
            <button onClick={() => applySkin('default')} className="w-full mt-3 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer border flex items-center justify-center gap-1.5" style={{ borderColor: '#5C4033', color: '#5C4033', background: 'rgba(92,64,51,0.06)' }}>
              <i className="fas fa-bone" />Reset to Skeleton
            </button>
          )}
        </div>
      ),
      room: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="int-section-header">Room Settings</p>
          {[
            { label: 'Width', val: roomW, min: 4, max: 14, step: 0.5, setter: [setRoomW, (v: number) => roomWRef.current = v] },
            { label: 'Depth', val: roomD, min: 4, max: 12, step: 0.5, setter: [setRoomD, (v: number) => roomDRef.current = v] },
            { label: 'Height', val: roomH, min: 2.5, max: 5, step: 0.25, setter: [setRoomH, (v: number) => roomHRef.current = v] },
          ].map(({ label, val, min, max, step, setter }) => (
            <div key={label as string} className="mb-2">
              <div className="flex justify-between mb-0.5 items-center"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>{label as string}</span>
                <div className="flex items-center gap-0.5">
                  <input type="number" className="w-10 text-[12px] text-center rounded border-none outline-none" style={{ background: 'transparent', color: '#4A3E32' }} min={min as number} max={max as number} step={step as number} value={(val as number).toFixed(1)} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= (min as number) && v <= (max as number)) { (setter as any)[0](v); (setter as any)[1](v); updateRoomVisualPreview(roomWRef.current, roomDRef.current, roomHRef.current); debouncedBuildRoom(); markUnsaved(); } }} />
                  <span className="text-[12px]" style={{ color: '#4A3E32' }}>m</span>
                </div>
              </div>
              <input type="range" className="int-range" min={min as number} max={max as number} value={val as number} step={step as number} onChange={e => { const v = parseFloat(e.target.value); (setter as any)[0](v); (setter as any)[1](v); updateRoomVisualPreview(roomWRef.current, roomDRef.current, roomHRef.current); debouncedBuildRoom(); markUnsaved(); }} onMouseUp={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} onTouchEnd={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} />
            </div>
          ))}
          {/* Wall Color */}
          <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Wall Color</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {wallColorOptions.map(wc => (
                <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }}
                  className={`int-color-swatch ${wallCol === wc.color ? 'int-color-swatch-active' : ''}`}
                  style={{ background: wc.color }} aria-label={wc.label} role="radio" aria-checked={wallCol === wc.color} />
              ))}
              <div className="relative">
                <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
                <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                  <i className="fas fa-eyedropper text-[10px] text-white drop-shadow" />
                </div>
              </div>
            </div>
          </div>
          {/* Floor Type */}
          <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Flooring</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {floorTypeOptions.map(ft => (
                <button key={ft.id} onClick={() => { setFloorType(ft.id); floorTypeRef.current = ft.id; buildRoom(); markUnsaved(); }}
                  className={`int-color-swatch ${floorType === ft.id ? 'int-color-swatch-active' : ''}`}
                  style={{ background: ft.color }} aria-label={ft.label} role="radio" aria-checked={floorType === ft.id} />
              ))}
            </div>
          </div>
          {/* Floor Color */}
          <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Floor Color</span>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {floorColorOptions.map(fc => (
                <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }}
                  className={`int-color-swatch ${floorColor === fc.color ? 'int-color-swatch-active' : ''}`}
                  style={{ background: fc.color }} aria-label={fc.label} role="radio" aria-checked={floorColor === fc.color} />
              ))}
              <div className="relative">
                <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8" />
                <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                  <i className="fas fa-eyedropper text-[10px] text-white drop-shadow" />
                </div>
              </div>
            </div>
          </div>
          {/* Lighting */}
          <div><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Lighting</span>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {lightMoodOptions.map(lm => {
                const lockedMoods = new Set(['golden', 'night']);
                const isLocked = isGuest && lockedMoods.has(lm.id);
                return (
                <button key={lm.id} onClick={() => { if (isLocked) { showToast('Sign up to unlock ' + lm.label + ' mood'); return; } setLightMood(lm.id); lightMoodRef.current = lm.id; updateLightingMood(lm.id); markUnsaved(); }} className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-all relative ${isLocked ? 'opacity-50' : ''}`}
                  style={{ borderColor: lightMood === lm.id ? '#C17F4E' : '#E8DFD4', color: lightMood === lm.id ? '#C17F4E' : '#4A3E32', background: lightMood === lm.id ? '#F5E8DC' : 'transparent' }}>
                  {lm.icon} {lm.label}
                  {isLocked && <i className="fas fa-lock text-[6px] absolute -top-0.5 -right-0.5" style={{ color: '#7A6E62' }} />}
                </button>
              );})}
            </div>
          </div>
          {/* Ceiling Light Preset - Mobile */}
          <div className="mt-3">
            <span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Ceiling Light Style</span>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {ceilingLightPresets.map(p => (
                <button key={p.id} onClick={() => { setCeilingLightPreset(p.id as 'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'); ceilingLightPresetRef.current = p.id as 'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'; const newPositions: Record<string, Array<{ x: number; z: number }>> = { recessed: [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }], chandelier: [{ x: 0, z: 0 }], track: [{ x: -1.2, z: 0 }, { x: -0.4, z: 0 }, { x: 0.4, z: 0 }, { x: 1.2, z: 0 }], panel: [{ x: 0, z: 0 }], pendant: [{ x: -1.2, z: 0 }, { x: 0, z: 0 }, { x: 1.2, z: 0 }] }; ceilingSpotPositionsRef.current = newPositions[p.id] || [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }]; buildRoom(); markUnsaved(); }}
                  className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-all"
                  style={{ borderColor: ceilingLightPreset === p.id ? '#C17F4E' : '#E8DFD4', color: ceilingLightPreset === p.id ? '#C17F4E' : '#4A3E32', background: ceilingLightPreset === p.id ? '#F5E8DC' : 'transparent' }}>
                  <i className={`fas ${p.icon} mr-0.5`} />{p.label}
                </button>
              ))}
            </div>
          </div>
          {/* Ceiling Light Edit - Mobile */}
          <div className="mt-3">
            <button onClick={ceilingEditMode ? exitCeilingEditMode : enterCeilingEditMode}
              className="w-full py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer border transition-all"
              style={{ borderColor: ceilingEditMode ? '#C17F4E' : '#E8DFD4', color: ceilingEditMode ? '#C17F4E' : '#4A3E32', background: ceilingEditMode ? 'rgba(193,127,78,0.1)' : 'transparent' }}>
              <i className="fas fa-lightbulb text-[9px]" />{ceilingEditMode ? 'Exit Light Editor' : 'Edit Ceiling Lights'}
            </button>
          </div>
        </div>
      ),
      skeleton: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          {/* Skeleton header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(92,64,51,0.1)' }}>
              <i className="fas fa-bone text-sm" style={{ color: '#5C4033' }} />
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: '#2D2D2D' }}>Skeleton Mode</p>
              <p className="text-[10px]" style={{ color: '#7A6E62' }}>Original bare structure</p>
            </div>
          </div>

          {/* Current skin status */}
          <div className="p-3 rounded-xl mb-3" style={{ background: activeSkin === 'default' ? 'rgba(92,64,51,0.06)' : '#FAF8F4', border: `1px solid ${activeSkin === 'default' ? '#5C4033' : '#E8DFD4'}` }}>
            <div className="flex items-center gap-2 mb-1">
              <i className={`fas ${activeSkin === 'default' ? 'fa-check-circle' : 'fa-paint-brush'} text-xs`} style={{ color: activeSkin === 'default' ? '#5C4033' : '#7A6E62' }} />
              <p className="text-[11px] font-bold" style={{ color: activeSkin === 'default' ? '#5C4033' : '#7A6E62' }}>
                {activeSkin === 'default' ? 'Skeleton Active' : `Skin: ${SKINS_DICTIONARY[activeSkin]?.name || activeSkin}`}
              </p>
            </div>
            <p className="text-[11px]" style={{ color: '#7A6E62' }}>
              {activeSkin === 'default'
                ? 'Your room is in its original skeleton state — no theme skin applied.'
                : 'A design skin is currently applied. Reset to skeleton to remove it.'}
            </p>
          </div>

          {/* Reset to Skeleton button */}
          {activeSkin !== 'default' && (
            <button onClick={() => applySkin('default')}
              className="w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer border-none mb-3 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #5C4033, #3B2F28)', color: '#fff' }}>
              <i className="fas fa-bone" />Reset to Skeleton
            </button>
          )}

          {/* Quick skin preview strip */}
          <p className="int-section-header">Quick Apply Skin</p>
          <div className="grid grid-cols-2 gap-2">
            {SKINS_LIST.filter(s => s.id !== 'default').map(skin => (
              <button key={skin.id} onClick={() => applySkin(skin.id)}
                className="p-2.5 rounded-xl border-2 cursor-pointer transition-all text-left"
                style={{
                  borderColor: activeSkin === skin.id ? skin.accent : '#E8DFD4',
                  background: activeSkin === skin.id ? `${skin.accent}10` : '#FFFFFF',
                }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeSkin === skin.id ? skin.accent : '#F0E8D8', color: activeSkin === skin.id ? '#fff' : '#5A4E42' }}>
                    <i className={`fas ${skin.icon} text-[10px]`} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: activeSkin === skin.id ? skin.accent : '#2D2D2D' }}>{skin.name}</span>
                </div>
                <div className="int-skin-colorbar" style={{
                  background: `linear-gradient(90deg, ${Object.values(skin.slots).filter(Boolean).slice(0, 4).map((s: any) => s.color).join(', ')})`
                }} />
              </button>
            ))}
          </div>

          {/* Destructive actions */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: '#E2DDD4' }}>
            <p className="int-section-header">Clear & Reset</p>
            <div className="flex gap-2">
              <button onClick={() => { loadFurnitureData([]); setActiveSkin('default'); activeSkinRef.current = 'default'; applySkin('default'); markUnsaved(); showToast('All furniture cleared, skin reset'); }}
                className="flex-1 py-2.5 rounded-lg text-[11px] font-semibold cursor-pointer border flex items-center justify-center gap-1"
                style={{ borderColor: '#e8d0d0', color: '#c0392b', background: '#fff' }}>
                <i className="fas fa-eraser text-[9px]" />Clear Furniture
              </button>
              <button onClick={() => { if (confirm('Reset the entire room? This will remove all furniture and reset room settings.')) resetRoom(); }}
                className="flex-1 py-2.5 rounded-lg text-[11px] font-semibold cursor-pointer border flex items-center justify-center gap-1"
                style={{ borderColor: '#e8d0d0', color: '#c0392b', background: '#fff' }}>
                <i className="fas fa-trash-alt text-[9px]" />Reset Room
              </button>
            </div>
          </div>
        </div>
      ),
      presets: (
        <div className="h-full overflow-y-auto int-scrollbar p-3">
          <p className="int-section-header">Design Presets</p>
          <p className="text-[11px] mb-3" style={{ color: '#7A6E62' }}>Tap a preset to instantly load a curated room design</p>
          {/* Room type filter */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {(['living', 'bedroom', 'kitchen', 'dining', 'office', 'bathroom'] as PresetRoomType[]).map(type => (
              <button key={type} onClick={() => setSelectedRoomType(type)}
                className={`cursor-pointer transition-all whitespace-nowrap ${selectedRoomType === type ? 'int-cat-tab-active' : 'int-cat-tab'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          {/* Preset cards */}
          <div className="grid grid-cols-1 gap-2">
            {getPresetsForRoom(selectedRoomType).map(preset => (
              <button key={preset.id} onClick={() => loadPreset(preset)}
                className="p-4 rounded-2xl border cursor-pointer transition-all text-left hover:shadow-sm relative"
                style={{ borderColor: preset.accent + '40', background: '#FFFFFF' }}>
                <div className="int-preset-accent-bar" style={{ background: `linear-gradient(90deg, ${preset.accent}, transparent)` }} />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: preset.accent + '18', color: preset.accent }}>
                    <i className={`fas ${preset.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: '#2D2D2D' }}>{preset.name}</p>
                    <p className="text-[11px]" style={{ color: '#7A6E62' }}>{preset.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px]" style={{ color: '#5A4E42' }}>{preset.furniture.length} pieces</span>
                      <div className="flex gap-0.5">
                        {Object.values(SKINS_DICTIONARY[preset.skin || 'default']?.slots || {}).filter(Boolean).slice(0, 4).map((slot, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full border" style={{ background: (slot as any).color, borderColor: '#E2DDD4' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-[10px]" style={{ color: '#C4A882' }} />
                </div>
              </button>
            ))}
          </div>
          {isGuest && (
            <div className="mt-3 p-2.5 rounded-lg border" style={{ background: '#FAF8F4', borderColor: '#E8DFD4' }}>
              <p className="text-[10px]" style={{ color: '#5A4E42' }}><i className="fas fa-lock text-[9px] mr-1" style={{ color: '#7A6E62' }} />Sign in to save presets and unlock more designs</p>
              <a href="/auth/signup" className="text-[10px] font-bold no-underline" style={{ color: '#C17F4E' }}>Sign Up Free →</a>
            </div>
          )}
        </div>
      ),
    };
    return panelContent[mobilePanel];
  };

  /* ===== DESKTOP SIDEBAR CONTENT ===== */
  const renderDesktopSidebar = () => (
    <aside data-sidebar-theme={sidebarDark ? 'dark' : 'light'} className={`int-scrollbar h-screen overflow-y-auto ${sidebarDark ? '' : `int-sidebar int-sidebar-glow-${lightMood}`}`} style={{ width: sidebarOpen ? 320 : 0, minWidth: sidebarOpen ? 320 : 0, borderRight: sidebarOpen ? `1px solid ${sidebarDark ? 'rgba(255,255,255,0.06)' : '#E8DFD4'}` : 'none', overflow: sidebarOpen ? 'auto' : 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', backgroundColor: sidebarDark ? '#1E1B18' : undefined, color: sidebarDark ? '#E8E0D6' : undefined }}>
      {/* Logo */}
      <div className="p-5 int-logo-border">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Instod" className="w-9 h-9 rounded-xl" />
          <div><h1 className="text-lg font-bold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Instod</h1><p className="text-[12px]" style={{ color: '#7A6E62' }}>3D Design Previewer</p></div>
        </div>
      </div>

      {/* Furniture Library */}
      <div className="p-5">
        <p className="int-section-header">Furniture Library</p>
        <div className="relative mb-2">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: '#7A6E62' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search furniture..." className="int-search-input" />
        </div>
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCurrentCat(cat.id)} className={`int-cat-tab ${currentCat === cat.id ? 'int-cat-tab-active' : ''}`}>
              <i className={`fas ${cat.icon} mr-0.5`} />{cat.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
          {filteredItems.map(item => (
            <button key={item.name} onClick={() => addFurniture(item.fn, currentColor, currentMatType)} className="int-furniture-card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1 text-base" style={{ background: '#F0E8D8', color: '#5A4E42' }}><i className={`fas ${item.icon}`} /></div>
              <p className="text-[13px] font-semibold leading-tight">{item.name}</p>
              <p className="text-[11px]" style={{ color: '#7A6E62' }}>{item.desc}</p>
            </button>
          ))}
          {filteredItems.length === 0 && <p className="text-xs col-span-2 text-center py-4" style={{ color: '#5A4E42' }}>No items found</p>}
        </div>
      </div>
      <div className="int-section-divider" />

      {/* Material & Color */}
      <div className="p-5">
        <p className="int-section-header">Material & Color</p>
        <div className="flex gap-1 mb-2 flex-wrap">
          {(['fabric', 'leather', 'wood', 'metal'] as MatType[]).map(t => (
            <button key={t} onClick={() => setCurrentMatType(t)} className={`int-mat-pill ${currentMatType === t ? 'int-mat-pill-active' : ''}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(isGuest ? matColors[currentMatType].slice(0, GUEST_COLORS_PER_TYPE) : matColors[currentMatType]).map(c => (
            <button key={c} onClick={() => { setCurrentColor(c); if (selectedObjRef.current) applyMaterial(c, currentMatType); }} className={`int-color-swatch ${currentColor === c ? 'int-color-swatch-active' : ''}`}
              style={{ background: c }} aria-label={colorNames[c] || c} role="radio" aria-checked={currentColor === c} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2"><span className="text-[12px]" style={{ color: '#7A6E62' }}>Selected:</span><span className="text-[13px] font-semibold" style={{ color: '#2D2D2D' }}>{colorNames[currentColor] || currentColor}</span></div>
      </div>
      <div className="int-section-divider" />

      {/* Room Settings */}
      <div className="p-5">
        <p className="int-section-header">Room Settings</p>
        {[
          { label: 'Width', val: roomW, min: 4, max: 14, step: 0.5, setter: [setRoomW, (v: number) => roomWRef.current = v] },
          { label: 'Depth', val: roomD, min: 4, max: 12, step: 0.5, setter: [setRoomD, (v: number) => roomDRef.current = v] },
          { label: 'Ceiling Height', val: roomH, min: 2.5, max: 5, step: 0.25, setter: [setRoomH, (v: number) => roomHRef.current = v] },
        ].map(({ label, val, min, max, step, setter }) => (
          <div key={label as string} className="mb-2">
            <div className="flex justify-between mb-0.5 items-center"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>{label as string}</span>
              <div className="flex items-center gap-0.5">
                <input type="number" className="w-10 text-[12px] text-center rounded border-none outline-none" style={{ background: 'transparent', color: '#5A4E42' }} min={min as number} max={max as number} step={step as number} value={(val as number).toFixed(1)} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v >= (min as number) && v <= (max as number)) { (setter as any)[0](v); (setter as any)[1](v); buildRoom(); markUnsaved(); } }} />
                <span className="text-[12px]" style={{ color: '#5A4E42' }}>m</span>
              </div>
            </div>
            <input type="range" className="int-range" min={min as number} max={max as number} value={val as number} step={step as number} onChange={e => { const v = parseFloat(e.target.value); (setter as any)[0](v); (setter as any)[1](v); updateRoomVisualPreview(roomWRef.current, roomDRef.current, roomHRef.current); debouncedBuildRoom(); markUnsaved(); }} onMouseUp={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} onTouchEnd={() => { if (buildRoomTimeoutRef.current) { clearTimeout(buildRoomTimeoutRef.current); buildRoomTimeoutRef.current = null; } buildRoom(); }} />
          </div>
        ))}

        {/* Wall Color */}
        <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Wall Color</span>
          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
            {wallColorOptions.map(wc => (
              <button key={wc.color} onClick={() => { setWallCol(wc.color); updateWallColor(wc.color); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: wc.color, borderColor: wallCol === wc.color ? '#C17F4E' : 'transparent' }} title={wc.label} />
            ))}
            <div className="relative">
              <input type="color" value={wallCol} onChange={e => { const c = e.target.value; setWallCol(c); updateWallColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7" />
              <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Floor Type */}
        <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Flooring</span>
          <div className="flex gap-1.5 mt-1.5">
            {floorTypeOptions.map(ft => (
              <button key={ft.id} onClick={() => { setFloorType(ft.id); floorTypeRef.current = ft.id; buildRoom(); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: ft.color, borderColor: floorType === ft.id ? '#C17F4E' : 'transparent' }} title={ft.label} />
            ))}
          </div>
        </div>

        {/* Floor Color */}
        <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Floor Color</span>
          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
            {floorColorOptions.map(fc => (
              <button key={fc.color} onClick={() => { setFloorColor(fc.color); updateFloorColor(fc.color); markUnsaved(); }} className="w-7 h-7 rounded-lg cursor-pointer border-2 transition-all"
                style={{ background: fc.color, borderColor: floorColor === fc.color ? '#C17F4E' : 'transparent' }} title={fc.label} />
            ))}
            <div className="relative">
              <input type="color" value={floorColor} onChange={e => { const c = e.target.value; setFloorColor(c); updateFloorColor(c); markUnsaved(); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7" />
              <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: '#E8DFD4', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                <i className="fas fa-eyedropper text-[8px] text-white drop-shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Door */}
        <div className="mb-2"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Door</span>
          <div className="flex gap-1 mt-1.5">
            {['none', 'back', 'left', 'right'].map(dw => (
              <button key={dw} onClick={() => { setDoorWall(dw); doorWallRef.current = dw; buildRoom(); markUnsaved(); }} className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: doorWall === dw ? '#C17F4E' : '#E8DFD4', color: doorWall === dw ? '#C17F4E' : '#4A3E32', background: doorWall === dw ? '#F5E8DC' : 'transparent' }}>
                {dw === 'none' ? 'None' : dw.charAt(0).toUpperCase() + dw.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Windows */}
        <div className="mb-2">
          <div className="flex justify-between mb-0.5"><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Windows</span><span className="text-[12px]" style={{ color: '#5A4E42' }}>{windowCount}</span></div>
          <input type="range" className="int-range" min={1} max={3} value={windowCount} step={1} onChange={e => { const v = parseInt(e.target.value); setWindowCount(v); windowCountRef.current = v; buildRoom(); markUnsaved(); }} />
          <div className="flex gap-1 mt-1">
            {['back', 'left', 'right'].map(ww => (
              <button key={ww} onClick={() => { setWindowWall(ww); windowWallRef.current = ww; buildRoom(); markUnsaved(); }} className="px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: windowWall === ww ? '#C17F4E' : '#E8DFD4', color: windowWall === ww ? '#C17F4E' : '#4A3E32' }}>
                {ww.charAt(0).toUpperCase() + ww.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting Mood */}
        <div><span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Lighting</span>
          <div className="flex gap-1.5 mt-1.5">
            {lightMoodOptions.map(lm => {
              const lockedMoods = new Set(['golden', 'night']);
              const isLocked = isGuest && lockedMoods.has(lm.id);
              return (
              <button key={lm.id} onClick={() => { if (isLocked) { showToast('Sign up to unlock ' + lm.label + ' mood'); return; } setLightMood(lm.id); lightMoodRef.current = lm.id; updateLightingMood(lm.id); markUnsaved(); }} className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-all relative ${isLocked ? 'opacity-50' : ''}`}
                style={{ borderColor: lightMood === lm.id ? '#C17F4E' : '#E8DFD4', color: lightMood === lm.id ? '#C17F4E' : '#4A3E32', background: lightMood === lm.id ? '#F5E8DC' : 'transparent' }}>
                {lm.icon} {lm.label}
                {isLocked && <i className="fas fa-lock text-[6px] absolute -top-0.5 -right-0.5" style={{ color: '#7A6E62' }} />}
              </button>
            );})}
          </div>
        </div>

        {/* Ceiling Light Preset */}
        <div className="mb-3">
          <span className="text-[12px] font-semibold" style={{ color: '#4A3E32' }}>Ceiling Light Style</span>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {ceilingLightPresets.map(preset => (
              <button key={preset.id} onClick={() => { setCeilingLightPreset(preset.id as 'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'); ceilingLightPresetRef.current = preset.id as 'recessed' | 'chandelier' | 'track' | 'panel' | 'pendant'; const newPositions: Record<string, Array<{ x: number; z: number }>> = { recessed: [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }], chandelier: [{ x: 0, z: 0 }], track: [{ x: -1.2, z: 0 }, { x: -0.4, z: 0 }, { x: 0.4, z: 0 }, { x: 1.2, z: 0 }], panel: [{ x: 0, z: 0 }], pendant: [{ x: -1.2, z: 0 }, { x: 0, z: 0 }, { x: 1.2, z: 0 }] }; ceilingSpotPositionsRef.current = newPositions[preset.id] || [{ x: -1.5, z: 0 }, { x: 1.5, z: 0 }]; buildRoom(); markUnsaved(); }}
                className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer border transition-all"
                style={{ borderColor: ceilingLightPreset === preset.id ? '#C17F4E' : '#E8DFD4', color: ceilingLightPreset === preset.id ? '#C17F4E' : '#4A3E32', background: ceilingLightPreset === preset.id ? '#F5E8DC' : 'transparent' }}>
                <i className={`fas ${preset.icon} mr-0.5`} />{preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ceiling Light Edit */}
        <div className="mt-3">
          <button onClick={ceilingEditMode ? exitCeilingEditMode : enterCeilingEditMode}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border transition-all"
            style={{ borderColor: ceilingEditMode ? '#C17F4E' : '#E8DFD4', color: ceilingEditMode ? '#C17F4E' : '#4A3E32', background: ceilingEditMode ? 'rgba(193,127,78,0.1)' : 'transparent' }}>
            <i className="fas fa-lightbulb text-[12px]" />{ceilingEditMode ? 'Exit Light Editor' : 'Edit Ceiling Lights'}
          </button>
        </div>
      </div>
      <div className="int-section-divider" />

      {/* Design Presets */}
      <div className="p-5">
        <p className="int-section-header">Design Presets</p>
        <div className="flex gap-1.5 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {(['living', 'bedroom', 'kitchen', 'dining', 'office', 'bathroom'] as PresetRoomType[]).map(type => {
            const lockedTypes = new Set(['kitchen', 'dining', 'bathroom']);
            const isLocked = isGuest && lockedTypes.has(type);
            return (
            <button key={type} onClick={() => { if (isLocked) { showToast('Sign up to unlock ' + type.charAt(0).toUpperCase() + type.slice(1)); return; } setSelectedRoomType(type); }}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all whitespace-nowrap border relative ${isLocked ? 'opacity-50' : ''} ${selectedRoomType === type ? 'border-[#C17F4E] text-[#C17F4E] bg-[rgba(193,127,78,0.05)]' : 'border-[#E2DDD4] text-[#5A4E42] bg-[#FAF8F4]'}`}>
              {isLocked && <i className="fas fa-lock text-[7px] absolute top-0.5 right-0.5" style={{ color: '#7A6E62' }} />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );})}
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto int-scrollbar">
          {getPresetsForRoom(selectedRoomType).map(preset => (
            <button key={preset.id} onClick={() => loadPreset(preset)}
              className="w-full p-4 rounded-2xl border cursor-pointer transition-all text-left hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: preset.accent + '30', background: '#FFFFFF' }}>
              <div className="int-preset-accent-bar" style={{ background: `linear-gradient(90deg, ${preset.accent}, transparent)` }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: preset.accent + '18', color: preset.accent }}>
                  <i className={`fas ${preset.icon} text-[14px]`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: '#2D2D2D' }}>{preset.name}</p>
                  <p className="text-[11px] truncate" style={{ color: '#7A6E62' }}>{preset.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="int-section-divider" />

      {/* Design Skins */}
      <div className="p-5">
        <p className="int-section-header">Design Skins</p>
        {/* Skeleton button - always prominent at top */}
        <button onClick={() => applySkin('default')}
          className="w-full p-3 rounded-xl border-2 cursor-pointer transition-all text-left mb-2 hover:shadow-md"
          style={{
            borderColor: activeSkin === 'default' ? '#5C4033' : '#E8DFD4',
            background: activeSkin === 'default' ? 'rgba(92,64,51,0.08)' : '#FFFFFF',
          }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeSkin === 'default' ? '#5C4033' : '#F0E8D8', color: activeSkin === 'default' ? '#fff' : '#5A4E42' }}>
              <i className="fas fa-bone text-[14px]" />
            </div>
            <div>
              <span className="text-[13px] font-bold" style={{ color: activeSkin === 'default' ? '#5C4033' : '#2D2D2D' }}>Skeleton</span>
              <p className="text-[11px]" style={{ color: '#7A6E62' }}>Original bare structure</p>
            </div>
            {activeSkin === 'default' && (
              <i className="fas fa-check-circle text-[10px] ml-auto" style={{ color: '#5C4033' }} />
            )}
          </div>
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          {SKINS_LIST.filter(s => s.id !== 'default').map(skin => (
            <button key={skin.id} onClick={() => applySkin(skin.id)}
              className="p-3 rounded-xl border-2 cursor-pointer transition-all text-left hover:shadow-md"
              style={{
                borderColor: activeSkin === skin.id ? skin.accent : '#E8DFD4',
                background: activeSkin === skin.id ? `${skin.accent}10` : '#FFFFFF',
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <i className={`fas ${skin.icon} text-[14px]`} style={{ color: activeSkin === skin.id ? skin.accent : '#5A4E42' }} />
                <span className="text-[13px] font-bold" style={{ color: activeSkin === skin.id ? skin.accent : '#2D2D2D' }}>{skin.name}</span>
              </div>
              <div className="int-skin-colorbar" style={{
                background: `linear-gradient(90deg, ${Object.values(skin.slots).filter(Boolean).slice(0, 5).map((s: any) => s.color).join(', ')})`
              }} />
            </button>
          ))}
        </div>
        {/* Clear & Reset */}
        <div className="mt-3 pt-2">
          <div className="flex gap-1.5">
            <button onClick={() => { loadFurnitureData([]); setActiveSkin('default'); activeSkinRef.current = 'default'; applySkin('default'); markUnsaved(); showToast('All furniture cleared, skin reset'); }}
              className="int-btn-danger flex-1"><i className="fas fa-eraser" />Clear</button>
            <button onClick={() => { if (confirm('Reset the entire room?')) resetRoom(); }}
              className="int-btn-danger flex-1"><i className="fas fa-trash-alt" />Reset</button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5">
        <p className="int-section-header">Actions</p>
        <div className="flex flex-col gap-2">
          <button onClick={saveRoom} className="int-btn-primary w-full"><i className="fas fa-save" />Save Room</button>
          <button onClick={() => window.location.href = '/dashboard'} className="int-btn-secondary w-full"><i className="fas fa-th-large" />Dashboard</button>
          <div className="flex gap-2">
            <button onClick={() => setShowSnapshots(true)} className="int-btn-secondary flex-1"><i className="fas fa-camera-retro" />Snapshots</button>
            <button onClick={takeScreenshot} className="int-btn-secondary flex-1"><i className="fas fa-camera" />Screenshot</button>
          </div>
          <div className="flex gap-2">
            <button onClick={exportHD} className="int-btn-secondary flex-1"><i className="fas fa-expand" />Export HD</button>
            <button onClick={exportFloorPlan} className="int-btn-secondary flex-1"><i className="fas fa-drafting-compass" />Floor Plan</button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden`} style={{ background: '#F5F0E8', color: '#2D2D2D', fontFamily: "'DM Sans', sans-serif", height: '100dvh' }}>
      {/* WebGL Fallback — shown when browser doesn't support WebGL */}
      {webglError && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#F0E8D8' }}>
              <i className="fas fa-cube text-2xl" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>3D Editor Unavailable</h2>
            <p className="text-sm mb-4" style={{ color: '#5A4E42' }}>{webglError}</p>
            <a href="/" className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#C17F4E' }}>Return to Homepage</a>
          </div>
        </div>
      )}
      {!webglError && (
        <>

      {/* ===== LOADING OVERLAY — shows until scene is ready ===== */}
      {!sceneReady && (
        <div className="fixed inset-0 z-[200]" style={{ transition: 'opacity 0.5s ease-out' }}>
          <EditorLoader />
        </div>
      )}

      {/* ===== ONBOARDING OVERLAY ===== */}
      {showOnboarding && sceneReady && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ background: 'rgba(45,45,45,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeInUp 0.4s ease forwards' }}>
          <div className="bg-white rounded-2xl p-5 sm:p-7 max-w-lg w-full mx-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto int-scrollbar" onKeyDown={trapFocus} style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>
            {/* Step 1: Room Type */}
            {onboardingStep === 'room' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0E8D8' }}>
                    <i className="fas fa-home text-xl" style={{ color: '#7A6E62' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>What would you like to design?</h2>
                  <p className="text-sm mt-1" style={{ color: '#5A4E42' }}>Choose a room type to get started</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { type: 'living' as PresetRoomType, label: 'Living Room', icon: 'fa-couch', color: '#7A8B6F', locked: false },
                    { type: 'bedroom' as PresetRoomType, label: 'Bedroom', icon: 'fa-bed', color: '#C49898', locked: false },
                    { type: 'kitchen' as PresetRoomType, label: 'Kitchen', icon: 'fa-utensils', color: '#C17F59', locked: true },
                    { type: 'dining' as PresetRoomType, label: 'Dining Room', icon: 'fa-utensils', color: '#B8956A', locked: true },
                    { type: 'office' as PresetRoomType, label: 'Office', icon: 'fa-laptop', color: '#3D4F5F', locked: false },
                    { type: 'bathroom' as PresetRoomType, label: 'Bathroom', icon: 'fa-bath', color: '#7B8EA0', locked: true },
                  ]).map(room => {
                    const isLocked = isGuest && room.locked;
                    return (
                    <button key={room.type} onClick={() => { if (isLocked) { showToast('Sign up to unlock ' + room.label); return; } setSelectedRoomType(room.type); setOnboardingStep('preset'); }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center hover:shadow-md relative ${isLocked ? 'opacity-50' : ''} ${selectedRoomType === room.type ? 'border-[#C17F4E] bg-[rgba(193,127,78,0.05)]' : 'border-[#E2DDD4] bg-[#FAF8F4]'}`}>
                      {isLocked && <i className="fas fa-lock absolute top-2 right-2 text-[9px]" style={{ color: '#7A6E62' }} />}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: room.color + '18', color: room.color }}>
                        <i className={`fas ${room.icon} text-lg`} />
                      </div>
                      <p className="text-xs font-bold">{room.label}</p>
                    </button>
                  );})}
                </div>
                <button onClick={() => { setOnboardingStep('blank'); }}
                  className="w-full mt-4 py-3 rounded-xl text-sm font-semibold cursor-pointer border-2 flex items-center justify-center gap-2"
                  style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}>
                  <i className="fas fa-pen" /> Start from Scratch
                </button>
                {hasCachedDesign && (
                  <button onClick={restoreCachedDesign}
                    className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-white cursor-pointer border-none flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
                    <i className="fas fa-history" /> Continue Previous Design
                  </button>
                )}
              </>
            )}

            {/* Step 2: Preset Selection */}
            {onboardingStep === 'preset' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0E8D8' }}>
                    <i className="fas fa-palette text-xl" style={{ color: '#7A6E62' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose a Style</h2>
                  <p className="text-sm mt-1" style={{ color: '#5A4E42' }}>Pick a preset or start from scratch</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getPresetsForRoom(selectedRoomType).map(preset => (
                    <button key={preset.id} onClick={() => loadPreset(preset)}
                      className="p-4 rounded-xl border-2 cursor-pointer transition-all text-left hover:shadow-md"
                      style={{ borderColor: preset.accent + '40', background: '#FAF8F4' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: preset.accent + '18', color: preset.accent }}>
                          <i className={`fas ${preset.icon}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{preset.name}</p>
                          <p className="text-[10px]" style={{ color: '#5A4E42' }}>{preset.furniture.length} pieces</p>
                        </div>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: '#5A4E42' }}>{preset.description}</p>
                      <div className="flex gap-1 mt-2">
                        {Object.values(SKINS_DICTIONARY[preset.skin || 'default']?.slots || {}).filter(Boolean).slice(0, 5).map((slot, i) => (
                          <div key={i} className="w-3 h-3 rounded-full border" style={{ background: (slot as any).color, borderColor: '#E2DDD4' }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setOnboardingStep('room')}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer border-2 flex items-center justify-center gap-2"
                    style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}>
                    <i className="fas fa-arrow-left" /> Back
                  </button>
                  <button onClick={() => { setOnboardingStep('blank'); }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer border-2 flex items-center justify-center gap-2"
                    style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}>
                    <i className="fas fa-pen" /> Start from Scratch
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Blank / Guest Warning */}
            {onboardingStep === 'blank' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0E8D8' }}>
                    <i className="fas fa-drafting-compass text-xl" style={{ color: '#7A6E62' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Start from Scratch</h2>
                  <p className="text-sm mt-1" style={{ color: '#5A4E42' }}>Build your room from the ground up</p>
                </div>

                {/* Room type selection */}
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: '#5A4E42' }}>Room Type</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(['living', 'bedroom', 'kitchen', 'dining', 'office', 'bathroom'] as PresetRoomType[]).map(type => {
                    const lockedTypes = new Set(['kitchen', 'dining', 'bathroom']);
                    const isLocked = isGuest && lockedTypes.has(type);
                    return (
                    <button key={type} onClick={() => { if (isLocked) { showToast('Sign up to unlock ' + type.charAt(0).toUpperCase() + type.slice(1)); return; } setSelectedRoomType(type); }}
                      className={`py-2 px-3 rounded-lg text-[11px] font-semibold cursor-pointer transition-all border relative ${isLocked ? 'opacity-50' : ''} ${selectedRoomType === type ? 'border-[#C17F4E] text-[#C17F4E] bg-[rgba(193,127,78,0.05)]' : 'border-[#E2DDD4] text-[#5A4E42] bg-[#FAF8F4]'}`}>
                      {isLocked && <i className="fas fa-lock text-[7px] absolute top-1 right-1" style={{ color: '#7A6E62' }} />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );})}
                </div>

                {/* Guest mode notice */}
                {isGuest && (
                  <div className="p-3 rounded-xl mb-4 border" style={{ background: '#FAF8F4', borderColor: '#E8DFD4' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <i className="fas fa-info-circle text-xs" style={{ color: '#7A6E62' }} />
                      <p className="text-[11px] font-bold" style={{ color: '#7A6E62' }}>Guest Mode</p>
                    </div>
                    <p className="text-[10px] mb-2" style={{ color: '#5A4E42' }}>You're using the free editor with limited options. Sign in for the full experience.</p>
                    <div className="flex gap-3 text-[9px]" style={{ color: '#5A4E42' }}>
                      <span><i className="fas fa-couch mr-0.5" style={{ color: '#7A6E62' }} /> {GUEST_ALLOWED_FURNITURE.size} items</span>
                      <span><i className="fas fa-door-open mr-0.5" style={{ color: '#7A6E62' }} /> {GUEST_MAX_ROOMS} rooms</span>
                      <span><i className="fas fa-palette mr-0.5" style={{ color: '#7A6E62' }} /> Fewer colors</span>
                    </div>
                    <a href="/auth/signup" className="mt-2 block w-full py-2 rounded-lg text-[11px] font-bold text-center no-underline" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', color: '#fff' }}>
                      <i className="fas fa-sign-in-alt mr-1" />Sign Up for Full Access
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setOnboardingStep(selectedRoomType ? 'preset' : 'room')}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer border-2 flex items-center justify-center gap-2"
                    style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}>
                    <i className="fas fa-arrow-left" /> Back
                  </button>
                  <button onClick={() => {
                    // Apply the room type defaults
                    const defaults = roomTypeDefaults[selectedRoomType];
                    if (defaults) {
                      roomWRef.current = defaults.width; setRoomW(defaults.width);
                      roomDRef.current = defaults.depth; setRoomD(defaults.depth);
                      roomHRef.current = defaults.height; setRoomH(defaults.height);
                      buildRoom();
                      setTimeout(() => {
                        defaults.defaultFurniture.forEach(f => {
                          const fn = builders[f.fn]; if (!fn) return;
                          const item = fn(f.color, f.mat as MatType, roomHRef.current);
                          item.position.set(f.pos[0], f.pos[1], f.pos[2]);
                          if (f.rot) item.rotation.y = f.rot;
                          item.userData.fn = f.fn; item.userData.isFurniture = true; item.name = f.fn;
                          sceneRef.current?.add(item); placedItemsRef.current.push(item);
                        });
                        setItemCount(placedItemsRef.current.length);
                        markSceneDirty();
                        historyRef.current = [serializeFurniture()]; historyIdxRef.current = 0;
                      }, 200);
                    }
                    setShowOnboarding(false);
                    // Show tutorial for first-time users
                    if (!localStorage.getItem('instod_tutorial_seen')) {
                      setTimeout(() => setShowTutorial(true), 600);
                    }
                  }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer border-none flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
                    <i className="fas fa-arrow-right" /> Start Designing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== TUTORIAL OVERLAY ===== */}
      {showTutorial && !showOnboarding && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl border" style={{ borderColor: '#E2DDD4' }}>
            {tutorialStep === 0 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <i className="fas fa-mouse-pointer" style={{ color: '#7A6E62' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Navigate Your Room</h3>
                    <p className="text-[10px]" style={{ color: '#5A4E42' }}>Step 1 of 4</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                  <b>Click &amp; drag</b> to orbit around the room. <b>Scroll</b> to zoom in/out. <b>Right-click &amp; drag</b> to pan the camera.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { setShowTutorial(false); localStorage.setItem('instod_tutorial_seen', '1'); }} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}>Skip Tour</button>
                  <button onClick={() => setTutorialStep(1)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>Next <i className="fas fa-arrow-right ml-1" /></button>
                </div>
              </>
            )}
            {tutorialStep === 1 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <i className="fas fa-couch" style={{ color: '#7A6E62' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Add Furniture</h3>
                    <p className="text-[10px]" style={{ color: '#5A4E42' }}>Step 2 of 4</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                  Use the <b>Furniture tab</b> in the left sidebar to browse items. Click any furniture piece to add it to your room instantly.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setTutorialStep(0)} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}><i className="fas fa-arrow-left mr-1" /> Back</button>
                  <button onClick={() => setTutorialStep(2)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>Next <i className="fas fa-arrow-right ml-1" /></button>
                </div>
              </>
            )}
            {tutorialStep === 2 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <i className="fas fa-arrows-alt" style={{ color: '#7A6E62' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Move &amp; Rotate</h3>
                    <p className="text-[10px]" style={{ color: '#5A4E42' }}>Step 3 of 4</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                  <b>Click</b> any furniture to select it. <b>Drag</b> to reposition. Use the <b>rotate slider</b> or press <b>R</b> to rotate. Press <b>Delete</b> to remove.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setTutorialStep(1)} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}><i className="fas fa-arrow-left mr-1" /> Back</button>
                  <button onClick={() => setTutorialStep(3)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>Next <i className="fas fa-arrow-right ml-1" /></button>
                </div>
              </>
            )}
            {tutorialStep === 3 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <i className="fas fa-palette" style={{ color: '#7A6E62' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Customize Materials</h3>
                    <p className="text-[10px]" style={{ color: '#5A4E42' }}>Step 4 of 4</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                  Select a furniture item, then use the <b>Colors tab</b> to change materials. Try different fabrics, wood tones, and metals. Explore <b>Skins</b> for whole-room themes.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setTutorialStep(2)} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FAF8F4' }}><i className="fas fa-arrow-left mr-1" /> Back</button>
                  <button onClick={() => { setShowTutorial(false); localStorage.setItem('instod_tutorial_seen', '1'); }} className="flex-1 py-2 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>Start Designing! <i className="fas fa-check ml-1" /></button>
                </div>
              </>
            )}
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[0,1,2,3].map(s => (
                <div key={s} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: s === tutorialStep ? '#C17F4E' : '#E2DDD4', transform: s === tutorialStep ? 'scale(1.3)' : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guest Upsell — modern top banner with prominent CTA */}
      {isGuest && !showOnboarding && !isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6"
          style={{
            background: '#5A4E42',
            color: '#fff',
            height: 44,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', width: 26, height: 26 }}
            >
              <i className="fas fa-lock text-[10px]" style={{ color: '#fff' }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] tracking-wide">Guest Mode</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.8)' }}>Limited features — sign up for full access</span>
            </div>
          </div>
          <a
            href="/auth/signup"
            className="flex items-center gap-2 px-5 py-1.5 rounded-full text-[12px] font-bold no-underline transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{
              background: '#FFFFFF',
              color: '#A86A3D',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fas fa-user-plus text-[10px]" />
            Sign Up Free
          </a>
        </div>
      )}

      {/* Mobile Guest Banner — slim pill at top */}
      {isGuest && !showOnboarding && isMobile && (
        <a
          href="/auth/signup"
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center gap-2 no-underline"
          style={{
            background: '#5A4E42',
            color: '#fff',
            height: 36,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <i className="fas fa-lock text-[8px]" />
          <span>Guest Mode — Limited features</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>Sign Up Free</span>
        </a>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}>
            <h3 className="text-base font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[['Delete', 'Remove selected'], ['D', 'Duplicate'], ['R', 'Rotate 15°'], ['Ctrl+Z', 'Undo'], ['Ctrl+Y', 'Redo'], ['Escape', 'Deselect'], ['Two fingers', 'Rotate item (mobile)']].map(([k, d]) => (
                <div key={k} className="flex justify-between"><span style={{ color: '#5A4E42' }}>{d}</span><kbd className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: '#F5F0E8' }}>{k}</kbd></div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 rounded-lg text-sm font-medium cursor-pointer border" style={{ borderColor: '#E2DDD4' }}>Close</button>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowAddRoom(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}>
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
                    style={{ borderColor: newRoomType === t ? '#C17F4E' : '#E2DDD4', background: newRoomType === t ? 'rgba(193,127,78,0.1)' : 'transparent', color: newRoomType === t ? '#C17F4E' : '#5A4E42' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addNewRoom} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none" style={{ background: '#C17F4E' }}>Add Room</button>
          </div>
        </div>
      )}

      {/* Room Manager Modal */}
      {roomManagerOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setRoomManagerOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Room Manager</h3>
              <button onClick={() => setRoomManagerOpen(false)} aria-label="Close room manager" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-times text-xs" /></button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto int-scrollbar">
              {rooms.map(room => {
                const roomItemCount = room.id === currentRoomId ? itemCount : (roomStatesRef.current.get(room.id)?.length || 0);
                const typeLabel: Record<string, string> = { living: 'Living Room', bedroom: 'Bedroom', kitchen: 'Kitchen', bathroom: 'Bathroom', office: 'Office', dining: 'Dining Room' };
                const isEditing = editingRoomName === room.id;
                return (
                  <div key={room.id} className="flex items-center gap-2 p-2.5 rounded-xl border transition-all" style={{ borderColor: currentRoomId === room.id ? '#C17F4E' : '#E2DDD4', background: currentRoomId === room.id ? 'rgba(193,127,78,0.06)' : 'transparent' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentRoomId === room.id ? '#C17F4E' : '#F0E8D8' }}>
                      <i className="fas fa-door-open text-[10px]" style={{ color: currentRoomId === room.id ? '#fff' : '#7A6E62' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input value={editingRoomNameValue} onChange={e => setEditingRoomNameValue(e.target.value)} onBlur={() => { if (editingRoomNameValue.trim()) renameRoom(room.id, editingRoomNameValue.trim()); setEditingRoomName(null); }} onKeyDown={e => { if (e.key === 'Enter') { if (editingRoomNameValue.trim()) renameRoom(room.id, editingRoomNameValue.trim()); setEditingRoomName(null); } }} className="w-full px-2 py-0.5 rounded text-xs border" style={{ borderColor: '#C17F4E' }} autoFocus />
                      ) : (
                        <p className="text-xs font-semibold truncate" onClick={() => { setEditingRoomName(room.id); setEditingRoomNameValue(room.name); }} style={{ cursor: 'text' }}>{room.name}</p>
                      )}
                      <p className="text-[9px]" style={{ color: '#5A4E42' }}>{typeLabel[room.roomType] || room.roomType} &bull; {roomItemCount} items</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {currentRoomId !== room.id && (
                        <button onClick={() => switchRoom(room.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} aria-label="Switch to room" title="Switch to room"><i className="fas fa-arrow-right text-[9px]" style={{ color: '#5A4E42' }} /></button>
                      )}
                      {!isEditing && (
                        <button onClick={() => { setEditingRoomName(room.id); setEditingRoomNameValue(room.name); }} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} aria-label="Rename room" title="Rename"><i className="fas fa-pen text-[9px]" style={{ color: '#5A4E42' }} /></button>
                      )}
                      {rooms.length > 1 && (
                        <button onClick={() => deleteRoom(room.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#e8d0d0' }} aria-label="Delete room" title="Delete room"><i className="fas fa-trash-alt text-[9px]" style={{ color: '#c0392b' }} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setRoomManagerOpen(false); setShowAddRoom(true); }} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none mt-4" style={{ background: '#C17F4E' }}>
              <i className="fas fa-plus mr-1" />Add New Room
            </button>
          </div>
        </div>
      )}

      {/* Snapshots Modal */}
      {showSnapshots && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowSnapshots(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Revision Snapshots</h3>
              <button onClick={() => setShowSnapshots(false)} aria-label="Close snapshots" className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-times text-xs" /></button>
            </div>
            {/* Create snapshot */}
            <div className="flex gap-1.5 mb-4">
              <input value={snapshotName} onChange={e => setSnapshotName(e.target.value)} placeholder="Snapshot name..." className="flex-1 px-3 py-2 rounded-lg text-sm border" style={{ borderColor: '#E2DDD4' }} onKeyDown={e => { if (e.key === 'Enter') takeSnapshot(); }} />
              <button onClick={takeSnapshot} className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer border-none" style={{ background: '#C17F4E' }}><i className="fas fa-camera mr-1" />Save</button>
            </div>
            {/* Snapshots list */}
            {snapshots.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: '#F0E8D8' }}><i className="fas fa-camera-retro text-lg" style={{ color: '#7A6E62' }} /></div>
                <p className="text-xs" style={{ color: '#5A4E42' }}>No snapshots yet. Save a snapshot to preserve a design revision.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto int-scrollbar">
                {snapshots.map((snap, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border" style={{ borderColor: '#E2DDD4' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0E8D8' }}>
                      <i className="fas fa-camera-retro text-[10px]" style={{ color: '#7A6E62' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{snap.name}</p>
                      <p className="text-[9px]" style={{ color: '#5A4E42' }}>{new Date(snap.timestamp).toLocaleString()} &bull; {snap.data.length} items</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => restoreSnapshot(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }} aria-label="Restore snapshot" title="Restore"><i className="fas fa-undo text-[9px]" style={{ color: '#7A6E62' }} /></button>
                      <button onClick={() => deleteSnapshot(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#e8d0d0' }} aria-label="Delete snapshot" title="Delete"><i className="fas fa-trash-alt text-[9px]" style={{ color: '#c0392b' }} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DESKTOP: Sidebar + Main ===== */}
      {/* eslint-disable-next-line react-hooks/refs */}
      {!isMobile && renderDesktopSidebar()}

      {/* ===== Main 3D Viewer ===== */}
      <main className="flex-1 relative min-h-0" style={{ background: lightMoods[lightMood]?.bg ? `#${lightMoods[lightMood].bg.toString(16).padStart(6, '0')}` : '#FAF8F4', transition: 'background-color 0.6s ease' }}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-2" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.92)' : 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', borderBottom: lightMood === 'night' ? '1px solid rgba(68,85,170,0.2)' : '1px solid #E2DDD4', color: lightMood === 'night' ? '#E8E0D0' : undefined, transition: 'background 0.5s ease, border-color 0.5s ease, color 0.5s ease', paddingTop: isMobile ? 'max(8px, env(safe-area-inset-top, 8px))' : undefined, marginTop: (isMobile && isGuest && !showOnboarding) ? 36 : undefined }}>
          {!isMobile && (
            <>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined }}><i className="fas fa-bars text-xs" /></button>
              {sidebarOpen && (
                <button onClick={() => setSidebarDark(!sidebarDark)} aria-label={sidebarDark ? 'Light sidebar' : 'Dark sidebar'} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined }} title={sidebarDark ? 'Switch to light sidebar' : 'Switch to dark sidebar'}><i className={`fas ${sidebarDark ? 'fa-sun' : 'fa-moon'} text-xs`} /></button>
              )}
            </>
          )}
          <input value={designName} onChange={e => { setDesignName(e.target.value); designNameRef.current = e.target.value; markUnsaved(); }} className="px-2 py-1 rounded text-sm font-semibold border-none outline-none" style={{ background: 'transparent', maxWidth: isMobile ? 140 : 180, fontFamily: "'Outfit', sans-serif", color: lightMood === 'night' ? '#E8E0D0' : undefined }} />
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ color: saveStatus === 'saved' ? '#7A8B6F' : saveStatus === 'saving' ? '#7A6E62' : '#5A4E42', background: saveStatus === 'saved' ? 'rgba(122,139,111,0.1)' : 'rgba(138,132,120,0.1)' }}>
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.05)', color: '#7A6E62' }} title="This is a layout drafting view. Use Export for polished renders.">
            <i className="fas fa-drafting-compass text-[7px]" />Draft
          </span>

          {/* Room tabs */}
          <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
            {rooms.map(room => {
              const roomItemCount = room.id === currentRoomId ? itemCount : 0;
              return (
                <button key={room.id} onClick={() => switchRoom(room.id)} className={`rounded-lg font-medium cursor-pointer transition-all whitespace-nowrap border flex items-center gap-1 ${isMobile ? 'px-3 py-1.5 text-[11px]' : 'px-3 py-1 text-[10px]'}`}
                  style={{ background: currentRoomId === room.id ? '#C17F4E' : (lightMood === 'night' ? 'rgba(255,255,255,0.08)' : '#FAF8F4'), color: currentRoomId === room.id ? '#fff' : (lightMood === 'night' ? '#C8C0B0' : '#5A4E42'), borderColor: currentRoomId === room.id ? '#C17F4E' : (lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4') }}>
                  <i className={`fas fa-door-open ${isMobile ? 'text-[10px]' : 'text-[8px]'}`} />{room.name}<span className="text-[8px] opacity-70">({roomItemCount})</span>
                </button>
              );
            })}
            <button onClick={() => setRoomManagerOpen(true)} className={`rounded-lg flex items-center justify-center cursor-pointer border ${isMobile ? 'w-9 h-9' : 'w-6 h-6'}`} style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Room Manager" title="Room Manager"><i className={`fas fa-th-list ${isMobile ? 'text-[10px]' : 'text-[8px]'}`} /></button>
            <button onClick={() => setShowAddRoom(true)} className={`rounded-lg flex items-center justify-center cursor-pointer border ${isMobile ? 'w-9 h-9' : 'w-6 h-6'}`} style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Add Room" title="Add Room"><i className={`fas fa-plus ${isMobile ? 'text-[10px]' : 'text-[8px]'}`} /></button>
          </div>

          {/* Mobile right actions — minimal: only save status + sign up pill */}
          {isMobile && (
            <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
              {isGuest && (
                <a href="/auth/signup" className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap no-underline flex items-center gap-1 min-h-[36px]" style={{ background: '#C17F4E', color: '#fff' }}>
                  <i className="fas fa-lock text-[9px]" />Sign Up
                </a>
              )}
            </div>
          )}

          {/* Desktop right actions */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              <button onClick={() => window.location.href = '/dashboard'} className="h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: 'transparent' }} aria-label="Dashboard" title="Dashboard"><i className="fas fa-th-large text-[10px]" /><span className="text-[10px] font-semibold">Dashboard</span></button>
              <button onClick={() => setSnapToGrid(!snapToGrid)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: snapToGrid ? '#C17F4E' : (lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4'), color: snapToGrid ? '#C17F4E' : (lightMood === 'night' ? '#C8C0B0' : '#5A4E42') }} aria-label="Snap to Grid" title="Snap to Grid"><i className="fas fa-th text-[9px]" /></button>
              <button onClick={() => { const next = !shadowsEnabledRef.current; shadowsEnabledRef.current = next; setShadowsEnabled(next); if (dirLightRef.current) dirLightRef.current.castShadow = next; if (rendererRef.current) rendererRef.current.shadowMap.enabled = next; if (needsRenderRef.current) needsRenderRef.current(); }} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: shadowsEnabled ? '#C17F4E' : (lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4'), color: shadowsEnabled ? '#C17F4E' : (lightMood === 'night' ? '#C8C0B0' : '#5A4E42') }} aria-label="Toggle Shadows" title="Toggle Shadows"><i className="fas fa-cloud-sun text-[9px]" /></button>
              <button onClick={shareRoom} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined }} aria-label="Share room" title="Share"><i className="fas fa-share-alt text-[9px]" /></button>
              <button onClick={() => setShowShortcuts(true)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined }} aria-label="Keyboard shortcuts" title="Shortcuts"><i className="fas fa-keyboard text-[9px]" /></button>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: lightMood === 'night' ? 'rgba(255,255,255,0.08)' : '#F0E8D8', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }}>{itemCount} items</span>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} role="application" aria-label="3D Room Editor — use mouse to orbit, scroll to zoom" style={{ width: '100%', height: '100%', display: 'block', cursor: ceilingEditMode ? 'crosshair' : 'grab' }} />

        {/* Ceiling Edit Mode — bottom drawer on mobile, floating panel on desktop */}
        {ceilingEditMode && (
          <div className={`${isMobile ? 'fixed left-0 right-0 bottom-0 rounded-t-2xl z-30' : 'absolute top-14 left-1/2 -translate-x-1/2 z-30 rounded-xl'}`} style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: isMobile ? '1px solid #E2DDD4' : '1px solid #E2DDD4', ...(isMobile ? { paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' } : { minWidth: 280 }), maxHeight: isMobile ? '42vh' : 'none', overflowY: 'auto' }}>
            {isMobile && <div className="w-10 h-1 rounded-full mx-auto mt-2 mb-1" style={{ background: '#D4D0C8' }} />}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}><i className="fas fa-lightbulb text-[10px]" style={{ color: '#7A6E62' }} /></div>
                  <h3 className="text-xs font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#5A4E42' }}>Ceiling Light Editor</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#7A6E62' }}>{ceilingSpotPositionsRef.current.length}/6</span>
                </div>
                <button onClick={exitCeilingEditMode} aria-label="Exit ceiling editor" className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4' }}><i className="fas fa-times text-[9px]" /></button>
              </div>
              <div className="flex gap-1.5 mb-2">
                <button onClick={addCeilingLight} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: '#C17F4E', color: '#fff', border: 'none' }}>
                  <i className="fas fa-plus text-[8px]" />Add Light
                </button>
                <button onClick={deleteSelectedCeilingLight} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: '#fff', color: selectedCeilingLightIdx >= 0 ? '#c0392b' : '#5A4E42', border: `1px solid ${selectedCeilingLightIdx >= 0 ? '#e8d0d0' : '#E2DDD4'}` }} disabled={selectedCeilingLightIdx < 0}>
                  <i className="fas fa-trash-alt text-[8px]" />Delete
                </button>
              </div>
            {selectedCeilingLightIdx >= 0 && (
              <div className="p-2 rounded-lg mb-1" style={{ background: '#FAF8F4' }}>
                <p className="text-[9px] font-bold mb-1" style={{ color: '#5A4E42' }}>LIGHT #{selectedCeilingLightIdx + 1} POSITION</p>
                <div className="mb-1">
                  <div className="flex justify-between"><span className="text-[9px]">X</span><span className="text-[9px]" style={{ color: '#5A4E42' }}>{selectedLightX.toFixed(2)}m</span></div>
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
                  <div className="flex justify-between"><span className="text-[9px]">Z</span><span className="text-[9px]" style={{ color: '#5A4E42' }}>{selectedLightZ.toFixed(2)}m</span></div>
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
            <p className="text-[8px] text-center" style={{ color: '#5A4E42' }}>
              {selectedCeilingLightIdx >= 0 ? 'Drag light or use sliders to reposition' : 'Click ceiling to add • Click light to select'}
            </p>
            </div>{/* end p-3 wrapper */}
          </div>
        )}

        {/* Bottom-center toolbar */}
        {!isMobile && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <button onClick={undo} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: '#E2DDD4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} aria-label="Undo" title="Undo (Ctrl+Z)"><i className="fas fa-undo text-xs" /></button>
            <button onClick={redo} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: '#E2DDD4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} aria-label="Redo" title="Redo (Ctrl+Y)"><i className="fas fa-redo text-xs" /></button>
          </div>
        )}

        {/* View controls - Desktop */}
        {!isMobile && (
          <div className="absolute bottom-5 right-5 flex gap-1.5 z-10">
            <button onClick={resetRoom} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: lightMood === 'night' ? '#C8C0B0' : '#2D2D2D', fontSize: 11, transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease' }} aria-label="Reset Room" title="Reset Room"><i className="fas fa-undo-alt" /></button>
            {[
              { id: 'top', icon: 'fa-border-all', pos: [0, 10, 0.01] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
              { id: 'front', icon: 'fa-square', pos: [0, 2, roomD] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
              { id: 'persp', icon: 'fa-cube', pos: [7, 6, 9] as [number, number, number], target: [0, 1, 0] as [number, number, number] },
            ].map(v => (
              <button key={v.id} onClick={() => animateCamera(v.pos, v.target)} aria-label={`${v.id} view`} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: lightMood === 'night' ? '#C8C0B0' : '#2D2D2D', fontSize: 11, transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease' }}><i className={`fas ${v.icon}`} /></button>
            ))}
            <button onClick={() => { autoRotateRef.current = !autoRotateRef.current; setAutoRotActive(autoRotateRef.current); if (controlsRef.current) { controlsRef.current.autoRotate = autoRotateRef.current; controlsRef.current.autoRotateSpeed = 1.5; } }}
              aria-label={autoRotActive ? 'Stop auto-rotate' : 'Start auto-rotate'} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderColor: autoRotActive ? '#C17F4E' : (lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4'), boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: autoRotActive ? '#C17F4E' : (lightMood === 'night' ? '#C8C0B0' : '#2D2D2D'), fontSize: 11, transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease' }}><i className="fas fa-sync-alt" /></button>
          </div>
        )}

        {/* Selected item panel — slim compact bar on mobile, floating card on desktop */}
        {itemPanelVisible && !mobilePanel && !isMobile && (
          <div className="z-10 border absolute bottom-5 left-5 rounded-xl p-3" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', minWidth: 200, transition: 'background 0.4s ease, border-color 0.4s ease' }}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedName}</h4>
              <button onClick={deselectAll} aria-label="Deselect item" className="text-xs cursor-pointer" style={{ color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }}><i className="fas fa-times" /></button>
            </div>
            <p className="text-[10px]" style={{ color: lightMood === 'night' ? '#A09888' : '#5A4E42' }}>{selectedDesc}</p>
            <div className="flex gap-1.5 mt-2">
              <button onClick={() => rotateSelected('left')} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined, fontSize: 10 }} aria-label="Rotate Left" title="Rotate Left"><i className="fas fa-undo" /></button>
              <button onClick={() => rotateSelected('right')} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined, fontSize: 10 }} aria-label="Rotate Right" title="Rotate Right"><i className="fas fa-redo" /></button>
              <button onClick={duplicateSelected} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: lightMood === 'night' ? 'rgba(255,255,255,0.12)' : '#E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : undefined, fontSize: 10 }} aria-label="Duplicate item" title="Duplicate"><i className="fas fa-clone" /></button>
              <button onClick={deleteSelected} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#e8d0d0', color: '#c0392b', fontSize: 10 }} aria-label="Delete item" title="Delete"><i className="fas fa-trash-alt" /></button>
            </div>
          </div>
        )}

        {/* Mobile: two-finger rotate hint */}
        {isMobile && !mobilePanel && !ceilingEditMode && !itemPanelVisible && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10 }}>
            <i className="fas fa-hand-pointer mr-1" />Tap to select &bull; Two fingers to rotate/zoom
          </div>
        )}

        {/* Mobile: Floating side action panel (collapsed by default, expands on tap) */}
        {isMobile && !mobilePanel && !ceilingEditMode && (
          <div className="absolute right-2 z-20" style={{ top: '50%', transform: 'translateY(-50%)' }}>
            {/* Toggle button */}
            <button onClick={() => setMobileActionsOpen(!mobileActionsOpen)}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
              style={{ background: mobileActionsOpen ? '#C17F4E' : (lightMood === 'night' ? 'rgba(30,28,25,0.92)' : 'rgba(255,255,255,0.92)'), backdropFilter: 'blur(8px)', border: mobileActionsOpen ? 'none' : (lightMood === 'night' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2DDD4'), color: mobileActionsOpen ? '#fff' : (lightMood === 'night' ? '#C8C0B0' : '#5A4E42'), boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'background 0.4s ease, border-color 0.4s ease, color 0.4s ease' }}
              aria-label="Actions"
            >
              <i className={`fas ${mobileActionsOpen ? 'fa-times' : 'fa-ellipsis-v'}`} style={{ fontSize: 13 }} />
            </button>
            {/* Expanded action buttons */}
            {mobileActionsOpen && (
              <div className="flex flex-col gap-1.5 mt-1.5 items-center">
                <button onClick={() => { saveRoom(); setMobileActionsOpen(false); }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: '#7A8B6F', color: '#fff', border: 'none' }} aria-label="Save" title="Save"><i className="fas fa-save text-[11px]" /></button>
                <button onClick={() => { undo(); setMobileActionsOpen(false); }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: lightMood === 'night' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Undo" title="Undo"><i className="fas fa-undo text-[11px]" /></button>
                <button onClick={() => { redo(); setMobileActionsOpen(false); }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: lightMood === 'night' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Redo" title="Redo"><i className="fas fa-redo text-[11px]" /></button>
                <button onClick={() => { takeScreenshot(); setMobileActionsOpen(false); }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: lightMood === 'night' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Screenshot" title="Screenshot"><i className="fas fa-camera text-[11px]" /></button>
                <button onClick={() => { shareRoom(); setMobileActionsOpen(false); }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: lightMood === 'night' ? 'rgba(30,28,25,0.9)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: lightMood === 'night' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E2DDD4', color: lightMood === 'night' ? '#C8C0B0' : '#5A4E42' }} aria-label="Share" title="Share"><i className="fas fa-share-alt text-[11px]" /></button>
                <button onClick={() => { window.location.href = '/dashboard'; }} className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #E2DDD4', color: '#5A4E42' }} aria-label="Dashboard" title="Dashboard"><i className="fas fa-th-large text-[11px]" /></button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== MOBILE: Bottom Edit Panel ===== */}
      {isMobile && (
        <div className="bg-white border-t flex flex-col" style={{ borderColor: '#E2DDD4', height: mobilePanel ? '38vh' : 'auto', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>

          {/* Selected item slim bar — name + rotate + delete, only when item is selected and no panel open */}
          {itemPanelVisible && !mobilePanel && (
            <div className="flex items-center gap-1.5 px-2 border-b" style={{ height: 38, borderColor: '#F0E8D8', background: '#FAF8F4' }}>
              <span className="text-[11px] font-semibold truncate flex-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>{selectedName}</span>
              <button onClick={() => rotateSelected('left')} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', fontSize: 12, background: '#fff' }} aria-label="Rotate Left"><i className="fas fa-undo" /></button>
              <button onClick={() => rotateSelected('right')} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#E2DDD4', color: '#5A4E42', fontSize: 12, background: '#fff' }} aria-label="Rotate Right"><i className="fas fa-redo" /></button>
              <button onClick={deleteSelected} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border" style={{ borderColor: '#e8d0d0', color: '#c0392b', fontSize: 12, background: '#fff' }} aria-label="Delete"><i className="fas fa-trash-alt" /></button>
              <button onClick={deselectAll} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer" style={{ color: '#8A8478', fontSize: 10 }} aria-label="Deselect"><i className="fas fa-times" /></button>
            </div>
          )}

          {/* Tab bar — icon-only, Furniture + Colors first, 56px height for better touch targets */}
          <div role="tablist" className="flex border-b" style={{ borderColor: '#E2DDD4', height: 56 }}>
            {([
              { id: 'furniture' as const, icon: 'fa-couch', label: 'Furniture', color: '#5A4E42' },
              { id: 'material' as const, icon: 'fa-palette', label: 'Colors', color: '#5A4E42' },
              { id: 'room' as const, icon: 'fa-sliders-h', label: 'Room', color: '#5A4E42' },
              { id: 'skin' as const, icon: 'fa-wand-magic-sparkles', label: 'Skins', color: '#5A4E42' },
              { id: 'presets' as const, icon: 'fa-magic', label: 'Presets', color: '#5A4E42' },
              { id: 'skeleton' as const, icon: 'fa-bone', label: 'More', color: '#5C4033' },
            ]).map(({ id, icon, label, color }) => (
              <button key={id} onClick={() => { setMobilePanel(mobilePanel === id ? null : id); setMobileActionsOpen(false); }}
                role="tab" aria-selected={mobilePanel === id}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative"
                style={{ color: mobilePanel === id ? '#2D2D2D' : '#5A4E42', background: mobilePanel === id ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                <i className={`fas ${icon}`} style={{ fontSize: 16 }} />
                <span style={{ fontSize: 9, fontWeight: mobilePanel === id ? 700 : 600 }}>{label}</span>
                {mobilePanel === id && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#2D2D2D', position: 'absolute', bottom: 3 }} />}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {/* eslint-disable-next-line react-hooks/refs */}
            {mobilePanel ? renderMobilePanel() : (
              <div className="h-full flex flex-col items-center justify-center p-3 text-center" style={{ minHeight: 60 }}>
                <p className="text-[10px]" style={{ color: '#5A4E42' }}>{itemCount} items &bull; Tap tabs above to edit &bull; Swipe toolbar for actions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <div className="fixed z-[1000] pointer-events-none" style={{ bottom: isMobile ? (mobilePanel ? '40vh' : (itemPanelVisible ? 96 : 58)) : 24, left: '50%', transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)', opacity: toastVisible ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div role="status" aria-live="polite" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#333', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}><i className="fas fa-check-circle text-xs" style={{ color: '#7A8B6F' }} />{toastMsg}</div>
      </div>
      </>
      )}
    </div>
  );
}

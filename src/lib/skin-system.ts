import * as THREE from 'three';

// Skin material slot definition
export interface SkinMaterialSlot {
  color: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
}

// A skin is a collection of named material slots
export interface SkinDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // FontAwesome icon class
  accent: string; // Brand/accent color for UI
  slots: {
    // Room structure
    walls?: SkinMaterialSlot;
    floor?: SkinMaterialSlot;
    ceiling?: SkinMaterialSlot;
    baseboard?: SkinMaterialSlot;
    windowFrame?: SkinMaterialSlot;
    // Furniture categories
    fabric?: SkinMaterialSlot;
    leather?: SkinMaterialSlot;
    wood?: SkinMaterialSlot;
    metal?: SkinMaterialSlot;
    // Structural (legs, frames, etc.)
    structural?: SkinMaterialSlot;
  };
  lighting?: {
    ambientColor?: string;
    ambientIntensity?: number;
    dirColor?: string;
    dirIntensity?: number;
    exposure?: number;
    bgColor?: string;
  };
}

export const SKINS_DICTIONARY: Record<string, SkinDefinition> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Warm natural tones',
    icon: 'fa-home',
    accent: '#C17F4E',
    slots: {
      walls: { color: '#FAF8F4', roughness: 0.9, metalness: 0 },
      floor: { color: '#B8956A', roughness: 0.65, metalness: 0 },
      ceiling: { color: '#FFFFF8', roughness: 1, metalness: 0 },
      baseboard: { color: '#F0E8D8', roughness: 0.7, metalness: 0 },
      windowFrame: { color: '#DDD8D0', roughness: 0.5, metalness: 0 },
      fabric: { color: '#8A8478', roughness: 0.85, metalness: 0 },
      leather: { color: '#9A6B3C', roughness: 0.45, metalness: 0.02 },
      wood: { color: '#B8956A', roughness: 0.6, metalness: 0 },
      metal: { color: '#C9A96E', roughness: 0.25, metalness: 0.85 },
      structural: { color: '#3B2F28', roughness: 0.5, metalness: 0.1 },
    },
    lighting: {
      ambientColor: '#FFE8D0',
      ambientIntensity: 0.5,
      dirColor: '#FFF0D8',
      dirIntensity: 1.8,
      exposure: 1.1,
      bgColor: '#F5F0E8',
    },
  },
  matte_black: {
    id: 'matte_black',
    name: 'Matte Black',
    description: 'Dark, moody, sophisticated',
    icon: 'fa-moon',
    accent: '#FF6B35',
    slots: {
      walls: { color: '#2D2D2D', roughness: 0.95, metalness: 0 },
      floor: { color: '#1A1A1A', roughness: 0.8, metalness: 0.05 },
      ceiling: { color: '#1F1F1F', roughness: 1, metalness: 0 },
      fabric: { color: '#3D3D3D', roughness: 0.9, metalness: 0 },
      leather: { color: '#2D2D2D', roughness: 0.5, metalness: 0.02 },
      wood: { color: '#2A2420', roughness: 0.7, metalness: 0 },
      metal: { color: '#1A1A1A', roughness: 0.2, metalness: 0.9 },
      structural: { color: '#111111', roughness: 0.4, metalness: 0.6 },
      baseboard: { color: '#1A1A1A', roughness: 0.5, metalness: 0.1 },
      windowFrame: { color: '#2A2A2A', roughness: 0.4, metalness: 0.3 },
    },
    lighting: {
      ambientColor: '#FFD8A0',
      ambientIntensity: 0.3,
      dirColor: '#FFE0A0',
      dirIntensity: 0.8,
      exposure: 0.8,
      bgColor: '#1A1815',
    },
  },
  nordic_light: {
    id: 'nordic_light',
    name: 'Nordic Light',
    description: 'Bright, airy Scandinavian',
    icon: 'fa-snowflake',
    accent: '#7A8B6F',
    slots: {
      walls: { color: '#FFFFFF', roughness: 0.95, metalness: 0 },
      floor: { color: '#E8DCC8', roughness: 0.7, metalness: 0 },
      ceiling: { color: '#FFFFFE', roughness: 1, metalness: 0 },
      fabric: { color: '#E8E2D8', roughness: 0.9, metalness: 0 },
      leather: { color: '#C4A882', roughness: 0.45, metalness: 0.02 },
      wood: { color: '#E0C8A0', roughness: 0.55, metalness: 0 },
      metal: { color: '#C0C0C0', roughness: 0.3, metalness: 0.7 },
      structural: { color: '#DDD8D0', roughness: 0.5, metalness: 0.1 },
      baseboard: { color: '#F0EDE8', roughness: 0.6, metalness: 0 },
      windowFrame: { color: '#FFFFFF', roughness: 0.4, metalness: 0.1 },
    },
    lighting: {
      ambientColor: '#FFE8D0',
      ambientIntensity: 0.6,
      dirColor: '#FFF5E0',
      dirIntensity: 2.0,
      exposure: 1.2,
      bgColor: '#F8F5F0',
    },
  },
  luxury_marble: {
    id: 'luxury_marble',
    name: 'Luxury Marble',
    description: 'Rich, elegant, premium',
    icon: 'fa-gem',
    accent: '#C9A96E',
    slots: {
      walls: { color: '#F0EDE8', roughness: 0.4, metalness: 0.05 },
      floor: { color: '#E0D8D0', roughness: 0.15, metalness: 0.1 },
      ceiling: { color: '#FFFFF8', roughness: 0.8, metalness: 0 },
      fabric: { color: '#8A6850', roughness: 0.7, metalness: 0 },
      leather: { color: '#6B4226', roughness: 0.4, metalness: 0.05 },
      wood: { color: '#5C4033', roughness: 0.5, metalness: 0 },
      metal: { color: '#C9A96E', roughness: 0.15, metalness: 0.9 },
      structural: { color: '#B8860B', roughness: 0.3, metalness: 0.7 },
      baseboard: { color: '#E0D8D0', roughness: 0.3, metalness: 0.1 },
      windowFrame: { color: '#C9A96E', roughness: 0.3, metalness: 0.5 },
    },
    lighting: {
      ambientColor: '#FFE8D0',
      ambientIntensity: 0.5,
      dirColor: '#FFF0D8',
      dirIntensity: 1.8,
      exposure: 1.1,
      bgColor: '#F0E8E0',
    },
  },
  industrial_loft: {
    id: 'industrial_loft',
    name: 'Industrial Loft',
    description: 'Raw, urban, concrete',
    icon: 'fa-industry',
    accent: '#B87333',
    slots: {
      walls: { color: '#B8B4B0', roughness: 0.95, metalness: 0 },
      floor: { color: '#8A8680', roughness: 0.9, metalness: 0.05 },
      ceiling: { color: '#C8C4C0', roughness: 0.95, metalness: 0 },
      fabric: { color: '#6B5D50', roughness: 0.85, metalness: 0 },
      leather: { color: '#5C4033', roughness: 0.5, metalness: 0.02 },
      wood: { color: '#6B4226', roughness: 0.7, metalness: 0 },
      metal: { color: '#333333', roughness: 0.3, metalness: 0.85 },
      structural: { color: '#2D2D2D', roughness: 0.4, metalness: 0.6 },
      baseboard: { color: '#6B6B6B', roughness: 0.7, metalness: 0.1 },
      windowFrame: { color: '#2D2D2D', roughness: 0.4, metalness: 0.5 },
    },
    lighting: {
      ambientColor: '#FFE0C0',
      ambientIntensity: 0.4,
      dirColor: '#FFE8D0',
      dirIntensity: 1.2,
      exposure: 0.95,
      bgColor: '#D8D0C8',
    },
  },
  japandi_zen: {
    id: 'japandi_zen',
    name: 'Japandi Zen',
    description: 'Japanese-Scandinavian minimalism',
    icon: 'fa-yin-yang',
    accent: '#7A8B6F',
    slots: {
      walls: { color: '#F5F0E8', roughness: 0.9, metalness: 0 },
      floor: { color: '#C4A882', roughness: 0.65, metalness: 0 },
      ceiling: { color: '#FFFFF5', roughness: 1, metalness: 0 },
      fabric: { color: '#B8A898', roughness: 0.85, metalness: 0 },
      leather: { color: '#8A7A6A', roughness: 0.45, metalness: 0.02 },
      wood: { color: '#C4A882', roughness: 0.6, metalness: 0 },
      metal: { color: '#A0A0A8', roughness: 0.3, metalness: 0.6 },
      structural: { color: '#8A7A6A', roughness: 0.5, metalness: 0.1 },
      baseboard: { color: '#D4C8B8', roughness: 0.6, metalness: 0 },
      windowFrame: { color: '#C4A882', roughness: 0.5, metalness: 0.1 },
    },
    lighting: {
      ambientColor: '#FFE8D0',
      ambientIntensity: 0.55,
      dirColor: '#FFF0D8',
      dirIntensity: 1.6,
      exposure: 1.05,
      bgColor: '#F0E8E0',
    },
  },
};

function applySlot(mat: THREE.MeshStandardMaterial, slot: SkinMaterialSlot | undefined): void {
  if (!slot) return;
  if (slot.color) mat.color.set(slot.color);
  if (slot.roughness !== undefined) mat.roughness = slot.roughness;
  if (slot.metalness !== undefined) mat.metalness = slot.metalness;
  if (slot.emissive) {
    mat.emissive.set(slot.emissive);
    mat.emissiveIntensity = slot.emissiveIntensity ?? 0;
  }
  // Don't reset emissive if the skin doesn't define it — keep original
  mat.needsUpdate = true;
}

export function applySkinToSkeleton(
  scene: THREE.Scene,
  roomGroup: THREE.Group,
  placedItems: THREE.Group[],
  skin: SkinDefinition,
  ambientLight: THREE.AmbientLight | null,
  dirLight: THREE.DirectionalLight | null,
  renderer: THREE.WebGLRenderer | null
): void {
  // 1. Apply room structure materials
  roomGroup.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material as THREE.MeshStandardMaterial;
    if (!mat) return;

    // Match mesh names to skin slots
    const name = child.name.toLowerCase();

    if (name.startsWith('wall_')) {
      applySlot(mat, skin.slots.walls);
    } else if (name === 'floor') {
      applySlot(mat, skin.slots.floor);
    } else if (name === 'ceiling') {
      applySlot(mat, skin.slots.ceiling);
    } else if (name.startsWith('baseboard_')) {
      applySlot(mat, skin.slots.baseboard);
    } else if (name.startsWith('ceilingspotmesh_') || name === 'ceilingtrack') {
      // Ceiling light fixtures use metal/structural
      applySlot(mat, skin.slots.metal || skin.slots.structural);
    } else if (name.includes('window') || name.includes('door') || name.includes('frame')) {
      applySlot(mat, skin.slots.windowFrame || skin.slots.baseboard);
    }
  });

  // 2. Apply furniture materials
  placedItems.forEach(item => {
    item.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      // Skip structural materials (marked with _isStruct or _isLeg)
      if ((mat as unknown as Record<string, unknown>)._isStruct) {
        applySlot(mat, skin.slots.structural);
        return;
      }
      if ((mat as unknown as Record<string, unknown>)._isLeg) {
        applySlot(mat, skin.slots.structural);
        return;
      }

      // Determine material type from userData
      const itemData = item.userData;
      const matType = itemData.matType as string;

      if (matType === 'metal') {
        applySlot(mat, skin.slots.metal);
      } else if (matType === 'leather') {
        applySlot(mat, skin.slots.leather);
      } else if (matType === 'wood') {
        applySlot(mat, skin.slots.wood);
      } else {
        applySlot(mat, skin.slots.fabric);
      }
    });
  });

  // 3. Apply lighting changes
  if (skin.lighting) {
    const l = skin.lighting;
    if (ambientLight && l.ambientColor) {
      ambientLight.color.set(l.ambientColor);
      if (l.ambientIntensity !== undefined) ambientLight.intensity = l.ambientIntensity;
    }
    if (dirLight && l.dirColor) {
      dirLight.color.set(l.dirColor);
      if (l.dirIntensity !== undefined) dirLight.intensity = l.dirIntensity;
    }
    if (renderer && l.exposure !== undefined) {
      renderer.toneMappingExposure = l.exposure;
    }
    if (l.bgColor) {
      scene.background = new THREE.Color(l.bgColor);
      scene.fog = new THREE.FogExp2(new THREE.Color(l.bgColor).getHex(), 0.018);
    }
  }
}

export const SKINS_LIST: SkinDefinition[] = Object.values(SKINS_DICTIONARY);

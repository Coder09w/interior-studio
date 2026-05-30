/**
 * Dynamic plan configuration — single source of truth for all plan
 * limits, features, and pricing. Config is loaded from the database
 * (PlanConfig table) with a 5-minute in-memory cache, so you can
 * change pricing, limits, and features without redeploying.
 *
 * If the DB is unreachable, falls back to HARDCODED_DEFAULTS so the
 * app never crashes due to missing plan data.
 */

import { db } from '@/lib/db';

// ─── Beta Mode ────────────────────────────────────────────────────────────────

/**
 * Check if the app is in Early Access Beta mode.
 * When true: all users get Pro features for free, Stripe is disabled,
 * and plan enforcement treats every user as 'pro'.
 *
 * Toggle via NEXT_PUBLIC_BETA_MODE env var.
 */
export function isBetaMode(): boolean {
  return process.env.NEXT_PUBLIC_BETA_MODE === 'true';
}

// ─── Plan Keys ────────────────────────────────────────────────────────────────

export type PlanKey = 'free' | 'pro' | 'studio';

export const PLAN_KEYS: PlanKey[] = ['free', 'pro', 'studio'];

export const PLAN_ORDER: Record<PlanKey, number> = {
  free: 0,
  pro: 1,
  studio: 2,
};

// ─── Feature Definitions ─────────────────────────────────────────────────────

export interface PlanConfig {
  name: string;
  key: PlanKey;
  price: number; // monthly price in USD (0 = free)
  priceId: string; // Stripe Price ID (empty for free plan)
  description: string;
  highlight: boolean;
  cta: string;

  // Limits
  maxProjects: number | null;
  maxRoomsPerProject: number | null;
  maxFurniturePerRoom: number | null;
  maxRevisionSnapshots: number | null; // null = unlimited
  maxMoodBoards: number | null; // null = unlimited

  // Feature flags
  features: {
    allFurnitureItems: boolean;
    allRoomTypes: boolean;
    allLightingMoods: boolean;
    customDimensions: boolean;
    shareLinks: boolean;
    exportImage: boolean;
    exportPDF: boolean;
    exportHD: boolean;
    revisionSnapshots: boolean;
    moodBoard: boolean;
    floorPlanExport: boolean;
    clientPortal: boolean;
    costEstimator: boolean;
    presentationMode: boolean;
    brandCustomization: boolean;
    priorityRendering: boolean;
    customFurnitureUpload: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

// ─── Hardcoded Defaults (fallback when DB is empty) ──────────────────────────

const HARDCODED_DEFAULTS: Record<PlanKey, PlanConfig> = {
  free: {
    name: 'Free',
    key: 'free',
    price: 0,
    priceId: '',
    description: 'Perfect for trying out 3D interior design',
    highlight: false,
    cta: 'Start for Free',
    maxProjects: 3,
    maxRoomsPerProject: 1,
    maxFurniturePerRoom: 15,
    maxRevisionSnapshots: 0,
    maxMoodBoards: 0,
    features: {
      allFurnitureItems: false,
      allRoomTypes: false,
      allLightingMoods: false,
      customDimensions: false,
      shareLinks: false,
      exportImage: false,
      exportPDF: false,
      exportHD: false,
      revisionSnapshots: false,
      moodBoard: false,
      floorPlanExport: false,
      clientPortal: false,
      costEstimator: false,
      presentationMode: false,
      brandCustomization: false,
      priorityRendering: false,
      customFurnitureUpload: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: 'Pro',
    key: 'pro',
    price: 12,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    description: 'For serious designers and homeowners',
    highlight: true,
    cta: 'Get Pro',
    maxProjects: 50,
    maxRoomsPerProject: 10,
    maxFurniturePerRoom: null,
    maxRevisionSnapshots: 3,
    maxMoodBoards: 1,
    features: {
      allFurnitureItems: true,
      allRoomTypes: true,
      allLightingMoods: true,
      customDimensions: true,
      shareLinks: true,
      exportImage: true,
      exportPDF: true,
      exportHD: false,
      revisionSnapshots: true,
      moodBoard: true,
      floorPlanExport: false,
      clientPortal: false,
      costEstimator: false,
      presentationMode: false,
      brandCustomization: false,
      priorityRendering: true,
      customFurnitureUpload: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  studio: {
    name: 'Studio',
    key: 'studio',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID || '',
    description: 'For professional interior designers',
    highlight: false,
    cta: 'Get Studio',
    maxProjects: null,
    maxRoomsPerProject: null,
    maxFurniturePerRoom: null,
    maxRevisionSnapshots: null, // unlimited
    maxMoodBoards: null, // unlimited
    features: {
      allFurnitureItems: true,
      allRoomTypes: true,
      allLightingMoods: true,
      customDimensions: true,
      shareLinks: true,
      exportImage: true,
      exportPDF: true,
      exportHD: true,
      revisionSnapshots: true,
      moodBoard: true,
      floorPlanExport: true,
      clientPortal: true,
      costEstimator: true,
      presentationMode: true,
      brandCustomization: true,
      priorityRendering: true,
      customFurnitureUpload: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

// ─── Default room types & lighting moods ─────────────────────────────────────

const DEFAULT_FREE_ROOM_TYPES = ['living', 'bedroom', 'office'] as const;
const DEFAULT_ALL_ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining'] as const;
const DEFAULT_FREE_LIGHTING_MOODS = ['daylight', 'evening'] as const;
const DEFAULT_ALL_LIGHTING_MOODS = ['daylight', 'golden', 'evening', 'night'] as const;

/** Room types available to free users (from DB or fallback) */
export let FREE_ROOM_TYPES: readonly string[] = DEFAULT_FREE_ROOM_TYPES;
/** All room types (Pro+) */
export let ALL_ROOM_TYPES: readonly string[] = DEFAULT_ALL_ROOM_TYPES;
/** Lighting moods available to free users */
export let FREE_LIGHTING_MOODS: readonly string[] = DEFAULT_FREE_LIGHTING_MOODS;
/** All lighting moods (Pro+) */
export let ALL_LIGHTING_MOODS: readonly string[] = DEFAULT_ALL_LIGHTING_MOODS;

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedPlans {
  data: Record<PlanKey, PlanConfig>;
  roomTypes: { free: string[]; all: string[] };
  lightingMoods: { free: string[]; all: string[] };
  featureComparison: ComparisonCategory[];
  timestamp: number;
}

let cachedPlans: CachedPlans | null = null;

// ─── Feature Comparison Types ────────────────────────────────────────────────

export interface ComparisonItem {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  studio: boolean | string;
}

export interface ComparisonCategory {
  category: string;
  items: ComparisonItem[];
}

const DEFAULT_FEATURE_COMPARISON: ComparisonCategory[] = [
  {
    category: 'Design & Editing',
    items: [
      { label: '3D Room Editor', free: true, pro: true, studio: true },
      { label: 'Furniture Items', free: '15 basic', pro: '30+ all', studio: 'All + custom' },
      { label: 'Room Types', free: '3 types', pro: '6 types', studio: '6 types' },
      { label: 'Lighting Moods', free: '2 moods', pro: '4 moods', studio: '4 moods' },
      { label: 'Custom Dimensions', free: false, pro: true, studio: true },
      { label: 'Material & Color System', free: true, pro: true, studio: true },
    ],
  },
  {
    category: 'Projects & Storage',
    items: [
      { label: 'Saved Designs', free: '3 projects', pro: '50 projects', studio: 'Unlimited' },
      { label: 'Rooms per Project', free: '1 room', pro: '10 rooms', studio: 'Unlimited' },
      { label: 'Furniture per Room', free: '15 items', pro: 'Unlimited', studio: 'Unlimited' },
      { label: 'Revision Snapshots', free: false, pro: '3 per project', studio: 'Unlimited' },
      { label: 'Mood Boards', free: false, pro: '1 per project', studio: 'Unlimited' },
    ],
  },
  {
    category: 'Export & Sharing',
    items: [
      { label: 'Screenshot Export', free: true, pro: true, studio: true },
      { label: 'Export as Image (PNG)', free: false, pro: true, studio: true },
      { label: 'Export as PDF', free: false, pro: true, studio: true },
      { label: 'HD Export', free: false, pro: false, studio: true },
      { label: '2D Floor Plan Export', free: false, pro: false, studio: true },
      { label: 'Share Links', free: false, pro: true, studio: true },
      { label: 'Client Portal (Branded)', free: false, pro: false, studio: true },
    ],
  },
  {
    category: 'Professional Tools',
    items: [
      { label: 'Cost Estimator / Budget', free: false, pro: false, studio: true },
      { label: 'Presentation Mode', free: false, pro: false, studio: true },
      { label: 'Priority Rendering', free: false, pro: true, studio: true },
      { label: 'Brand Customization', free: false, pro: false, studio: true },
      { label: 'Custom Furniture Upload', free: false, pro: false, studio: true },
      { label: 'API Access', free: false, pro: false, studio: true },
      { label: 'Priority Support', free: false, pro: false, studio: true },
    ],
  },
];

// ─── DB → PlanConfig Mapper ──────────────────────────────────────────────────

interface DbPlanConfig {
  planKey: string;
  name: string;
  price: number;
  priceId: string;
  description: string;
  highlight: boolean;
  cta: string;
  maxProjects: number | null;
  maxRoomsPerProject: number | null;
  maxFurniturePerRoom: number | null;
  maxRevisionSnapshots: number | null;
  maxMoodBoards: number | null;
  features: string; // JSON
  freeRoomTypes: string; // JSON
  freeLightingMoods: string; // JSON
  allRoomTypes: string; // JSON
  allLightingMoods: string; // JSON
  featureComparison: string; // JSON
}

function dbRowToPlanConfig(row: DbPlanConfig): PlanConfig {
  let features = HARDCODED_DEFAULTS[row.planKey as PlanKey]?.features ?? HARDCODED_DEFAULTS.free.features;
  try {
    const parsed = JSON.parse(row.features);
    // Merge with defaults so new feature flags are always present
    features = { ...HARDCODED_DEFAULTS[row.planKey as PlanKey]?.features, ...parsed };
  } catch {
    // Keep defaults
  }

  return {
    name: row.name,
    key: row.planKey as PlanKey,
    price: row.price,
    priceId: row.priceId || (row.planKey !== 'free' ? (
      row.planKey === 'pro'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '')
        : (process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID || '')
    ) : ''),
    description: row.description,
    highlight: row.highlight,
    cta: row.cta,
    maxProjects: row.maxProjects,
    maxRoomsPerProject: row.maxRoomsPerProject,
    maxFurniturePerRoom: row.maxFurniturePerRoom,
    maxRevisionSnapshots: row.maxRevisionSnapshots ?? HARDCODED_DEFAULTS[row.planKey as PlanKey]?.maxRevisionSnapshots ?? 0,
    maxMoodBoards: row.maxMoodBoards ?? HARDCODED_DEFAULTS[row.planKey as PlanKey]?.maxMoodBoards ?? 0,
    features,
  };
}

// ─── Cache Invalidation ──────────────────────────────────────────────────────

/**
 * Force-clear the plan config cache.
 * Call this after updating plan config via the admin API.
 */
export function invalidatePlanCache(): void {
  cachedPlans = null;
}

/**
 * Check if the cache is still valid.
 */
function isCacheValid(): boolean {
  return cachedPlans !== null && (Date.now() - cachedPlans.timestamp) < CACHE_TTL_MS;
}

// ─── Load Plans from DB ──────────────────────────────────────────────────────

/**
 * Load all plan configurations from the database.
 * Returns cached data if still fresh, otherwise fetches from DB.
 * Falls back to HARDCODED_DEFAULTS if DB is unreachable.
 */
export async function loadPlans(): Promise<Record<PlanKey, PlanConfig>> {
  if (isCacheValid() && cachedPlans) {
    return cachedPlans.data;
  }

  try {
    const rows = await db.planConfig.findMany({
      orderBy: { planKey: 'asc' },
    });

    if (rows.length === 0) {
      // No plan configs in DB yet — seed them
      await seedPlanConfigs();
      return { ...HARDCODED_DEFAULTS };
    }

    const data = {} as Record<PlanKey, PlanConfig>;
    let roomTypesFree: string[] = [...DEFAULT_FREE_ROOM_TYPES];
    let roomTypesAll: string[] = [...DEFAULT_ALL_ROOM_TYPES];
    let lightingMoodsFree: string[] = [...DEFAULT_FREE_LIGHTING_MOODS];
    let lightingMoodsAll: string[] = [...DEFAULT_ALL_LIGHTING_MOODS];
    let featureComparison: ComparisonCategory[] = DEFAULT_FEATURE_COMPARISON;

    for (const row of rows) {
      const config = dbRowToPlanConfig(row as unknown as DbPlanConfig);
      data[row.planKey as PlanKey] = config;

      // Parse room types & lighting moods from the free plan row
      if (row.planKey === 'free') {
        try {
          const frt = JSON.parse(row.freeRoomTypes);
          if (Array.isArray(frt) && frt.length > 0) roomTypesFree = frt;
        } catch { /* keep defaults */ }
        try {
          const flm = JSON.parse(row.freeLightingMoods);
          if (Array.isArray(flm) && flm.length > 0) lightingMoodsFree = flm;
        } catch { /* keep defaults */ }
      }

      // Parse all room types & lighting moods from the pro plan row
      if (row.planKey === 'pro') {
        try {
          const art = JSON.parse(row.allRoomTypes);
          if (Array.isArray(art) && art.length > 0) roomTypesAll = art;
        } catch { /* keep defaults */ }
        try {
          const alm = JSON.parse(row.allLightingMoods);
          if (Array.isArray(alm) && alm.length > 0) lightingMoodsAll = alm;
        } catch { /* keep defaults */ }
      }

      // Parse feature comparison from any row (they're all the same)
      if (row.featureComparison && row.featureComparison !== '[]') {
        try {
          const fc = JSON.parse(row.featureComparison);
          if (Array.isArray(fc) && fc.length > 0) featureComparison = fc;
        } catch { /* keep defaults */ }
      }
    }

    // Fill any missing plan keys with hardcoded defaults
    for (const key of PLAN_KEYS) {
      if (!data[key]) {
        data[key] = HARDCODED_DEFAULTS[key];
      }
    }

    // Update module-level exports
    FREE_ROOM_TYPES = roomTypesFree;
    ALL_ROOM_TYPES = roomTypesAll;
    FREE_LIGHTING_MOODS = lightingMoodsFree;
    ALL_LIGHTING_MOODS = lightingMoodsAll;

    cachedPlans = {
      data,
      roomTypes: { free: roomTypesFree, all: roomTypesAll },
      lightingMoods: { free: lightingMoodsFree, all: lightingMoodsAll },
      featureComparison,
      timestamp: Date.now(),
    };

    return data;
  } catch (error) {
    console.error('Failed to load plan configs from DB, using hardcoded defaults:', error);
    return { ...HARDCODED_DEFAULTS };
  }
}

// ─── Synchronous Accessor (for backward compat) ─────────────────────────────

/**
 * Synchronous plan config accessor.
 * Uses the cache if available, otherwise falls back to HARDCODED_DEFAULTS.
 * For API routes that need fresh data, use `await loadPlans()` instead.
 */
export const PLAN_CONFIG: Record<PlanKey, PlanConfig> = { ...HARDCODED_DEFAULTS };

/**
 * Update PLAN_CONFIG from the cache. Called after loadPlans().
 */
function syncPlanConfigFromCache(data: Record<PlanKey, PlanConfig>): void {
  for (const key of PLAN_KEYS) {
    PLAN_CONFIG[key] = data[key] || HARDCODED_DEFAULTS[key];
  }
}

// Auto-load on first import (server-side only)
if (typeof window === 'undefined') {
  loadPlans().then(syncPlanConfigFromCache).catch(() => {});
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/** Get plan config safely, falling back to free. During beta, returns Pro config. */
export function getPlanConfig(plan: string | null | undefined): PlanConfig {
  if (isBetaMode()) {
    return PLAN_CONFIG.pro ?? HARDCODED_DEFAULTS.pro;
  }
  const key = (plan as PlanKey) ?? 'free';
  return PLAN_CONFIG[key] ?? HARDCODED_DEFAULTS[key] ?? HARDCODED_DEFAULTS.free;
}

/** Check if a plan has a specific feature. During beta, all features enabled. */
export function hasFeature(plan: string | null | undefined, feature: keyof PlanConfig['features']): boolean {
  if (isBetaMode()) return true;
  return getPlanConfig(plan).features[feature];
}

/** Check if a plan has reached or exceeded a numeric limit. During beta, limits are relaxed. */
export function hasReachedLimit(
  plan: string | null | undefined,
  limitKey: 'maxProjects' | 'maxRoomsPerProject' | 'maxFurniturePerRoom' | 'maxRevisionSnapshots' | 'maxMoodBoards',
  currentCount: number,
): boolean {
  if (isBetaMode()) return false; // No limits during beta
  const config = getPlanConfig(plan);
  const limit = config[limitKey];
  if (limit === null) return false; // unlimited
  return currentCount >= limit;
}

/** Get the numeric limit for a plan, or Infinity if unlimited */
export function getPlanLimit(
  plan: string | null | undefined,
  limitKey: 'maxProjects' | 'maxRoomsPerProject' | 'maxFurniturePerRoom' | 'maxRevisionSnapshots' | 'maxMoodBoards',
): number {
  const config = getPlanConfig(plan);
  const limit = config[limitKey];
  return limit ?? Infinity;
}

/** Check if plan A is at least as high as plan B. During beta, always true. */
export function isPlanAtLeast(planA: string | null | undefined, planB: PlanKey): boolean {
  if (isBetaMode()) return true;
  const a = PLAN_ORDER[(planA as PlanKey) ?? 'free'] ?? 0;
  const b = PLAN_ORDER[planB] ?? 0;
  return a >= b;
}

/** Format price for display */
export function formatPlanPrice(plan: PlanKey): string {
  const config = PLAN_CONFIG[plan] ?? HARDCODED_DEFAULTS[plan];
  if (config.price === 0) return 'Free';
  return `$${config.price}/mo`;
}

/** Get available room types for a plan. During beta, all room types available. */
export function getAvailableRoomTypes(plan: string | null | undefined): readonly string[] {
  if (isBetaMode()) return ALL_ROOM_TYPES;
  return hasFeature(plan, 'allRoomTypes') ? ALL_ROOM_TYPES : FREE_ROOM_TYPES;
}

/** Get available lighting moods for a plan. During beta, all moods available. */
export function getAvailableLightingMoods(plan: string | null | undefined): readonly string[] {
  if (isBetaMode()) return ALL_LIGHTING_MOODS;
  return hasFeature(plan, 'allLightingMoods') ? ALL_LIGHTING_MOODS : FREE_LIGHTING_MOODS;
}

/** Get the upgrade plan for a given plan (null if already highest) */
export function getUpgradePlan(plan: string | null | undefined): PlanKey | null {
  const current = (plan as PlanKey) ?? 'free';
  switch (current) {
    case 'free': return 'pro';
    case 'pro': return 'studio';
    case 'studio': return null;
    default: return 'pro';
  }
}

/** Get the feature comparison list for the pricing page (from DB or defaults) */
export function getFeatureComparison(): ComparisonCategory[] {
  if (cachedPlans?.featureComparison && cachedPlans.featureComparison.length > 0) {
    return cachedPlans.featureComparison;
  }
  return DEFAULT_FEATURE_COMPARISON;
}

// ─── Seed Function ───────────────────────────────────────────────────────────

/**
 * Seed the PlanConfig table with default values.
 * Called automatically when the table is empty.
 */
export async function seedPlanConfigs(): Promise<void> {
  const defaultFeatures = {
    free: HARDCODED_DEFAULTS.free.features,
    pro: HARDCODED_DEFAULTS.pro.features,
    studio: HARDCODED_DEFAULTS.studio.features,
  };

  const defaultComparison = JSON.stringify(DEFAULT_FEATURE_COMPARISON);

  for (const key of PLAN_KEYS) {
    const d = HARDCODED_DEFAULTS[key];
    await db.planConfig.upsert({
      where: { planKey: key },
      update: {},
      create: {
        planKey: key,
        name: d.name,
        price: d.price,
        priceId: d.priceId,
        description: d.description,
        highlight: d.highlight,
        cta: d.cta,
        maxProjects: d.maxProjects,
        maxRoomsPerProject: d.maxRoomsPerProject,
        maxFurniturePerRoom: d.maxFurniturePerRoom,
        maxRevisionSnapshots: d.maxRevisionSnapshots,
        maxMoodBoards: d.maxMoodBoards,
        features: JSON.stringify(defaultFeatures[key]),
        freeRoomTypes: JSON.stringify([...DEFAULT_FREE_ROOM_TYPES]),
        freeLightingMoods: JSON.stringify([...DEFAULT_FREE_LIGHTING_MOODS]),
        allRoomTypes: JSON.stringify([...DEFAULT_ALL_ROOM_TYPES]),
        allLightingMoods: JSON.stringify([...DEFAULT_ALL_LIGHTING_MOODS]),
        featureComparison: defaultComparison,
      },
    });
  }

  console.log('[plans] Seeded default plan configs to database');
}

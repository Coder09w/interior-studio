/**
 * Plan enforcement utilities for API routes.
 *
 * Every API route that creates resources or gates features should use
 * these helpers instead of hard-coding plan logic.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  type PlanKey,
  getPlanConfig,
  hasFeature,
  hasReachedLimit,
  getPlanLimit,
  isPlanAtLeast,
  getAvailableRoomTypes,
  getAvailableLightingMoods,
  isBetaMode,
} from '@/lib/plans';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanCheckResult {
  allowed: boolean;
  plan: PlanKey;
  limit?: number | null;
  current?: number;
  error?: string;
}

export interface UsageStats {
  projects: { current: number; limit: number | null };
  roomsPerProject: { current: number; limit: number | null; projectId?: string };
  furniturePerRoom: { current: number; limit: number | null; roomId?: string };
  revisionSnapshots: { current: number; limit: number | null };
  moodBoards: { current: number; limit: number | null };
  plan: PlanKey;
  planName: string;
}

// ─── Session Plan Helper ──────────────────────────────────────────────────────

/**
 * Get the current user's plan from their session.
 * Returns 'pro' during beta, 'free' as default otherwise.
 */
export async function getUserPlan(): Promise<{ plan: PlanKey; userId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // During beta, all users are treated as Pro
  if (isBetaMode()) {
    return { plan: 'pro', userId: session.user.id };
  }

  const plan = (session.user as Record<string, unknown>).plan as PlanKey | undefined;
  return { plan: plan || 'free', userId: session.user.id };
}

/**
 * Get the user's plan directly from the database (always fresh).
 * During beta, returns 'pro'.
 */
export async function getUserPlanFromDB(userId: string): Promise<PlanKey> {
  if (isBetaMode()) return 'pro';
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return (user?.plan as PlanKey) || 'free';
}

// ─── Project Limit Checks ─────────────────────────────────────────────────────

/**
 * Check if the user can create a new project.
 */
export async function checkProjectLimit(userId: string, plan: PlanKey): Promise<PlanCheckResult> {
  const config = getPlanConfig(plan);
  const currentCount = await db.project.count({
    where: { userId },
  });

  const limit = config.maxProjects;
  const reached = limit !== null && currentCount >= limit;

  return {
    allowed: !reached,
    plan,
    limit,
    current: currentCount,
    error: reached
      ? `You've reached the maximum of ${limit} projects on the ${config.name} plan. Upgrade to create more designs.`
      : undefined,
  };
}

// ─── Room Limit Checks ────────────────────────────────────────────────────────

/**
 * Check if the user can add a new room to a specific project.
 */
export async function checkRoomLimit(
  userId: string,
  projectId: string,
  plan: PlanKey,
): Promise<PlanCheckResult> {
  const config = getPlanConfig(plan);

  // Verify ownership
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { _count: { select: { rooms: true } } },
  });

  if (!project || project.userId !== userId) {
    return {
      allowed: false,
      plan,
      error: 'Project not found or access denied.',
    };
  }

  const currentCount = project._count.rooms;
  const limit = config.maxRoomsPerProject;
  const reached = limit !== null && currentCount >= limit;

  return {
    allowed: !reached,
    plan,
    limit,
    current: currentCount,
    error: reached
      ? `You've reached the maximum of ${limit} room${limit !== 1 ? 's' : ''} per project on the ${config.name} plan. Upgrade for more rooms.`
      : undefined,
  };
}

// ─── Furniture Limit Checks ───────────────────────────────────────────────────

/**
 * Check if the user can add more furniture to a room.
 */
export function checkFurnitureLimit(
  plan: PlanKey,
  currentFurnitureCount: number,
): PlanCheckResult {
  const config = getPlanConfig(plan);
  const limit = config.maxFurniturePerRoom;
  const reached = limit !== null && currentFurnitureCount >= limit;

  return {
    allowed: !reached,
    plan,
    limit,
    current: currentFurnitureCount,
    error: reached
      ? `You've reached the maximum of ${limit} furniture items on the ${config.name} plan. Upgrade for unlimited items.`
      : undefined,
  };
}

// ─── Feature Gate Checks ──────────────────────────────────────────────────────

/**
 * Check if the user can access a specific feature.
 */
export function checkFeature(
  plan: PlanKey,
  feature: keyof ReturnType<typeof getPlanConfig>['features'],
): PlanCheckResult {
  const config = getPlanConfig(plan);
  const allowed = config.features[feature];

  return {
    allowed,
    plan,
    error: !allowed
      ? `The ${feature.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} feature is not available on the ${config.name} plan. Please upgrade.`
      : undefined,
  };
}

/**
 * Check if the user can use a specific room type.
 */
export function checkRoomType(plan: PlanKey, roomType: string): PlanCheckResult {
  const available = getAvailableRoomTypes(plan);
  const allowed = available.includes(roomType as typeof available[number]);

  return {
    allowed,
    plan,
    error: !allowed
      ? `The "${roomType}" room type is not available on the ${getPlanConfig(plan).name} plan. Upgrade to access all room types.`
      : undefined,
  };
}

/**
 * Check if the user can use a specific lighting mood.
 */
export function checkLightingMood(plan: PlanKey, mood: string): PlanCheckResult {
  const available = getAvailableLightingMoods(plan);
  const allowed = available.includes(mood as typeof available[number]);

  return {
    allowed,
    plan,
    error: !allowed
      ? `The "${mood}" lighting mood is not available on the ${getPlanConfig(plan).name} plan. Upgrade to access all moods.`
      : undefined,
  };
}

/**
 * Check if the user can use custom dimensions.
 */
export function checkCustomDimensions(plan: PlanKey, width: number, depth: number, height: number): PlanCheckResult {
  if (isPlanAtLeast(plan, 'pro')) {
    return { allowed: true, plan };
  }

  // Free plan: only standard presets allowed (8x6x3)
  const isStandard = width === 8 && depth === 6 && height === 3;
  return {
    allowed: isStandard,
    plan,
    error: !isStandard
      ? 'Custom dimensions are not available on the Free plan. Upgrade to Pro to set custom room sizes.'
      : undefined,
  };
}

// ─── Usage Stats ──────────────────────────────────────────────────────────────

/**
 * Get comprehensive usage stats for the current user.
 */
export async function getUsageStats(userId: string, plan: PlanKey): Promise<UsageStats> {
  const config = getPlanConfig(plan);

  // Project count
  const projectCount = await db.project.count({
    where: { userId },
  });

  // Find the project with the most rooms
  const projectsWithRoomCount = await db.project.findMany({
    where: { userId },
    include: { _count: { select: { rooms: true } } },
    orderBy: { createdAt: 'desc' },
  });

  let maxRooms = 0;
  let maxRoomsProjectId: string | undefined;
  for (const p of projectsWithRoomCount) {
    if (p._count.rooms > maxRooms) {
      maxRooms = p._count.rooms;
      maxRoomsProjectId = p.id;
    }
  }

  // Find the room with the most furniture
  const rooms = await db.room.findMany({
    where: { project: { userId } },
    select: { id: true, furniture: true },
  });

  let maxFurniture = 0;
  let maxFurnitureRoomId: string | undefined;
  for (const r of rooms) {
    try {
      const items = JSON.parse(r.furniture || '[]');
      if (Array.isArray(items) && items.length > maxFurniture) {
        maxFurniture = items.length;
        maxFurnitureRoomId = r.id;
      }
    } catch {
      // skip invalid JSON
    }
  }

  return {
    projects: { current: projectCount, limit: config.maxProjects },
    roomsPerProject: { current: maxRooms, limit: config.maxRoomsPerProject, projectId: maxRoomsProjectId },
    furniturePerRoom: { current: maxFurniture, limit: config.maxFurniturePerRoom, roomId: maxFurnitureRoomId },
    revisionSnapshots: { current: 0, limit: config.maxRevisionSnapshots },
    moodBoards: { current: 0, limit: config.maxMoodBoards },
    plan,
    planName: config.name,
  };
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

/**
 * Create a 403 Forbidden response for plan limit violations.
 */
export function planLimitResponse(result: PlanCheckResult): NextResponse {
  return NextResponse.json(
    {
      error: result.error,
      code: 'PLAN_LIMIT_REACHED',
      plan: result.plan,
      limit: result.limit,
      current: result.current,
    },
    { status: 403 },
  );
}

/**
 * Create a 402 Payment Required response for feature gate violations.
 */
export function featureGateResponse(result: PlanCheckResult): NextResponse {
  return NextResponse.json(
    {
      error: result.error,
      code: 'FEATURE_NOT_AVAILABLE',
      plan: result.plan,
    },
    { status: 402 },
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { type PlanKey, PLAN_KEYS, invalidatePlanCache } from '@/lib/plans';

/**
 * GET /api/admin/plans
 *
 * Returns all plan configurations from the database.
 * Requires authentication.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await db.planConfig.findMany({
      orderBy: { planKey: 'asc' },
    });

    // Parse JSON fields for easier consumption
    const parsed = configs.map((c) => ({
      ...c,
      features: JSON.parse(c.features),
      freeRoomTypes: JSON.parse(c.freeRoomTypes),
      freeLightingMoods: JSON.parse(c.freeLightingMoods),
      allRoomTypes: JSON.parse(c.allRoomTypes),
      allLightingMoods: JSON.parse(c.allLightingMoods),
      featureComparison: JSON.parse(c.featureComparison),
    }));

    return NextResponse.json({ plans: parsed });
  } catch (error) {
    console.error('Error fetching plan configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan configurations' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/plans
 *
 * Update one or more plan configurations.
 * Body: { plans: [{ planKey: "pro", price: 15, ... }, ...] }
 * Only the fields you include will be updated.
 *
 * After updating, the server-side cache is invalidated so changes
 * take effect immediately — no redeploy needed.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plans } = body as {
      plans: Array<{
        planKey: string;
        name?: string;
        price?: number;
        priceId?: string;
        description?: string;
        highlight?: boolean;
        cta?: string;
        maxProjects?: number | null;
        maxRoomsPerProject?: number | null;
        maxFurniturePerRoom?: number | null;
        maxRevisionSnapshots?: number | null;
        maxMoodBoards?: number | null;
        features?: Record<string, boolean>;
        freeRoomTypes?: string[];
        freeLightingMoods?: string[];
        allRoomTypes?: string[];
        allLightingMoods?: string[];
        featureComparison?: Array<{ category: string; items: Array<{ label: string; free: boolean | string; pro: boolean | string; studio: boolean | string }> }>;
      }>;
    };

    if (!plans || !Array.isArray(plans)) {
      return NextResponse.json(
        { error: 'Request body must include a "plans" array' },
        { status: 400 },
      );
    }

    const updated: string[] = [];

    for (const update of plans) {
      if (!update.planKey || !PLAN_KEYS.includes(update.planKey as PlanKey)) {
        continue; // Skip invalid plan keys
      }

      // Build update data — only include fields that were provided
      const data: Record<string, unknown> = {};

      if (update.name !== undefined) data.name = update.name;
      if (update.price !== undefined) data.price = update.price;
      if (update.priceId !== undefined) data.priceId = update.priceId;
      if (update.description !== undefined) data.description = update.description;
      if (update.highlight !== undefined) data.highlight = update.highlight;
      if (update.cta !== undefined) data.cta = update.cta;
      if (update.maxProjects !== undefined) data.maxProjects = update.maxProjects;
      if (update.maxRoomsPerProject !== undefined) data.maxRoomsPerProject = update.maxRoomsPerProject;
      if (update.maxFurniturePerRoom !== undefined) data.maxFurniturePerRoom = update.maxFurniturePerRoom;
      if (update.maxRevisionSnapshots !== undefined) data.maxRevisionSnapshots = update.maxRevisionSnapshots;
      if (update.maxMoodBoards !== undefined) data.maxMoodBoards = update.maxMoodBoards;

      // JSON fields — stringify before storing
      if (update.features !== undefined) data.features = JSON.stringify(update.features);
      if (update.freeRoomTypes !== undefined) data.freeRoomTypes = JSON.stringify(update.freeRoomTypes);
      if (update.freeLightingMoods !== undefined) data.freeLightingMoods = JSON.stringify(update.freeLightingMoods);
      if (update.allRoomTypes !== undefined) data.allRoomTypes = JSON.stringify(update.allRoomTypes);
      if (update.allLightingMoods !== undefined) data.allLightingMoods = JSON.stringify(update.allLightingMoods);
      if (update.featureComparison !== undefined) data.featureComparison = JSON.stringify(update.featureComparison);

      if (Object.keys(data).length === 0) continue; // Nothing to update

      await db.planConfig.upsert({
        where: { planKey: update.planKey },
        update: data,
        create: {
          planKey: update.planKey,
          name: update.name || update.planKey,
          price: update.price ?? 0,
          priceId: update.priceId || '',
          description: update.description || '',
          highlight: update.highlight ?? false,
          cta: update.cta || '',
          maxProjects: update.maxProjects ?? null,
          maxRoomsPerProject: update.maxRoomsPerProject ?? null,
          maxFurniturePerRoom: update.maxFurniturePerRoom ?? null,
          maxRevisionSnapshots: update.maxRevisionSnapshots ?? null,
          maxMoodBoards: update.maxMoodBoards ?? null,
          features: JSON.stringify(update.features || {}),
          freeRoomTypes: JSON.stringify(update.freeRoomTypes || []),
          freeLightingMoods: JSON.stringify(update.freeLightingMoods || []),
          allRoomTypes: JSON.stringify(update.allRoomTypes || []),
          allLightingMoods: JSON.stringify(update.allLightingMoods || []),
          featureComparison: JSON.stringify(update.featureComparison || []),
        },
      });

      updated.push(update.planKey);
    }

    // Invalidate cache so changes take effect immediately
    invalidatePlanCache();

    return NextResponse.json({
      message: `Updated ${updated.length} plan configuration(s)`,
      updated,
      note: 'Changes are live immediately — no redeploy needed. Cache refreshed.',
    });
  } catch (error) {
    console.error('Error updating plan configs:', error);
    return NextResponse.json(
      { error: 'Failed to update plan configurations' },
      { status: 500 },
    );
  }
}

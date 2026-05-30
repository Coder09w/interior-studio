import { NextResponse } from 'next/server';
import { loadPlans, getFeatureComparison, type PlanKey } from '@/lib/plans';

/**
 * GET /api/plans
 *
 * Public endpoint that returns all plan configurations.
 * Used by the pricing page to render plans dynamically.
 * This ensures pricing changes (made via /api/admin/plans)
 * are reflected on the pricing page without redeploying.
 */
export async function GET() {
  try {
    const plans = await loadPlans();
    const featureComparison = getFeatureComparison();

    const serialize = (key: PlanKey) => ({
      name: plans[key].name,
      price: plans[key].price,
      description: plans[key].description,
      highlight: plans[key].highlight,
      cta: plans[key].cta,
      maxProjects: plans[key].maxProjects,
      maxRoomsPerProject: plans[key].maxRoomsPerProject,
      maxFurniturePerRoom: plans[key].maxFurniturePerRoom,
      maxRevisionSnapshots: plans[key].maxRevisionSnapshots,
      maxMoodBoards: plans[key].maxMoodBoards,
      features: plans[key].features,
    });

    return NextResponse.json({
      plans: {
        free: serialize('free'),
        pro: serialize('pro'),
        studio: serialize('studio'),
      },
      featureComparison,
    });
  } catch (error) {
    console.error('Error fetching public plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan configurations' },
      { status: 500 },
    );
  }
}

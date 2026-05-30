import { NextResponse } from 'next/server';
import { getUsageStats, getUserPlan } from '@/lib/plan-enforcement';

/**
 * GET /api/plan/usage
 *
 * Returns comprehensive usage stats for the current user,
 * including current counts vs plan limits.
 */
export async function GET() {
  try {
    const userPlan = await getUserPlan();
    if (!userPlan) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getUsageStats(userPlan.userId, userPlan.plan);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 },
    );
  }
}

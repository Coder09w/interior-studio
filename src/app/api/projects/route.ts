import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { getUserPlan, checkProjectLimit, planLimitResponse } from '@/lib/plan-enforcement';
import { getAvailableRoomTypes } from '@/lib/plans';

// GET /api/projects — List all projects for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            roomType: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects — Create a new project
export async function POST(request: NextRequest) {
  try {
    // Rate limit write operations
    const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.write);
    if (rateLimitResponse) return rateLimitResponse;

    const userPlan = await getUserPlan();
    if (!userPlan) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce plan limits using centralized config
    const planCheck = await checkProjectLimit(userPlan.userId, userPlan.plan);
    if (!planCheck.allowed) {
      return planLimitResponse(planCheck);
    }

    const body = await request.json();
    const { name, roomType, wallColor } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Validate room type is available for this plan
    const availableRoomTypes = getAvailableRoomTypes(userPlan.plan);
    const requestedType = roomType || 'living';
    if (!availableRoomTypes.includes(requestedType as typeof availableRoomTypes[number])) {
      return NextResponse.json(
        {
          error: `The "${requestedType}" room type is not available on your current plan. Upgrade to access all room types.`,
          code: 'FEATURE_NOT_AVAILABLE',
          availableTypes: availableRoomTypes,
        },
        { status: 402 },
      );
    }

    // Map room type to default room name
    const roomNameMap: Record<string, string> = {
      living: 'Living Room',
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      bathroom: 'Bathroom',
      office: 'Office',
      dining: 'Dining Room',
    };

    const project = await db.project.create({
      data: {
        name: name.trim(),
        userId: userPlan.userId,
        rooms: {
          create: {
            name: roomNameMap[requestedType] || 'Living Room',
            roomType: requestedType,
            width: 8,
            depth: 6,
            height: 3,
            wallColor: wallColor || '#FAF8F4',
            floorType: 'hardwood',
            doorWall: 'none',
            windowCount: 1,
            windowWall: 'back',
            lightMood: 'daylight',
            furniture: '[]',
          },
        },
      },
      include: {
        rooms: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

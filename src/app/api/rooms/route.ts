import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const ROOM_DEFAULTS: Record<string, { width: number; depth: number; height: number; name: string }> = {
  living: { width: 8, depth: 6, height: 3, name: 'Living Room' },
  bedroom: { width: 5, depth: 4.5, height: 3, name: 'Bedroom' },
  kitchen: { width: 4, depth: 3.5, height: 3, name: 'Kitchen' },
  bathroom: { width: 3, depth: 2.5, height: 2.8, name: 'Bathroom' },
  office: { width: 4, depth: 3.5, height: 3, name: 'Office' },
  dining: { width: 5, depth: 4, height: 3, name: 'Dining Room' },
};

// POST /api/rooms — Create a new room in a project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, roomType } = body;

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the project belongs to the authenticated user
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = roomType && ROOM_DEFAULTS[roomType] ? roomType : 'living';
    const defaults = ROOM_DEFAULTS[type];

    const room = await db.room.create({
      data: {
        projectId,
        name: name?.trim() || defaults.name,
        roomType: type,
        width: defaults.width,
        depth: defaults.depth,
        height: defaults.height,
        wallColor: '#FAF8F4',
        floorType: 'hardwood',
        doorWall: 'none',
        windowCount: 1,
        windowWall: 'back',
        lightMood: 'daylight',
        furniture: '[]',
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

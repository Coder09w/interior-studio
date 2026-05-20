import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rooms/public/[roomId] — Public room data (no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Return only public-safe fields (no projectId or other sensitive data)
    const publicData = {
      name: room.name,
      roomType: room.roomType,
      width: room.width,
      depth: room.depth,
      height: room.height,
      wallColor: room.wallColor,
      floorType: room.floorType,
      windowCount: room.windowCount,
      windowWall: room.windowWall,
      lightMood: room.lightMood,
      furniture: room.furniture,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error fetching public room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

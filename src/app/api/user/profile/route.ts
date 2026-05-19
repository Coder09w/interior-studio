import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/user/profile — Return current user profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultRoomW: true,
        defaultRoomD: true,
        defaultRoomH: true,
        defaultWallColor: true,
        autoSave: true,
        plan: true,
        onboarding: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile — Update user profile fields
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const allowedFields = [
      'name',
      'defaultRoomW',
      'defaultRoomD',
      'defaultRoomH',
      'defaultWallColor',
      'autoSave',
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Validate numeric fields
    if ('defaultRoomW' in updateData) {
      const v = Number(updateData.defaultRoomW);
      if (isNaN(v) || v < 4 || v > 14) {
        return NextResponse.json(
          { error: 'Room width must be between 4 and 14' },
          { status: 400 }
        );
      }
      updateData.defaultRoomW = v;
    }

    if ('defaultRoomD' in updateData) {
      const v = Number(updateData.defaultRoomD);
      if (isNaN(v) || v < 4 || v > 12) {
        return NextResponse.json(
          { error: 'Room depth must be between 4 and 12' },
          { status: 400 }
        );
      }
      updateData.defaultRoomD = v;
    }

    if ('defaultRoomH' in updateData) {
      const v = Number(updateData.defaultRoomH);
      if (isNaN(v) || v < 2.5 || v > 5) {
        return NextResponse.json(
          { error: 'Ceiling height must be between 2.5 and 5' },
          { status: 400 }
        );
      }
      updateData.defaultRoomH = v;
    }

    if ('autoSave' in updateData && typeof updateData.autoSave !== 'boolean') {
      return NextResponse.json(
        { error: 'autoSave must be a boolean' },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        defaultRoomW: true,
        defaultRoomD: true,
        defaultRoomH: true,
        defaultWallColor: true,
        autoSave: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH /api/user/onboarding — Update user's onboarding status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { onboarding } = body;

    if (typeof onboarding !== 'boolean') {
      return NextResponse.json(
        { error: 'onboarding must be a boolean' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { onboarding },
      select: {
        id: true,
        onboarding: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding' },
      { status: 500 }
    );
  }
}

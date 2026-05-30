import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/feedback
 * Receives user feedback during beta (bug reports, feature requests, general).
 * Stores feedback as a simple JSON log file in the server.
 * In production, this should be replaced with a database table or external service.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, email, page, timestamp } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!['bug', 'feature', 'general'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Log to console for now (in production, save to DB or external service)
    console.log('[FEEDBACK]', JSON.stringify({
      category,
      message: message.trim().slice(0, 2000),
      email: email || '(not provided)',
      page: page || '(unknown)',
      timestamp: timestamp || new Date().toISOString(),
    }));

    // TODO: Replace with database storage when ready
    // await prisma.feedback.create({
    //   data: {
    //     category,
    //     message: message.trim(),
    //     email: email || null,
    //     page: page || null,
    //   },
    // });

    return NextResponse.json(
      { success: true, message: 'Feedback received. Thank you!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

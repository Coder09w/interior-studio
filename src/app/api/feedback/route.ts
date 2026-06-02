import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/feedback
 * Receives user feedback during beta (bug reports, feature requests, general, contact).
 * Validates and logs feedback. In production, replace with database storage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, message, email, name, subject, page, timestamp } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Accept contact form subjects as categories too
    const validCategory = category || 'general';
    if (!['bug', 'feature', 'general', 'support', 'partnership', 'feedback', 'question'].includes(validCategory)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const feedbackEntry = {
      category: validCategory,
      subject: subject || null,
      message: message.trim().slice(0, 2000),
      email: email || '(not provided)',
      name: name || '(not provided)',
      page: page || '(unknown)',
      timestamp: timestamp || new Date().toISOString(),
    };

    // Structured log for server monitoring / log aggregation
    console.log('[FEEDBACK]', JSON.stringify(feedbackEntry));

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

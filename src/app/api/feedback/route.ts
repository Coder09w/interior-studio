import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/feedback
 * Receives user feedback during beta (bug reports, feature requests, general, contact).
 * Validates and stores feedback in the database.
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

    // Store feedback in the database
    await db.feedback.create({
      data: {
        category: validCategory,
        subject: subject || null,
        message: message.trim().slice(0, 2000),
        email: email || null,
        name: name || null,
        page: page || null,
      },
    });

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

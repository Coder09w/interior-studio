import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60s for AI rendering
export const dynamic = 'force-dynamic';

// Config — env vars take priority (for Vercel), then hardcoded fallbacks (preview server)
const CONFIG = {
  baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
  apiKey: process.env.ZAI_API_KEY || 'Z.ai',
  chatId: process.env.ZAI_CHAT_ID || 'chat-35deae8a-4b35-4721-b3e0-c275d64dc879',
  userId: process.env.ZAI_USER_ID || '8f0db4c6-71f2-4b99-aca5-72eb123618e6',
  token: process.env.ZAI_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGYwZGI0YzYtNzFmMi00Yjk5LWFjYTUtNzJlYjEyMzYxOGU2IiwiY2hhdF9pZCI6ImNoYXQtMzVkZWFlOGEtNGIzNS00NzIxLWIzZTAtYzI3NWQ2NGRjODc5IiwicGxhdGZvcm0iOiJ6YWkifQ.1NcunMXQ-S_5A0Xuwx_tvuis4AfRx_8WIvaYqVHqPGA',
};

/** Check if an error is an infrastructure/sandbox issue (not a code bug) */
function isInfrastructureError(msg: string): boolean {
  return (
    msg.includes('fetch failed') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('sandbox is inactive') ||
    msg.includes('Configuration file not found')
  );
}

/** Build the full architectural rendering prompt */
function buildPrompt(prompt: string, style?: string): string {
  return [
    'Architectural interior rendering, photorealistic, professional photography,',
    '8K ultra detailed, natural lighting, soft shadows, depth of field,',
    'interior design magazine quality, realistic materials and textures,',
    style === 'luxury' ? 'luxury high-end finish, premium furnishings,' : '',
    style === 'cozy' ? 'warm cozy atmosphere, soft ambient lighting,' : '',
    style === 'minimal' ? 'minimalist clean lines, Scandinavian aesthetic,' : '',
    prompt,
    ', realistic rendering, V-Ray quality, architectural visualization',
  ].filter(Boolean).join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const fullPrompt = buildPrompt(prompt, style);
    console.log('[AI Render] Prompt:', fullPrompt.substring(0, 200));

    // Call the z-ai image generation API
    const url = `${CONFIG.baseUrl}/images/generations`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'X-Z-AI-From': 'Z',
    };
    if (CONFIG.chatId) headers['X-Chat-Id'] = CONFIG.chatId;
    if (CONFIG.userId) headers['X-User-Id'] = CONFIG.userId;
    if (CONFIG.token) headers['X-Token'] = CONFIG.token;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: fullPrompt, size: '1024x1024' }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('[AI Render] API error:', apiResponse.status, errorBody.substring(0, 300));

      // Sandbox/inactive — infrastructure issue, not a code bug
      if (errorBody.includes('sandbox is inactive')) {
        return NextResponse.json(
          {
            error: 'The AI design sandbox is currently asleep. Please refresh or try again in a moment.',
            isSandboxSleeping: true,
            isUnavailable: true,
          },
          { status: 503 }
        );
      }

      throw new Error(`Image API returned ${apiResponse.status}: ${errorBody.substring(0, 200)}`);
    }

    const result = await apiResponse.json();

    if (!result.data || result.data.length === 0) {
      throw new Error('No image data returned from AI');
    }

    // Return the image URL directly — no server-side base64 (causes OOM with large images)
    const imageUrl = result.data[0]?.url || null;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: fullPrompt,
    });
  } catch (error: any) {
    console.error('[AI Render] Error:', error?.message || error);
    const msg = error?.message || '';

    if (isInfrastructureError(msg)) {
      return NextResponse.json(
        {
          error: 'The AI design sandbox is currently asleep. Please refresh or try again in a moment.',
          isSandboxSleeping: true,
          isUnavailable: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: msg || 'AI rendering failed', isUnavailable: false },
      { status: 500 }
    );
  }
}

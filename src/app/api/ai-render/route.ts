import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60s for AI rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build a detailed architectural rendering prompt
    const fullPrompt = [
      'Architectural interior rendering, photorealistic, professional photography,',
      '8K ultra detailed, natural lighting, soft shadows, depth of field,',
      'interior design magazine quality, realistic materials and textures,',
      style === 'luxury' ? 'luxury high-end finish, premium furnishings,' : '',
      style === 'cozy' ? 'warm cozy atmosphere, soft ambient lighting,' : '',
      style === 'minimal' ? 'minimalist clean lines, Scandinavian aesthetic,' : '',
      prompt,
      ', realistic rendering, V-Ray quality, architectural visualization',
    ].filter(Boolean).join(' ');

    console.log('[AI Render] Generating with prompt:', fullPrompt.substring(0, 200));

    // Use the z-ai-web-dev-sdk which reads .z-ai-config from the filesystem.
    // Works when running on the Z.ai platform (has .z-ai-config).
    // On Vercel serverless, the config file doesn't exist — handled below.
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: fullPrompt,
      size: '1344x768',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from AI');
    }

    const imageData = response.data[0];

    return NextResponse.json({
      success: true,
      image: imageData.base64 ? `data:image/png;base64,${imageData.base64}` : null,
      prompt: fullPrompt,
    });
  } catch (error: any) {
    console.error('[AI Render] Error:', error?.message || error);

    const msg = error?.message || '';
    const isConfigError = msg.includes('Configuration file not found') || msg.includes('.z-ai-config');
    const isNetworkError = msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND');

    if (isConfigError || isNetworkError) {
      // These are infrastructure issues, not user errors — return structured info
      return NextResponse.json(
        {
          error: 'AI Render requires the live preview environment.',
          hint: 'Use the preview link to access the full-featured editor with AI rendering.',
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

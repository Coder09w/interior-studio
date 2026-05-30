import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const maxDuration = 60; // Allow up to 60s for AI rendering

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

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

    // Generate the photorealistic render using the SDK
    const response = await zai.images.generations.create({
      prompt: fullPrompt,
      size: '1344x768', // Wide aspect ratio for room renders
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from AI');
    }

    const imageData = response.data[0];

    // Return base64 image data
    return NextResponse.json({
      success: true,
      image: imageData.base64 ? `data:image/png;base64,${imageData.base64}` : null,
      prompt: fullPrompt,
    });
  } catch (error: any) {
    console.error('[AI Render] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'AI rendering failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60s for AI rendering

// Read Z-AI config from environment variables (set in Vercel dashboard)
// Falls back to .z-ai-config file values for local dev
function getConfig() {
  return {
    baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
    apiKey: process.env.ZAI_API_KEY || 'Z.ai',
    chatId: process.env.ZAI_CHAT_ID || '',
    userId: process.env.ZAI_USER_ID || '',
    token: process.env.ZAI_TOKEN || '',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const config = getConfig();

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

    // Call the image generation API directly (bypassing SDK to avoid .z-ai-config file dependency)
    const url = `${config.baseUrl}/images/generations`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Z-AI-From': 'Z',
    };
    if (config.chatId) headers['X-Chat-Id'] = config.chatId;
    if (config.userId) headers['X-User-Id'] = config.userId;
    if (config.token) headers['X-Token'] = config.token;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: fullPrompt,
        size: '1344x768',
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error('[AI Render] API error:', apiResponse.status, errorBody);
      throw new Error(`Image API returned ${apiResponse.status}: ${errorBody}`);
    }

    const result = await apiResponse.json();

    if (!result.data || result.data.length === 0) {
      throw new Error('No image data returned from AI');
    }

    // Process: if the API returns URLs, download and convert to base64
    const processedData = await Promise.all(
      result.data.map(async (item: { url?: string; base64?: string }) => {
        if (item.base64) {
          return { base64: item.base64 };
        }
        if (item.url) {
          const imgResponse = await fetch(item.url);
          if (!imgResponse.ok) throw new Error(`Failed to download image: ${imgResponse.status}`);
          const arrayBuffer = await imgResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return { base64 };
        }
        return item;
      })
    );

    return NextResponse.json({
      success: true,
      image: processedData[0]?.base64 ? `data:image/png;base64,${processedData[0].base64}` : null,
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

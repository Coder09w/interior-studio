import { NextRequest, NextResponse } from 'next/server';
import { ROOM_IMAGES, POST_TYPES, TONES, PostType, Tone } from '@/lib/hail-mary-images';
import { generateFromTemplate } from '@/lib/hail-mary-templates';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Z.AI config — same pattern as /api/ai-render
const CONFIG = {
  baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
  apiKey: process.env.ZAI_API_KEY || 'Z.ai',
  chatId: process.env.ZAI_CHAT_ID || 'chat-35deae8a-4b35-4721-b3e0-c275d64dc879',
  userId: process.env.ZAI_USER_ID || '8f0db4c6-71f2-4b99-aca5-72eb123618e6',
  token: process.env.ZAI_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOGYwZGI0YzYtNzFmMi00Yjk5LWFjYTUtNzJlYjEyMzYxOGU2IiwiY2hhdF9pZCI6ImNoYXQtMzVkZWFlOGEtNGIzNS00NzIxLWIzZTAtYzI3NWQ2NGRjODc5IiwicGxhdGZvcm0iOiJ6YWkifQ.1NcunMXQ-S_5A0Xuwx_tvuis4AfRx_8WIvaYqVHqPGA',
};

interface GenerateRequest {
  imageSrc: string;
  postType: PostType;
  tone: Tone;
}

/**
 * Find the room image metadata by src.
 */
function findImage(src: string) {
  return ROOM_IMAGES.find((img) => img.src === src) || ROOM_IMAGES[0];
}

/**
 * Build the system prompt for Z.AI based on post type.
 */
function buildSystemPrompt(postType: PostType, tone: Tone): string {
  const base = `You are an expert Instagram social media manager for Instod, a browser-native 3D interior design studio. You write engaging, authentic captions that drive saves and shares. Tone: ${tone}.`;

  switch (postType) {
    case 'showcase':
      return `${base} Write captions that showcase a beautiful room design. Hook in the first line (stop the scroll), brief context, then a soft CTA pointing to instod.vercel.app. Max 150 words.`;
    case 'educational':
      return `${base} Write educational captions that teach a specific design principle. Format: tip title, actionable advice, then CTA to try the tip in Instod. Max 150 words.`;
    case 'engagement':
      return `${base} Write engagement-bait captions that ask a clear question and invite comments. Keep it under 80 words. End with the question.`;
    case 'behind-the-scenes':
      return `${base} Write behind-the-scenes captions that reveal how Instod works or how a design was made. List format works well. Max 150 words.`;
    case 'reel-script':
      return `${base} Generate a 15-second Instagram Reel script. Output JSON with: hook (1 line), 4 shots (each with duration, visual, voiceover, textOverlay), music suggestion, and a caption with hashtags.`;
    default:
      return base;
  }
}

/**
 * Call Z.AI chat completions API.
 * Returns null if the API is unavailable (caller falls back to templates).
 */
async function callZAIChat(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    const url = `${CONFIG.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'X-Z-AI-From': 'Z',
    };
    if (CONFIG.chatId) headers['X-Chat-Id'] = CONFIG.chatId;
    if (CONFIG.userId) headers['X-User-Id'] = CONFIG.userId;
    if (CONFIG.token) headers['X-Token'] = CONFIG.token;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.warn('[Hail Mary] Z.AI chat API returned', response.status);
      return null;
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    return content || null;
  } catch (err) {
    console.warn('[Hail Mary] Z.AI chat API error:', err);
    return null;
  }
}

/**
 * Parse AI response into structured content.
 * If parsing fails, return null (caller falls back to templates).
 */
function parseAIResponse(content: string, postType: PostType): { captions: string[]; hashtags: string[]; reelScript?: any } | null {
  try {
    if (postType === 'reel-script') {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.shots && parsed.hook) {
          return {
            captions: [parsed.caption || ''],
            hashtags: extractHashtags(content),
            reelScript: parsed,
          };
        }
      }
      return null;
    }

    // For text posts: split by "---" or numbered list to get 3 variants
    const variants = content.split(/\n---\n|\n\d+\.\s/).filter((s) => s.trim().length > 20);
    const captions = variants.length >= 2 ? variants.slice(0, 3) : [content];
    const hashtags = extractHashtags(content);

    return { captions, hashtags };
  } catch {
    return null;
  }
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w]+/g) || [];
  return [...new Set(matches)].slice(0, 25);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateRequest;
    const { imageSrc, postType, tone } = body;

    // Validate post type
    if (!POST_TYPES.find((p) => p.value === postType)) {
      return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
    }
    if (!TONES.find((t) => t.value === tone)) {
      return NextResponse.json({ error: 'Invalid tone' }, { status: 400 });
    }

    const image = findImage(imageSrc);
    const systemPrompt = buildSystemPrompt(postType, tone);
    const userPrompt = `Room: ${image.label}\nMood: ${image.mood}\nDescription: ${image.description}\n\nGenerate ${postType === 'reel-script' ? 'a reel script' : '3 caption variants'} for an Instagram post about this ${image.roomType} design. ${postType === 'reel-script' ? 'Return valid JSON only.' : 'Separate variants with "---" on its own line. Include 15-20 hashtags at the end.'}`;

    // Try Z.AI first
    const aiContent = await callZAIChat(systemPrompt, userPrompt);

    if (aiContent) {
      const parsed = parseAIResponse(aiContent, postType);
      if (parsed && parsed.captions.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'ai',
          ...parsed,
          image: { src: image.src, label: image.label, roomType: image.roomType },
        });
      }
    }

    // Fallback to templates
    const templateContent = generateFromTemplate({ image, postType, tone });
    return NextResponse.json({
      success: true,
      source: 'template',
      ...templateContent,
      image: { src: image.src, label: image.label, roomType: image.roomType },
    });
  } catch (error: any) {
    console.error('[Hail Mary] Generate error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

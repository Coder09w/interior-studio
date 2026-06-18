import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/editor-crash
 *
 * Receives structured crash reports from `EditorErrorBoundary` (and from the
 * global window.error / unhandledrejection listeners in InteriorStudio).
 *
 * We deliberately do NOT write to the database here — crash reports are noisy
 * and high-volume. Instead we emit a single structured `console.error` line
 * that Vercel's log drain captures, so we can search & filter them in the
 * Vercel dashboard. The endpoint always returns 200 so the client doesn't
 * surface a secondary "report failed" error on top of the original crash.
 *
 * The response includes a short `reportId` (echoed from the client, or
 * generated here as a fallback) so the user can reference it when contacting us.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CrashPayload {
  reportId?: string | null;
  timestamp?: string;
  url?: string;
  userAgent?: string;
  viewport?: { w?: number; h?: number; dpr?: number };
  webgl?: { supported?: boolean; version?: string; vendor?: string; renderer?: string } | null;
  memory?: { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number };
  online?: boolean;
  referrer?: string;
  error?: { name?: string; message?: string; stack?: string } | null;
  componentStack?: string | null;
  source?: string; // 'error-boundary' | 'window-error' | 'unhandledrejection'
  manual?: boolean;
}

function safeStr(v: unknown, max = 4000): string {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  return s.length > max ? s.slice(0, max) + '…[truncated]' : s;
}

export async function POST(request: NextRequest) {
  let payload: CrashPayload = {};
  try {
    payload = (await request.json()) as CrashPayload;
  } catch {
    // Malformed body — still 200 so client doesn't error twice
    return NextResponse.json({ success: false, reportId: null }, { status: 200 });
  }

  const reportId = payload.reportId || `crash_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Single structured line — easy to grep in Vercel logs
  const summary = {
    tag: 'EDITOR_CRASH',
    reportId,
    source: payload.source || 'error-boundary',
    manual: Boolean(payload.manual),
    ts: payload.timestamp || new Date().toISOString(),
    url: safeStr(payload.url, 500),
    online: payload.online,
    ua: safeStr(payload.userAgent, 600),
    viewport: payload.viewport,
    webgl: payload.webgl
      ? {
          supported: payload.webgl.supported,
          version: payload.webgl.version,
          vendor: safeStr(payload.webgl.vendor, 200),
          renderer: safeStr(payload.webgl.renderer, 300),
        }
      : null,
    mem: payload.memory
      ? {
          usedMB: payload.memory.usedJSHeapSize ? +(payload.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : null,
          totalMB: payload.memory.totalJSHeapSize ? +(payload.memory.totalJSHeapSize / 1024 / 1024).toFixed(1) : null,
          limitMB: payload.memory.jsHeapSizeLimit ? +(payload.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) : null,
        }
      : null,
    errName: payload.error?.name || '',
    errMsg: safeStr(payload.error?.message, 1000),
    errStack: safeStr(payload.error?.stack, 3000),
    componentStack: safeStr(payload.componentStack, 2000),
  };

  // Vercel captures console.error output. Use a single-line JSON so it's one log entry.
  console.error(JSON.stringify(summary));

  return NextResponse.json({ success: true, reportId }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/editor-crash', method: 'POST' });
}

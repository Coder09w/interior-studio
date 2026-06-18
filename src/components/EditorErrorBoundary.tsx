'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Home, Copy, Check, Send } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  reportId: string | null;
  reportSent: boolean;
  copied: boolean;
  diagnostics: CrashDiagnostics | null;
}

/* ─── Crash diagnostics ─── */
interface CrashDiagnostics {
  timestamp: string;
  url: string;
  userAgent: string;
  viewport: { w: number; h: number; dpr: number };
  webgl: { supported: boolean; version: string; vendor: string; renderer: string } | null;
  memory?: { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number };
  online: boolean;
  referrer: string;
}

function gatherDiagnostics(): CrashDiagnostics {
  const diag: CrashDiagnostics = {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    viewport:
      typeof window !== 'undefined'
        ? { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }
        : { w: 0, h: 0, dpr: 0 },
    webgl: null,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  };

  // Probe WebGL vendor + renderer (this is what actually tells us "graphics driver issue")
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      diag.webgl = {
        supported: true,
        version: gl instanceof WebGL2RenderingContext ? 'WebGL 2' : 'WebGL 1',
        vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      };
    } else {
      diag.webgl = { supported: false, version: 'none', vendor: '', renderer: '' };
    }
  } catch {
    diag.webgl = { supported: false, version: 'probe-failed', vendor: '', renderer: '' };
  }

  // Chrome exposes performance.memory
  try {
    const m = (performance as unknown as { memory?: PerformanceMemory }).memory;
    if (m) {
      diag.memory = {
        jsHeapSizeLimit: m.jsHeapSizeLimit,
        totalJSHeapSize: m.totalJSHeapSize,
        usedJSHeapSize: m.usedJSHeapSize,
      };
    }
  } catch {}

  return diag;
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/* ─── Classify the error so we can show a tailored message ─── */
function classifyError(err: Error | null): { kind: string; hint: string } {
  if (!err) return { kind: 'unknown', hint: '' };
  const msg = `${err.name} ${err.message}`.toLowerCase();
  const stack = err.stack?.toLowerCase() || '';

  if (msg.includes('webgl') || msg.includes('context') && msg.includes('lost')) {
    return { kind: 'webgl-context', hint: 'The graphics context was lost (common on mobile when GPU memory is pressured). Reload usually fixes it.' };
  }
  if (msg.includes('shader') || stack.includes('shader')) {
    return { kind: 'shader', hint: 'A 3D shader failed to compile on this device\'s GPU. Often a driver bug.' };
  }
  if (msg.includes('out of memory') || msg.includes('oom') || msg.includes('memory')) {
    return { kind: 'oom', hint: 'The device ran out of GPU or JS memory. Reloading frees it.' };
  }
  if (msg.includes('texture') || stack.includes('texture')) {
    return { kind: 'texture', hint: 'A texture failed to load or upload to the GPU.' };
  }
  if (msg.includes('geometry') || stack.includes('buffergeometry')) {
    return { kind: 'geometry', hint: 'A 3D mesh had invalid geometry data.' };
  }
  if (msg.includes('null') || msg.includes('undefined')) {
    return { kind: 'null-ref', hint: 'A value that was expected to exist was missing. This is a code bug we can fix if you send the report.' };
  }
  return { kind: 'unknown', hint: '' };
}

function buildReportText(error: Error | null, componentStack: string | null, diag: CrashDiagnostics | null, reportId: string | null): string {
  const lines: string[] = [];
  lines.push('=== INSTOD EDITOR CRASH REPORT ===');
  if (reportId) lines.push(`Report ID: ${reportId}`);
  if (diag) {
    lines.push(`Time: ${diag.timestamp}`);
    lines.push(`URL: ${diag.url}`);
    lines.push(`Online: ${diag.online}`);
    lines.push(`Referrer: ${diag.referrer}`);
    lines.push(`Viewport: ${diag.viewport.w}x${diag.viewport.h} @ ${diag.viewport.dpr}x dpr`);
    lines.push(`UA: ${diag.userAgent}`);
    if (diag.webgl) {
      lines.push(`WebGL: ${diag.webgl.version} | supported=${diag.webgl.supported}`);
      lines.push(`GPU vendor: ${diag.webgl.vendor}`);
      lines.push(`GPU renderer: ${diag.webgl.renderer}`);
    }
    if (diag.memory) {
      const fmt = (b?: number) => (b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '?');
      lines.push(`JS heap: used=${fmt(diag.memory.usedJSHeapSize)} / total=${fmt(diag.memory.totalJSHeapSize)} / limit=${fmt(diag.memory.jsHeapSizeLimit)}`);
    }
  }
  lines.push('');
  lines.push('--- ERROR ---');
  if (error) {
    lines.push(`Name: ${error.name}`);
    lines.push(`Message: ${error.message}`);
    lines.push(`Stack:`);
    lines.push(error.stack || '(no stack)');
  } else {
    lines.push('(no error object)');
  }
  if (componentStack) {
    lines.push('');
    lines.push('--- REACT COMPONENT STACK ---');
    lines.push(componentStack);
  }
  lines.push('');
  lines.push('=== END ===');
  return lines.join('\n');
}

async function sendReport(payload: unknown): Promise<string | null> {
  try {
    const res = await fetch('/api/editor-crash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // ensure it fires even if the user navigates away
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.reportId || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default class EditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null, reportId: null, reportSent: false, copied: false, diagnostics: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const diagnostics = gatherDiagnostics();
    const reportId = `crash_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    this.setState({ componentStack: errorInfo.componentStack ?? null, diagnostics, reportId });

    console.error('[EditorErrorBoundary] Three.js crash caught:', error, errorInfo);
    console.error('[EditorErrorBoundary] Diagnostics:', diagnostics);

    // Fire-and-forget auto-send so we get the report even if the user just hits Reload
    sendReport({
      reportId,
      timestamp: diagnostics.timestamp,
      url: diagnostics.url,
      userAgent: diagnostics.userAgent,
      viewport: diagnostics.viewport,
      webgl: diagnostics.webgl,
      memory: diagnostics.memory,
      online: diagnostics.online,
      referrer: diagnostics.referrer,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack ?? null,
    }).then((id) => {
      if (id) this.setState({ reportSent: true });
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, componentStack: null, reportId: null, reportSent: false, copied: false, diagnostics: null });
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('instod_rooms');
      localStorage.removeItem('instod_room_states');
    } catch {}
    this.setState({ hasError: false, error: null, componentStack: null, reportId: null, reportSent: false, copied: false, diagnostics: null });
    window.location.reload();
  };

  handleCopy = async () => {
    const text = buildReportText(this.state.error, this.state.componentStack, this.state.diagnostics, this.state.reportId);
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Fallback: open a new window with the text
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<pre style="font:12px monospace;white-space:pre-wrap;">${text.replace(/</g, '&lt;')}</pre>`);
      }
    }
  };

  handleSend = async () => {
    const id = await sendReport({
      reportId: this.state.reportId,
      timestamp: this.state.diagnostics?.timestamp,
      url: this.state.diagnostics?.url,
      userAgent: this.state.diagnostics?.userAgent,
      viewport: this.state.diagnostics?.viewport,
      webgl: this.state.diagnostics?.webgl,
      memory: this.state.diagnostics?.memory,
      error: this.state.error
        ? { name: this.state.error.name, message: this.state.error.message, stack: this.state.error.stack }
        : null,
      componentStack: this.state.componentStack,
      manual: true,
    });
    if (id) {
      this.setState({ reportSent: true, reportId: id });
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, componentStack, diagnostics, reportId, reportSent, copied } = this.state;
    const cls = classifyError(error);
    const reportText = buildReportText(error, componentStack, diagnostics, reportId);

    return (
      <div className="w-full h-full flex items-center justify-center overflow-y-auto" style={{ background: '#1A1612' }}>
        <div className="max-w-md w-full mx-4 my-6 p-6 sm:p-8 rounded-2xl text-left" style={{ background: '#F5F0E8', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
            <AlertTriangle className="w-7 h-7" style={{ color: '#DC2626' }} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-4 text-center" style={{ color: '#5A4E42' }}>
            The 3D editor hit an unexpected error. Your work has been auto-saved. Try reloading — or send us the error report below so we can fix the root cause.
          </p>

          {/* Tailored hint */}
          {cls.hint && (
            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: '#FAF6EE', border: '1px solid #E8DFD4', color: '#5A4E42' }}>
              <strong style={{ color: '#7A4E22' }}>Likely cause: </strong>
              {cls.hint}
            </div>
          )}

          {/* Report status */}
          {reportSent && (
            <div className="mb-4 p-2.5 rounded-xl text-xs flex items-center gap-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
              <Check className="w-3.5 h-3.5" />
              <span>Error report sent to our team{reportId ? ` (ID: ${reportId.slice(0, 20)})` : ''}.</span>
            </div>
          )}

          {/* Error details (collapsible, expanded by default on mobile so the friend can paste back) */}
          <details className="mb-4" open>
            <summary className="text-xs font-semibold cursor-pointer select-none" style={{ color: '#5A4E42' }}>
              Technical details (tap to copy &amp; send to us)
            </summary>
            <pre
              className="mt-2 p-3 rounded-lg text-[10px] leading-tight overflow-auto max-h-44 whitespace-pre-wrap break-all"
              style={{ background: '#FAF8F4', color: '#3A3027', border: '1px solid #E2DDD4', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            >
              {reportText}
            </pre>
          </details>

          {/* Copy + Send buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={this.handleCopy}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border transition-all hover:opacity-90"
              style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FFFFFF' }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy report'}
            </button>
            <button
              onClick={this.handleSend}
              disabled={reportSent}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', color: '#fff' }}
            >
              <Send className="w-3.5 h-3.5" />
              {reportSent ? 'Sent' : 'Send to team'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer border transition-all hover:opacity-90"
              style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FFFFFF' }}
            >
              <RotateCcw className="w-4 h-4" />
              Reload Editor
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', color: '#fff' }}
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Reset data option */}
          <button
            onClick={this.handleReset}
            className="mt-4 text-xs underline cursor-pointer mx-auto block"
            style={{ color: '#5A4E42' }}
          >
            Clear saved data &amp; reload
          </button>
        </div>
      </div>
    );
  }
}

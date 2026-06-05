'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EditorLoader from '@/components/EditorLoader';

/* ─── WebGL Detection ─── */
function checkWebGL(): { supported: boolean; version: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      return { supported: true, version: gl instanceof WebGL2RenderingContext ? 'WebGL 2' : 'WebGL 1' };
    }
  } catch {
    // WebGL not available
  }
  return { supported: false, version: 'none' };
}

/* ─── WebGL Not Supported Screen ─── */
function WebGLUnsupported() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="text-center max-w-md w-full px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#E8D5C4' }}>
          <svg className="w-8 h-8" style={{ color: '#C17F4E' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          3D Editor Not Available
        </h2>
        <p className="text-sm mt-3" style={{ color: '#5A4E42' }}>
          Your browser or device does not support WebGL, which is required for the 3D room editor. This could be because:
        </p>
        <ul className="text-sm mt-3 space-y-1.5 text-left max-w-xs mx-auto" style={{ color: '#5A4E42' }}>
          <li className="flex items-start gap-2">
            <span style={{ color: '#C17F4E' }}>•</span>
            WebGL is disabled in your browser settings
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#C17F4E' }}>•</span>
            Your graphics drivers need updating
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#C17F4E' }}>•</span>
            You are using an older browser that does not support WebGL
          </li>
        </ul>

        <div className="mt-6 p-4 rounded-xl text-left" style={{ background: 'rgba(193,127,78,0.08)', border: '1px solid rgba(193,127,78,0.15)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#C17F4E' }}>How to fix this:</p>
          <ul className="text-xs space-y-1" style={{ color: '#5A4E42' }}>
            <li>1. Update to the latest version of Chrome, Firefox, Safari, or Edge</li>
            <li>2. Enable hardware acceleration in your browser settings</li>
            <li>3. Update your graphics card drivers</li>
            <li>4. Try disabling browser extensions that may block WebGL</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => <EditorLoader />,
});

export default function EditorPage() {
  const [webglStatus, setWebglStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking');
  const searchParams = useSearchParams();
  const roomType = searchParams.get('room');

  useEffect(() => {
    const { supported } = checkWebGL();
    setWebglStatus(supported ? 'supported' : 'unsupported');
  }, []);

  if (webglStatus === 'checking') return <EditorLoader />;
  if (webglStatus === 'unsupported') return <WebGLUnsupported />;
  return <InteriorStudio initialRoomType={roomType || undefined} />;
}

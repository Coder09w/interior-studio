'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

function EditorLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing 3D Engine...');

  useEffect(() => {
    // Simulate progress stages while the actual component loads
    const stages = [
      { at: 10, text: 'Loading 3D Engine...' },
      { at: 30, text: 'Setting up WebGL renderer...' },
      { at: 50, text: 'Preparing furniture library...' },
      { at: 70, text: 'Loading materials & textures...' },
      { at: 85, text: 'Building room environment...' },
      { at: 95, text: 'Almost ready...' },
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      if (current > 95) current = 95;
      setProgress(Math.round(current));

      const stage = [...stages].reverse().find(s => current >= s.at);
      if (stage) setStatusText(stage.text);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
      <div className="text-center max-w-sm w-full px-6">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
            <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        </div>

        <h2 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Interior Studio
        </h2>

        {/* Progress bar */}
        <div className="mt-5 mb-3 w-full h-2 rounded-full overflow-hidden" style={{ background: '#E2DDD4' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C17F4E, #D4A76A)',
            }}
          />
        </div>

        <p className="text-sm font-medium" style={{ color: '#8A8478' }}>
          {statusText}
        </p>
        <p className="text-xs mt-2" style={{ color: '#B8A898' }}>
          {progress}%
        </p>

        {/* Helpful tip */}
        <div className="mt-6 p-3 rounded-xl text-left" style={{ background: 'rgba(193,127,78,0.06)', borderColor: 'rgba(193,127,78,0.15)', border: '1px solid rgba(193,127,78,0.15)' }}>
          <p className="text-xs" style={{ color: '#8A8478' }}>
            <span className="font-semibold" style={{ color: '#C17F4E' }}>💡 Tip:</span> Use Orbit controls to rotate the view — click &amp; drag to orbit, scroll to zoom, and right-click to pan.
          </p>
        </div>

        {/* Fallback message */}
        <p className="text-[10px] mt-6" style={{ color: '#B8A898' }}>
          Taking too long? Make sure WebGL is enabled in your browser.
        </p>
      </div>
    </div>
  );
}

const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => <EditorLoadingScreen />,
});

export default function EditorPage() {
  return <InteriorStudio />;
}

'use client';

import dynamic from 'next/dynamic';

const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#C17F4E' }}>
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Interior Studio</h2>
        <p className="text-sm mt-1" style={{ color: '#8A8478' }}>Loading 3D Engine...</p>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  return <InteriorStudio />;
}

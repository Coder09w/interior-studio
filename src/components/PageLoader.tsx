'use client';

import { useMemo } from 'react';

/* ===== BRANDED PAGE LOADER (lighter than EditorLoader) ===== */
/* Used for dashboard, profile, view pages — shows brand identity while loading */

/* Letter-by-letter animated text */
function AnimatedBrand({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: 'inline-block' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="loader-letter"
          style={{
            animationDelay: `${delay + i * 0.05}s`,
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/* Floating particles (fewer than editor loader) */
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      top: `${25 + Math.random() * 50}%`,
      delay: `${i * 0.5}s`,
      duration: `${3 + Math.random() * 2}s`,
      px: `${(Math.random() - 0.5) * 40}px`,
      size: `${2 + Math.random() * 3}px`,
    })),
  []);

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="loader-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            '--px': p.px,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

export default function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D8 50%, #F0E8DC 100%)',
      }}
    >
      <Particles />

      <div className="text-center relative z-10">
        {/* Logo with glow */}
        <div
          className="loader-glow mx-auto mb-5"
          style={{
            width: '64px', height: '64px',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #C17F4E, #A86A3D)',
          }}
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
            <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        </div>

        {/* Brand name */}
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#2D2D2D',
          marginBottom: '12px',
        }}>
          <AnimatedBrand text="Instod" delay={0.1} />
        </h2>

        {/* Animated dots */}
        <div className="loader-dot-pulse" style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

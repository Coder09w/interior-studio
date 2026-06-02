'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

/* ===== EPIC CINEMATIC LOADER FOR INTERIOR STUDIO ===== */

const STAGES = [
  { at: 5, text: 'Initializing 3D Engine' },
  { at: 15, text: 'Setting up WebGL renderer' },
  { at: 25, text: 'Loading room geometry' },
  { at: 40, text: 'Preparing furniture library' },
  { at: 55, text: 'Loading materials & textures' },
  { at: 70, text: 'Building lighting system' },
  { at: 82, text: 'Rendering environment' },
  { at: 92, text: 'Almost ready' },
  { at: 100, text: 'Ready!' },
];

const TIPS = [
  'Click & drag to orbit the 3D view',
  'Scroll to zoom in and out',
  'Right-click & drag to pan around',
  'Double-click furniture to select it',
  'Use the skin system to change room aesthetics',
  'Switch lighting moods for different atmospheres',
  'Add ceiling lights in the lighting panel',
];

/* Isometric CSS Room that builds itself */
function IsometricRoom({ progress }: { progress: number }) {
  const furnitureVisible = progress > 40;
  const lightVisible = progress > 60;

  return (
    <div className="loader-iso-room" style={{ margin: '0 auto' }}>
      {/* Floor */}
      <div className="loader-iso-floor" />

      {/* Left wall */}
      <div className="loader-iso-wall-left" />

      {/* Back wall */}
      <div className="loader-iso-wall-back">
        {/* Window on back wall */}
        {progress > 30 && (
          <div style={{
            position: 'absolute', top: '25%', left: '30%',
            width: '40%', height: '50%',
            background: 'linear-gradient(180deg, #E8F0F8, #C8D8E8)',
            border: '2px solid #B8A898',
            opacity: progress > 30 ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }} />
        )}
      </div>

      {/* Right wall */}
      <div className="loader-iso-wall-right" />

      {/* Furniture - sofa silhouette */}
      {furnitureVisible && (
        <div className="loader-iso-furniture" style={{ animationDelay: '0.8s' }}>
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
            <rect x="5" y="10" width="50" height="15" rx="3" fill="#8B7355" />
            <rect x="5" y="5" width="50" height="8" rx="3" fill="#7A6348" />
            <rect x="8" y="12" width="20" height="10" rx="2" fill="#9B8365" />
            <rect x="32" y="12" width="20" height="10" rx="2" fill="#9B8365" />
            <rect x="8" y="25" width="3" height="4" rx="1" fill="#5C4033" />
            <rect x="49" y="25" width="3" height="4" rx="1" fill="#5C4033" />
          </svg>
        </div>
      )}

      {/* Side table */}
      {furnitureVisible && (
        <div style={{
          position: 'absolute', bottom: '20%', right: '20%',
          animation: 'loaderFurnitureSlide 0.5s ease forwards',
          animationDelay: '1s',
          opacity: 0,
        }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <rect x="2" y="0" width="14" height="3" rx="1" fill="#A08060" />
            <rect x="4" y="3" width="2" height="16" fill="#8B7355" />
            <rect x="12" y="3" width="2" height="16" fill="#8B7355" />
          </svg>
        </div>
      )}

      {/* Ceiling light glow */}
      {lightVisible && (
        <>
          <div className="loader-iso-light" style={{ opacity: undefined }} />
          <div className="loader-iso-light-beam" style={{ opacity: undefined }} />
        </>
      )}
    </div>
  );
}

/* Floating particles */
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${30 + Math.random() * 50}%`,
      delay: `${i * 0.4}s`,
      duration: `${2.5 + Math.random() * 2}s`,
      px: `${(Math.random() - 0.5) * 60}px`,
      size: `${3 + Math.random() * 4}px`,
      opacity: 0.3 + Math.random() * 0.4,
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
            opacity: p.opacity,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/* Letter-by-letter animated text */
function AnimatedTitle({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: 'inline-block' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="loader-letter"
          style={{
            animationDelay: `${delay + i * 0.06}s`,
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

/* Main Loader Component */
export default function EditorLoader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STAGES[0].text);
  const [tipIndex, setTipIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Slower, steadier progress — smaller increments, longer interval
      // Speed slows down as we approach completion (easing)
      const remaining = 100 - current;
      const increment = Math.max(0.5, (remaining * 0.08) + (Math.random() * 1.5));
      current = Math.min(current + increment, 100);
      setProgress(Math.round(current));

      const stage = [...STAGES].reverse().find(s => current >= s.at);
      if (stage) setStatusText(stage.text);

      // When we reach 100%, mark complete and pause before allowing transition
      if (current >= 100) {
        setProgress(100);
        setStatusText('Ready!');
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 500); // Slower interval: 500ms (was 350ms)

    return () => clearInterval(interval);
  }, []);

  // Rotate tips every 4 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div
      className="flex items-center justify-center h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D8 50%, #F0E8DC 100%)',
        transition: 'opacity 0.6s ease-out',
        opacity: isComplete ? 0.7 : 1,
      }}
    >
      {/* Background floating particles */}
      <Particles />

      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(193,127,78,0.04) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(193,127,78,0.03) 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div className="text-center w-full max-w-lg px-6 relative z-10">
        {/* Isometric animated room */}
        <div className="loader-room-container loader-glow mx-auto mb-6"
          style={{
            width: '220px', height: '180px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(193,127,78,0.12)',
          }}
        >
          <IsometricRoom progress={progress} />
        </div>

        {/* Brand name with letter-by-letter animation */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2rem',
          fontWeight: 800,
          color: '#2D2D2D',
          letterSpacing: '-0.02em',
          marginBottom: '4px',
        }}>
          <AnimatedTitle text="Interior Studio" delay={0.3} />
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.85rem',
          color: '#5A4E42',
          marginBottom: '28px',
          opacity: 0.8,
        }}>
          3D Room Design Previewer
        </p>

        {/* Progress bar */}
        <div
          className="loader-shimmer-bar"
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '8px',
            background: '#E2DDD4',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '8px',
              width: `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #5A8F4E, #7AB86A, #5A8F4E)' // Green when complete
                : 'linear-gradient(90deg, #C17F4E, #D4A76A, #C17F4E)',
              backgroundSize: '200% 100%',
              transition: 'width 0.5s ease-out, background 0.5s ease',
              position: 'relative',
            }}
          />
        </div>

        {/* Status text with typing dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.85rem',
            fontWeight: isComplete ? 700 : 500,
            color: isComplete ? '#5A8F4E' : '#5A4E42',
            transition: 'color 0.3s ease, font-weight 0.3s ease',
          }}>
            {statusText}
          </p>
          {!isComplete && (
            <div className="loader-dot-pulse">
              <span /><span /><span />
            </div>
          )}
          {isComplete && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5A8F4E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        {/* Percentage */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.75rem',
          color: isComplete ? '#5A8F4E' : '#8B7355',
          fontWeight: 600,
          marginBottom: '24px',
          transition: 'color 0.3s ease',
        }}>
          {progress}%
        </p>

        {/* Tip box — rotating tips */}
        <div style={{
          padding: '14px 18px',
          borderRadius: '16px',
          background: 'rgba(193,127,78,0.06)',
          border: '1px solid rgba(193,127,78,0.12)',
          textAlign: 'left',
          minHeight: '52px',
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: '#5A4E42',
            transition: 'opacity 0.3s ease',
          }}>
            <span style={{
              fontWeight: 700,
              color: '#C17F4E',
              marginRight: '6px',
            }}>Tip:</span>
            {TIPS[tipIndex]}
          </p>
        </div>

        {/* WebGL notice */}
        <p style={{
          fontSize: '0.65rem',
          color: '#8B7355',
          marginTop: '20px',
          opacity: 0.6,
        }}>
          Taking too long? Make sure WebGL is enabled in your browser.
        </p>
      </div>
    </div>
  );
}

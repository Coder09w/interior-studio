'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/* ===== CLASH-OF-CLANS STYLE CINEMATIC LOADER FOR INSTOD ===== */

const STAGES = [
  { pct: 8,  label: 'Initializing engine',      scene: 'Starting up...' },
  { pct: 18, label: 'Setting up WebGL',          scene: 'WebGL ready' },
  { pct: 30, label: 'Loading room geometry',     scene: 'Building walls' },
  { pct: 44, label: 'Preparing furniture',       scene: 'Placing furniture' },
  { pct: 58, label: 'Loading materials',         scene: 'Applying textures' },
  { pct: 72, label: 'Building lighting',         scene: 'Adding lights' },
  { pct: 84, label: 'Rendering environment',     scene: 'Final touches' },
  { pct: 93, label: 'Almost ready',              scene: 'Nearly there...' },
  { pct: 100, label: 'Ready!',                   scene: 'Welcome!' },
];

const TIPS = [
  'Click & drag to orbit the 3D view',
  'Scroll to zoom in and out',
  'Tap furniture to select and move it',
  'Use two fingers to rotate items on mobile',
  'Switch lighting moods for different vibes',
  'Save your design with the button in the top bar',
  'Try the Design Presets for instant room styles',
];

const BRAND = 'Instod';

/* ── Theme tokens ── */
const THEMES = {
  teal: {
    bg: '#0D1B16',
    bgGrad1: 'rgba(15,158,126,.18)',
    bgGrad2: 'rgba(193,127,78,.12)',
    bgGrad3: 'rgba(77,217,184,.07)',
    accent: '#0f9e7e',
    accentLt: '#4dd9b8',
    cardBg: 'linear-gradient(145deg, #1a2e26 0%, #162822 50%, #1e3329 100%)',
    cardBorder: 'rgba(77,217,184,.18)',
    glowCenter: 'rgba(15,158,126,.22)',
    gridLine: 'rgba(77,217,184,.025)',
    particleColor: 'rgba(77,217,184,.6)',
    sceneLabelColor: 'rgba(77,217,184,.5)',
    statusDot: '#4dd9b8',
    textPrimary: '#e8f5f2',
    textSecondary: 'rgba(160,196,186,.8)',
    textMuted: 'rgba(160,196,186,.55)',
    tipStrong: 'rgba(77,217,184,.7)',
    tipBorder: 'rgba(77,217,184,.1)',
    tipBg: 'rgba(255,255,255,.03)',
    barGrad: 'linear-gradient(90deg, #0f9e7e 0%, #4dd9b8 100%)',
    completeGrad: 'linear-gradient(90deg, #2ecc8e, #5ae8b0)',
    completeTip: '#5ae8b0',
    rugColor: 'rgba(15,158,126,.25)',
    rugBorder: 'rgba(15,158,126,.2)',
    rugGrad2: 'rgba(77,217,184,.12)',
    iconGrad: 'linear-gradient(135deg, #0f9e7e 0%, #0d8a6c 100%)',
    iconShadow: 'rgba(15,158,126,.4)',
    iconBorder: 'rgba(77,217,184,.2)',
    barTipShadow: 'rgba(77,217,184,.8)',
    stageDotPassed: '#0f9e7e',
    stageDotGlow: 'rgba(77,217,184,.3)',
    completeGlow: 'rgba(46,204,142,.28)',
  },
  warm: {
    bg: '#1B1410',
    bgGrad1: 'rgba(193,127,78,.18)',
    bgGrad2: 'rgba(139,90,43,.12)',
    bgGrad3: 'rgba(212,167,106,.07)',
    accent: '#C17F4E',
    accentLt: '#D4A76A',
    cardBg: 'linear-gradient(145deg, #2a1f18 0%, #241a12 50%, #2e221a 100%)',
    cardBorder: 'rgba(212,167,106,.18)',
    glowCenter: 'rgba(193,127,78,.22)',
    gridLine: 'rgba(212,167,106,.025)',
    particleColor: 'rgba(212,167,106,.6)',
    sceneLabelColor: 'rgba(212,167,106,.5)',
    statusDot: '#D4A76A',
    textPrimary: '#f5efe4',
    textSecondary: 'rgba(196,176,150,.8)',
    textMuted: 'rgba(196,176,150,.55)',
    tipStrong: 'rgba(212,167,106,.7)',
    tipBorder: 'rgba(212,167,106,.1)',
    tipBg: 'rgba(255,255,255,.03)',
    barGrad: 'linear-gradient(90deg, #C17F4E 0%, #D4A76A 100%)',
    completeGrad: 'linear-gradient(90deg, #8fb85a, #b8d88a)',
    completeTip: '#b8d88a',
    rugColor: 'rgba(193,127,78,.25)',
    rugBorder: 'rgba(193,127,78,.2)',
    rugGrad2: 'rgba(212,167,106,.12)',
    iconGrad: 'linear-gradient(135deg, #C17F4E 0%, #A86A3D 100%)',
    iconShadow: 'rgba(193,127,78,.4)',
    iconBorder: 'rgba(212,167,106,.2)',
    barTipShadow: 'rgba(212,167,106,.8)',
    stageDotPassed: '#C17F4E',
    stageDotGlow: 'rgba(212,167,106,.3)',
    completeGlow: 'rgba(143,184,90,.28)',
  },
} as const;

type ThemeKey = keyof typeof THEMES;

/* ── Isometric CSS Room ── */
type ThemeTokens = typeof THEMES.teal | typeof THEMES.warm;

function IsometricRoom({ progress, theme }: { progress: number; theme: ThemeTokens }) {
  const furnitureVisible = progress > 40;
  const lightVisible = progress > 60;
  const windowVisible = progress > 30;

  return (
    <div className="coc-iso" style={{ perspective: '600px' }}>
      {/* Floor */}
      <div className="coc-iso-floor" />

      {/* Left wall */}
      <div className="coc-iso-wall-l">
        {windowVisible && (
          <div className="coc-iso-window" style={{
            opacity: windowVisible ? undefined : 0,
            animationDelay: '1.4s',
          }} />
        )}
      </div>

      {/* Back wall */}
      <div className="coc-iso-wall-b" />

      {/* Rug */}
      <div className="coc-iso-rug" style={{
        background: `linear-gradient(135deg, ${theme.rugColor} 0%, ${theme.rugGrad2} 100%)`,
        borderColor: theme.rugBorder,
      }} />

      {/* Sofa */}
      {furnitureVisible && (
        <div className="coc-iso-sofa">
          <svg width="72" height="38" viewBox="0 0 72 38" fill="none">
            <rect x="6" y="14" width="60" height="18" rx="4" fill="#8B7355" />
            <rect x="6" y="7"  width="60" height="10" rx="4" fill="#7A6348" />
            <rect x="6" y="16" width="24" height="12" rx="2" fill="#9B8365" />
            <rect x="34" y="16" width="24" height="12" rx="2" fill="#9B8365" />
            <rect x="9"  y="32" width="4" height="5" rx="1.5" fill="#5C4033" />
            <rect x="59" y="32" width="4" height="5" rx="1.5" fill="#5C4033" />
            <rect x="8"  y="16" width="22" height="4" rx="1" fill="rgba(255,255,255,.1)" />
            <rect x="36" y="16" width="22" height="4" rx="1" fill="rgba(255,255,255,.1)" />
          </svg>
        </div>
      )}

      {/* Side table */}
      {furnitureVisible && (
        <div className="coc-iso-table">
          <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
            <rect x="2" y="0" width="16" height="3" rx="1.5" fill="#A08060" />
            <circle cx="10" cy="3" r="3" fill="rgba(255,232,160,.5)" />
            <rect x="5" y="3"  width="2" height="14" fill="#8B7355" />
            <rect x="13" y="3" width="2" height="14" fill="#8B7355" />
            <rect x="3" y="17" width="14" height="2" rx="1" fill="#7A6348" />
          </svg>
        </div>
      )}

      {/* Ceiling light */}
      {lightVisible && (
        <>
          <div className="coc-iso-light-beam" />
          <div className="coc-iso-light" />
        </>
      )}
    </div>
  );
}

/* ── Scene particles ── */
function SceneParticles({ color }: { color: string }) {
  const particles = useMemo(() => [
    { w: 3, h: 3, left: '20%', top: '60%', dur: '4s', delay: '0s' },
    { w: 2, h: 2, left: '70%', top: '75%', dur: '5s', delay: '1s' },
    { w: 4, h: 4, left: '45%', top: '65%', dur: '3.5s', delay: '.5s' },
    { w: 2, h: 2, left: '85%', top: '55%', dur: '6s', delay: '2s' },
    { w: 3, h: 3, left: '30%', top: '80%', dur: '4.5s', delay: '1.5s' },
  ], []);

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="coc-scene-particle"
          style={{
            width: p.w, height: p.h,
            left: p.left, top: p.top,
            animationDuration: p.dur,
            animationDelay: p.delay,
            background: color,
          }}
        />
      ))}
    </>
  );
}

/* ── Animated brand name ── */
function AnimatedBrand({ text, color }: { text: string; color: string }) {
  return (
    <div className="coc-brand-name" style={{ color }}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="coc-letter"
          style={{ animationDelay: `${0.5 + i * 0.07}s` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </div>
  );
}

/* ── Stage dots ── */
function StageDots({ stageIdx, passedColor, glowColor }: { stageIdx: number; passedColor: string; glowColor: string }) {
  return (
    <div className="coc-stage-dots">
      {STAGES.map((_, i) => (
        <div
          key={i}
          className={`coc-stage-dot${i <= stageIdx ? ' passed' : ''}`}
          style={{
            background: i <= stageIdx ? passedColor : 'rgba(255,255,255,.12)',
            transform: i <= stageIdx ? 'scale(1.3)' : undefined,
          }}
        >
          {i <= stageIdx && (
            <span style={{
              position: 'absolute', inset: '-3px',
              borderRadius: '50%',
              background: glowColor,
              animation: 'cocDotGlow 1s ease forwards',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN LOADER COMPONENT
   ════════════════════════════════════════════════ */
export default function EditorLoader() {
  const { status } = useSession();
  const themeKey: ThemeKey = status === 'authenticated' ? 'teal' : 'warm';
  const t = THEMES[themeKey];

  // Progress state
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [statusText, setStatusText] = useState(STAGES[0].label);
  const [sceneText, setSceneText] = useState(STAGES[0].scene);
  const [isComplete, setIsComplete] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Refs for rAF loop
  const currentRef = useRef(0);
  const targetRef = useRef(STAGES[0].pct);
  const stageIdxRef = useRef(0);
  const rafRef = useRef<number>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── FIX #4: Premium loader timing — faster stages, smoother easing, tighter pauses ──
  // Root cause: Stage intervals were too long (400-700ms each), making the loader
  // feel sluggish. Total time was ~4.8s when the scene is often ready in 1.5-2s.
  // Fix: Tighter intervals (250-450ms), reduced hold at 100% (800ms→500ms),
  // faster fade-out trigger (1400ms→600ms after complete).
  useEffect(() => {
    const stageIntervals = [250, 280, 300, 320, 300, 340, 380, 400, 450];
    let idx = 0;

    function advanceStage() {
      if (idx >= STAGES.length - 1) return;
      idx++;
      stageIdxRef.current = idx;
      targetRef.current = STAGES[idx].pct;
      setStageIdx(idx);
      setStatusText(STAGES[idx].label);
      setSceneText(STAGES[idx].scene);

      if (idx < STAGES.length - 1) {
        const timer = setTimeout(advanceStage, stageIntervals[idx] || 300);
        timersRef.current.push(timer);
      } else {
        setIsComplete(true);
        const fadeTimer = setTimeout(() => setIsFadingOut(true), 500);
        timersRef.current.push(fadeTimer);
      }
    }

    const initialTimer = setTimeout(advanceStage, stageIntervals[0] || 250);
    timersRef.current.push(initialTimer);
    
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // ── FIX #4: Smoother fill physics — eased interpolation instead of fixed speed ──
  // Root cause: Fixed speed steps (1.2/0.55/0.25 per frame) felt jumpy and mechanical.
  // Fix: Use exponential ease-out — progress approaches target asymptotically,
  // creating a smooth "settling" feel like premium apps.
  useEffect(() => {
    function tick() {
      const current = currentRef.current;
      const target = targetRef.current;

      if (current < target) {
        const gap = target - current;
        // Exponential ease-out: fast start, smooth deceleration
        const speed = gap > 20 ? gap * 0.12 : gap > 5 ? gap * 0.15 : gap * 0.2;
        currentRef.current = Math.min(current + Math.max(speed, 0.15), target);
        setProgress(currentRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const pctDisplay = Math.floor(progress);

  return (
    <div
      className={`coc-loader${isComplete ? ' complete' : ''}${isFadingOut ? ' fade-out' : ''}`}
      style={{ '--coc-accent': t.accent, '--coc-accent-lt': t.accentLt } as React.CSSProperties}
    >
      {/* ── Background ── */}
      <div className="coc-bg" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%,   ${t.bgGrad1} 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%,  ${t.bgGrad2} 0%, transparent 55%),
          radial-gradient(ellipse 40% 50% at 10% 80%,   ${t.bgGrad3} 0%, transparent 50%),
          linear-gradient(160deg, ${t.bg} 0%, ${t.bg} 45%, ${t.bg} 100%)
        `,
      }} />

      {/* Noise grain */}
      <div className="coc-grain" />

      {/* Grid lines */}
      <div className="coc-grid-bg" style={{
        backgroundImage: `
          linear-gradient(${t.gridLine} 1px, transparent 1px),
          linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)
        `,
      }} />

      {/* ── Scene Card ── */}
      <div className="coc-scene-wrap">
        <div className="coc-scene-glow" style={{
          background: `radial-gradient(ellipse at 50% 60%, ${isComplete ? t.completeGlow : t.glowCenter} 0%, transparent 65%)`,
        }} />
        <div className="coc-scene-card" style={{
          background: t.cardBg,
          borderColor: t.cardBorder,
        }}>
          {/* Corner accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${t.accentLt}50 50%, transparent 100%)`,
          }} />

          {/* Scene particles */}
          <SceneParticles color={t.particleColor} />

          {/* Isometric room */}
          <IsometricRoom progress={progress} theme={t} />

          {/* Scene label */}
          <div className="coc-scene-label" style={{ color: t.sceneLabelColor }}>
            {sceneText}
          </div>
        </div>
      </div>

      {/* ── Brand ── */}
      <div className="coc-brand">
        <div className="coc-brand-icon" style={{
          background: t.iconGrad,
          boxShadow: `0 8px 24px ${t.iconShadow}, 0 0 0 1px ${t.iconBorder}`,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <AnimatedBrand text={BRAND} color={t.textPrimary} />
        <div className="coc-brand-sub" style={{ color: t.textMuted }}>
          3D Room Designer
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="coc-progress-wrap">
        <div className="coc-progress-top">
          <div className="coc-status-text" style={{ color: t.textSecondary }}>
            <div className="coc-status-dot" style={{
              background: isComplete ? t.completeTip : t.statusDot,
              animation: isComplete ? 'none' : undefined,
            }} />
            <span>{statusText}</span>
          </div>
          <div className="coc-pct-text" style={{
            color: isComplete ? t.completeTip : t.accentLt,
          }}>
            {pctDisplay}%
          </div>
        </div>

        <div className="coc-bar-track">
          <div
            className="coc-bar-fill"
            style={{
              width: `${progress}%`,
              background: isComplete ? t.completeGrad : t.barGrad,
            }}
          />
        </div>

        <StageDots
          stageIdx={stageIdx}
          passedColor={t.stageDotPassed}
          glowColor={t.stageDotGlow}
        />
      </div>

      {/* ── Tip ── */}
      <div className="coc-tip-box" style={{
        background: t.tipBg,
        borderColor: t.tipBorder,
        color: t.textMuted,
      }}>
        <strong style={{ color: t.tipStrong }}>Tip:</strong>{' '}
        <span style={{ transition: 'opacity .3s' }}>{TIPS[tipIndex]}</span>
      </div>
    </div>
  );
}

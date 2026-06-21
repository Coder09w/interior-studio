'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Sofa,
  Box,
  Home as HomeIcon,
  GraduationCap,
  PenTool,
  Ruler,
  LayoutGrid,
  Palette,
  Share2,
  Layers,
  Eye,
  Sun,
  ArrowRight,
  Menu,
  X,
  Check,
  XCircle,
  ChevronRight,
  Sparkles,
  Play,
  Twitter,
  Github,
} from 'lucide-react';

/* ─── Animation helpers ─── */
function RevealOnScroll({ children, delay = 0, direction = 'up', className = '' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'; className?: string }) {
  const dirMap = { up: { y: 60 }, down: { y: -60 }, left: { x: 60 }, right: { x: -60 } };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, ...dirMap[direction] }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        visible: { transition: { staggerChildren: 0.12 } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled(y > 20);
          setDarkMode(y < window.innerHeight * 0.6);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = darkMode
    ? scrolled ? 'bg-[#0F0F0F]/80 backdrop-blur-md' : 'bg-transparent'
    : 'bg-white/80 backdrop-blur-md shadow-sm';

  const textColor = darkMode ? '#FFFFFF' : '#2D2D2D';
  const mutedColor = darkMode ? '#A8A8A8' : '#5A4E42';
  const borderColor = darkMode ? 'rgba(255,255,255,0.15)' : '#E2DDD4';
  const mobileMenuBg = darkMode ? 'bg-[#0F0F0F]/95' : 'bg-white/95';

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="Instod" className="w-9 h-9 rounded-lg transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: textColor }}>
              Instod
            </span>
            <span
              className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              BETA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-[#C17F4E]" style={{ color: mutedColor }}>
              Features
            </a>
            <a href="#gallery" className="text-sm font-medium transition-colors hover:text-[#C17F4E]" style={{ color: mutedColor }}>
              Gallery
            </a>
            <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-[#C17F4E]" style={{ color: mutedColor }}>
              Pricing
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
                style={{ background: '#C17F4E' }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium px-5 py-2.5 rounded-lg border transition-all hover:shadow-sm"
                  style={{ borderColor, color: textColor }}
                >
                  Sign In
                </Link>
                <Link
                  href="/editor"
                  prefetch={false}
                  className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md hover:shadow-[#C17F4E]/20"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  Start Designing
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: textColor }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden ${mobileMenuBg} backdrop-blur-md border-t`}
          style={{ borderColor }}
        >
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium py-3 min-h-[44px] flex items-center" style={{ color: mutedColor }} onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#gallery" className="block text-sm font-medium py-3 min-h-[44px] flex items-center" style={{ color: mutedColor }} onClick={() => setMobileOpen(false)}>Gallery</a>
            <Link href="/pricing" className="block text-sm font-medium py-3 min-h-[44px] flex items-center" style={{ color: mutedColor }} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <div className="pt-2 flex flex-col gap-2">
              {session ? (
                <Link href="/dashboard" className="text-sm font-medium px-5 py-2.5 rounded-lg text-white text-center" style={{ background: '#C17F4E' }} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium px-5 py-2.5 rounded-lg border text-center" style={{ borderColor, color: textColor }} onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/editor" prefetch={false} className="text-sm font-medium px-5 py-2.5 rounded-lg text-white text-center" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }} onClick={() => setMobileOpen(false)}>Start Designing</Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

/* ─── 1. HERO SECTION (Dark #0F0F0F) ─── */
const heroSlides = [
  { image: '/images/hero-living-v2.png', label: 'Living Room' },
  { image: '/images/hero-bedroom-v2.png', label: 'Bedroom' },
  { image: '/images/hero-kitchen-v2.png', label: 'Kitchen' },
  { image: '/images/hero-bathroom-v2.png', label: 'Bathroom' },
  { image: '/images/hero-dining-v2.png', label: 'Dining Room' },
  { image: '/images/hero-office-v2.png', label: 'Office' },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -40]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden" style={{ background: '#0F0F0F' }}>
      {/* Backdrop image — moody architectural interior matching dark brand theme */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/hero/hero-backdrop-dark.png)',
          backgroundPosition: 'center 40%',
        }}
        aria-hidden="true"
      />
      {/* Dark wash + radial vignette so the white headline stays crisp */}
      <div
        className="absolute inset-0"
        style={{
          // Center-heavy radial: darkest behind the headline, fades out toward edges
          // Pushed lighter so the architectural photo bleeds through more strongly
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(15,15,15,0.55) 0%, rgba(15,15,15,0.72) 40%, rgba(15,15,15,0.85) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative gradient blobs */}
      <div
        className="absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float1"
        style={{ background: 'linear-gradient(135deg, rgba(193,127,78,0.18), rgba(168,152,132,0.10))' }}
      />

      <motion.div style={{ y: y1 }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="flex flex-col items-center text-center">
          {/* Centered text content */}
          <div className="text-center max-w-3xl mx-auto">
            <RevealOnScroll delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#A8A8A8' }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#A8A8A8' }}>FREE 3D ROOM DESIGNER</span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}
              >
                See Your Room in 3D{' '}
                <span className="relative inline-block">
                  <span className="font-extrabold" style={{ color: '#C17F4E', textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>Before You Move a Thing</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6C50 2 150 2 198 6" stroke="#C17F4E" strokeWidth="3" strokeLinecap="round" opacity="0.4" /></svg>
                </span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <p className="mt-5 text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#A8A8A8' }}>
                Place furniture, swap materials, adjust lighting, and see your room come to life in real-time 3D. Free to use — no account required.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.4}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link
                  href="/editor"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/30 hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', boxShadow: '0 0 30px rgba(193,127,78,0.2)' }}
                >
                  Start Designing Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/editor?room=living"
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:bg-white/5 hover:border-white/30 active:scale-[0.97]"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
                >
                  <Play className="w-4 h-4" style={{ color: '#A8A8A8' }} />
                  View Demo Project
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.5}>
              <div className="mt-10 flex items-center gap-4 justify-center">
                <div className="flex -space-x-2">
                  {['bg-[#7A6E62]', 'bg-[#6B7B6B]', 'bg-[#6B8E6B]', 'bg-[#7B8FA1]'].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0F0F0F] ${bg} flex items-center justify-center`} aria-hidden="true">
                      <span className="text-white text-[10px] font-bold">{['S', 'A', 'M', 'K'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: '#A8A8A8' }}>
                  <span className="font-semibold" style={{ color: '#FFFFFF' }}>200+ designers</span> in early access
                </p>
              </div>
            </RevealOnScroll>
          </div>

          {/* Image Carousel — below the text, full-width showcase */}
          <RevealOnScroll delay={0.3} direction="up">
            <div className="relative rounded-2xl overflow-hidden mt-12 lg:mt-16 max-w-4xl mx-auto w-full" style={{ border: '2px solid rgba(255,255,255,0.08)' }}>
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={heroSlides[currentSlide].image}
                      alt={heroSlides[currentSlide].label}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Room type label overlay */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  {heroSlides[currentSlide].label}
                </div>

                {/* LIVE badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#A8A8A8' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE 3D
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 py-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="transition-all duration-300 rounded-full min-w-[8px] min-h-[20px]"
                    style={{
                      width: i === currentSlide ? '24px' : '8px',
                      height: '8px',
                      background: i === currentSlide ? '#C17F4E' : 'rgba(255,255,255,0.3)',
                    }}
                    aria-label={`View ${heroSlides[i].label}`}
                  />
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── 2. BEFORE / AFTER SECTION (White #FFFFFF) — Interactive Slider ─── */
function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  };

  // Pointer events handle mouse + touch uniformly
  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl select-none cursor-ew-resize touch-none"
      style={{ border: '2px solid #E8E2DA', boxShadow: '0 12px 48px rgba(0,0,0,0.10)' }}
    >
      {/* AFTER image (full-bleed, bottom layer) */}
      <img
        src="/images/room-designed-v2.png"
        alt="Designed room after using Instod"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* AFTER badge */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider pointer-events-none" style={{ background: 'rgba(193,127,78,0.95)', color: '#FFFFFF', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        AFTER
      </div>

      {/* BEFORE image (clipped to left of slider handle) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${position}%` }}
      >
        <img
          src="/images/room-empty-v2.png"
          alt="Empty room before design"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${containerRef.current?.clientWidth ?? 1000}px`, maxWidth: 'none' }}
          draggable={false}
        />
        {/* BEFORE badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider" style={{ background: 'rgba(45,45,45,0.85)', color: '#FFFFFF', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          BEFORE
        </div>
      </div>

      {/* Drag handle line + knob */}
      <div
        className="absolute top-0 bottom-0 z-30 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Vertical line */}
        <div
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2"
          style={{ background: '#FFFFFF', boxShadow: '0 0 12px rgba(0,0,0,0.35), 0 0 2px rgba(193,127,78,0.6)' }}
        />
        {/* Knob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #C17F4E, #A86A3D)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.25), 0 0 0 4px rgba(255,255,255,0.95)',
          }}
        >
          {/* Arrow icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 6 4 12 8 18" />
            <polyline points="16 6 20 12 16 18" />
          </svg>
        </div>
      </div>

      {/* Hint pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide pointer-events-none" style={{ background: 'rgba(15,15,15,0.75)', color: '#FFFFFF', backdropFilter: 'blur(8px)' }}>
        ← Drag to compare →
      </div>
    </div>
  );
}

function BeforeAfterSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Subtle cream backdrop wash on edges for atmosphere */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(250,246,240,0.8) 0%, rgba(255,255,255,0) 60%)',
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.10)', color: '#C17F4E' }}>
              TRANSFORMATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A1A' }}>
              Stop Guessing. <span className="font-extrabold" style={{ color: '#C17F4E' }}>Start Visualizing.</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: '#5A4E42' }}>
              Drag the slider to reveal the transformation — from an empty room to a fully designed space, all in your browser.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <BeforeAfterSlider />
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── 3. WHY PEOPLE USE INSTOD (Light warm bg #FAF6F0) ─── */
const userTypes = [
  { icon: HomeIcon, title: 'Homeowners', description: 'Visualize renovations before spending money', color: '#8B7355' },
  { icon: GraduationCap, title: 'Students', description: 'Learn interior design through real 3D experimentation', color: '#6B7B6B' },
  { icon: PenTool, title: 'Interior Designers', description: 'Present concepts to clients faster', color: '#7B8FA1' },
  { icon: Ruler, title: 'Furniture Planners', description: 'Ensure everything fits before purchase', color: '#A68B6B' },
];

function WhyPeopleUseSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#FAF6F0' }}>
      {/* Atmospheric cream backdrop — subtle, doesn't compete with cards */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: 'url(/hero/section-bg-cream.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(250,246,240,0.5) 0%, rgba(250,246,240,0.85) 100%)' }} aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.10)', color: '#C17F4E' }}>
              WHO IT'S FOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Built for Everyone Who <span className="font-extrabold" style={{ color: '#C17F4E' }}>Designs Spaces</span>
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {userTypes.map(({ icon: Icon, title, description, color }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 cursor-default"
              style={{
                background: '#FFFFFF',
                border: '2px solid #E8E2DA',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = color;
                el.style.boxShadow = `0 12px 36px ${color}26, 0 0 0 1px ${color}40`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = '#E8E2DA';
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${color}15`, border: `2px solid ${color}30` }}
              >
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── 4. DESIGN EVERY PART OF YOUR ROOM (Dark bg #0F0F0F) ─── */
const designFeatures = [
  { icon: Sofa, title: 'Furniture Placement', description: 'Drag and drop 30+ furniture items into your room — sofas, beds, tables, chairs, and more', image: '/images/feature-furniture.png' },
  { icon: Palette, title: 'Wall Materials', description: 'Choose from paints, wallpapers, tiles and textured finishes for every wall', image: '/images/feature-materials.png' },
  { icon: Layers, title: 'Floor Materials', description: 'Swap between hardwood, tile, carpet and more with a single click', image: '/images/feature-preview-3d.png' },
  { icon: Sun, title: 'Lighting Moods', description: 'Adjust ambient, task and accent lighting in real time to set the mood', image: '/images/feature-settings.png' },
  { icon: LayoutGrid, title: 'Room Themes', description: 'Apply complete style presets — modern, bohemian, traditional, and more', image: '/images/feature-rooms.png' },
  { icon: Eye, title: 'Live 3D Preview', description: 'Walk through your design from any angle in real-time 3D', image: '/images/feature-share.png' },
];

function DesignEveryPartSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#0F0F0F' }}>
      {/* Atmospheric dark backdrop — lamp glow ambiance */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{ backgroundImage: 'url(/hero/section-bg-dark.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(15,15,15,0.65) 0%, rgba(15,15,15,0.92) 100%)' }} aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.18)', color: '#C17F4E' }}>
              FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
              Design Every Part of <span className="font-extrabold" style={{ color: '#C17F4E' }}>Your Room</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: '#A8A8A8' }}>
              From walls to furniture, lighting to materials — control every detail.
            </p>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designFeatures.map(({ icon: Icon, title, description, image }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              className="group rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: '#1A1A1A',
                border: '2px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(193,127,78,0.55)';
                el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(193,127,78,0.25), 0 0 28px rgba(193,127,78,0.18)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Image top */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(26,26,26,0.7) 100%)' }} />
                {/* Icon chip overlay */}
                <div
                  className="absolute -bottom-5 left-5 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)', border: '2px solid rgba(193,127,78,0.55)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 pt-7">
                <h3 className="text-base font-semibold tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A8A8A8' }}>
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── 5. SAMPLE DESIGNS / GALLERY (Dark bg #121212) ─── */
const galleryCategories = [
  { label: 'Living Room', type: 'living', image: '/images/gallery-living.png' },
  { label: 'Bedroom', type: 'bedroom', image: '/images/gallery-bedroom.png' },
  { label: 'Bathroom', type: 'bathroom', image: '/images/gallery-bathroom.png' },
  { label: 'Kitchen', type: 'kitchen', image: '/images/gallery-kitchen.png' },
  { label: 'Dining Room', type: 'dining', image: '/images/gallery-dining.png' },
  { label: 'Office', type: 'office', image: '/images/gallery-office.png' },
];

function GallerySection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="gallery" className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#121212' }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.18)', color: '#C17F4E' }}>
              GALLERY
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
              See What&apos;s <span className="font-extrabold" style={{ color: '#C17F4E' }}>Possible</span>
            </h2>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          {/* Tab bar */}
          <div className="gallery-tabs-scroll flex items-center justify-start sm:justify-center gap-2 mb-10 flex-nowrap sm:flex-wrap px-1 sm:px-0 -mx-4 sm:mx-0 px-4 sm:px-0">
            {galleryCategories.map((cat, i) => (
              <button
                key={cat.type}
                onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0"
                style={{
                  background: i === activeTab ? 'linear-gradient(135deg, #C17F4E, #A86A3D)' : 'rgba(255,255,255,0.06)',
                  color: i === activeTab ? '#FFFFFF' : '#A8A8A8',
                  border: i === activeTab ? '2px solid rgba(193,127,78,0.5)' : '1.5px solid rgba(255,255,255,0.1)',
                  boxShadow: i === activeTab ? '0 6px 20px rgba(193,127,78,0.25)' : 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          {/* Gallery display */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-500"
            style={{ border: '2px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(193,127,78,0.06)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative aspect-[4/3] sm:aspect-[16/9]"
              >
                <img
                  src={galleryCategories[activeTab].image}
                  alt={`${galleryCategories[activeTab].label} gallery`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 45%)' }} />
                {/* Active label chip — top-left */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider" style={{ background: 'rgba(193,127,78,0.95)', color: '#FFFFFF', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {galleryCategories[activeTab].label.toUpperCase()}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Link
                href={`/editor?room=${galleryCategories[activeTab].type}`}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/40 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', boxShadow: '0 6px 20px rgba(193,127,78,0.3)' }}
              >
                Design This Room
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── 6. HOW INSTOD WORKS (White bg #FFFFFF) ─── */
const steps = [
  { icon: Box, number: 1, title: 'Create Room', description: 'Set your room dimensions and type' },
  { icon: Sofa, number: 2, title: 'Add Furniture', description: 'Browse and place 30+ furniture items' },
  { icon: Palette, number: 3, title: 'Customize Materials', description: 'Swap fabrics, woods, metals and colors' },
  { icon: Share2, number: 4, title: 'Save & Share', description: 'Save your design and share a live link' },
];

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-20 sm:py-28" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A1A' }}>
              How <span className="font-extrabold" style={{ color: '#2D2D2D' }}>Instod Works</span>
            </h2>
          </div>
        </RevealOnScroll>

        <div ref={ref} className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5" style={{ background: '#E8E2DA' }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full origin-left"
              style={{ background: 'linear-gradient(90deg, #E8E2DA, #C17F4E, #E8E2DA)' }}
            />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map(({ icon: Icon, number, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative"
              >
                {/* Step number circle */}
                <div className="relative z-10 mx-auto mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-sm font-bold transition-all duration-300"
                    style={{
                      background: isInView ? '#FFFFFF' : '#F5F0E8',
                      color: isInView ? '#2D2D2D' : '#A8A8A8',
                      border: isInView ? '2.5px solid #C17F4E' : '2.5px solid #E8E2DA',
                      boxShadow: isInView ? '0 0 0 4px rgba(193,127,78,0.1)' : 'none',
                    }}
                  >
                    {number}
                  </div>
                </div>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1.5px solid rgba(0,0,0,0.06)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: '#7A6E62' }} />
                </div>

                <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed max-w-[200px] mx-auto" style={{ color: '#5A4E42' }}>
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 7. VALUE COMPARISON (Light warm bg #FAF6F0) ─── */
const comparisons = [
  { category: 'Furniture Fit', traditional: 'Guess measurements', instod: 'Visualize in 3D' },
  { category: 'Room Layout', traditional: 'Draw on paper', instod: 'Drag and place interactively' },
  { category: 'Material Selection', traditional: 'Buy samples', instod: 'Preview instantly' },
  { category: 'Client Presentations', traditional: 'Mood boards', instod: 'Interactive 3D walkthrough' },
  { category: 'Design Iterations', traditional: 'Days of revisions', instod: 'Seconds to modify' },
];

function ValueComparisonSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#FAF6F0' }}>
      {/* Atmospheric cream backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
        style={{ backgroundImage: 'url(/hero/section-bg-cream.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(250,246,240,0.7) 0%, rgba(250,246,240,0.92) 100%)' }} aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.10)', color: '#C17F4E' }}>
              COMPARISON
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              The Smarter Way to <span className="font-extrabold" style={{ color: '#C17F4E' }}>Design Rooms</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: '#5A4E42' }}>
              Why guess when you can see? Here&apos;s how Instod compares to the old way of designing spaces.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          {/* Desktop table layout */}
          <div
            className="hidden sm:block max-w-4xl mx-auto rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '2px solid #E8E2DA', boxShadow: '0 12px 48px rgba(0,0,0,0.06)' }}
          >
            {/* Header row */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 relative" style={{ background: '#FAF6F0', borderBottom: '2px solid #E8E2DA' }}>
              <div className="text-sm font-bold uppercase tracking-wider" style={{ color: '#5A4E42' }}>Feature</div>
              <div className="text-sm font-bold text-center uppercase tracking-wider" style={{ color: '#B8433A' }}>Traditional Way</div>
              <div className="text-sm font-bold text-center uppercase tracking-wider relative" style={{ color: '#C17F4E' }}>
                Instod
                {/* Recommended ribbon */}
                <span className="absolute -top-1 right-0 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', color: '#FFFFFF', boxShadow: '0 2px 6px rgba(193,127,78,0.3)' }}>
                  RECOMMENDED
                </span>
              </div>
            </div>

            {/* Comparison rows */}
            {comparisons.map((row, i) => (
              <div
                key={row.category}
                className="grid grid-cols-3 gap-4 px-6 py-5 items-center transition-colors duration-200 hover:bg-[#FAF6F0]/50"
                style={{ borderBottom: i < comparisons.length - 1 ? '1px solid #F0E8DE' : 'none' }}
              >
                <div className="text-sm font-semibold" style={{ color: '#2D2D2D' }}>
                  {row.category}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#B8433A' }} />
                  <span className="text-sm text-center" style={{ color: '#7A6E62' }}>{row.traditional}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(107,139,94,0.15)' }}
                  >
                    <Check className="w-3 h-3" style={{ color: '#6B8B5E' }} />
                  </div>
                  <span className="text-sm text-center font-medium" style={{ color: '#2D2D2D' }}>{row.instod}</span>
                </div>
              </div>
            ))}

            {/* Footer row inside the table — Instod CTA */}
            <div className="grid grid-cols-3 gap-4 px-6 py-5 items-center" style={{ background: 'linear-gradient(90deg, rgba(250,246,240,0) 0%, rgba(250,246,240,0) 33%, rgba(193,127,78,0.06) 33%)' }}>
              <div></div>
              <div></div>
              <div className="text-center">
                <Link
                  href="/editor"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90 hover:shadow-md hover:shadow-[#C17F4E]/30"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  Try It Free
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile card layout */}
          <div className="sm:hidden max-w-4xl mx-auto space-y-3">
            {comparisons.map((row) => (
              <div
                key={row.category}
                className="rounded-xl p-4"
                style={{ background: '#FFFFFF', border: '2px solid #E8E2DA', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
              >
                <div className="text-sm font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                  {row.category}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#B8433A' }} />
                    <span className="text-sm" style={{ color: '#7A6E62' }}>{row.traditional}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(107,139,94,0.18)' }}>
                      <Check className="w-2.5 h-2.5" style={{ color: '#6B8B5E' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>{row.instod}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Mobile CTA */}
            <div className="text-center pt-4">
              <Link
                href="/editor"
                prefetch={false}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/30"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
              >
                Try It Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── 8. EARLY ACCESS BETA SECTION (Dark bg #0F0F0F) ─── */
const betaBenefits = [
  'Unlimited projects',
  'Unlimited rooms',
  'All furniture items',
  'Premium features included',
  'Early access benefits',
  'Shape the product with your feedback',
];

function EarlyAccessSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: '#0F0F0F' }}>
      {/* Atmospheric dark backdrop — matches the hero bookend */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: 'url(/hero/section-bg-dark.png)' }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div
            className="relative rounded-3xl p-1.5"
            style={{ background: 'linear-gradient(135deg, rgba(193,127,78,0.5) 0%, rgba(193,127,78,0.1) 35%, rgba(193,127,78,0.1) 65%, rgba(193,127,78,0.5) 100%)', boxShadow: '0 0 60px rgba(193,127,78,0.12)' }}
          >
            <div className="rounded-[22px] p-8 sm:p-12 lg:p-16 text-center" style={{ background: '#1A1A1A' }}>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4" style={{ background: 'rgba(193,127,78,0.18)', color: '#C17F4E' }}>
                EARLY ACCESS BETA
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
                Everything Free — <span className="font-extrabold" style={{ color: '#C17F4E' }}>For a Limited Time</span>
              </h2>
              <p className="text-base mb-10 max-w-lg mx-auto" style={{ color: '#A8A8A8' }}>
                Join the beta and get full access to every feature at no cost. Your input helps shape the future of Instod.
              </p>

              <div className="max-w-md mx-auto mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {betaBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(107,139,94,0.18)', border: '1px solid rgba(107,139,94,0.3)' }}>
                        <Check className="w-3 h-3" style={{ color: '#6B8B5E' }} />
                      </div>
                      <span className="text-sm" style={{ color: '#E8E0D6' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/editor"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/40 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', boxShadow: '0 0 30px rgba(193,127,78,0.25)' }}
              >
                Start Designing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── 9. FINAL CTA SECTION (Dark bg with gradient + backdrop) ─── */
function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32 overflow-hidden" style={{ background: '#0F0F0F' }}>
      {/* Atmospheric backdrop — same moody interior as hero for bookend feeling */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/hero/hero-backdrop-dark.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(15,15,15,0.78) 0%, rgba(15,15,15,0.92) 100%)' }} aria-hidden="true" />

      {/* Parallax glow effect */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(193,127,78,0.15) 0%, rgba(193,127,78,0.04) 40%, transparent 70%)' }}
        />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>
            Your Future Room <br className="hidden sm:block" />Is Waiting
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#A8A8A8' }}>
            Start designing, experimenting, and visualizing your space today. No account needed — start in 10 seconds.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <Link
            href="/editor"
            prefetch={false}
            className="inline-flex items-center justify-center gap-3 px-12 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-300 hover:opacity-90 hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(193,127,78,0.4)] active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #C17F4E, #A86A3D)',
              boxShadow: '0 0 40px rgba(193,127,78,0.3)',
            }}
          >
            Launch Designer
            <ArrowRight className="w-6 h-6" />
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── 10. FOOTER (Dark bg #0A0A0A) ─── */
const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Demo Project', href: '/editor?room=living' },
  ],
  Resources: [
    { label: 'Help Center', href: '/contact' },
  ],
  Company: [
    { label: 'About', href: '/contact' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookie-policy' },
  ],
};

function Footer() {
  return (
    <footer className="pt-16 pb-10 sm:pt-24 sm:pb-14" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Logo column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <img src="/logo.svg" alt="Instod" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
                Instod
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#A8A8A8' }}>
              Design your room before you build it. Free 3D room designer for everyone.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" style={{ color: '#A8A8A8' }} />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" style={{ color: '#A8A8A8' }} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold tracking-wide mb-5" style={{ fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={link.href.startsWith('#') || link.href === '#' ? undefined : false}
                      className="text-sm transition-colors duration-200 hover:text-[#C17F4E]"
                      style={{ color: '#A8A8A8' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: '#7A6E62' }}>
            &copy; {new Date().getFullYear()} Instod. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: '#7A6E62' }}>
            Made with ❤️ for designers
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── SCROLL-FOLLOWING LIGHT — warm glow that tracks scroll position ─── */
function ScrollFollowingLight() {
  const { scrollY } = useScroll();
  // Map scroll [0..3000px] to vertical position [10%..90%] of viewport
  const y = useTransform(scrollY, [0, 4000], ['10vh', '90vh']);
  const opacity = useTransform(scrollY, [0, 100, 4000, 4500], [0, 0.55, 0.55, 0]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1, // above section backgrounds, below content (which is z-auto/10+)
        y,
        opacity,
      }}
    >
      {/* Warm radial glow — like a flashlight beam following the user's scroll */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,127,78,0.18) 0%, rgba(193,127,78,0.06) 30%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Smaller hotter core — gives the glow a "source" feel */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,140,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
    </motion.div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <ScrollFollowingLight />
      <Navbar />
      <HeroSection />
      <BeforeAfterSection />
      <WhyPeopleUseSection />
      <DesignEveryPartSection />
      <GallerySection />
      <HowItWorksSection />
      <ValueComparisonSection />
      <EarlyAccessSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}

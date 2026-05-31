'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Sofa,
  Box,
  Armchair,
  LayoutGrid,
  Palette,
  Share2,
  Settings,
  MousePointerClick,
  ChevronRight,
  Menu,
  X,
  RotateCcw,
  Eye,
  Layers,
  Move,
  Lamp,
  BedDouble,
  CookingPot,
  Bath,
  Monitor,
  Sparkles,
  ArrowRight,
  Check,
  Play,
  Zap,
  Globe,
  UtensilsCrossed,
  Star,
  Quote,
} from 'lucide-react';

/* ─── Animation helpers ─── */
function FadeInWhenVisible({ children, delay = 0, direction = 'up', className = '' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'down' | 'left' | 'right'; className?: string }) {
  const dirMap = { up: { y: 40 }, down: { y: -40 }, left: { x: 40 }, right: { x: -40 } };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ─── Counter Animation ─── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return;
    const duration = 1500;
    const startTime = performance.now();
    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setDisplay(current.toString() + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value, suffix]);

  return <span ref={ref}>{display}</span>;
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const editorHref = session ? '/dashboard' : '/editor';

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: '#C17F4E' }}
            >
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Interior Studio
            </span>
            <span
              className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              BETA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium transition-colors hover:text-[#C17F4E]"
              style={{ color: '#8A8478' }}
            >
              Features
            </a>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-[#C17F4E]"
              style={{ color: '#8A8478' }}
            >
              Pricing
            </Link>
            <Link
              href={session ? '/dashboard' : '/auth/login'}
              className="text-sm font-medium px-5 py-2.5 rounded-lg border transition-all hover:shadow-sm"
              style={{
                borderColor: '#E2DDD4',
                color: '#2D2D2D',
              }}
            >
              {session ? 'Dashboard' : 'Sign In'}
            </Link>
            <Link
              href={editorHref}
              className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: '#C17F4E' }}
            >
              {session ? 'Dashboard' : 'Open Editor'}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#2D2D2D' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-md border-t"
          style={{ borderColor: '#E2DDD4' }}
        >
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium py-2" style={{ color: '#8A8478' }} onClick={() => setMobileOpen(false)}>Features</a>
            <Link href="/pricing" className="block text-sm font-medium py-2" style={{ color: '#8A8478' }} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href={session ? '/dashboard' : '/auth/login'} className="text-sm font-medium px-5 py-2.5 rounded-lg border text-center" style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }} onClick={() => setMobileOpen(false)}>{session ? 'Dashboard' : 'Sign In'}</Link>
              <Link href={editorHref} className="text-sm font-medium px-5 py-2.5 rounded-lg text-white text-center" style={{ background: '#C17F4E' }} onClick={() => setMobileOpen(false)}>{session ? 'Dashboard' : 'Open Editor'}</Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      style={{ background: '#F5F0E8' }}
    >
      {/* Backdrop image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-living-room.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(245,240,232,0.75)' }} />
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #2D2D2D 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative gradient blobs — CSS-animated for GPU efficiency */}
      <div
        className="absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float1"
        style={{ background: 'linear-gradient(135deg, #C17F4E, #D4A76A)', willChange: 'transform, opacity' }}
      />
      <div
        className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl animate-float2"
        style={{ background: 'linear-gradient(135deg, #8B7355, #C17F4E)', willChange: 'transform, opacity' }}
      />

      <motion.div style={{ y: y1, opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="text-center lg:text-left">
            <FadeInWhenVisible delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(193,127,78,0.08)', borderColor: 'rgba(193,127,78,0.2)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#C17F4E' }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#C17F4E' }}>FREE 3D ROOM DESIGNER</span>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
              >
                Design Your{' '}
                <span className="relative inline-block">
                  <span style={{ color: '#C17F4E' }}>Dream Space</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6C50 2 150 2 198 6" stroke="#C17F4E" strokeWidth="3" strokeLinecap="round" opacity="0.4"/></svg>
                </span>{' '}
                in 3D
              </h1>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <p
                className="mt-5 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
                style={{ color: '#8A8478' }}
              >
                Design and explore your rooms in an interactive 3D editor.
                Place furniture, swap materials, adjust lighting, and iterate on your
                layout from any angle — no design experience needed.
              </p>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.4}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/20 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  Start Designing
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base border-2 transition-all hover:shadow-sm"
                  style={{
                    borderColor: '#E2DDD4',
                    color: '#2D2D2D',
                  }}
                >
                  See How It Works
                </a>
              </div>
            </FadeInWhenVisible>

            {/* Social proof */}
            <FadeInWhenVisible delay={0.5}>
              <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[
                    'bg-[#C17F4E]',
                    'bg-[#8B7355]',
                    'bg-[#6B8E6B]',
                    'bg-[#7B8FA1]',
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white ${bg} flex items-center justify-center`}
                    >
                      <span className="text-white text-[10px] font-bold">
                        {['JD', 'AK', 'ML', 'SR'][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: '#8A8478' }}>
                  <span className="font-semibold" style={{ color: '#2D2D2D' }}>
                    Join our
                  </span>{' '}
                  beta community
                </p>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Right: stylized 3D editor preview */}
          <FadeInWhenVisible delay={0.3} direction="right">
            <div
              className="rounded-2xl border-2 shadow-2xl overflow-hidden"
              style={{
                borderColor: '#E2DDD4',
                background: '#FAF8F4',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: '#E2DDD4', background: '#FFFFFF' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div
                  className="flex-1 text-center text-xs font-medium rounded-md py-1 mx-8"
                  style={{ background: '#F5F0E8', color: '#8A8478' }}
                >
                  Interior Studio — Living Room
                </div>
              </div>

              {/* Simulated room viewport */}
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #F0E8D8 0%, #E8DFD0 40%, #DDD4C4 100%)',
                }}
              >
                {/* Floor grid */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: 'perspective(800px) rotateX(50deg)',
                    transformOrigin: 'top center',
                  }}
                />

                {/* Beta Preview badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-semibold" style={{ background: 'rgba(193,127,78,0.9)', color: '#fff' }}>
                  BETA PREVIEW
                </div>

                {/* Animated furniture items */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Sofa */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.85, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute flex flex-col items-center gap-1"
                      style={{ top: '40%', left: '25%' }}
                    >
                      <div
                        className="w-24 h-12 rounded-lg shadow-md flex items-center justify-center"
                        style={{ background: '#C17F4E', opacity: 0.85 }}
                      >
                        <Sofa className="w-6 h-6 text-white" />
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.9)', color: '#8A8478' }}
                      >
                        Modern Sofa
                      </span>
                    </motion.div>

                    {/* Table */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.85, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute flex flex-col items-center gap-1"
                      style={{ top: '45%', left: '55%' }}
                    >
                      <div
                        className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center"
                        style={{ background: '#8B7355', opacity: 0.85 }}
                      >
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.9)', color: '#8A8478' }}
                      >
                        Coffee Table
                      </span>
                    </motion.div>

                    {/* Lamp */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.85, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute flex flex-col items-center gap-1"
                      style={{ top: '20%', left: '72%' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-md flex items-center justify-center"
                        style={{ background: '#D4A76A', opacity: 0.85 }}
                      >
                        <Lamp className="w-4 h-4 text-white" />
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.9)', color: '#8A8478' }}
                      >
                        Floor Lamp
                      </span>
                    </motion.div>

                    {/* Rug */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute"
                      style={{
                        top: '55%',
                        left: '35%',
                        width: '120px',
                        height: '60px',
                        borderRadius: '8px',
                        background: 'rgba(193,127,78,0.2)',
                        border: '2px dashed rgba(193,127,78,0.4)',
                      }}
                    />
                  </div>
                </div>

                {/* Toolbar overlay bottom */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                >
                  {[
                    { icon: MousePointerClick, label: 'Select' },
                    { icon: Move, label: 'Move' },
                    { icon: RotateCcw, label: 'Rotate' },
                    { icon: Eye, label: 'View' },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-[#F5F0E8]"
                      title={label}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#8A8478' }} />
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: '#8A8478' }}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Floating card - left */}
          <FadeInWhenVisible delay={0.8} direction="right">
            <div
              className="absolute -left-4 sm:-left-8 top-1/4 px-4 py-3 rounded-xl shadow-xl border"
              style={{
                background: '#FFFFFF',
                borderColor: '#E2DDD4',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#F0E8D8' }}
                >
                  <Armchair className="w-4 h-4" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: '#2D2D2D' }}
                  >
                    Furniture Library
                  </p>
                  <p className="text-[10px]" style={{ color: '#8A8478' }}>
                    30+ items available
                  </p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Floating card - right */}
          <FadeInWhenVisible delay={1.0} direction="left">
            <div
              className="absolute -right-2 sm:-right-6 bottom-1/4 px-4 py-3 rounded-xl shadow-xl border"
              style={{
                background: '#FFFFFF',
                borderColor: '#E2DDD4',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#F0E8D8' }}
                >
                  <Palette className="w-4 h-4" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: '#2D2D2D' }}
                  >
                    Material Swap
                  </p>
                  <p className="text-[10px]" style={{ color: '#8A8478' }}>
                    Change in real-time
                  </p>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Features ─── */
const features = [
  {
    icon: Box,
    title: '3D Real-Time Preview',
    description:
      'Walk through your designs in a fully interactive 3D environment. Rotate, zoom, and explore every angle with smooth OrbitControls.',
    gradient: 'linear-gradient(135deg, rgba(193,127,78,0.06) 0%, rgba(212,167,106,0.04) 100%)',
    image: '/images/feature-preview-3d.png',
  },
  {
    icon: Armchair,
    title: '30+ Furniture Items',
    description:
      'From sofas to bathtubs, our extensive library has everything you need to furnish any room type. Each item is fully customizable.',
    gradient: 'linear-gradient(135deg, rgba(139,115,85,0.06) 0%, rgba(193,127,78,0.04) 100%)',
    image: '/images/feature-furniture.png',
  },
  {
    icon: LayoutGrid,
    title: 'Multiple Rooms',
    description:
      'Design entire houses with dedicated rooms for living, bedroom, kitchen, bathroom, and office spaces. Switch between them instantly.',
    gradient: 'linear-gradient(135deg, rgba(123,143,161,0.06) 0%, rgba(61,79,95,0.04) 100%)',
    image: '/images/feature-rooms.png',
  },
  {
    icon: Palette,
    title: 'Material & Color System',
    description:
      'Swap fabrics, woods, metals, and leathers with a click. See changes instantly in 3D with realistic PBR materials and shadows.',
    gradient: 'linear-gradient(135deg, rgba(193,127,78,0.08) 0%, rgba(139,115,85,0.04) 100%)',
    image: '/images/feature-materials.png',
  },
  {
    icon: Share2,
    title: 'Save & Share',
    description:
      'Save your designs and share them with anyone via a simple link. No login required to view shared rooms.',
    gradient: 'linear-gradient(135deg, rgba(107,142,107,0.06) 0%, rgba(139,115,85,0.04) 100%)',
    image: '/images/feature-share.png',
  },
  {
    icon: Settings,
    title: 'Smart Room Settings',
    description:
      'Customize dimensions, flooring, windows, doors, and lighting to match your exact space. Four mood presets available.',
    gradient: 'linear-gradient(135deg, rgba(61,79,95,0.06) 0%, rgba(123,143,161,0.04) 100%)',
    image: '/images/feature-settings.png',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Everything You Need to Design Beautiful Spaces
            </h2>
            <p className="mt-4 text-base" style={{ color: '#8A8478' }}>
              Powerful tools to bring your interior design vision to life.
            </p>
          </div>
        </FadeInWhenVisible>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, gradient, image }) => (
            <motion.div
              key={title}
              variants={staggerItem}
              className="group rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderColor: '#E2DDD4',
              }}
            >
              {/* Feature image banner */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Subtle overlay for polish */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.08) 100%)',
                  }}
                />
              </div>
              {/* Content area */}
              <div className="relative z-10 p-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(193,127,78,0.12)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: '#C17F4E' }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A8478' }}>
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

/* ─── Room types showcase strip ─── */
const roomTypes = [
  { icon: Sofa, label: 'Living Room', color: '#C17F4E', image: '/images/room-living.png' },
  { icon: BedDouble, label: 'Bedroom', color: '#8B7355', image: '/images/room-bedroom.png' },
  { icon: CookingPot, label: 'Kitchen', color: '#D4A76A', image: '/images/room-kitchen.png' },
  { icon: Bath, label: 'Bathroom', color: '#7B8FA1', image: '/images/room-bathroom.png' },
  { icon: Monitor, label: 'Office', color: '#3D4F5F', image: '/images/room-office.png' },
  { icon: UtensilsCrossed, label: 'Dining Room', color: '#A68B6B', image: '/images/room-dining.png' },
];

function RoomShowcase() {
  return (
    <section
      className="py-16 sm:py-20"
      style={{ background: '#FAF8F4' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Design Every Room in Your Home
            </h2>
            <p className="mt-3 text-sm" style={{ color: '#8A8478' }}>
              Dedicated templates and furniture for every space.
            </p>
          </div>
        </FadeInWhenVisible>
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {roomTypes.map(({ icon: Icon, label, color, image }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              whileHover={{ y: -6, scale: 1.03 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-xl"
            >
              {/* Room image background */}
              <img
                src={image}
                alt={label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient overlay at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 40%, transparent 60%)',
                }}
              />
              {/* Label at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}CC` }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className="text-sm font-semibold text-white"
                  >
                    {label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
const steps = [
  {
    num: 1,
    title: 'Pick a Room',
    description:
      'Choose from living room, bedroom, kitchen, and more. Set your dimensions and style.',
    icon: LayoutGrid,
  },
  {
    num: 2,
    title: 'Add Furniture',
    description:
      'Browse our library and place items with a click. Drag to reposition, rotate to fit.',
    icon: Armchair,
  },
  {
    num: 3,
    title: 'Save & Share',
    description:
      'Save your design and share it with contractors, friends, or keep iterating.',
    icon: Share2,
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28"
      style={{ background: '#F5F0E8' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              How It Works
            </h2>
            <p className="mt-4 text-base" style={{ color: '#8A8478' }}>
              From blank canvas to dream home in three simple steps.
            </p>
          </div>
        </FadeInWhenVisible>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Connecting lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5" style={{ background: '#E2DDD4' }} />

          {steps.map(({ num, title, description, icon: Icon }) => (
            <motion.div key={num} variants={staggerItem} className="relative flex flex-col items-center text-center">
              {/* Number circle */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-6"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
              >
                {num}
              </motion.div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ color: '#8A8478' }}
              >
                {description}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── Design Inspiration Carousel ─── */
const showcaseItems = [
  { image: '/images/room-living.png', title: 'Modern Living Room', description: 'Warm tones & open layout' },
  { image: '/images/room-bedroom.png', title: 'Cozy Bedroom Retreat', description: 'Serene & minimalist design' },
  { image: '/images/room-kitchen.png', title: 'Chef\'s Dream Kitchen', description: 'Functional elegance' },
  { image: '/images/room-bathroom.png', title: 'Spa-Inspired Bathroom', description: 'Tranquil & luxurious' },
  { image: '/images/room-office.png', title: 'Productive Home Office', description: 'Focus & comfort combined' },
  { image: '/images/room-dining.png', title: 'Elegant Dining Space', description: 'Gather in style' },
  { image: '/images/hero-living-room.png', title: 'Open Concept Living', description: 'Where comfort meets design' },
];

function DesignInspirationCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  // Keep pausedRef in sync with isPaused state without re-creating the animation loop
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrame: number;
    let lastTime = performance.now();
    const speed = 0.5; // pixels per frame at 60fps

    function animate(time: number) {
      if (!pausedRef.current && container) {
        const delta = (time - lastTime) / 16.67; // normalize to 60fps
        posRef.current += speed * delta;
        const maxScroll = container.scrollWidth / 2;
        if (posRef.current >= maxScroll) posRef.current = 0;
        container.style.transform = `translateX(-${posRef.current}px)`;
      }
      lastTime = time;
      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Duplicate items for infinite loop feel
  const allItems = [...showcaseItems, ...showcaseItems];

  return (
    <section
      className="py-20 sm:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #2D2D2D 0%, #1A1A1A 100%)' }}
    >
      {/* Subtle accent gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(193,127,78,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(193,127,78,0.05) 0%, transparent 60%)',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(193,127,78,0.15)', borderColor: 'rgba(193,127,78,0.3)' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#C17F4E' }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: '#C17F4E' }}>DESIGN INSPIRATION</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Explore Beautiful Room <span style={{ color: '#C17F4E' }}>Designs</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Get inspired by stunning interior compositions crafted in Interior Studio.
            </p>
          </div>
        </FadeInWhenVisible>
      </div>

      {/* Carousel */}
      <div
        className="relative mt-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #1A1A1A, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #1A1A1A, transparent)' }}
        />

        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-6"
            style={{ willChange: 'transform' }}
          >
            {allItems.map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className="flex-shrink-0 w-[340px] sm:w-[420px] group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[3/2] border transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[#C17F4E]/10"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)' }}
                  />
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3
                      className="text-lg font-semibold text-white mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {item.description}
                    </p>
                  </div>
                  {/* Accent border glow on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 2px rgba(193,127,78,0.4)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function StatsSection() {
  const stats = [
    { value: '30', suffix: '+', label: 'Furniture Items' },
    { value: '5', suffix: '', label: 'Room Types' },
    { value: '4', suffix: '', label: 'Lighting Moods' },
    { value: '100', suffix: '%', label: 'Free to Use' },
  ];

  return (
    <section className="py-12" style={{ background: '#FFFFFF' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label }) => (
            <motion.div key={label} variants={staggerItem} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#C17F4E' }}>
                <AnimatedCounter value={value} suffix={suffix} />
              </p>
              <p className="text-sm mt-1" style={{ color: '#8A8478' }}>{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── Showcase Banner ─── */
function ShowcaseBannerSection() {
  return (
    <section
      className="py-20 sm:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text content */}
          <FadeInWhenVisible>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(193,127,78,0.15)', borderColor: 'rgba(193,127,78,0.3)' }}>
                <Eye className="w-4 h-4" style={{ color: '#C17F4E' }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#C17F4E' }}>LIVE PREVIEW</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                See Your Designs{' '}
                <span style={{ color: '#C17F4E' }}>Come Alive</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Watch your ideas transform into stunning 3D spaces in real time.
                Every detail, every texture, every shadow — rendered instantly as you design.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/editor"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/20 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  Try It Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, text: 'Real-time rendering' },
                  { icon: Palette, text: 'PBR materials' },
                  { icon: Eye, text: '360° walkthrough' },
                  { icon: Layers, text: 'Dynamic lighting' },
                ].map(({ icon: FIcon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(193,127,78,0.15)' }}
                    >
                      <FIcon className="w-4 h-4" style={{ color: '#C17F4E' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>

          {/* Right: Browser mockup with hero image */}
          <FadeInWhenVisible delay={0.2} direction="right">
            <div
              className="rounded-2xl border-2 shadow-2xl overflow-hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: '#1A1A1A',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#252525' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28CA41' }} />
                </div>
                <div
                  className="flex-1 text-center text-xs font-medium rounded-md py-1 mx-8"
                  style={{ background: '#1A1A1A', color: 'rgba(255,255,255,0.4)' }}
                >
                  Interior Studio — Living Room
                </div>
              </div>

              {/* Image viewport */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/hero-living-room.png"
                  alt="Interior Studio 3D room preview"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Subtle overlay with toolbar hint */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 30%)' }} />
                {/* Floating toolbar */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
                  style={{ background: 'rgba(26,26,26,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {[
                    { icon: MousePointerClick, label: 'Select' },
                    { icon: Move, label: 'Move' },
                    { icon: RotateCcw, label: 'Rotate' },
                    { icon: Eye, label: 'View' },
                  ].map(({ icon: TIcon, label }) => (
                    <button
                      key={label}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                      title={label}
                    >
                      <TIcon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                      <span className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const testimonials = [
    { name: 'Sarah K.', role: 'Interior Designer', text: 'This tool has completely transformed how I present concepts to clients. The 3D preview is incredibly realistic.', avatar: 'SK' },
    { name: 'James M.', role: 'Homeowner', text: 'I was able to plan my entire living room renovation before buying a single piece of furniture. Saved me thousands!', avatar: 'JM' },
    { name: 'Priya R.', role: 'Architecture Student', text: 'Perfect for quick prototyping. The material system and lighting moods make iterations so fast and intuitive.', avatar: 'PR' },
  ];

  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
      }}
    >
      {/* Accent gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 10% 20%, rgba(193,127,78,0.08) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(193,127,78,0.06) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInWhenVisible>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(193,127,78,0.15)', borderColor: 'rgba(193,127,78,0.3)' }}>
              <Quote className="w-4 h-4" style={{ color: '#C17F4E' }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: '#C17F4E' }}>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Loved by Designers & <span style={{ color: '#C17F4E' }}>Homeowners</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              See what people are building with Interior Studio.
            </p>
          </div>
        </FadeInWhenVisible>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Accent glow border on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(193,127,78,0.3), 0 0 20px rgba(193,127,78,0.05)' }}
              />

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: '#C17F4E' }}
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Person info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section
      className="py-20 sm:py-28"
      style={{
        background: 'linear-gradient(135deg, #2D2D2D 0%, #3D3D3D 50%, #2D2D2D 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInWhenVisible>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: 'rgba(193,127,78,0.15)', borderColor: 'rgba(193,127,78,0.3)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#D4A76A' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#D4A76A' }}>NO SIGN-UP REQUIRED</span>
          </div>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.1}>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Ready to Design Your Dream Space?
          </h2>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.2}>
          <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Jump right into the 3D editor and start creating. No account needed to explore and design.
          </p>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.3}>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/editor"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 hover:shadow-xl hover:shadow-[#C17F4E]/20 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              Open 3D Editor
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-lg border-2 transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              Sign Up to Save
            </Link>
          </div>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.4}>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4" style={{ color: '#C17F4E' }} />
              Free forever
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4" style={{ color: '#C17F4E' }} />
              No credit card
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4" style={{ color: '#C17F4E' }} />
              Works in browser
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ background: '#2D2D2D' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#C17F4E' }}
              >
                <Sofa className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Interior Studio
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              The easiest way to design, visualize, and share your dream
              interiors in stunning 3D.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: '3D Editor', href: '/editor' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Features', href: '#features' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 border-t text-center"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Interior Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <RoomShowcase />
        <HowItWorksSection />
        <DesignInspirationCarousel />
        <StatsSection />
        <TestimonialsSection />
        <ShowcaseBannerSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

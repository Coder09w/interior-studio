'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
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
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
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
              href="/auth/login"
              className="text-sm font-medium px-5 py-2.5 rounded-lg border transition-all hover:shadow-sm"
              style={{
                borderColor: '#E2DDD4',
                color: '#2D2D2D',
              }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: '#C17F4E' }}
            >
              Get Started
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t" style={{ borderColor: '#E2DDD4' }}>
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-sm font-medium py-2"
              style={{ color: '#8A8478' }}
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <Link
              href="/pricing"
              className="block text-sm font-medium py-2"
              style={{ color: '#8A8478' }}
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium px-5 py-2.5 rounded-lg border text-center"
                style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-medium px-5 py-2.5 rounded-lg text-white text-center"
                style={{ background: '#C17F4E' }}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-20"
      style={{ background: '#F5F0E8' }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #2D2D2D 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="text-center lg:text-left">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Design Your{' '}
              <span style={{ color: '#C17F4E' }}>Dream Space</span>{' '}
              in 3D
            </h1>
            <p
              className="mt-5 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ color: '#8A8478' }}
            >
              Visualize, customize, and perfect your interior designs with our
              interactive 3D room editor. No design experience needed.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#C17F4E]/20 hover:-translate-y-0.5"
                style={{ background: '#C17F4E' }}
              >
                Start for Free
                <ChevronRight className="w-4 h-4" />
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

            {/* Social proof */}
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
                  2,400+
                </span>{' '}
                designers already creating
              </p>
            </div>
          </div>

          {/* Right: stylized 3D editor preview */}
          <div className="relative">
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

                {/* Furniture items */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Sofa */}
                    <div
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
                    </div>

                    {/* Table */}
                    <div
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
                    </div>

                    {/* Lamp */}
                    <div
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
                    </div>

                    {/* Rug */}
                    <div
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
                <div
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
                </div>
              </div>
            </div>

            {/* Floating card - left */}
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

            {/* Floating card - right */}
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
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const features = [
  {
    icon: Box,
    title: '3D Real-Time Preview',
    description:
      'Walk through your designs in a fully interactive 3D environment. Rotate, zoom, and explore every angle.',
  },
  {
    icon: Armchair,
    title: '30+ Furniture Items',
    description:
      'From sofas to bathtubs, our extensive library has everything you need to furnish any room.',
  },
  {
    icon: LayoutGrid,
    title: 'Multiple Rooms',
    description:
      'Design entire houses with dedicated rooms for living, bedroom, kitchen, bathroom, and office spaces.',
  },
  {
    icon: Palette,
    title: 'Material & Color System',
    description:
      'Swap fabrics, woods, metals, and leathers with a click. See changes instantly in 3D.',
  },
  {
    icon: Share2,
    title: 'Save & Share',
    description:
      'Save your designs and share them with anyone via a simple link. No login required to view.',
  },
  {
    icon: Settings,
    title: 'Smart Room Settings',
    description:
      'Customize dimensions, flooring, windows, doors, and lighting to match your exact space.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: '#FFFFFF',
                borderColor: '#E2DDD4',
              }}
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Room types showcase strip ─── */
const roomTypes = [
  { icon: Sofa, label: 'Living Room' },
  { icon: BedDouble, label: 'Bedroom' },
  { icon: CookingPot, label: 'Kitchen' },
  { icon: Bath, label: 'Bathroom' },
  { icon: Monitor, label: 'Office' },
];

function RoomShowcase() {
  return (
    <section
      className="py-16 sm:py-20"
      style={{ background: '#FAF8F4' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {roomTypes.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer min-w-[130px]"
              style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'rgba(193,127,78,0.12)' }}
              >
                <Icon className="w-7 h-7" style={{ color: '#C17F4E' }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: '#2D2D2D' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
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
  },
  {
    num: 2,
    title: 'Add Furniture',
    description:
      'Browse our library and place items with a click. Drag to reposition, rotate to fit.',
  },
  {
    num: 3,
    title: 'Save & Share',
    description:
      'Save your design and share it with contractors, friends, or keep iterating.',
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

        <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Connecting lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5" style={{ background: '#E2DDD4' }} />

          {steps.map(({ num, title, description }) => (
            <div key={num} className="relative flex flex-col items-center text-center">
              {/* Number circle */}
              <div
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-6"
                style={{ background: '#C17F4E' }}
              >
                {num}
              </div>
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
            </div>
          ))}
        </div>
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
        background: 'linear-gradient(135deg, #F0E8D8 0%, #E8DDD0 50%, #F5F0E8 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
        >
          Ready to Design Your Dream Space?
        </h2>
        <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#8A8478' }}>
          Join thousands of designers and homeowners creating beautiful interiors.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 hover:shadow-xl hover:shadow-[#C17F4E]/20 hover:-translate-y-0.5"
            style={{ background: '#C17F4E' }}
          >
            Get Started for Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
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
              {['Features', 'Pricing', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Pricing' ? '/pricing' : '#'}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
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
              {['Privacy', 'Terms'].map((item) => (
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
export default function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <RoomShowcase />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

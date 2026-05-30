'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sofa, Menu, X } from 'lucide-react';

interface SiteNavProps {
  /** Variant: 'landing' = transparent→white on scroll, 'solid' = always white bg */
  variant?: 'landing' | 'solid';
  /** Show beta badge next to logo */
  showBeta?: boolean;
  /** Custom right-side content (replaces default nav items) */
  rightContent?: React.ReactNode;
}

export default function SiteNav({ variant = 'solid', showBeta = true, rightContent }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const isTransparent = variant === 'landing' && !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md shadow-sm'
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
            {showBeta && (
              <span
                className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
              >
                BETA
              </span>
            )}
          </Link>

          {/* Right content or default nav */}
          {rightContent || (
            <>
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
                  style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/editor"
                  className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
                  style={{ background: '#C17F4E' }}
                >
                  Open Editor
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
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !rightContent && (
        <div className="md:hidden border-t" style={{ borderColor: '#E2DDD4', background: '#FFFFFF' }}>
          <div className="px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm font-medium" style={{ color: '#8A8478' }}>Features</a>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm font-medium" style={{ color: '#8A8478' }}>Pricing</Link>
            <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium" style={{ color: '#8A8478' }}>Sign In</Link>
            <Link href="/editor" onClick={() => setMobileOpen(false)} className="block text-sm font-medium px-4 py-2 rounded-lg text-white text-center" style={{ background: '#C17F4E' }}>Open Editor</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

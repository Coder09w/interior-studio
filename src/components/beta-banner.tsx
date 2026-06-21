'use client';

import { Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * BetaBanner — Shows an "Early Access Beta" banner at the top of the app.
 * Dismissible permanently (stored in localStorage).
 * Only renders when NEXT_PUBLIC_BETA_MODE is 'true'.
 * Hidden on editor pages to avoid stacking with the Guest Mode banner.
 */
export function BetaBanner() {
  const [dismissed, setDismissed] = useState(true); // Start true to avoid flash
  const pathname = usePathname();

  useEffect(() => {
    // Only show if beta mode is enabled and not dismissed
    const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === 'true';
    const wasDismissed = localStorage.getItem('beta-banner-dismissed') === 'true';
    if (isBeta && !wasDismissed) {
      setDismissed(false);
    }
  }, []);

  // Hide on editor pages — the in-editor Guest Mode banner serves this purpose
  if (dismissed || pathname.startsWith('/editor')) return null;

  return (
    <div
      className="relative w-full py-2 px-4 text-center text-sm"
      style={{
        background: 'linear-gradient(90deg, #C17F4E, #A86A3D)',
        color: '#FFFFFF',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-8 sm:pr-0">
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium leading-snug">
          <span className="sm:hidden">Early Access Beta — Premium features free!</span>
          <span className="hidden sm:inline">
            Early Access Beta — All premium features are free!{' '}
            <a href="/pricing" className="underline underline-offset-2 hover:opacity-90">
              Learn more
            </a>
          </span>
        </span>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem('beta-banner-dismissed', 'true');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
        </button>
      </div>
    </div>
  );
}

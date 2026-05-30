'use client';

import { Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * BetaBanner — Shows an "Early Access Beta" banner at the top of the app.
 * Dismissible per session (stored in sessionStorage).
 * Only renders when NEXT_PUBLIC_BETA_MODE is 'true'.
 */
export function BetaBanner() {
  const [dismissed, setDismissed] = useState(true); // Start true to avoid flash

  useEffect(() => {
    // Only show if beta mode is enabled and not dismissed this session
    const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === 'true';
    const wasDismissed = sessionStorage.getItem('beta-banner-dismissed') === 'true';
    if (isBeta && !wasDismissed) {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="relative w-full py-2 px-4 text-center text-sm"
      style={{
        background: 'linear-gradient(90deg, #C17F4E, #A86A3D)',
        color: '#FFFFFF',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">
          Early Access Beta — All premium features are free!{' '}
          <a href="/pricing" className="underline underline-offset-2 hover:opacity-90">
            Learn more
          </a>
        </span>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem('beta-banner-dismissed', 'true');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-80 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cookie, X, ShieldCheck } from 'lucide-react';
import { enablePostHog, disablePostHog } from '@/lib/posthog';

type ConsentState = 'accepted' | 'rejected' | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const stored = localStorage.getItem('instod_cookie_consent') as ConsentState;
    if (stored) {
      setConsent(stored);
    } else {
      // Show banner after a short delay so it doesn't flash on every page
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem('instod_cookie_consent', 'accepted');
    setConsent('accepted');
    setVisible(false);
    enablePostHog();
  }, []);

  const handleReject = useCallback(() => {
    localStorage.setItem('instod_cookie_consent', 'rejected');
    setConsent('rejected');
    setVisible(false);
    disablePostHog();
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-4 duration-500"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-4 mb-4 max-w-3xl mx-auto">
        <div
          className="rounded-2xl border p-5 sm:p-6 shadow-2xl backdrop-blur-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.97)',
            borderColor: '#E2DDD4',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" style={{ color: '#7A6E62' }} />
          </button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}
            >
              <Cookie className="w-5 h-5" style={{ color: '#C17F4E' }} />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-bold mb-1.5"
                style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
              >
                We use cookies to improve your experience
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                We use essential cookies to keep you logged in and save your designs,
                and analytics cookies to understand how people use Instod so we can
                make it better. We never sell your data or use advertising cookies.{' '}
                <Link
                  href="/cookie-policy"
                  className="underline hover:opacity-80 transition-opacity"
                  style={{ color: '#C17F4E' }}
                >
                  Cookie Policy
                </Link>
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#C17F4E' }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Accept all cookies
                </button>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50 active:scale-[0.98]"
                  style={{ color: '#5A4E42', borderColor: '#E2DDD4' }}
                >
                  Essential only
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

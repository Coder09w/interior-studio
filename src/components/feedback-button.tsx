'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * FeedbackButton — A feedback MODAL (no longer a floating button).
 *
 * Per user request:
 *   "remove that feedback floating icon, it's everywhere and annoying.
 *    It should only appear as a feedback form after when the user saves the design etc."
 *
 * So this component now renders NOTHING on screen by default. It listens for a
 * custom DOM event `instod:open-feedback` (dispatched from the editor after a
 * manual save) and shows the feedback form as a centered modal with a backdrop.
 *
 * Trigger from anywhere:
 *   window.dispatchEvent(new CustomEvent('instod:open-feedback'));
 *
 * It also self-throttles: after a successful submission it won't re-open for
 * another 24 hours (per browser, via localStorage) so it never becomes annoying.
 */
const THROTTLE_KEY = 'instod:feedback-last-shown';
const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24h

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Only show in beta mode (kept for parity with previous behavior)
  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === 'true';
  // Still render the listener even outside beta so saves don't dispatch into
  // a void; the modal simply won't open if isBeta is false.
  const canShow = isBeta;

  const openFeedback = useCallback(() => {
    if (!canShow) return;
    // Throttle: don't re-show within 24h after a successful submit
    try {
      const last = Number(localStorage.getItem(THROTTLE_KEY) || '0');
      if (last && Date.now() - last < THROTTLE_MS) return;
    } catch { /* localStorage unavailable — ignore */ }
    setSubmitted(false);
    setMessage('');
    setEmail('');
    setCategory('general');
    setIsOpen(true);
  }, [canShow]);

  // Listen for save-triggered open events
  useEffect(() => {
    function handleOpen() { openFeedback(); }
    window.addEventListener('instod:open-feedback', handleOpen as EventListener);
    return () => window.removeEventListener('instod:open-feedback', handleOpen as EventListener);
  }, [openFeedback]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          page: typeof window !== 'undefined' ? window.location.pathname : '/',
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok || res.status === 201) {
        setSubmitted(true);
        try { localStorage.setItem(THROTTLE_KEY, String(Date.now())); } catch {}
        setMessage('');
        setEmail('');
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 2200);
      }
    } catch {
      console.warn('Feedback submission failed');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        // Click on backdrop (outside panel) closes
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-2xl border-2 shadow-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          borderColor: '#E8DFD4',
          animation: 'instod-feedback-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <style>{`
          @keyframes instod-feedback-in {
            from { opacity: 0; transform: translateY(8px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div
          className="px-5 py-4 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#C17F4E' }}
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="feedback-title" className="font-bold text-sm" style={{ color: '#2D2D2D' }}>
                How was your design session?
              </h3>
              <p className="text-[11px]" style={{ color: '#5A4E42' }}>
                Quick feedback helps us improve Instod
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
            aria-label="Close feedback"
          >
            <X className="w-4 h-4" style={{ color: '#5A4E42' }} />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12" style={{ color: '#6B8E6B' }} />
            <p className="font-semibold text-base" style={{ color: '#2D2D2D' }}>
              Thanks for your feedback!
            </p>
            <p className="text-xs" style={{ color: '#5A4E42' }}>
              Your input helps us build a better product.
            </p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            {/* Category selector */}
            <div className="flex gap-2">
              {([
                { key: 'bug' as const, label: 'Bug' },
                { key: 'feature' as const, label: 'Feature' },
                { key: 'general' as const, label: 'General' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: category === key ? '#C17F4E15' : '#FAF8F4',
                    color: category === key ? '#C17F4E' : '#5A4E42',
                    border: category === key ? '1.5px solid #C17F4E40' : '1.5px solid #E2DDD4',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                category === 'bug'
                  ? 'What went wrong? What did you expect to happen?'
                  : category === 'feature'
                  ? 'What feature would you like to see?'
                  : "What's on your mind?"
              }
              rows={4}
              autoFocus
              className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#E2DDD4',
                color: '#2D2D2D',
                background: '#FAF8F4',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C17F4E';
                e.target.style.boxShadow = '0 0 0 3px rgba(193,127,78,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2DDD4';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Email (optional) */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, for follow-up)"
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: '#E2DDD4',
                color: '#2D2D2D',
                background: '#FAF8F4',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C17F4E';
                e.target.style.boxShadow = '0 0 0 3px rgba(193,127,78,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2DDD4';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Submit + skip */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-black/5"
                style={{ color: '#5A4E42', background: 'transparent', border: '1.5px solid #E2DDD4' }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || isSending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

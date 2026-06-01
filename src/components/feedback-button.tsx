'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * FeedbackButton — A floating feedback button visible during beta.
 * Opens a simple form where users can submit feedback (bug report, feature request, general).
 * Submits to /api/feedback endpoint.
 */
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Only show in beta mode
  const isBeta = process.env.NEXT_PUBLIC_BETA_MODE === 'true';
  if (!isBeta) return null;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok || res.status === 201) {
        setSubmitted(true);
        setMessage('');
        setEmail('');
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 2500);
      }
    } catch {
      // Silently fail — don't disrupt the user
      console.warn('Feedback submission failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="feedback"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
        aria-label="Send feedback"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:animate-pulse" />
        )}
      </button>

      {/* Feedback panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-50 w-[340px] rounded-2xl border-2 shadow-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderColor: '#C17F4E30',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4"
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
                <h3 className="font-bold text-sm" style={{ color: '#2D2D2D' }}>
                  Share Your Feedback
                </h3>
                <p className="text-[11px]" style={{ color: '#5A4E42' }}>
                  Help us improve Interior Studio
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="w-10 h-10" style={{ color: '#6B8E6B' }} />
              <p className="font-semibold text-sm" style={{ color: '#2D2D2D' }}>
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
                    : 'What\'s on your mind?'
                }
                rows={4}
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

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || isSending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </div>
      )}
    </>
  );
}

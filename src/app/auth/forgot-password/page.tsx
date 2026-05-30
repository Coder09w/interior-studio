'use client';

import { useState } from 'react';
import { Sofa, ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-lg border p-8 anim-fade-up"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E2DDD4',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-sm"
            style={{ backgroundColor: '#C17F4E' }}
          >
            <Sofa className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#2D2D2D' }}
          >
            Interior Studio
          </h1>
        </div>

        {!isSubmitted ? (
          <>
            {/* Reset Form */}
            <div className="text-center mb-6">
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: '#2D2D2D' }}
              >
                Reset your password
              </h2>
              <p className="text-sm" style={{ color: '#8A8478' }}>
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm text-center"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" style={{ color: '#2D2D2D' }}>
                  Email
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  style={{ borderColor: '#E2DDD4' }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-white font-medium cursor-pointer"
                style={{ backgroundColor: '#C17F4E' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending link…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <CheckCircle2
                className="w-8 h-8"
                style={{ color: '#22C55E' }}
              />
            </div>
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: '#2D2D2D' }}
            >
              Check your email
            </h2>
            <p className="text-sm mb-1" style={{ color: '#8A8478' }}>
              If an account exists for
            </p>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: '#2D2D2D' }}
            >
              {email}
            </p>
            <p className="text-sm mb-6" style={{ color: '#8A8478' }}>
              you&apos;ll receive a reset link shortly.
            </p>
            <div
              className="rounded-lg p-4 mb-6"
              style={{ backgroundColor: '#FAF8F4' }}
            >
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#C17F4E' }} />
                <p className="text-xs text-left" style={{ color: '#8A8478' }}>
                  If you don&apos;t see the email, check your spam folder. The link will expire in 1 hour.
                </p>
              </div>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div
                className="rounded-lg p-3 mb-4"
                style={{ backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: '1px' }}
              >
                <p className="text-xs text-left" style={{ color: '#92400E' }}>
                  In development, check the server console for the reset link.
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full h-11 cursor-pointer"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Send another link
            </Button>
          </div>
        )}

        {/* Back to Sign In */}
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: '#C17F4E' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

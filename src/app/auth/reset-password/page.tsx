'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sofa, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token found. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setTokenError('No reset token found. Please request a new password reset link.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.toLowerCase().includes('expired') || data.error?.toLowerCase().includes('invalid')) {
          setTokenError(data.error);
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid/missing token state
  if (tokenError) {
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

          {/* Error State */}
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#FEF2F2' }}
            >
              <AlertCircle
                className="w-8 h-8"
                style={{ color: '#DC2626' }}
              />
            </div>
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: '#2D2D2D' }}
            >
              Link expired or invalid
            </h2>
            <p className="text-sm mb-6" style={{ color: '#5A4E42' }}>
              {tokenError}
            </p>
            <Link href="/auth/forgot-password">
              <Button
                className="w-full h-11 text-white font-medium cursor-pointer"
                style={{ backgroundColor: '#C17F4E' }}
              >
                Request new link
              </Button>
            </Link>
          </div>

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

  // Success state
  if (isSuccess) {
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

          {/* Success State */}
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
              Password reset successful
            </h2>
            <p className="text-sm mb-6" style={{ color: '#5A4E42' }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link href="/auth/login">
              <Button
                className="w-full h-11 text-white font-medium cursor-pointer"
                style={{ backgroundColor: '#C17F4E' }}
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
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

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: '#FAF8F4' }}
          >
            <KeyRound className="w-6 h-6" style={{ color: '#C17F4E' }} />
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: '#2D2D2D' }}
          >
            Set new password
          </h2>
          <p className="text-sm" style={{ color: '#5A4E42' }}>
            Choose a strong password for your account
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
            <Label htmlFor="new-password" style={{ color: '#2D2D2D' }}>
              New password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
                style={{ borderColor: '#E2DDD4' }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#5A4E42' }}
                tabIndex={0}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" style={{ color: '#2D2D2D' }}>
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pr-10"
                style={{ borderColor: '#E2DDD4' }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#5A4E42' }}
                tabIndex={0}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password strength hint */}
          {password && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: '#FAF8F4' }}
            >
              <p className="text-xs" style={{ color: '#5A4E42' }}>
                {password.length < 8
                  ? '⚠️ Password must be at least 8 characters'
                  : confirmPassword && password !== confirmPassword
                    ? '⚠️ Passwords do not match'
                    : '✓ Password looks good'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-white font-medium cursor-pointer"
            style={{ backgroundColor: '#C17F4E' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting password…
              </>
            ) : (
              'Reset password'
            )}
          </Button>
        </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#F5F0E8' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#C17F4E' }}
          >
            <Sofa className="w-7 h-7 text-white" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

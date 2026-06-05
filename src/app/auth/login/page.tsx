'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sofa, Eye, EyeOff, Loader2, ArrowLeft, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const fromEditor = callbackUrl.includes('editor') || searchParams.get('from') === 'editor';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#1a1612' }}>
      {/* ===== LEFT SIDE — Interior Image ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/auth-interior.png"
          alt="Beautiful modern living room designed with Instod"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,22,18,0.85) 0%, rgba(26,22,18,0.3) 50%, rgba(26,22,18,0.1) 100%)' }} />

        {/* Back to website */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white transition-colors z-10"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to website
        </Link>

        {/* Branding overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#C17F4E' }}>
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Instod
            </span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Design Your Dream Space
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            Visualize interiors in stunning 3D. Drag furniture, swap materials, and bring your vision to life — all in your browser.
          </p>
        </div>
      </div>

      {/* ===== RIGHT SIDE — Login Form ===== */}
      <div className="w-full lg:w-1/2 flex flex-col" style={{ background: '#F5F0E8' }}>
        {/* Mobile back button */}
        <div className="lg:hidden p-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: '#5A4E42' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
        </div>

        {/* Form container — centered */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#C17F4E' }}>
                <Sofa className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Instod</h1>
            </div>

            {/* Header */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Welcome back
            </h2>
            <p className="text-sm mb-8" style={{ color: '#5A4E42' }}>
              Sign in to access your designs and saved rooms
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                {error}
              </div>
            )}

            {/* Social Login — Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors mb-4"
              style={{ borderColor: '#E2DDD4', background: '#FFFFFF', color: '#2D2D2D' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: '#E2DDD4' }} />
              <span className="text-xs" style={{ color: '#5A4E42' }}>or sign in with email</span>
              <div className="flex-1 h-px" style={{ background: '#E2DDD4' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  style={{ borderColor: '#E2DDD4', background: '#FFFFFF' }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label htmlFor="password" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Password</label>
                  {/* Forgot password hidden during beta — no SMTP configured */}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    style={{ borderColor: '#E2DDD4', background: '#FFFFFF' }}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: '#5A4E42' }}
                    tabIndex={0}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-white font-semibold cursor-pointer rounded-lg"
                style={{ backgroundColor: '#C17F4E' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm mt-6" style={{ color: '#5A4E42' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: '#C17F4E' }}>
                Sign up free
              </Link>
            </p>

            {/* Continue as Guest */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E2DDD4' }}>
              <Link
                href="/editor"
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors hover:opacity-90"
                style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FFFFFF' }}
              >
                <Home className="w-4 h-4" />
                Continue as guest
              </Link>
              <p className="text-[10px] text-center mt-2" style={{ color: '#5A4E42' }}>
                Limited features — sign up for all 30+ furniture items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

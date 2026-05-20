'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sofa, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
          <p className="text-sm mt-1" style={{ color: '#8A8478' }}>
            Sign in to your account
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              style={{ color: '#2D2D2D' }}
            >
              Email
            </Label>
            <Input
              id="email"
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

          <div className="space-y-2">
            <Label
              htmlFor="password"
              style={{ color: '#2D2D2D' }}
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
                style={{ borderColor: '#E2DDD4' }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#8A8478' }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMe(checked === true)
                }
                className="cursor-pointer"
                style={{
                  borderColor: '#E2DDD4',
                }}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
                style={{ color: '#8A8478' }}
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium hover:underline"
              style={{ color: '#C17F4E' }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-white font-medium cursor-pointer"
            style={{ backgroundColor: '#C17F4E' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: '#8A8478' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium hover:underline"
            style={{ color: '#C17F4E' }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

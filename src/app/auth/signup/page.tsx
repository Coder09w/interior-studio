'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, ArrowLeft, Home, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push('/auth/login');
        return;
      }

      router.push('/onboarding');
      router.refresh();
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/onboarding' });
  };

  // Password strength indicators
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#1a1612' }}>
      {/* ===== LEFT SIDE — Interior Image (Desktop) ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/auth-bedroom.png"
          alt="Beautiful bedroom interior designed with Instod"
          fill
          className="object-cover"
          priority
        />
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

        {/* Benefits list */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <div className="flex items-center gap-2.5 mb-5">
            <Image src="/logo.svg" alt="Instod" width={36} height={36} className="rounded-lg" />
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Instod
            </span>
            <span
              className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              BETA
            </span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Unlock Your Full Design Potential
          </h2>
          <div className="space-y-3">
            {[
              'Unlimited furniture & room designs',
              'Save and manage multiple projects',
              'All material skins & design presets',
              'Revision snapshots & export tools',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(107,139,94,0.2)' }}>
                  <Check className="w-3 h-3" style={{ color: '#6B8B5E' }} />
                </div>
                <span className="text-white/80 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MOBILE HERO — Image header for mobile ===== */}
      <div className="lg:hidden relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
        <Image
          src="/images/auth-bedroom.png"
          alt="Beautiful bedroom interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,22,18,0.95) 0%, rgba(26,22,18,0.4) 60%, rgba(26,22,18,0.2) 100%)' }} />
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/logo.svg" alt="Instod" width={28} height={28} className="rounded-lg" />
            <span className="text-white font-bold text-base tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Instod</span>
            <span className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>BETA</span>
          </div>
          <h2 className="text-white text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Unlock Your Full Design Potential</h2>
          <p className="text-white/60 text-xs leading-relaxed mb-2">Sign up free — no credit card required</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {['Unlimited furniture', 'Save projects', 'Free during beta'].map((benefit) => (
              <span key={benefit} className="text-white/70 text-[10px] flex items-center gap-1">
                <Check className="w-2.5 h-2.5" style={{ color: '#6B8B5E' }} />
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE — Signup Form ===== */}
      <div className="w-full lg:w-1/2 flex flex-col flex-1" style={{ background: '#F5F0E8' }}>
        {/* Desktop back button */}
        <div className="hidden lg:block p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: '#5A4E42' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to website
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Header */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Create an account
            </h2>
            <p className="text-sm mb-2" style={{ color: '#5A4E42' }}>
              Start designing your dream space for free
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
              {['Free during beta', 'No credit card', '30+ furniture items'].map((benefit) => (
                <span key={benefit} className="text-xs flex items-center gap-1" style={{ color: '#6B8B5E' }}>
                  <Check className="w-3 h-3" />
                  {benefit}
                </span>
              ))}
            </div>

            {/* Error */}
            {errors.general && (
              <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                {errors.general}
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
              <span className="text-xs" style={{ color: '#5A4E42' }}>or sign up with email</span>
              <div className="flex-1 h-px" style={{ background: '#E2DDD4' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Full Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                  className="h-11"
                  style={{ borderColor: errors.name ? '#DC2626' : '#E2DDD4', background: '#FFFFFF' }}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.name && <p className="text-xs" style={{ color: '#DC2626' }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Email</label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  className="h-11"
                  style={{ borderColor: errors.email ? '#DC2626' : '#E2DDD4', background: '#FFFFFF' }}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs" style={{ color: '#DC2626' }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Password</label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                    className="h-11 pr-10"
                    style={{ borderColor: errors.password ? '#DC2626' : '#E2DDD4', background: '#FFFFFF' }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: '#5A4E42' }} tabIndex={0} aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs" style={{ color: '#DC2626' }}>{errors.password}</p>
                ) : password.length > 0 ? (
                  <div className="flex gap-3 mt-1">
                    <span className={`text-[10px] flex items-center gap-0.5 ${hasLength ? 'text-green-600' : 'text-gray-400'}`}><Check className="w-3 h-3" />8+ chars</span>
                    <span className={`text-[10px] flex items-center gap-0.5 ${hasUpper ? 'text-green-600' : 'text-gray-400'}`}><Check className="w-3 h-3" />Uppercase</span>
                    <span className={`text-[10px] flex items-center gap-0.5 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}><Check className="w-3 h-3" />Number</span>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: '#5A4E42' }}>Must be at least 8 characters</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium" style={{ color: '#2D2D2D' }}>Confirm Password</label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                    className="h-11 pr-10"
                    style={{ borderColor: errors.confirmPassword ? '#DC2626' : '#E2DDD4', background: '#FFFFFF' }}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: '#5A4E42' }} tabIndex={0} aria-label="Toggle confirm password visibility">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs" style={{ color: '#DC2626' }}>{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className="w-4 h-4 mt-0.5 rounded border flex items-center justify-center cursor-pointer flex-shrink-0"
                  style={{ borderColor: agreedToTerms ? '#C17F4E' : '#E2DDD4', background: agreedToTerms ? '#C17F4E' : '#FFFFFF' }}
                  aria-label="Agree to terms and conditions"
                >
                  {agreedToTerms && <Check className="w-3 h-3 text-white" />}
                </button>
                <p className="text-xs" style={{ color: '#5A4E42' }}>
                  I agree to the{' '}
                  <Link href="/terms" className="underline" style={{ color: '#C17F4E' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline" style={{ color: '#C17F4E' }}>Privacy Policy</Link>
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-white font-semibold cursor-pointer rounded-lg"
                style={{ backgroundColor: '#C17F4E' }}
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm mt-5" style={{ color: '#5A4E42' }}>
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#C17F4E' }}>
                Sign in
              </Link>
            </p>

            {/* Continue as Guest */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E2DDD4' }}>
              <Link
                href="/editor"
                prefetch={false}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors hover:opacity-90"
                style={{ borderColor: '#E2DDD4', color: '#5A4E42', background: '#FFFFFF' }}
              >
                <Home className="w-4 h-4" />
                Continue as guest
              </Link>
              <p className="text-[10px] text-center mt-2" style={{ color: '#5A4E42' }}>
                Designs won&apos;t be saved without an account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

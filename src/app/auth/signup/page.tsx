'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sofa, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

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
  const [referralSource, setReferralSource] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
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
        // Registration succeeded but auto sign-in failed, redirect to login
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
        <div className="flex flex-col items-center mb-6">
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
            Create your account
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          >
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" style={{ color: '#2D2D2D' }}>
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="h-11"
              style={{ borderColor: errors.name ? '#DC2626' : '#E2DDD4' }}
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="signup-email" style={{ color: '#2D2D2D' }}>
              Email
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="h-11"
              style={{ borderColor: errors.email ? '#DC2626' : '#E2DDD4' }}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="signup-password" style={{ color: '#2D2D2D' }}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="h-11 pr-10"
                style={{ borderColor: errors.password ? '#DC2626' : '#E2DDD4' }}
                disabled={isLoading}
                autoComplete="new-password"
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
            {errors.password ? (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {errors.password}
              </p>
            ) : (
              <p className="text-xs" style={{ color: '#8A8478' }}>
                Must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" style={{ color: '#2D2D2D' }}>
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className="h-11 pr-10"
                style={{ borderColor: errors.confirmPassword ? '#DC2626' : '#E2DDD4' }}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: '#8A8478' }}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs" style={{ color: '#DC2626' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Referral Source */}
          <div className="space-y-2">
            <Label style={{ color: '#2D2D2D' }}>
              How did you hear about us? <span style={{ color: '#8A8478', fontWeight: 400 }}>(optional)</span>
            </Label>
            <Select value={referralSource} onValueChange={setReferralSource}>
              <SelectTrigger
                className="w-full h-11"
                style={{ borderColor: '#E2DDD4', color: referralSource ? '#2D2D2D' : '#8A8478' }}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-search">Google Search</SelectItem>
                <SelectItem value="product-hunt">Product Hunt</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="designer-friend">Designer Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: '#8A8478' }}
        >
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium hover:underline"
            style={{ color: '#C17F4E' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

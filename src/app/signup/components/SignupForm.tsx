/**
 * Signup Form Component
 * Handles new account creation
 * Based on Pencil design: Signup Page > signupForm
 */

'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred');
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-8">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--success-tint)]">
          <span className="icon-lucide text-2xl text-[var(--success)]">
            check
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium text-white">Check your email</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            We sent a confirmation link to{' '}
            <span className="text-white font-medium">{email}</span>
            <br />
            Click the link to verify your account.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-5">
      {error && (
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--error-tint)] text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-medium text-[var(--text-tertiary)]"
        >
          Email
        </label>
        <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3.5 focus-within:border-[var(--accent)] transition-colors">
          <span className="icon-lucide text-lg text-[var(--text-muted)]">
            mail
          </span>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-medium text-[var(--text-tertiary)]"
        >
          Password
        </label>
        <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3.5 focus-within:border-[var(--accent)] transition-colors">
          <span className="icon-lucide text-lg text-[var(--text-muted)]">
            lock
          </span>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
          />
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirm-password"
          className="text-xs font-medium text-[var(--text-tertiary)]"
        >
          Confirm Password
        </label>
        <div className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3.5 focus-within:border-[var(--accent)] transition-colors">
          <span className="icon-lucide text-lg text-[var(--text-muted)]">
            lock
          </span>
          <input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
          />
        </div>
      </div>

      {/* Terms Checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 w-[18px] h-[18px] rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] accent-[var(--accent)]"
        />
        <span className="text-sm text-[var(--text-secondary)] leading-snug">
          I agree to the{' '}
          <Link
            href="/terms"
            className="text-[var(--accent)] hover:underline"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-[var(--accent)] hover:underline"
          >
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="gradient-accent flex items-center justify-center py-3.5 rounded-[var(--radius-md)] text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}

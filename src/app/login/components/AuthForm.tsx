/**
 * Authentication Form Component
 * Handles email/password and magic link sign in
 * Based on Pencil design: Login Page > loginForm
 */

'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  type: 'error' | 'success';
  text: string;
}

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({
            type: 'success',
            text: 'Check your email for the login link!',
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
      {message && (
        <div
          className={`p-4 rounded-[var(--radius-md)] text-sm ${
            message.type === 'error'
              ? 'bg-[var(--error-tint)] text-[var(--error)]'
              : 'bg-[var(--success-tint)] text-[var(--success)]'
          }`}
        >
          {message.text}
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
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
          />
        </div>
      </div>

      {/* Password Field */}
      {!isMagicLink && (
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
              name="password"
              type="password"
              autoComplete="current-password"
              required={!isMagicLink}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] outline-none"
            />
          </div>
        </div>
      )}

      {/* Remember & Forgot */}
      {!isMagicLink && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] accent-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      )}

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
          'Sign In'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        <span className="text-xs text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>

      {/* Magic Link Button */}
      <button
        type="button"
        onClick={() => {
          setIsMagicLink(true);
          if (email) {
            handleEmailLogin({ preventDefault: () => {} } as React.FormEvent);
          }
        }}
        className="flex items-center justify-center gap-2.5 py-3.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm font-medium text-white hover:bg-[var(--bg-interactive)] transition-colors"
      >
        <span className="icon-lucide text-lg text-[var(--text-tertiary)]">
          mail
        </span>
        Send Magic Link
      </button>

      {/* Sign Up Link */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <span className="text-sm text-[var(--text-muted)]">
          Don't have an account?
        </span>
        <Link
          href="/signup"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}

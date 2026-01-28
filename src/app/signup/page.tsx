/**
 * Signup Page
 * User registration with email/password
 * Based on Pencil design: Signup Page
 */

import Link from 'next/link';
import { Logo } from '@/components';
import { SignupForm } from './components/SignupForm';

export const metadata = {
  title: 'Create Account | HealthTrack',
};

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-between bg-[var(--bg-surface)] px-20 py-15">
        <Logo />

        <div className="flex flex-col gap-8 w-[400px]">
          <div className="flex flex-col gap-3">
            <h1 className="font-display-serif text-4xl text-white tracking-tight">
              Create account
            </h1>
            <p className="text-[15px] text-[var(--text-tertiary)] leading-relaxed">
              Start tracking your health metrics and optimize your performance.
            </p>
          </div>

          <SignupForm />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sm text-[var(--text-muted)]">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="w-[560px] bg-[var(--bg-page)] p-10 flex items-center justify-center">
        <div
          className="
            w-full h-full
            rounded-3xl
            p-10
            flex flex-col gap-8
            border border-[var(--border-subtle)]
          "
          style={{
            background:
              'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, #0A0A0B 100%)',
          }}
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-display-serif text-3xl text-white leading-tight tracking-tight max-w-[320px]">
              Join thousands of
              <br />
              athletes worldwide
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[350px]">
              Start your health optimization journey today.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <FeatureItem
              icon="activity"
              title="Real-time Tracking"
              description="Monitor your metrics as they happen"
            />
            <FeatureItem
              icon="bar-chart-2"
              title="Smart Analytics"
              description="AI-powered insights and recommendations"
            />
            <FeatureItem
              icon="shield-check"
              title="Secure & Private"
              description="Your health data is always encrypted"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[var(--accent-tint)]">
        <span className="icon-lucide text-xl text-[var(--accent)]">{icon}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="text-xs text-[var(--text-muted)]">{description}</span>
      </div>
    </div>
  );
}

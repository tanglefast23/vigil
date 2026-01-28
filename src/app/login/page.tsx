/**
 * Login Page
 * Email/password and magic link authentication
 * Based on Pencil design: Login Page
 */

import Link from 'next/link';
import { Logo } from '@/components';
import { AuthForm } from './components/AuthForm';

export const metadata = {
  title: 'Sign In | HealthTrack',
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-between bg-[var(--bg-surface)] px-20 py-15">
        <Logo />

        <div className="flex flex-col gap-8 w-[400px]">
          <div className="flex flex-col gap-3">
            <h1 className="font-display-serif text-4xl text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-[15px] text-[var(--text-tertiary)] leading-relaxed">
              Sign in to your account to continue tracking your health metrics.
            </p>
          </div>

          <AuthForm />
        </div>

        <div />
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
              'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, #0A0A0B 100%)',
          }}
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-display-serif text-3xl text-white leading-tight tracking-tight max-w-[300px]">
              Health insights
              <br />
              at your fingertips
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[350px]">
              Track recovery, workouts, and sleep to optimize your performance.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <VisualStatCard
              icon="heart-pulse"
              iconBg="#22C55E20"
              iconColor="var(--success)"
              label="Recovery Score"
              value="87%"
            />
            <VisualStatCard
              icon="moon"
              iconBg="#6366F120"
              iconColor="var(--purple)"
              label="Sleep Quality"
              value="92%"
            />
            <VisualStatCard
              icon="flame"
              iconBg="#F59E0B20"
              iconColor="var(--warning)"
              label="Daily Strain"
              value="14.2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualStatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div
        className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-lg)]"
        style={{ backgroundColor: iconBg }}
      >
        <span className="icon-lucide text-2xl" style={{ color: iconColor }}>
          {icon}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        <span className="font-mono text-xl font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

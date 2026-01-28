/**
 * Landing Page
 * Marketing page with hero, features, and CTA
 * Based on Pencil design: 1. Landing Page
 */

import Link from 'next/link';
import { Logo, FeatureCard, Button } from '@/components';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between h-20 px-15 border-b border-[var(--border-subtle)]">
        <Logo />

        <div className="flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="gradient-accent px-5 py-3 rounded-[var(--radius-md)] text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center gap-12 py-24 px-15">
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/25">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--accent)]">
            Now with Whoop Integration
          </span>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-center gap-6 max-w-[800px]">
          <h1 className="font-display-serif text-6xl text-white text-center tracking-tight leading-[1.1]">
            Track Your Health,
            <br />
            Optimize Your Life
          </h1>
          <p className="text-lg text-[var(--text-tertiary)] text-center leading-relaxed max-w-[600px]">
            Monitor recovery, workouts, and sleep patterns with beautiful analytics.
            Make data-driven decisions to perform at your best.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="gradient-accent flex items-center gap-2.5 px-8 py-4 rounded-[var(--radius-lg)] text-base font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Start Free Trial
            <span className="icon-lucide text-xl">arrow-right</span>
          </Link>
          <button className="flex items-center gap-2.5 px-8 py-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] text-base font-medium text-white hover:bg-[var(--bg-interactive)] transition-colors">
            <span className="icon-lucide text-xl text-[var(--text-tertiary)]">
              play-circle
            </span>
            Watch Demo
          </button>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="flex justify-center px-15 pb-20">
        <div
          className="
            w-full max-w-[1000px]
            bg-[var(--bg-surface)]
            border border-[var(--border-subtle)]
            rounded-[var(--radius-xl)]
            overflow-hidden
            shadow-[0_20px_80px_-10px_rgba(16,185,129,0.2)]
          "
        >
          {/* Browser Header */}
          <div className="flex items-center gap-2 h-12 px-5 border-b border-[var(--border-subtle)]">
            <span className="w-3 h-3 rounded-full bg-[var(--error)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--warning)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--success)]" />
          </div>

          {/* Preview Content */}
          <div className="flex h-[512px]">
            {/* Sidebar Preview */}
            <div className="w-[200px] bg-[#0F0F10] border-r border-[var(--border-subtle)] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
                <span className="w-4 h-4 rounded bg-[var(--accent)]" />
                <span className="text-xs font-medium text-white">Dashboard</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)]">
                <span className="w-4 h-4 rounded bg-[var(--border-default)]" />
                <span className="text-xs text-[var(--text-tertiary)]">Workouts</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)]">
                <span className="w-4 h-4 rounded bg-[var(--border-default)]" />
                <span className="text-xs text-[var(--text-tertiary)]">Sleep</span>
              </div>
            </div>

            {/* Main Content Preview */}
            <div className="flex-1 p-6 flex flex-col gap-5">
              {/* Stats Row */}
              <div className="flex gap-4">
                <PreviewStatCard label="RECOVERY" value="87%" color="var(--success)" />
                <PreviewStatCard label="STRAIN" value="12.4" color="var(--warning)" />
                <PreviewStatCard label="SLEEP" value="7.5h" color="var(--accent-blue)" />
              </div>

              {/* Chart Preview */}
              <div className="flex-1 bg-[var(--bg-elevated)] rounded-[10px] p-5 flex flex-col gap-4">
                <span className="text-sm font-medium text-white">Recovery Trend</span>
                <div className="flex-1 flex items-end gap-2">
                  {[65, 72, 68, 85, 78, 92, 87].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--accent)] to-[var(--accent-light)]"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="flex flex-col items-center gap-12 py-20 px-15">
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <h2 className="font-display-serif text-4xl text-white text-center tracking-tight">
            Everything You Need
          </h2>
          <p className="text-base text-[var(--text-tertiary)] text-center">
            Comprehensive health tracking with powerful insights
          </p>
        </div>

        <div className="flex gap-6 w-full max-w-[1200px]">
          <FeatureCard
            icon="heart-pulse"
            title="Recovery Tracking"
            description="Monitor your daily recovery score and HRV trends to know when to push hard and when to rest."
          />
          <FeatureCard
            icon="moon"
            title="Sleep Analysis"
            description="Track sleep stages, duration, and consistency to optimize your nightly recovery."
            iconColor="var(--accent-blue)"
            iconBgColor="var(--accent-secondary-tint)"
          />
          <FeatureCard
            icon="flame"
            title="Strain Monitoring"
            description="Measure workout intensity and daily strain to balance training with recovery."
            iconColor="var(--warning)"
            iconBgColor="var(--warning-tint)"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center gap-8 py-20 px-15 bg-[var(--bg-surface)]">
        <div className="flex flex-col items-center gap-6 max-w-[600px]">
          <h2 className="font-display-serif text-4xl text-white text-center tracking-tight">
            Ready to optimize your health?
          </h2>
          <p className="text-base text-[var(--text-tertiary)] text-center">
            Join thousands of athletes tracking their recovery and performance.
          </p>
        </div>

        <Link
          href="/signup"
          className="gradient-accent flex items-center gap-2.5 px-10 py-4 rounded-[var(--radius-lg)] text-base font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Get Started Free
          <span className="icon-lucide text-xl">arrow-right</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between h-20 px-15 border-t border-[var(--border-subtle)]">
        <Logo size="sm" />
        <span className="text-sm text-[var(--text-muted)]">
          © 2025 HealthTrack. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-[var(--text-tertiary)] hover:text-white transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-[var(--text-tertiary)] hover:text-white transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="text-sm text-[var(--text-tertiary)] hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}

function PreviewStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex-1 bg-[var(--bg-elevated)] rounded-[10px] p-4 flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {label}
      </span>
      <span className="font-mono text-2xl font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

/**
 * Sleep Page
 * Displays sleep data with trends and detailed breakdowns
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { getSleepData, getLatestSleep } from '@/lib/data';
import { format, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function SleepPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [sleepData, latestSleep] = await Promise.all([
    getSleepData(user.id, 30),
    getLatestSleep(user.id),
  ]);

  // Calculate stats
  const avgSleepMins = sleepData.length > 0
    ? Math.round(sleepData.reduce((sum, s) => sum + (s.total_sleep_minutes || 0), 0) / sleepData.length)
    : 0;
  const avgSleepHours = (avgSleepMins / 60).toFixed(1);

  const avgScore = sleepData.length > 0
    ? Math.round(sleepData.reduce((sum, s) => sum + (s.sleep_score || 0), 0) / sleepData.filter(s => s.sleep_score).length)
    : 0;

  const avgEfficiency = sleepData.length > 0
    ? Math.round(sleepData.reduce((sum, s) => sum + (s.sleep_efficiency || 0), 0) / sleepData.filter(s => s.sleep_efficiency).length)
    : 0;

  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      <DashboardSidebar
        userName={user.user_metadata?.full_name || user.email?.split('@')[0]}
        userEmail={user.email}
      />

      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-7 p-8 px-10">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display-serif text-3xl text-white tracking-tight">
              Sleep
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Monitor your sleep patterns and quality
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="LAST NIGHT"
              value={latestSleep ? `${(latestSleep.total_sleep_minutes / 60).toFixed(1)}h` : '--'}
              color="var(--purple)"
              subtitle={latestSleep ? `Score: ${latestSleep.sleep_score || '--'}%` : undefined}
            />
            <StatCard
              label="AVG SLEEP"
              value={`${avgSleepHours}h`}
              subtitle="Last 30 days"
            />
            <StatCard
              label="AVG SCORE"
              value={avgScore ? `${avgScore}%` : '--'}
              color="var(--accent)"
              subtitle="Last 30 days"
            />
            <StatCard
              label="EFFICIENCY"
              value={avgEfficiency ? `${avgEfficiency}%` : '--'}
              color="var(--accent-blue)"
              subtitle="Time asleep vs in bed"
            />
          </div>

          {/* Latest Sleep Breakdown */}
          {latestSleep && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">
                  Last Night&apos;s Sleep
                </h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {format(parseISO(latestSleep.started_at), 'EEEE, MMM d')}
                </span>
              </div>

              {/* Sleep Stages */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <SleepStageCard
                  label="Deep Sleep"
                  minutes={latestSleep.deep_minutes}
                  color="var(--accent-blue)"
                  icon="moon"
                />
                <SleepStageCard
                  label="REM"
                  minutes={latestSleep.rem_minutes}
                  color="var(--purple)"
                  icon="brain"
                />
                <SleepStageCard
                  label="Light Sleep"
                  minutes={latestSleep.light_minutes}
                  color="var(--accent)"
                  icon="cloud"
                />
                <SleepStageCard
                  label="Awake"
                  minutes={latestSleep.awake_minutes}
                  color="var(--text-muted)"
                  icon="sun"
                />
              </div>

              {/* Sleep Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Sleep Composition</span>
                  <span>{(latestSleep.total_sleep_minutes / 60).toFixed(1)}h total</span>
                </div>
                <SleepBar sleep={latestSleep} />
              </div>
            </div>
          )}

          {/* Sleep History */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-base font-semibold text-white">
                Sleep History
              </h2>
            </div>

            {sleepData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                  <span className="icon-lucide text-3xl text-[var(--text-muted)]">
                    moon
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No sleep data yet
                </h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Sync your Whoop to track your sleep patterns.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {sleepData.slice().reverse().map((sleep) => (
                  <SleepRow key={sleep.id} sleep={sleep} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface Sleep {
  id: string;
  started_at: string;
  ended_at: string;
  total_sleep_minutes: number;
  rem_minutes: number | null;
  deep_minutes: number | null;
  light_minutes: number | null;
  awake_minutes: number | null;
  sleep_score: number | null;
  sleep_efficiency: number | null;
  respiratory_rate: number | null;
}

function SleepRow({ sleep }: { sleep: Sleep }) {
  const hours = (sleep.total_sleep_minutes / 60).toFixed(1);

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--purple-tint)] flex items-center justify-center">
          <span className="icon-lucide text-xl text-[var(--purple)]">moon</span>
        </div>
        <div>
          <h4 className="font-medium text-white">
            {format(parseISO(sleep.started_at), 'EEEE')}
          </h4>
          <p className="text-sm text-[var(--text-tertiary)]">
            {format(parseISO(sleep.started_at), 'MMM d')} •{' '}
            {format(parseISO(sleep.started_at), 'h:mm a')} -{' '}
            {format(parseISO(sleep.ended_at), 'h:mm a')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <MetricCell label="Duration" value={`${hours}h`} color="var(--purple)" />
        <MetricCell
          label="Score"
          value={sleep.sleep_score ? `${sleep.sleep_score}%` : '--'}
          color="var(--accent)"
        />
        <MetricCell
          label="Efficiency"
          value={sleep.sleep_efficiency ? `${sleep.sleep_efficiency}%` : '--'}
        />
        <MetricCell
          label="Deep"
          value={sleep.deep_minutes ? `${sleep.deep_minutes}m` : '--'}
          color="var(--accent-blue)"
        />
      </div>
    </div>
  );
}

function SleepStageCard({
  label,
  minutes,
  color,
  icon,
}: {
  label: string;
  minutes: number | null;
  color: string;
  icon: string;
}) {
  const hours = minutes ? (minutes / 60).toFixed(1) : '--';

  return (
    <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="icon-lucide text-sm" style={{ color }}>
          {icon}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="font-mono text-2xl font-medium" style={{ color }}>
        {hours}h
      </p>
      {minutes && (
        <p className="text-xs text-[var(--text-tertiary)]">{minutes} min</p>
      )}
    </div>
  );
}

function SleepBar({ sleep }: { sleep: Sleep }) {
  const total = sleep.total_sleep_minutes + (sleep.awake_minutes || 0);
  if (total === 0) return null;

  const deepPct = ((sleep.deep_minutes || 0) / total) * 100;
  const remPct = ((sleep.rem_minutes || 0) / total) * 100;
  const lightPct = ((sleep.light_minutes || 0) / total) * 100;
  const awakePct = ((sleep.awake_minutes || 0) / total) * 100;

  return (
    <div className="flex h-3 rounded-full overflow-hidden">
      <div
        className="bg-[var(--accent-blue)]"
        style={{ width: `${deepPct}%` }}
        title={`Deep: ${sleep.deep_minutes || 0}m`}
      />
      <div
        className="bg-[var(--purple)]"
        style={{ width: `${remPct}%` }}
        title={`REM: ${sleep.rem_minutes || 0}m`}
      />
      <div
        className="bg-[var(--accent)]"
        style={{ width: `${lightPct}%` }}
        title={`Light: ${sleep.light_minutes || 0}m`}
      />
      <div
        className="bg-[var(--bg-elevated)]"
        style={{ width: `${awakePct}%` }}
        title={`Awake: ${sleep.awake_minutes || 0}m`}
      />
    </div>
  );
}

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-right min-w-[60px]">
      <p
        className="font-mono text-lg font-medium"
        style={{ color: color || 'var(--text-primary)' }}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {label}
      </span>
      <span
        className="font-mono text-3xl font-medium tracking-tight"
        style={{ color: color || 'var(--text-primary)' }}
      >
        {value}
      </span>
      {subtitle && (
        <span className="text-xs text-[var(--text-tertiary)]">{subtitle}</span>
      )}
    </div>
  );
}

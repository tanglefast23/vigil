/**
 * Recovery Page
 * Displays recovery scores, HRV trends, and detailed metrics
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { RecoveryChart } from '../components/RecoveryChart';
import { getRecoveryData, getLatestRecovery } from '@/lib/data';
import { format, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function RecoveryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [recoveryData, latestRecovery] = await Promise.all([
    getRecoveryData(user.id, 30),
    getLatestRecovery(user.id),
  ]);

  // Calculate stats
  const avgRecovery = recoveryData.length > 0
    ? Math.round(recoveryData.reduce((sum, r) => sum + (r.recovery_score || 0), 0) / recoveryData.length)
    : 0;

  const avgHRV = recoveryData.length > 0
    ? Math.round(recoveryData.reduce((sum, r) => sum + (r.hrv_rmssd || 0), 0) / recoveryData.filter(r => r.hrv_rmssd).length)
    : 0;

  const avgRHR = recoveryData.length > 0
    ? Math.round(recoveryData.reduce((sum, r) => sum + (r.resting_heart_rate || 0), 0) / recoveryData.filter(r => r.resting_heart_rate).length)
    : 0;

  // Count recovery levels
  const highRecoveryDays = recoveryData.filter(r => r.recovery_score >= 67).length;
  const medRecoveryDays = recoveryData.filter(r => r.recovery_score >= 34 && r.recovery_score < 67).length;
  const lowRecoveryDays = recoveryData.filter(r => r.recovery_score < 34).length;

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
              Recovery
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Track your body&apos;s readiness and recovery metrics
            </p>
          </div>

          {/* Today's Recovery Card */}
          {latestRecovery && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">
                  Today&apos;s Recovery
                </h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {format(parseISO(latestRecovery.recorded_at), 'EEEE, MMM d')}
                </span>
              </div>

              <div className="flex items-center gap-12">
                {/* Recovery Score Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center border-4"
                    style={{
                      borderColor: getRecoveryColor(latestRecovery.recovery_score),
                      backgroundColor: `${getRecoveryColor(latestRecovery.recovery_score)}15`,
                    }}
                  >
                    <div className="text-center">
                      <span
                        className="font-mono text-4xl font-bold"
                        style={{ color: getRecoveryColor(latestRecovery.recovery_score) }}
                      >
                        {latestRecovery.recovery_score}
                      </span>
                      <span className="text-lg text-[var(--text-muted)]">%</span>
                    </div>
                  </div>
                  <span
                    className="mt-3 text-sm font-medium"
                    style={{ color: getRecoveryColor(latestRecovery.recovery_score) }}
                  >
                    {getRecoveryLabel(latestRecovery.recovery_score)}
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex-1 grid grid-cols-3 gap-6">
                  <MetricCard
                    icon="heart-pulse"
                    label="HRV"
                    value={latestRecovery.hrv_rmssd ? `${latestRecovery.hrv_rmssd}ms` : '--'}
                    color="var(--accent)"
                    description="Heart Rate Variability"
                  />
                  <MetricCard
                    icon="heart"
                    label="Resting HR"
                    value={latestRecovery.resting_heart_rate ? `${latestRecovery.resting_heart_rate} bpm` : '--'}
                    color="var(--error)"
                    description="Resting Heart Rate"
                  />
                  <MetricCard
                    icon="droplets"
                    label="SpO2"
                    value={latestRecovery.spo2 ? `${latestRecovery.spo2}%` : '--'}
                    color="var(--accent-blue)"
                    description="Blood Oxygen"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="AVG RECOVERY"
              value={avgRecovery ? `${avgRecovery}%` : '--'}
              color={getRecoveryColor(avgRecovery)}
              subtitle="Last 30 days"
            />
            <StatCard
              label="AVG HRV"
              value={avgHRV ? `${avgHRV}ms` : '--'}
              color="var(--accent)"
              subtitle="Last 30 days"
            />
            <StatCard
              label="AVG RHR"
              value={avgRHR ? `${avgRHR} bpm` : '--'}
              color="var(--error)"
              subtitle="Last 30 days"
            />
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                RECOVERY DISTRIBUTION
              </span>
              <div className="flex items-center gap-4 mt-2">
                <RecoveryBadge color="var(--recovery-high)" count={highRecoveryDays} label="High" />
                <RecoveryBadge color="var(--recovery-medium)" count={medRecoveryDays} label="Med" />
                <RecoveryBadge color="var(--recovery-low)" count={lowRecoveryDays} label="Low" />
              </div>
            </div>
          </div>

          {/* Recovery Trend Chart */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">
                Recovery Trend
              </h2>
              <span className="text-sm text-[var(--text-tertiary)]">
                Last 30 days
              </span>
            </div>
            <div className="h-72">
              <RecoveryChart data={recoveryData} />
            </div>
          </div>

          {/* Recovery History */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-base font-semibold text-white">
                Recovery History
              </h2>
            </div>

            {recoveryData.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                  <span className="icon-lucide text-3xl text-[var(--text-muted)]">
                    heart-pulse
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No recovery data yet
                </h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Sync your Whoop to track your recovery.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {recoveryData.slice().reverse().map((recovery) => (
                  <RecoveryRow key={recovery.id} recovery={recovery} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface Recovery {
  id: string;
  recorded_at: string;
  recovery_score: number;
  hrv_rmssd: number | null;
  resting_heart_rate: number | null;
  spo2: number | null;
  skin_temp_celsius: number | null;
}

function RecoveryRow({ recovery }: { recovery: Recovery }) {
  const color = getRecoveryColor(recovery.recovery_score);

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-elevated)] transition-colors">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span
            className="font-mono text-lg font-bold"
            style={{ color }}
          >
            {recovery.recovery_score}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-white">
            {format(parseISO(recovery.recorded_at), 'EEEE')}
          </h4>
          <p className="text-sm text-[var(--text-tertiary)]">
            {format(parseISO(recovery.recorded_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <MetricCell
          label="Recovery"
          value={`${recovery.recovery_score}%`}
          color={color}
        />
        <MetricCell
          label="HRV"
          value={recovery.hrv_rmssd ? `${recovery.hrv_rmssd}ms` : '--'}
          color="var(--accent)"
        />
        <MetricCell
          label="RHR"
          value={recovery.resting_heart_rate ? `${recovery.resting_heart_rate}` : '--'}
          color="var(--error)"
        />
        <MetricCell
          label="SpO2"
          value={recovery.spo2 ? `${recovery.spo2}%` : '--'}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="icon-lucide text-lg" style={{ color }}>
          {icon}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="font-mono text-2xl font-medium text-white">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{description}</p>
    </div>
  );
}

function RecoveryBadge({
  color,
  count,
  label,
}: {
  color: string;
  count: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-lg font-medium text-white">{count}</span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
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

function getRecoveryColor(score: number): string {
  if (score >= 67) return 'var(--recovery-high)';
  if (score >= 34) return 'var(--recovery-medium)';
  return 'var(--recovery-low)';
}

function getRecoveryLabel(score: number): string {
  if (score >= 67) return 'High Recovery';
  if (score >= 34) return 'Moderate Recovery';
  return 'Low Recovery';
}

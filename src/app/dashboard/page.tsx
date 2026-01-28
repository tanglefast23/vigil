/**
 * Health Dashboard Page
 * Server component that fetches data and renders the dashboard
 * Based on Pencil design: Dashboard
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

import { RecoveryChart } from './components/RecoveryChart';
import { WorkoutList } from './components/WorkoutList';
import { SyncButton } from './components/SyncButton';
import { ConnectionStatus } from './components/ConnectionStatus';
import { EmptyState } from './components/EmptyState';
import { TestDataBanner } from './components/TestDataBanner';
import { DashboardSidebar } from './components/DashboardSidebar';
import {
  getRecentWorkouts,
  getRecoveryData,
  getSyncStatus,
  getWeeklyStats,
  getLatestRecovery,
} from '@/lib/data';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user.id;

  const [workouts, recoveryData, syncStatus, weeklyStats, latestRecovery] =
    await Promise.all([
      getRecentWorkouts(userId),
      getRecoveryData(userId),
      getSyncStatus(userId),
      getWeeklyStats(userId),
      getLatestRecovery(userId),
    ]);

  const isConnected = !!syncStatus.connection;
  const hasData = recoveryData.length > 0 || workouts.length > 0;
  const isTestData =
    syncStatus.syncStatus?.provider === 'test_data' ||
    recoveryData.some((r) => r.source === 'test_data');

  return (
    <div className="flex h-screen bg-[var(--bg-page)]">
      {/* Sidebar */}
      <DashboardSidebar
        userName={user.user_metadata?.full_name || user.email?.split('@')[0]}
        userEmail={user.email}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="flex flex-col gap-7 p-8 px-10">
          {/* Test Data Banner */}
          {isTestData && <TestDataBanner />}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-display-serif text-3xl text-white tracking-tight">
                Health Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <ConnectionStatus
                  status={
                    syncStatus.syncStatus?.last_error
                      ? 'failed'
                      : syncStatus.syncStatus?.last_successful_sync
                        ? 'completed'
                        : undefined
                  }
                />
                <span className="text-sm text-[var(--text-tertiary)]">
                  {isTestData
                    ? 'Viewing sample data (Demo Mode)'
                    : isConnected
                      ? 'Synced with Whoop'
                      : 'Connect your device to see data'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isConnected && !isTestData && <SyncButton userId={userId} />}
              <button className="gradient-accent flex items-center gap-2 px-5 py-3 rounded-[var(--radius-md)] text-sm font-medium text-white hover:opacity-90 transition-opacity">
                <span className="icon-lucide">plus</span>
                Add Activity
              </button>
            </div>
          </div>

          {!isConnected && !hasData ? (
            <EmptyState />
          ) : (
            <>
              {/* Stats Row 1 */}
              <div className="flex gap-4">
                <StatCard
                  label="RECOVERY"
                  value={`${latestRecovery?.recovery_score ?? '--'}%`}
                  color={getRecoveryColor(latestRecovery?.recovery_score)}
                  trend={
                    latestRecovery
                      ? { value: '+5% from yesterday', direction: 'up' as const }
                      : undefined
                  }
                  status="live"
                />
                <StatCard
                  label="HRV"
                  value={`${weeklyStats.avgHrv ?? '--'}ms`}
                  trend={{ value: 'Avg this week', direction: 'neutral' as const }}
                />
                <StatCard
                  label="WORKOUTS"
                  value={weeklyStats.workoutCount.toString()}
                  trend={{ value: 'This week', direction: 'neutral' as const }}
                />
                <StatCard
                  label="STRAIN"
                  value={weeklyStats.totalStrain.toFixed(1)}
                  color="var(--warning)"
                  trend={{ value: 'Total this week', direction: 'neutral' as const }}
                />
              </div>

              {/* Stats Row 2 */}
              <div className="flex gap-4">
                <StatCard
                  label="SLEEP SCORE"
                  value={`${weeklyStats.avgSleepScore ?? '--'}%`}
                  color="var(--purple)"
                  trend={{ value: 'Avg this week', direction: 'neutral' as const }}
                />
                <StatCard
                  label="SLEEP"
                  value={`${weeklyStats.avgSleepHours ?? '--'}h`}
                  trend={{ value: 'Avg per night', direction: 'neutral' as const }}
                />
                <StatCard
                  label="CALORIES"
                  value={weeklyStats.totalCalories.toLocaleString()}
                  trend={{ value: 'Burned this week', direction: 'neutral' as const }}
                />
              </div>

              {/* Charts Row */}
              <div className="flex gap-6 h-80">
                {/* Recovery Chart */}
                <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">
                      Recovery Trend
                    </h3>
                    <span className="text-xs text-[var(--text-muted)]">
                      Last 30 days
                    </span>
                  </div>
                  <div className="flex-1">
                    <RecoveryChart data={recoveryData} />
                  </div>
                </div>

                {/* Recent Workouts */}
                <div className="w-[400px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-5 pt-5">
                    <h3 className="text-base font-semibold text-white">
                      Recent Workouts
                    </h3>
                    <button className="text-xs text-[var(--accent)] hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    <WorkoutList workouts={workouts} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  status?: 'live' | 'synced';
}

function StatCard({ label, value, color, trend, status }: StatCardProps) {
  const trendColors = {
    up: 'text-[var(--recovery-high)]',
    down: 'text-[var(--recovery-low)]',
    neutral: 'text-[var(--text-tertiary)]',
  };

  const trendIcons = {
    up: 'trending-up',
    down: 'trending-down',
    neutral: '',
  };

  return (
    <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          {label}
        </span>
        {status === 'live' && (
          <div className="flex items-center gap-1.5 bg-[var(--success-tint)] rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            <span className="text-[10px] font-medium text-[var(--success)]">
              Live
            </span>
          </div>
        )}
      </div>

      <span
        className="font-mono text-4xl font-medium tracking-tight"
        style={{ color: color || 'var(--text-primary)' }}
      >
        {value}
      </span>

      {trend && (
        <div className={`flex items-center gap-1 ${trendColors[trend.direction]}`}>
          {trendIcons[trend.direction] && (
            <span className="icon-lucide text-sm">
              {trendIcons[trend.direction]}
            </span>
          )}
          <span className="text-xs font-medium">{trend.value}</span>
        </div>
      )}
    </div>
  );
}

function getRecoveryColor(score?: number): string {
  if (!score) return 'var(--text-primary)';
  if (score >= 67) return 'var(--recovery-high)';
  if (score >= 34) return 'var(--recovery-medium)';
  return 'var(--recovery-low)';
}

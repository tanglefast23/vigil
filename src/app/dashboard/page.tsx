/**
 * Health Dashboard Page
 * Server component that fetches data and renders the dashboard
 */

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Prevent static generation - requires auth
export const dynamic = 'force-dynamic';
import { RecoveryChart } from './components/RecoveryChart';
import { WorkoutList } from './components/WorkoutList';
import { SyncButton } from './components/SyncButton';
import { ConnectionStatus } from './components/ConnectionStatus';
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

  // Parallel data fetching for performance
  const [workouts, recoveryData, syncStatus, weeklyStats, latestRecovery] =
    await Promise.all([
      getRecentWorkouts(userId),
      getRecoveryData(userId),
      getSyncStatus(userId),
      getWeeklyStats(userId),
      getLatestRecovery(userId),
    ]);

  const isConnected = !!syncStatus.connection;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Health Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {isConnected
                ? 'Synced with Whoop'
                : 'Connect your Whoop account to see data'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus
              status={
                syncStatus.syncStatus?.last_error
                  ? 'failed'
                  : syncStatus.syncStatus?.last_successful_sync
                    ? 'completed'
                    : undefined
              }
            />
            {isConnected && <SyncButton userId={userId} />}
          </div>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Whoop</h2>
            <p className="text-gray-600 mb-6">
              Link your Whoop account to import recovery scores, workouts, and
              strain data.
            </p>
            <a
              href={`/api/auth/whoop?user_id=${userId}`}
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Connect Whoop
            </a>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Current Recovery"
                value={latestRecovery?.recovery_score ?? '--'}
                unit="%"
                color={getRecoveryColor(latestRecovery?.recovery_score)}
              />
              <StatCard
                title="Avg HRV"
                value={weeklyStats.avgHrv ?? '--'}
                unit="ms"
              />
              <StatCard
                title="Workouts (7d)"
                value={weeklyStats.workoutCount}
                unit="sessions"
              />
              <StatCard
                title="Total Strain"
                value={weeklyStats.totalStrain.toFixed(1)}
                unit="/ 21"
              />
            </div>

            {/* Sleep Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Avg Sleep Score"
                value={weeklyStats.avgSleepScore ?? '--'}
                unit="%"
              />
              <StatCard
                title="Avg Sleep"
                value={weeklyStats.avgSleepHours ?? '--'}
                unit="hrs"
              />
              <StatCard
                title="Weekly Calories"
                value={weeklyStats.totalCalories.toLocaleString()}
                unit="kcal"
              />
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">
                Recovery Trend (30 Days)
              </h3>
              <RecoveryChart data={recoveryData} />
            </div>

            {/* Recent Workouts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recent Workouts</h3>
              <WorkoutList workouts={workouts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  unit,
  color = 'text-gray-900',
}: {
  title: string;
  value: string | number;
  unit: string;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {title}
      </p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
        <span className="text-lg text-gray-500 font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
}

function getRecoveryColor(score?: number): string {
  if (!score) return 'text-gray-900';
  if (score >= 67) return 'text-green-600';
  if (score >= 34) return 'text-yellow-600';
  return 'text-red-600';
}

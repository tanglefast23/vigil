/**
 * Workouts Page
 * Displays full workout history with filtering and details
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getRecentWorkouts } from '@/lib/data';
import { format, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

const SPORT_NAMES: Record<string, string> = {
  '0': 'Running',
  '1': 'Cycling',
  '2': 'Swimming',
  '3': 'Weightlifting',
  '9': 'Yoga',
  '16': 'Functional Fitness',
  '52': 'Walking',
  '66': 'High Intensity',
  '71': 'Rowing',
  '82': 'Cross-Training',
  '84': 'Pilates',
  '87': 'Dance',
};

const SPORT_ICONS: Record<string, string> = {
  '0': 'footprints',
  '1': 'bike',
  '2': 'waves',
  '3': 'dumbbell',
  '9': 'flower-2',
  '16': 'zap',
  '52': 'footprints',
  '66': 'flame',
  '71': 'sailboat',
  '82': 'activity',
  '84': 'stretch-horizontal',
  '87': 'music',
};

export default async function WorkoutsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth check handled by layout
  const workouts = await getRecentWorkouts(user?.id || '', 50);

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalStrain = workouts.reduce((sum, w) => sum + (w.strain_score || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  const avgHR = workouts.length > 0
    ? Math.round(workouts.reduce((sum, w) => sum + (w.avg_heart_rate || 0), 0) / workouts.filter(w => w.avg_heart_rate).length)
    : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 md:px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display-serif text-2xl md:text-3xl text-white tracking-tight">
            Workouts
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Track your activity and training history
          </p>
        </div>
        <button className="gradient-accent flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-md)] text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <span className="icon-lucide">plus</span>
          Log Workout
        </button>
      </div>

      {/* Stats Row - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard label="TOTAL WORKOUTS" value={totalWorkouts.toString()} />
            <StatCard
              label="TOTAL STRAIN"
              value={totalStrain.toFixed(1)}
              color="var(--warning)"
            />
            <StatCard
              label="CALORIES BURNED"
              value={totalCalories.toLocaleString()}
              color="var(--accent)"
            />
            <StatCard
              label="AVG HEART RATE"
              value={avgHR ? `${avgHR} bpm` : '--'}
              color="var(--error)"
            />
          </div>

      {/* Workouts List */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-base font-semibold text-white">
            Recent Activity
          </h2>
        </div>

        {workouts.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
              <span className="icon-lucide text-3xl text-[var(--text-muted)]">
                dumbbell
              </span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No workouts yet
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              Sync your Whoop or log a workout to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] overflow-x-auto">
            {workouts.map((workout) => (
              <WorkoutRow key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface Workout {
  id: string;
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  strain_score: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  calories_burned: number | null;
  distance_meters: number | null;
}

function WorkoutRow({ workout }: { workout: Workout }) {
  const activityName = SPORT_NAMES[workout.activity_type] || 'Workout';
  const activityIcon = SPORT_ICONS[workout.activity_type] || 'activity';

  // Calculate duration
  let durationStr = '--';
  if (workout.started_at && workout.ended_at) {
    const start = new Date(workout.started_at);
    const end = new Date(workout.ended_at);
    const durationMins = Math.round((end.getTime() - start.getTime()) / 60000);
    if (durationMins >= 60) {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      durationStr = `${hours}h ${mins}m`;
    } else {
      durationStr = `${durationMins}m`;
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-4 gap-4 hover:bg-[var(--bg-elevated)] transition-colors">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--accent-tint)] flex items-center justify-center flex-shrink-0">
          <span className="icon-lucide text-lg md:text-xl text-[var(--accent)]">
            {activityIcon}
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-white truncate">{activityName}</h4>
          <p className="text-xs md:text-sm text-[var(--text-tertiary)] truncate">
            {format(parseISO(workout.started_at), 'EEEE, MMM d • h:mm a')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8 ml-13 md:ml-0 flex-wrap">
        <MetricCell label="Duration" value={durationStr} />
        <MetricCell
          label="Strain"
          value={workout.strain_score?.toFixed(1) || '--'}
          color="var(--warning)"
        />
        <MetricCell
          label="Avg HR"
          value={workout.avg_heart_rate ? `${workout.avg_heart_rate}` : '--'}
          color="var(--error)"
        />
        <MetricCell
          label="Calories"
          value={workout.calories_burned?.toLocaleString() || '--'}
        />
        {workout.distance_meters && workout.distance_meters > 0 && (
          <MetricCell
            label="Distance"
            value={`${(workout.distance_meters / 1000).toFixed(1)}km`}
          />
        )}
      </div>
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
}: {
  label: string;
  value: string;
  color?: string;
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
    </div>
  );
}

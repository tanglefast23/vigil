/**
 * Workout List Component
 * Displays recent workouts with activity details
 */

import { format, parseISO } from 'date-fns';

interface Workout {
  id: string;
  activity_type: string;
  started_at: string;
  strain_score: number | null;
  avg_heart_rate: number | null;
  calories_burned: number | null;
  distance_meters: number | null;
}

interface WorkoutListProps {
  workouts: Workout[];
}

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

const SPORT_EMOJIS: Record<string, string> = {
  '0': '🏃',
  '1': '🚴',
  '2': '🏊',
  '3': '🏋️',
  '9': '🧘',
  '16': '💪',
  '52': '🚶',
  '66': '🔥',
  '71': '🚣',
  '82': '🏃‍♂️',
  '84': '🧘‍♀️',
  '87': '💃',
};

export function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <p className="text-[var(--text-muted)] italic text-sm px-2">
        No workouts found. Sync your Whoop data to see recent activity.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-tint)] rounded-full flex items-center justify-center text-lg">
              {SPORT_EMOJIS[workout.activity_type] || '💪'}
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] text-sm">
                {SPORT_NAMES[workout.activity_type] || 'Workout'}
              </h4>
              <p className="text-xs text-[var(--text-tertiary)]">
                {format(parseISO(workout.started_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-xs">
            {workout.strain_score !== null && (
              <div className="text-right">
                <p className="font-mono font-medium text-[var(--warning)]">
                  {workout.strain_score.toFixed(1)}
                </p>
                <p className="text-[var(--text-muted)]">Strain</p>
              </div>
            )}
            {workout.avg_heart_rate !== null && (
              <div className="text-right">
                <p className="font-mono font-medium text-[var(--error)]">
                  {workout.avg_heart_rate}
                </p>
                <p className="text-[var(--text-muted)]">HR</p>
              </div>
            )}
            {workout.calories_burned !== null && (
              <div className="text-right">
                <p className="font-mono font-medium text-[var(--text-primary)]">
                  {workout.calories_burned}
                </p>
                <p className="text-[var(--text-muted)]">kcal</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

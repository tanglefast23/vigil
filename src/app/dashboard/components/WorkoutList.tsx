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
      <p className="text-gray-500 italic">
        No workouts found. Sync your Whoop data to see recent activity.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
              {SPORT_EMOJIS[workout.activity_type] || '💪'}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {SPORT_NAMES[workout.activity_type] || 'Workout'}
              </h4>
              <p className="text-sm text-gray-600">
                {format(parseISO(workout.started_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            {workout.strain_score !== null && (
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {workout.strain_score.toFixed(1)}
                </p>
                <p className="text-gray-500">Strain</p>
              </div>
            )}
            {workout.avg_heart_rate !== null && (
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {workout.avg_heart_rate}
                </p>
                <p className="text-gray-500">Avg HR</p>
              </div>
            )}
            {workout.calories_burned !== null && (
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {workout.calories_burned}
                </p>
                <p className="text-gray-500">kcal</p>
              </div>
            )}
            {workout.distance_meters !== null && workout.distance_meters > 0 && (
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {(workout.distance_meters / 1000).toFixed(1)}km
                </p>
                <p className="text-gray-500">Distance</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

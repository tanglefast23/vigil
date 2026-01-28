/**
 * WorkoutCard Component
 * Displays workout summary with activity type, strain, HR, and calories
 * Based on Pencil design: Card/Workout
 */

interface WorkoutCardProps {
  emoji: string;
  activity: string;
  date: string;
  strain: number;
  avgHr: number;
  calories: number;
}

export function WorkoutCard({
  emoji,
  activity,
  date,
  strain,
  avgHr,
  calories,
}: WorkoutCardProps) {
  return (
    <div
      className="
        flex items-center justify-between
        bg-[var(--bg-surface)]
        border border-[var(--border-subtle)]
        rounded-[var(--radius-lg)]
        p-4
      "
    >
      <div className="flex items-center gap-3.5">
        <div
          className="
            w-11 h-11
            flex items-center justify-center
            bg-[var(--bg-elevated)]
            rounded-[10px]
          "
        >
          <span className="text-xl">{emoji}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-white">{activity}</span>
          <span className="text-xs text-[var(--text-muted)]">{date}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <MetricCell label="STRAIN" value={strain.toFixed(1)} color="var(--warning)" />
        <MetricCell label="AVG HR" value={`${avgHr} bpm`} />
        <MetricCell label="CALORIES" value={calories.toString()} />
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
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {label}
      </span>
      <span
        className="font-mono text-base font-medium"
        style={{ color: color || 'var(--text-secondary)' }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * StatCard Component
 * Displays a metric with label, value, and optional trend
 * Based on Pencil design: Card/Stat
 */

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  status?: 'live' | 'synced';
}

const trendColors = {
  up: 'text-[var(--recovery-high)]',
  down: 'text-[var(--recovery-low)]',
  neutral: 'text-[var(--text-secondary)]',
};

const trendIcons = {
  up: 'trending-up',
  down: 'trending-down',
  neutral: 'minus',
};

export function StatCard({ label, value, trend, status }: StatCardProps) {
  return (
    <div
      className="
        flex flex-col gap-3
        bg-[var(--bg-surface)]
        border border-[var(--border-subtle)]
        rounded-[var(--radius-lg)]
        p-5
        flex-1
      "
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          {label}
        </span>
        {status === 'live' && (
          <div className="flex items-center gap-1.5 bg-[var(--success-tint)] rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            <span className="text-xs font-medium text-[var(--success)]">
              Live
            </span>
          </div>
        )}
      </div>

      <span className="font-mono text-4xl font-medium text-white tracking-tight">
        {value}
      </span>

      {trend && (
        <div className={`flex items-center gap-1 ${trendColors[trend.direction]}`}>
          <span className="icon-lucide text-sm">{trendIcons[trend.direction]}</span>
          <span className="text-xs font-medium">{trend.value}</span>
        </div>
      )}
    </div>
  );
}

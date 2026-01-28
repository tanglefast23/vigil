/**
 * Recovery Chart Component
 * Displays 30-day recovery trend using Recharts
 * Styled for dark theme
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface RecoveryData {
  recorded_at: string;
  recovery_score: number;
  resting_heart_rate: number | null;
  hrv_rmssd: number | null;
}

interface RecoveryChartProps {
  data: RecoveryData[];
}

export function RecoveryChart({ data }: RecoveryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        No recovery data available. Sync your Whoop to see trends.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: format(parseISO(d.recorded_at), 'MMM d'),
    fullDate: d.recorded_at,
    score: d.recovery_score,
    rhr: d.resting_heart_rate,
    hrv: d.hrv_rmssd,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 60, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-subtle)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={{ stroke: 'var(--border-subtle)' }}
          tickLine={{ stroke: 'var(--border-subtle)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={{ stroke: 'var(--border-subtle)' }}
          tickLine={{ stroke: 'var(--border-subtle)' }}
          label={{
            value: 'Recovery %',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: 'var(--text-muted)' },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '8px',
            border: '1px solid var(--border-default)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          labelStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
          itemStyle={{ color: 'var(--text-secondary)' }}
          formatter={(value, name) => {
            const labels: Record<string, string> = {
              score: 'Recovery',
              hrv: 'HRV (ms)',
              rhr: 'Resting HR',
            };
            return [value ?? 0, labels[String(name)] || String(name)];
          }}
        />
        <ReferenceLine
          y={67}
          stroke="var(--recovery-high)"
          strokeDasharray="5 5"
          strokeWidth={1}
          label={{
            value: 'Opt',
            position: 'right',
            fill: 'var(--recovery-high)',
            fontSize: 11,
          }}
        />
        <ReferenceLine
          y={33}
          stroke="var(--recovery-low)"
          strokeDasharray="5 5"
          strokeWidth={1}
          label={{
            value: 'Low',
            position: 'right',
            fill: 'var(--recovery-low)',
            fontSize: 11,
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
          activeDot={{
            r: 6,
            fill: 'var(--accent-light)',
            stroke: 'var(--accent)',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

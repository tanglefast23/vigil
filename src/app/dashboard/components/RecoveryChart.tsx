/**
 * Recovery Chart Component
 * Displays 30-day recovery trend using Recharts
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
      <div className="h-80 flex items-center justify-center text-gray-500">
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
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Recovery %',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
            labelStyle={{ color: '#111' }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                score: 'Recovery',
                hrv: 'HRV (ms)',
                rhr: 'Resting HR',
              };
              return [value, labels[name] || name];
            }}
          />
          <ReferenceLine
            y={67}
            stroke="#22c55e"
            strokeDasharray="3 3"
            label={{ value: 'Optimal', position: 'right', fill: '#22c55e' }}
          />
          <ReferenceLine
            y={33}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: 'Low', position: 'right', fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#111"
            strokeWidth={2}
            dot={{ fill: '#111', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

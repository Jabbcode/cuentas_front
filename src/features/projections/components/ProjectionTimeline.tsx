import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { TimelinePoint } from '../types';
import { formatAmount, formatShortDate } from '../utils';

interface ProjectionTimelineProps {
  timeline: TimelinePoint[];
}

export function ProjectionTimeline({ timeline }: ProjectionTimelineProps) {
  const chartData = timeline.map((point) => ({
    date: formatShortDate(point.date),
    balance: point.projectedBalance,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">Evolución del Balance</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `$${formatAmount(v)}`}
            width={90}
          />
          <Tooltip
            formatter={(value: number) => [`$${formatAmount(value)}`, 'Balance']}
            labelStyle={{ fontWeight: 600 }}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { FixedVsVariable } from '../../types';

interface FixedVsVariableChartProps {
  data: FixedVsVariable | null;
}

export function FixedVsVariableChart({ data }: FixedVsVariableChartProps) {
  if (!data || data.total === 0) {
    return (
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-base lg:text-lg">Fijos vs Variables</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
          <div className="flex h-32 items-center justify-center text-sm text-gray-500 lg:h-48">
            Sin datos de gastos
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Fijos', value: data.fixed, fill: '#3B82F6' },
    { name: 'Variables', value: data.variable, fill: '#10B981' },
  ];

  return (
    <Card>
      <CardHeader className="p-4 lg:p-6">
        <CardTitle className="text-base lg:text-lg">Fijos vs Variables</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
        <ResponsiveContainer width="100%" height={140} className="lg:!h-[180px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0 }}
          >
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex justify-center gap-6 lg:mt-4 lg:gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500 lg:h-3 lg:w-3" />
              <span className="text-xs text-gray-600 lg:text-sm">Fijos</span>
            </div>
            <p className="mt-1 text-base font-bold text-blue-600 lg:text-lg">
              {data.fixedPercentage}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 lg:h-3 lg:w-3" />
              <span className="text-xs text-gray-600 lg:text-sm">Variables</span>
            </div>
            <p className="mt-1 text-base font-bold text-green-600 lg:text-lg">
              {data.variablePercentage}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

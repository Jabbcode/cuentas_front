import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { MonthComparison } from '../../../types';
import { MonthSelector } from './MonthSelector';
import { MONTHS_SHORT, formatCurrency } from '../../../lib/utils';

interface TrendBadgeProps {
  diff: number;
  percentage: number | null;
  invertColors?: boolean;
}

function TrendBadge({ diff, percentage, invertColors = false }: TrendBadgeProps) {
  if (diff === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Minus className="h-3 w-3" /> Sin cambio
      </span>
    );
  }

  const isPositive = diff > 0;
  const isGood = invertColors ? !isPositive : isPositive;
  const colorClass = isGood ? 'text-green-600' : 'text-red-500';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? '+' : '';

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {percentage !== null ? `${sign}${percentage}%` : '—'}
      <span className="text-gray-400">
        ({sign}
        {formatCurrency(diff)})
      </span>
    </span>
  );
}

interface Props {
  comparison: MonthComparison;
  selectedMonth: number;
  selectedYear: number;
  onPrev: () => void;
  onNext: () => void;
  isCurrentMonth: boolean;
}

export function MonthComparisonCard({
  comparison,
  selectedMonth,
  selectedYear,
  onPrev,
  onNext,
  isCurrentMonth,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    currentMonth,
    previousMonth,
    expensesDiff,
    expensesDiffPercentage,
    incomeDiff,
    incomeDiffPercentage,
  } = comparison;

  const prevLabel = `${MONTHS_SHORT[previousMonth.month - 1]} ${previousMonth.year}`;

  const rows = [
    {
      label: 'Gastos',
      prev: previousMonth.totalExpenses,
      curr: currentMonth.totalExpenses,
      diff: expensesDiff,
      pct: expensesDiffPercentage,
      invertColors: true,
    },
    {
      label: 'Ingresos',
      prev: previousMonth.totalIncome,
      curr: currentMonth.totalIncome,
      diff: incomeDiff,
      pct: incomeDiffPercentage,
      invertColors: false,
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 lg:p-6">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex min-h-[44px] items-center gap-2 text-left"
        >
          <h2 className="text-base font-semibold text-gray-900 lg:text-lg">Comparativa mensual</h2>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          )}
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <MonthSelector
            month={selectedMonth}
            year={selectedYear}
            onPrev={onPrev}
            onNext={onNext}
            disableNext={isCurrentMonth}
          />
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 lg:px-6 lg:pb-6">
          <div className="grid grid-cols-3 gap-y-3 text-sm">
            <div />
            <div className="text-center text-xs font-medium uppercase tracking-wide text-gray-400">
              {prevLabel}
            </div>
            <div className="text-center text-xs font-medium uppercase tracking-wide text-blue-600">
              Este mes
            </div>

            {rows.map((row) => (
              <>
                <div
                  key={`${row.label}-label`}
                  className="flex items-center font-medium text-gray-600"
                >
                  {row.label}
                </div>
                <div
                  key={`${row.label}-prev`}
                  className="flex items-center justify-center font-semibold text-gray-700"
                >
                  {formatCurrency(row.prev)}
                </div>
                <div key={`${row.label}-curr`} className="flex flex-col items-center gap-0.5">
                  <span className="font-semibold text-gray-900">{formatCurrency(row.curr)}</span>
                  <TrendBadge
                    diff={row.diff}
                    percentage={row.pct}
                    invertColors={row.invertColors}
                  />
                </div>
              </>
            ))}

            <div className="flex items-center font-medium text-gray-600">Balance</div>
            <div
              className={`flex items-center justify-center font-semibold ${previousMonth.net >= 0 ? 'text-green-600' : 'text-red-500'}`}
            >
              {formatCurrency(previousMonth.net)}
            </div>
            <div
              className={`flex items-center justify-center font-semibold ${currentMonth.net >= 0 ? 'text-green-600' : 'text-red-500'}`}
            >
              {formatCurrency(currentMonth.net)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

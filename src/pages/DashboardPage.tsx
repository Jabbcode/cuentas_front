import { useDashboard } from '../hooks/useDashboard';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { FixedExpensesSummaryCard } from '../components/dashboard/FixedExpensesSummaryCard';
import { ExpensesByCategoryChart } from '../components/dashboard/ExpensesByCategoryChart';
import { FixedVsVariableChart } from '../components/dashboard/FixedVsVariableChart';
import { NextMonthProjection } from '../components/dashboard/NextMonthProjection';
import { CreditCardsSummaryCard } from '../components/dashboard/CreditCardsSummary';

export function DashboardPage() {
  const { summary, byCategory, fixedSummary, fixedVsVariable, projection, creditCardsSummary, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Dashboard</h1>
        <p className="text-sm text-gray-500 lg:text-base">Resumen de tus finanzas personales</p>
      </div>

      <DashboardSummaryCards summary={summary} />

      {fixedSummary && <FixedExpensesSummaryCard summary={fixedSummary} />}

      {creditCardsSummary && <CreditCardsSummaryCard summary={creditCardsSummary} />}

      {projection && <NextMonthProjection projection={projection} />}

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <ExpensesByCategoryChart categories={byCategory} />
        <FixedVsVariableChart data={fixedVsVariable} />
      </div>
    </div>
  );
}

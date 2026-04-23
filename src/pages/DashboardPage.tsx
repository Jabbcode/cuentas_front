import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDashboard } from '../hooks/useDashboard';
import { useMonthComparison } from '../hooks/useMonthComparison';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { FixedExpensesSummaryCard } from '../components/dashboard/FixedExpensesSummaryCard';
import { ExpensesByCategoryChart } from '../components/dashboard/ExpensesByCategoryChart';
import { FixedVsVariableChart } from '../components/dashboard/FixedVsVariableChart';
import { NextMonthProjection } from '../components/dashboard/NextMonthProjection';
import { CreditCardsSummaryCard } from '../components/dashboard/CreditCardsSummary';
import { DebtsSummaryCard } from '../components/dashboard/DebtsSummaryCard';
import { BudgetDashboardWidget } from '../components/budgets/BudgetDashboardWidget';
import { MonthComparisonCard } from '../components/dashboard/MonthComparisonCard';
import { CategoryComparisonChart } from '../components/dashboard/CategoryComparisonChart';

export function DashboardPage() {
  const {
    summary,
    byCategory,
    fixedSummary,
    fixedVsVariable,
    projection,
    creditCardsSummary,
    debtsSummary,
    loading,
    reload,
  } = useDashboard();

  const {
    comparison,
    loading: compLoading,
    selectedMonth,
    selectedYear,
    goToPrevMonth,
    goToNextMonth,
    isCurrentMonth,
  } = useMonthComparison();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Dashboard</h1>
          <p className="text-sm text-gray-500 lg:text-base">Resumen de tus finanzas personales</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <DashboardSummaryCards summary={summary} />

      {fixedSummary && <FixedExpensesSummaryCard summary={fixedSummary} />}

      {creditCardsSummary && <CreditCardsSummaryCard summary={creditCardsSummary} />}

      {debtsSummary && <DebtsSummaryCard summary={debtsSummary} />}

      <BudgetDashboardWidget />

      {projection && <NextMonthProjection projection={projection} />}

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <ExpensesByCategoryChart categories={byCategory} />
        <FixedVsVariableChart data={fixedVsVariable} />
      </div>

      {!compLoading && comparison && (
        <>
          <MonthComparisonCard
            comparison={comparison}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
            isCurrentMonth={isCurrentMonth}
          />
          <CategoryComparisonChart
            categories={comparison.categories}
            previousMonth={comparison.previousMonth.month}
            previousYear={comparison.previousMonth.year}
            currentMonth={comparison.currentMonth.month}
            currentYear={comparison.currentMonth.year}
          />
        </>
      )}
    </div>
  );
}

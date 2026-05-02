import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDashboard } from '../features/dashboard';
import { useMonthComparison } from '../features/dashboard';
import { DashboardSummaryCards } from '../features/dashboard';
import { FixedExpensesSummaryCard } from '../features/dashboard';
import { ExpensesByCategoryChart } from '../features/dashboard';
import { FixedVsVariableChart } from '../features/dashboard';
import { NextMonthProjection } from '../features/dashboard';
import { CreditCardsSummaryCard } from '../features/dashboard';
import { DebtsSummaryCard } from '../features/dashboard';
import { BudgetDashboardWidget } from '../features/budgets/components/BudgetDashboardWidget';
import { MonthComparisonCard } from '../features/dashboard';
import { CategoryComparisonChart } from '../features/dashboard';

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

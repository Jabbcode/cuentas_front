import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useDashboard, useDashboardPage } from '../features/dashboard';
import { DashboardHeroCard } from '../features/dashboard';
import { DashboardAlertsSection } from '../features/dashboard';
import { MonthlyTrendChart } from '../features/dashboard';
import { DashboardSummaryCards } from '../features/dashboard';
import { FixedExpensesSummaryCard } from '../features/dashboard';
import { NextMonthProjection } from '../features/dashboard';
import { CreditCardsSummaryCard } from '../features/dashboard';
import { DebtsSummaryCard } from '../features/dashboard';

export function DashboardPage() {
  const {
    summary,
    fixedSummary,
    projection,
    creditCardsSummary,
    debtsSummary,
    monthlyTrend,
    trendLoading,
    loading,
    reload,
  } = useDashboard();

  const {
    isAlertsOpen,
    isCreditCardsOpen,
    isDebtsOpen,
    isFixedOpen,
    isProjectionOpen,
    toggleAlerts,
    toggleCreditCards,
    toggleDebts,
    toggleFixed,
    toggleProjection,
  } = useDashboardPage();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
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
          <RefreshCw className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* 1. Hero card */}
      <DashboardHeroCard summary={summary} />

      {/* 2. Alertas — colapsable, solo si hay alertas */}
      <DashboardAlertsSection
        debtsSummary={debtsSummary}
        creditCardsSummary={creditCardsSummary}
        fixedSummary={fixedSummary}
        isOpen={isAlertsOpen}
        onToggle={toggleAlerts}
      />

      {/* 3. Tendencia mensual */}
      <MonthlyTrendChart data={monthlyTrend} loading={trendLoading} />

      {/* 4. Balance total en cuentas */}
      <DashboardSummaryCards summary={summary} />

      {/* 5. Tarjetas de crédito — colapsado */}
      {creditCardsSummary && (
        <div>
          <button
            type="button"
            onClick={toggleCreditCards}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Tarjetas de crédito</span>
            {isCreditCardsOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {isCreditCardsOpen && (
            <div className="mt-3">
              <CreditCardsSummaryCard summary={creditCardsSummary} />
            </div>
          )}
        </div>
      )}

      {/* 5. Deudas — colapsado */}
      {debtsSummary && (
        <div>
          <button
            type="button"
            onClick={toggleDebts}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Deudas</span>
            {isDebtsOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {isDebtsOpen && (
            <div className="mt-3">
              <DebtsSummaryCard summary={debtsSummary} />
            </div>
          )}
        </div>
      )}

      {/* 5. Gastos fijos — colapsado */}
      {fixedSummary && (
        <div>
          <button
            type="button"
            onClick={toggleFixed}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Gastos fijos</span>
            {isFixedOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {isFixedOpen && (
            <div className="mt-3">
              <FixedExpensesSummaryCard summary={fixedSummary} />
            </div>
          )}
        </div>
      )}

      {/* 6. Proyección próximo mes — colapsable */}
      {projection && (
        <NextMonthProjection
          projection={projection}
          isOpen={isProjectionOpen}
          onToggle={toggleProjection}
        />
      )}
    </div>
  );
}

import { useProjectionsPage } from '../features/projections';
import { PeriodSelector } from '../features/projections/components/PeriodSelector';
import { ProjectionSummaryCards } from '../features/projections/components/ProjectionSummaryCards';
import { ProjectionTimeline } from '../features/projections/components/ProjectionTimeline';
import { ProjectionBreakdown } from '../features/projections/components/ProjectionBreakdown';
import { formatFullDate } from '../features/projections/utils';

export function ProjectionsPage() {
  const {
    data,
    isLoading,
    error,
    days,
    customDays,
    isCustom,
    setPresetDays,
    handleCustomDays,
    applyCustomDays,
  } = useProjectionsPage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyección Financiera</h1>
          {data && (
            <p className="mt-1 text-sm text-gray-500">
              {formatFullDate(data.period.from)} — {formatFullDate(data.period.to)}
            </p>
          )}
        </div>
        <PeriodSelector
          days={days}
          customDays={customDays}
          isCustom={isCustom}
          onPreset={setPresetDays}
          onCustomChange={handleCustomDays}
          onApply={applyCustomDays}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          Calculando proyección...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al cargar la proyección: {error.message}
        </div>
      )}

      {data && !isLoading && (
        <>
          <ProjectionSummaryCards data={data} />
          <ProjectionTimeline timeline={data.timeline} />
          <ProjectionBreakdown
            fixedExpenses={data.outflows.fixedExpenses}
            fixedIncome={data.outflows.fixedIncome}
            debtPayments={data.outflows.debtPayments}
            historicalForPeriod={data.historical.forPeriod}
            monthlyAverage={data.historical.monthlyAverage}
          />
        </>
      )}
    </div>
  );
}

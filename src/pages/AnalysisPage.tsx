import {
  AnalysisFiltersBar,
  CategoryMultiSelect,
  CategoryTrendChart,
  useAnalysisPage,
} from '../features/analysis';

export function AnalysisPage() {
  const page = useAnalysisPage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis</h1>
        <p className="text-gray-600">Evolución de gastos e ingresos por categoría</p>
      </div>

      <AnalysisFiltersBar
        startDate={page.draftRange.startDate}
        endDate={page.draftRange.endDate}
        rangeError={page.rangeError}
        onStartDateChange={page.setDraftStartDate}
        onEndDateChange={page.setDraftEndDate}
        accountId={page.accountId}
        accounts={page.accounts}
        onAccountChange={page.setAccountId}
        type={page.type}
        onTypeChange={page.setType}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <CategoryTrendChart
          months={page.months}
          series={page.series}
          selectedCategoryIds={page.selectedCategoryIds}
          loading={page.loading}
          emptyState={page.emptyState}
          onPointClick={() => {}}
          onRetry={page.reload}
        />
        <CategoryMultiSelect
          series={page.series}
          selectedCategoryIds={page.selectedCategoryIds}
          isSelectionFull={page.isSelectionFull}
          onToggleCategory={page.toggleCategory}
        />
      </div>
    </div>
  );
}

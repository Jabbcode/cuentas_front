---
name: Dashboard Feature Module Structure
description: Dashboard feature module layout, deleted legacy files, and notes from 2026-05-01 refactor
type: project
---

Migrated to `src/features/dashboard/` on 2026-05-01.

**Why:** Align with the feature-module canonical pattern applied to all other modules (accounts, debts, credit-cards, fixed-expenses, settings, transactions).

**How to apply:** Use this structure as reference for any future dashboard changes.

## Files created

```
src/features/dashboard/
├── index.ts                         # barrel — all public exports
├── types.ts                         # UseDashboardReturn, UseMonthComparisonReturn (UI types only)
├── api.ts                           # dashboardApi (getSummary, getByCategory, getMonthlyTrend, getFixedVsVariable, getNextMonthProjection, getMonthlySummary)
├── utils.ts                         # getPrevMonth, calcDiffPct, mergeCategories (extracted from useMonthComparison)
├── hooks/
│   ├── useDashboard.ts              # fetches summary + fixed/credit-cards/debts aggregates, visibility reload
│   └── useMonthComparison.ts        # month navigation state + comparison data fetch
└── components/
    ├── DashboardSummaryCards.tsx
    ├── FixedExpensesSummaryCard.tsx
    ├── ExpensesByCategoryChart.tsx
    ├── FixedVsVariableChart.tsx
    ├── NextMonthProjection.tsx
    ├── CreditCardsSummary.tsx
    ├── DebtsSummaryCard.tsx
    ├── MonthComparisonCard.tsx
    ├── CategoryComparisonChart.tsx
    └── MonthSelector.tsx
```

## Files deleted

- `src/api/dashboard.api.ts`
- `src/hooks/useDashboard.ts`
- `src/hooks/useMonthComparison.ts`
- `src/components/dashboard/` (entire folder — 10 component files)

## External files updated

- `src/pages/DashboardPage.tsx` — all imports now point to `../features/dashboard`

## Autonomy note

`BudgetDashboardWidget` (from `src/features/budgets/components/`) fetches its own data and is imported directly into `DashboardPage` without prop drilling — intentional per project rules.

## utils.ts note

`getPrevMonth`, `calcDiffPct`, and `mergeCategories` were previously inlined in `useMonthComparison.ts`. Extracted to `utils.ts` as pure functions — primary targets for unit tests.

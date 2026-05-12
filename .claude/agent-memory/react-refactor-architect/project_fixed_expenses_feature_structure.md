---
name: project_fixed_expenses_feature_structure
description: fixed-expenses feature module layout, deleted files, and external importers updated
type: project
---

Module migrated to feature-based pattern on 2026-05-01.

**Structure:**

```
src/features/fixed-expenses/
  index.ts                          — barrel (public API)
  types.ts                          — UI/form types only (CategoryInfo, FixedExpenseWithStatus, UseFixedExpensesReturn, UseFixedExpensesPageReturn)
  api.ts                            — fixedExpensesApi (migrated from src/api/fixed-expenses.api.ts)
  utils.ts                          — pure functions: getExpenseCategories, getIncomeCategories, getFilteredExpenseItems, getFilteredIncomeItems, getCreditCardItems, getDebtPaymentItems, sumActiveAmounts, toggleCategorySelection
  hooks/
    useFixedExpenses.ts             — base CRUD hook: summary, loading, reload, payExpense, deleteExpense, toggleActive
    useFixedExpensesPage.ts         — page-level orchestration: all UI state, derived data via useMemo from utils, all handlers
  components/
    FixedExpenseCard.tsx
    FixedExpenseForm.tsx            — uses fixedExpensesApi, accountsApi (from features/accounts), categoriesApi (from features/categories)
    FixedExpenseTable.tsx
    MonthlyFixedSummary.tsx
```

**Deleted files:**

- `src/api/fixed-expenses.api.ts`
- `src/hooks/useFixedExpenses.ts`
- `src/components/fixed-expenses/` (entire folder)

**External importers updated:**

- `src/hooks/useDashboard.ts` — changed `from '../api/fixed-expenses.api'` to `from '../features/fixed-expenses'`
- `src/pages/FixedExpensesPage.tsx` — rewritten as pure orchestrator (~80 lines), imports from `../features/fixed-expenses`

**Domain models stay in:** `src/types/index.ts` (FixedExpense, FixedExpenseSummary).

**Why:** Follows the canonical feature-module pattern already applied to accounts, debts, categories.
**How to apply:** When another feature needs fixedExpensesApi or useFixedExpenses, import from `features/fixed-expenses`.

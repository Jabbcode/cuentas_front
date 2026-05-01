---
name: project_budgets_feature_structure
description: budgets feature module layout, deleted files, and external importers updated
type: project
---

Budgets feature migrated to src/features/budgets/ following the credit-cards pattern.

**Why:** Consolidate all feature logic (API, hooks, components) inside a single feature directory and eliminate duplicate files in src/api/, src/hooks/, and src/components/.

**How to apply:** Use this as a reference when adding new features. The pattern is: types.ts + api.ts + utils.ts + hooks/ + components/ + index.ts barrel.

## Files created

- src/features/budgets/types.ts — BudgetFormData, UseBudgetsReturn, UseBudgetsPageReturn interfaces
- src/features/budgets/api.ts — budgetsApi (moved from src/api/budgets.api.ts)
- src/features/budgets/utils.ts — MONTHS, getMonthLabel, getPrevMonthYear, getNextMonthYear, getAvailableCategories
- src/features/budgets/hooks/useBudgets.ts — fetch hook (moved from src/hooks/useBudgets.ts)
- src/features/budgets/hooks/useBudgetsPage.ts — page logic hook (CRUD, modals, month navigation)
- src/features/budgets/components/BudgetProgressBar.tsx — moved from src/components/budgets/
- src/features/budgets/components/BudgetDashboardWidget.tsx — moved from src/components/budgets/
- src/features/budgets/components/BudgetCard.tsx — new component extracted from BudgetsPage
- src/features/budgets/components/BudgetFormDialog.tsx — new component extracted from BudgetsPage
- src/features/budgets/index.ts — barrel exports
- src/features/budgets/**tests**/budgets.test.ts — unit tests for utils

## Files deleted

- src/api/budgets.api.ts
- src/hooks/useBudgets.ts
- src/components/budgets/BudgetProgressBar.tsx
- src/components/budgets/BudgetDashboardWidget.tsx
- src/components/budgets/ (folder removed)

## External importers updated

- src/pages/BudgetsPage.tsx — refactored to pure orchestrator (~90 lines)
- src/pages/DashboardPage.tsx — updated BudgetDashboardWidget import path

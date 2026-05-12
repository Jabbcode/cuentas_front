---
name: transactions feature module structure
description: transactions feature module layout, deleted legacy files, new components added, and external importers updated — completed 2026-05-01
type: project
---

Refactor completed 2026-05-01. The transactions feature module is at `src/features/transactions/`.

## Final structure

```
src/features/transactions/
  api.ts                          — transactionsApi (Axios, typed)
  types.ts                        — TransactionFormData, TransactionFilterState, DateWarning, etc.
  utils.ts                        — groupTransactionsByCategory, calculatePaginationInfo,
                                     buildTransactionApiFilters, applyClientSideFilters,
                                     hasActiveFilters, DEFAULT_FILTER_STATE
  index.ts                        — public barrel: re-exports all hooks, components, utils, types
  hooks/
    useTransactions.ts            — data-fetching hook (transactions + accounts + categories)
    useTransactionsPage.ts        — orchestrator hook; all page logic, form, filters, pagination
  components/
    EditTransactionModal.tsx
    ReceiptScanner.tsx
    TagBadge.tsx
    TagInput.tsx                  — accepts `suggestions: Tag[]`
    TagSummaryView.tsx
    TransactionBadges.tsx
    TransactionCard.tsx
    TransactionEmpty.tsx
    TransactionFilters.tsx
    TransactionFormDialog.tsx     — NEW: extracted inline form dialog from old TransactionsPage
    TransactionGroupedView.tsx
    TransactionList.tsx
    TransactionPagination.tsx
    TransactionRow.tsx
  __tests__/
    transactions.test.ts          — pure util tests (grouping, pagination, filters)
```

## Legacy files deleted

- `src/api/transactions.api.ts`
- `src/hooks/useTransactions.ts`
- `src/components/transactions/` (entire directory)

## External importers updated

- `src/pages/TransactionsPage.tsx` — fully rewritten as pure orchestrator using `useTransactionsPage`
- `src/features/credit-cards/components/CreditCardTransactionsModal.tsx` — imports `transactionsApi` and `groupTransactionsByCategory` from `features/transactions`
- `src/hooks/usePagination.ts` — imports `calculatePaginationInfo` from `features/transactions/utils`

## Key pattern note

`TransactionFormDialog` was created as a new pure UI component to replace the inline form dialog that was previously hardcoded in `TransactionsPage`. It receives all state and handlers as props from `useTransactionsPage`.

`lib/transaction-utils.ts` still exists but is no longer imported by anything — can be deleted in a future cleanup pass.

**Why:** lib/transaction-utils had duplicate implementations of groupTransactionsByCategory and calculatePaginationInfo vs the feature module. The feature module is now the single source of truth.

**How to apply:** When other features (e.g., dashboard) need transaction grouping logic, import from `features/transactions` not from `lib/transaction-utils`.

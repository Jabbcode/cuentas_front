---
name: credit-cards feature module structure
description: Feature module structure for src/features/credit-cards/ including two hooks, moved API, and barrel index
type: project
---

Refactored credit-cards into src/features/credit-cards/ following the accounts feature pattern.

**Why:** Existing code scattered across src/api/, src/hooks/, and src/components/ with CreditCardsPage mixing business logic (CRUD, modal state, collapse state, pay handler).

**How to apply:** When adding new credit-card functionality, extend hooks/useCreditCardsPage.ts for page-level logic, hooks/useCreditCards.ts for data fetching, and api.ts for new endpoints. Keep components/ for feature-owned UI only.

## File layout

```
src/features/credit-cards/
├── types.ts                          — PaymentFormData, PaymentModalState, TransactionsModalState, return interfaces
├── api.ts                            — creditCardsApi (moved from src/api/credit-cards.api.ts — DELETED)
├── utils.ts                          — computeTotalToPay, countPendingCards, computeCurrentPeriodTotal, computeTotalUsed, getTodayDateString
├── hooks/
│   ├── useCreditCards.ts             — data fetching (statements + non-CC accounts), reload
│   └── useCreditCardsPage.ts         — all page logic: collapse state, payment modal, transactions modal, handlePay
├── components/
│   └── CreditCardPaymentModal.tsx    — feature-owned modal (imports PaymentFormData from feature types)
├── __tests__/
│   └── creditCards.test.ts           — unit tests for all utils functions
└── index.ts                          — barrel exports
```

## External importers updated

- src/hooks/useDashboard.ts → imports creditCardsApi from features/credit-cards/api
- src/features/accounts/hooks/useAccountsPage.ts → imports creditCardsApi from ../../credit-cards/api
- src/components/credit-cards/CreditCardPaymentModal.tsx → imports PaymentFormData from features/credit-cards/types

## Deleted files

- src/api/credit-cards.api.ts
- src/hooks/useCreditCards.ts
- src/hooks/usePaymentModal.ts

## Remaining in src/components/credit-cards/ (shared, not moved)

CreditCardAlerts, CreditCardEmpty, CreditCardHeader, CreditCardItem, CreditCardPeriod, CreditCardSummary, CreditCardTransactionsModal
(These are used by CreditCardsPage and left in components/ as shared UI)

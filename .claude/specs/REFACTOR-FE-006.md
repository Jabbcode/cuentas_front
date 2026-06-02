# SPEC: REFACTOR-FE-006 — Migrar server state a React Query (TanStack Query)

## Qué se pide

Reemplazar el patrón manual `useState + useEffect + useCallback` en **todos** los hooks de
fetching por `useQuery` de TanStack Query v5. Scope completo: Fase 1 (setup) + Fase 2 (12
hooks base) + Fase 3 (invalidación en page hooks y en base hooks con mutaciones propias).

---

## Contexto relevante

- **ADR-005 (Pure UI Rule)** — `useQuery` vive exclusivamente en los hooks, no en componentes.
- **ADR-008 (Feature-module architecture)** — Se migran los hooks base; los page hooks
  consumen el resultado sin cambiar su interfaz pública hacia las páginas.
- **ADR-009 (Vitest)** — Tests con `renderHook` necesitan wrapper `QueryClientProvider`.
- **FIX-031 (PR #51)** — Patrón `vi.hoisted` + mocks de módulo. Los tests actualizados
  mantienen este patrón.

---

## Decisión aprobada

**Opción B — `invalidateQueries` en handlers:** los handlers que hoy llaman `reload()` pasan
a usar `queryClient.invalidateQueries({ queryKey: [...] })`. Los handlers que viven en base
hooks (useDebts, useFixedExpenses, useRecurringDebtPayments) también usan `useQueryClient()`
internamente. Los handlers en page hooks igual. Mantiene cache global consistente.

Los handlers de mutación (create/update/delete) siguen siendo `async` directos — no se usa
`useMutation` de React Query en esta tarea.

---

## Query keys canónicas

| Hook                       | Query key                                                    |
| -------------------------- | ------------------------------------------------------------ |
| `useAccounts`              | `['accounts']`                                               |
| `useCategories`            | `['categories']`                                             |
| `useTransactions`          | `['transactions', filters]`                                  |
| `useDashboard`             | `['dashboard']`                                              |
| `useMonthComparison`       | `['month-comparison', selectedMonth, selectedYear]`          |
| `useBudgets`               | `['budgets']`                                                |
| `useCreditCards`           | `['credit-card-statements']` + `['accounts']` (dos useQuery) |
| `useDebts`                 | `['debts']`                                                  |
| `useRecurringDebtPayments` | `['recurring-debt-payments', debtId]`                        |
| `useFixedExpenses`         | `['fixed-expenses']`                                         |
| `useSettings`              | `['settings']`                                               |
| `useTransactionSummary`    | `['transaction-summary', filters]`                           |

---

## Archivos a tocar

### Setup

| Archivo        | Cambio                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `package.json` | Agregar `@tanstack/react-query` en `dependencies`                                                          |
| `src/App.tsx`  | `QueryClientProvider` con `QueryClient` (defaults: `staleTime: 30_000, retry: 1`) wrapeando `AuthProvider` |

### Hooks base (Fase 2)

| Archivo                                                | Cambio                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `features/accounts/hooks/useAccounts.ts`               | `useQuery(['accounts'])`                                                                                                                                                                                                                                                                                     |
| `features/categories/hooks/useCategories.ts`           | `useQuery(['categories'])`                                                                                                                                                                                                                                                                                   |
| `features/transactions/hooks/useTransactions.ts`       | `useQuery(['transactions', filters])`, elimina `eslint-disable` de exhaustive-deps                                                                                                                                                                                                                           |
| `features/dashboard/hooks/useDashboard.ts`             | `useQuery(['dashboard'])` con `queryFn` que hace el `Promise.all` interno                                                                                                                                                                                                                                    |
| `features/dashboard/hooks/useMonthComparison.ts`       | `useQuery(['month-comparison', selectedMonth, selectedYear])`                                                                                                                                                                                                                                                |
| `features/budgets/hooks/useBudgets.ts`                 | `useQuery(['budgets'])`                                                                                                                                                                                                                                                                                      |
| `features/credit-cards/hooks/useCreditCards.ts`        | Dos `useQuery`: `['credit-card-statements']` y `['accounts']`; combinar `isLoading` con `statements.isLoading \|\| accounts.isLoading`                                                                                                                                                                       |
| `features/debts/hooks/useDebts.ts`                     | `useQuery(['debts'])` + `useQueryClient()` para `invalidateQueries` en `deleteDebt` y `payDebt`                                                                                                                                                                                                              |
| `features/debts/hooks/useRecurringDebtPayments.ts`     | `useQuery(['recurring-debt-payments', debtId])` + `useQueryClient()` para `invalidateQueries` en `deleteRecurringPayment` y `toggleActive`                                                                                                                                                                   |
| `features/fixed-expenses/hooks/useFixedExpenses.ts`    | `useQuery(['fixed-expenses'])` + `useQueryClient()` para `invalidateQueries` en `payExpense`, `deleteExpense` y `toggleActive`                                                                                                                                                                               |
| `features/settings/hooks/useSettings.ts`               | `useQuery(['settings'])` para fetch de `profile` + `statistics`; los handlers de mutación (`handleUpdateProfile`, `handleChangePassword`, `handleDeleteAccount`) usan `queryClient.invalidateQueries(['settings'])` tras el await; `message` y `isLoading` (de UI, no de fetch) se mantienen como `useState` |
| `features/transactions/hooks/useTransactionSummary.ts` | `useQuery(['transaction-summary', filters], { enabled })`, elimina `eslint-disable` de exhaustive-deps                                                                                                                                                                                                       |

### Page hooks (Fase 3) — solo reemplazar `reload()` por `invalidateQueries`

| Archivo                                                 | Query key a invalidar                             |
| ------------------------------------------------------- | ------------------------------------------------- |
| `features/accounts/hooks/useAccountsPage.ts`            | `['accounts']`                                    |
| `features/categories/hooks/useCategoriesPage.ts`        | `['categories']`                                  |
| `features/transactions/hooks/useTransactionsPage.ts`    | `['transactions']` (sin filtros — invalida todas) |
| `features/budgets/hooks/useBudgetsPage.ts`              | `['budgets']`                                     |
| `features/credit-cards/hooks/useCreditCardsPage.ts`     | `['credit-card-statements']`                      |
| `features/debts/hooks/useDebtsPage.ts`                  | `['debts']`                                       |
| `features/fixed-expenses/hooks/useFixedExpensesPage.ts` | `['fixed-expenses']`                              |
| `features/settings/hooks/useSettingsPage.ts`            | `['settings']` (si existe reload)                 |

### Tests

| Archivo                                                   | Cambio                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| `features/accounts/hooks/useAccounts.test.ts`             | Wrapper `QueryClientProvider` en `renderHook`                 |
| `features/accounts/hooks/useAccountsPage.test.ts`         | Wrapper `QueryClientProvider`; si mockea `reload`, actualizar |
| `features/transactions/hooks/useTransactionsPage.test.ts` | Wrapper `QueryClientProvider`; si mockea `reload`, actualizar |

---

## Casos especiales

### `useCreditCards` — dos fetch en un hook

Actualmente hace un `Promise.all([creditCardsApi.getStatements(), accountsApi.getAll()])`.
Con React Query: dos `useQuery` separados en el mismo hook. El `loading` del retorno es
`statementsQuery.isLoading || accountsQuery.isLoading`.

### `useDebts`, `useFixedExpenses`, `useRecurringDebtPayments` — mutaciones en el base hook

Estos hooks tienen handlers de mutación (delete, pay, toggleActive) directamente en el base
hook, no en un page hook separado. En lugar de `reload()`, usan `useQueryClient()` y llaman
`queryClient.invalidateQueries` tras el await. No cambia el contrato de retorno.

### `useSettings` — estado mixto

`profile` y `statistics` son server state → migran a `useQuery(['settings'])`.
`message` (FeedbackMessage) es UI state → se mantiene como `useState`.
`isLoading` del fetch pasa a ser `settingsQuery.isLoading`.
Los handlers de mutación llaman `queryClient.invalidateQueries(['settings'])` tras el await.

### `useMonthComparison` — query key con parámetros de navegación

La query key `['month-comparison', selectedMonth, selectedYear]` cambia cuando el usuario
navega entre meses. React Query re-fetcha automáticamente. El estado `selectedMonth/Year` y
los handlers `goToPrevMonth/goToNextMonth` se mantienen como `useState` + `useCallback`.

---

## Propuesta de implementación

1. `npm install @tanstack/react-query` en `cuentas-frontend/`
2. `App.tsx` — `QueryClientProvider` con defaults
3. Migrar los 12 hooks base a `useQuery` (manteniendo interfaz de retorno)
4. Actualizar page hooks — reemplazar `reload()` por `queryClient.invalidateQueries`
5. Actualizar tests — agregar wrapper `QueryClientProvider`
6. `tsc --noEmit` para verificar tipos

---

## Fuera de scope

- `useMutation` de React Query para los handlers — quedan como `async` directos
- `ReactQueryDevtools` — no está en los criterios de aceptación
- Modificar la capa `api.ts` de cada módulo
- Hooks de auth (`useLoginPage`, `useRegisterPage`) — son form state, no server state
- `useTransactionFilters` — es estado local de UI, no fetching
- `useBudgetWidget` — wrapper delgado de `useBudgets`; se actualiza automáticamente al migrar `useBudgets`

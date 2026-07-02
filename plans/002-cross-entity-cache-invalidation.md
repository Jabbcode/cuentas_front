# Plan 002: Invalidar caché cross-entity tras mutaciones financieras (dashboard y balances stale)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat c139899..HEAD -- src/features/transactions/hooks/useTransactionsPage.ts src/features/accounts/hooks/useAccountsPage.ts src/features/fixed-expenses/hooks/useFixedExpenses.ts src/features/fixed-expenses/hooks/useFixedExpensesPage.ts src/features/debts/hooks/useDebts.ts src/features/debts/hooks/useDebtsPage.ts src/features/debts/hooks/useRecurringDebtPayments.ts src/features/credit-cards/hooks/useCreditCardsPage.ts src/features/categories/hooks/useCategoriesPage.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-fix-stale-tests-ci-and-auth-docs.md (suite verde como baseline)
- **Category**: bug
- **Planned at**: commit `c139899`, 2026-06-11

## Why this matters

Tras la migración a React Query (REFACTOR-FE-006), cada mutación invalida **solo su propia
query key**. Pero en una app financiera las entidades están acopladas: crear una transacción
cambia el balance de la cuenta (`['accounts']`), los totales del dashboard (`['dashboard']`)
y el resumen (`['transaction-summary']`); pagar una deuda o un gasto fijo mueve dinero de
una cuenta. Hoy, después de cualquier mutación, el usuario navega al dashboard y ve totales
y balances **stale** hasta que expira el `staleTime` de 30s y se produce un refetch — en una
app de finanzas personales, mostrar números viejos después de que el usuario acaba de
registrar un movimiento erosiona la confianza. El fix es mecánico: añadir las keys cruzadas
afectadas en cada punto de invalidación.

## Current state

### Configuración global

`src/App.tsx:18-25` — `QueryClient` con `staleTime: 30_000, retry: 1`.

### Inventario de query keys activas (verificado por grep en c139899)

| Key                                        | Definida en                                                                                             | Datos                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `['transactions', ...]`                    | `src/features/transactions/hooks/useTransactions.ts:30`                                                 | lista de transacciones                                                             |
| `['transaction-summary', filters]`         | `src/features/transactions/hooks/useTransactionSummary.ts:17`                                           | resumen de transacciones                                                           |
| `['accounts']`                             | `src/features/accounts/hooks/useAccounts.ts:8` y `src/features/credit-cards/hooks/useCreditCards.ts:23` | cuentas con balances                                                               |
| `['dashboard']` y `['dashboard', 'trend']` | `src/features/dashboard/hooks/useDashboard.ts:28,33`                                                    | summary, proyección, resumen de gastos fijos, tarjetas y deudas, tendencia mensual |
| `['credit-card-statements']`               | `src/features/credit-cards/hooks/useCreditCards.ts:10`                                                  | statements de tarjetas                                                             |
| `['fixed-expenses']`                       | `src/features/fixed-expenses/hooks/useFixedExpenses.ts:13`                                              | resumen de gastos fijos                                                            |
| `['debts', status]`                        | `src/features/debts/hooks/useDebts.ts:21`                                                               | deudas                                                                             |
| `['recurring-debt-payments', debtId]`      | `src/features/debts/hooks/useRecurringDebtPayments.ts:19`                                               | pagos recurrentes                                                                  |
| `['categories']`                           | `src/features/categories/hooks/useCategories.ts:9`                                                      | categorías                                                                         |
| `['settings']`                             | `src/features/settings/hooks/useSettings.ts:34`                                                         | settings de usuario                                                                |

Nota clave de React Query: `invalidateQueries({ queryKey: ['dashboard'] })` invalida por
**prefijo**, así que también cubre `['dashboard', 'trend']`. Igual con `['transactions']`,
`['transaction-summary']` y `['debts']`.

### Patrón actual (ejemplo real — el estilo a mantener)

`src/features/transactions/hooks/useTransactionsPage.ts:230-242` (handleSubmit, crear):

```ts
        handleCloseForm();
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } catch (err) {
        toast.error('No se pudo guardar la transacción');
```

Todos los sitios de mutación siguen este patrón: `await queryClient.invalidateQueries(...)`
(o `void queryClient.invalidateQueries(...)` en callbacks síncronos como `handleFormSuccess`).

## Commands you will need

Ejecutar desde `cuentas-frontend/`:

| Purpose   | Command             | Expected on success |
| --------- | ------------------- | ------------------- |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | exit 0, 0 failed    |
| Lint      | `npm run lint`      | exit 0              |
| Build     | `npm run build`     | exit 0              |

## Scope

**In scope** (los únicos archivos que puedes modificar):

- `src/features/transactions/hooks/useTransactionsPage.ts`
- `src/features/transactions/hooks/useTransactionsPage.test.ts` (si asserta invalidaciones)
- `src/features/accounts/hooks/useAccountsPage.ts`
- `src/features/accounts/hooks/useAccountsPage.test.ts` (si asserta invalidaciones)
- `src/features/fixed-expenses/hooks/useFixedExpenses.ts`
- `src/features/fixed-expenses/hooks/useFixedExpensesPage.ts`
- `src/features/debts/hooks/useDebts.ts`
- `src/features/debts/hooks/useDebtsPage.ts`
- `src/features/debts/hooks/useRecurringDebtPayments.ts`
- `src/features/credit-cards/hooks/useCreditCardsPage.ts`
- `src/features/categories/hooks/useCategoriesPage.ts`
- `plans/README.md` (solo la fila de status)

**Out of scope** (NO tocar):

- `src/App.tsx` — no cambies `staleTime` ni la config global; el problema es de
  invalidación, no de caché.
- Los archivos `api.ts` de cada feature y el backend — las mutaciones en sí funcionan.
- `src/features/settings/hooks/useSettings.ts` — settings no afecta datos financieros;
  su invalidación actual (`['settings']`) es suficiente.
- `src/features/accounts/components/AccountTransactionsModal.tsx` — hace fetch directo sin
  React Query; es un hallazgo aparte (no planificado aquí).
- No introduzcas `useMutation` ni refactorices los handlers — solo añade keys a las
  invalidaciones existentes.

## Git workflow

- Branch: `feature/fix-cross-entity-invalidation` desde `develop`.
- Commit estilo conventional, p. ej. `fix: invalidar dashboard y accounts tras mutaciones financieras`.
- NO hagas push ni abras PR salvo instrucción explícita del operador.

## Steps

En todos los pasos, el patrón de reemplazo es: donde hoy hay UNA invalidación, usar
`Promise.all` con la lista completa. Ejemplo del shape objetivo (para un sitio `await`):

```ts
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
]);
```

Para sitios `void` (callbacks síncronos), mantener `void Promise.all([...])`.

### Step 1: Transacciones — invalidar accounts, dashboard, summary y statements

`src/features/transactions/hooks/useTransactionsPage.ts` — 3 sitios, hoy todos invalidan
solo `['transactions']`:

- línea ~236 (`handleSubmit`, crear)
- línea ~290 (`handleSaveEdit`, editar)
- línea ~306 (`handleDelete`, borrar)

En los 3, invalidar: `['transactions']`, `['transaction-summary']`, `['accounts']`,
`['dashboard']`, `['credit-card-statements']` (una transacción puede pertenecer a una
tarjeta de crédito y cambiar su statement).

**Verify**: `npm run typecheck` → exit 0. `npx vitest run src/features/transactions` →
si algún test asserta el número/keys de invalidaciones, actualízalo para esperar las
nuevas keys (ver Test plan); todos pasan.

### Step 2: Cuentas — invalidar dashboard y statements

`src/features/accounts/hooks/useAccountsPage.ts` — 2 sitios, hoy invalidan solo `['accounts']`:

- línea ~125 (`handleSubmit`, crear/editar)
- línea ~144 (`handleDelete`)

En ambos, invalidar: `['accounts']`, `['dashboard']`, `['credit-card-statements']`
(las tarjetas de crédito son cuentas; crear/editar/borrar una afecta los statements).
En `handleDelete` añadir además `['transactions']` (las transacciones de la cuenta
eliminada desaparecen o quedan huérfanas en la lista).

**Verify**: `npm run typecheck` → exit 0. `npx vitest run src/features/accounts` → todos pasan
(actualizar asserts de invalidación si existen).

### Step 3: Gastos fijos — pagar mueve dinero

`src/features/fixed-expenses/hooks/useFixedExpenses.ts` — 3 sitios, hoy invalidan solo
`['fixed-expenses']`:

- línea ~30 (`payExpense`): el pago crea movimiento → invalidar `['fixed-expenses']`,
  `['transactions']`, `['accounts']`, `['dashboard']`.
- línea ~42 (`deleteExpense`): invalidar `['fixed-expenses']`, `['dashboard']`.
- línea ~52 (`toggleActive`): invalidar `['fixed-expenses']`, `['dashboard']` (el dashboard
  muestra el resumen de gastos fijos vía `fixedExpensesApi.getSummary()`).

`src/features/fixed-expenses/hooks/useFixedExpensesPage.ts` — línea ~85
(`handleFormSuccess`, sitio `void`): invalidar `['fixed-expenses']`, `['dashboard']`.

**Verify**: `npm run typecheck` → exit 0; `npx vitest run src/features/fixed-expenses` → todos pasan.

### Step 4: Deudas — pagar mueve dinero

`src/features/debts/hooks/useDebts.ts`:

- línea ~36 (`deleteDebt`): invalidar `['debts']`, `['dashboard']`.
- línea ~44 (`payDebt` — recibe `accountId`, el pago sale de una cuenta): invalidar
  `['debts']`, `['accounts']`, `['transactions']`, `['dashboard']`.

`src/features/debts/hooks/useDebtsPage.ts` — línea ~60 (`handleFormSuccess`, sitio `void`):
invalidar `['debts']`, `['dashboard']`.

`src/features/debts/hooks/useRecurringDebtPayments.ts` — líneas ~33 y ~41 (hoy invalidan
`['recurring-debt-payments', debtId]`): añadir `['debts']` y `['dashboard']` en ambos.

**Verify**: `npm run typecheck` → exit 0; `npx vitest run src/features/debts` → todos pasan.

### Step 5: Tarjetas de crédito — pagar statement mueve dinero

`src/features/credit-cards/hooks/useCreditCardsPage.ts` — línea ~113 (`handlePay`, recibe
`paymentAccountId`): invalidar `['credit-card-statements']`, `['accounts']`,
`['transactions']`, `['dashboard']`.

**Verify**: `npm run typecheck` → exit 0; `npx vitest run src/features/credit-cards` → todos pasan.

### Step 6: Categorías — afectan cómo se muestran las transacciones

`src/features/categories/hooks/useCategoriesPage.ts`:

- línea ~73 (update): invalidar `['categories']`, `['transactions']` (nombre/icono de
  categoría se renderiza en la lista de transacciones).
- línea ~91 (delete): invalidar `['categories']`, `['transactions']`, `['dashboard']`.

**Verify**: `npm run typecheck` → exit 0; `npx vitest run src/features/categories` → todos pasan.

### Step 7: Verificación completa

**Verify**: `npm run typecheck` → exit 0; `npm test` → exit 0, 0 failed;
`npm run lint` → exit 0; `npm run build` → exit 0.

## Test plan

- Los tests de hooks existentes (`useTransactionsPage.test.ts`, `useAccountsPage.test.ts`)
  mockean React Query; si assertan llamadas a `invalidateQueries`, actualiza los asserts
  para incluir las nuevas keys (espera N llamadas o usa
  `expect(invalidateMock).toHaveBeenCalledWith({ queryKey: ['dashboard'] })`).
- Añade al menos 1 assert nuevo por hook testeado: tras la mutación exitosa, se invalidó
  `['dashboard']`. Patrón estructural: `src/features/transactions/hooks/useTransactionsPage.test.ts`.
- Verificación: `npm test` → 0 failed.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 (0 failed)
- [ ] `npm run lint` exits 0
- [ ] `git grep -n "invalidateQueries" -- src/features/transactions/hooks/useTransactionsPage.ts` muestra `['dashboard']` y `['accounts']` entre las keys
- [ ] Cada archivo in-scope con mutaciones financieras (pasos 1-5) invalida `['dashboard']`
- [ ] `git status` no muestra archivos modificados fuera del scope
- [ ] Fila de status actualizada en `plans/README.md`

## STOP conditions

Stop and report back (do not improvise) if:

- Las líneas citadas no contienen las invalidaciones descritas (drift respecto a c139899).
- Algún hook ya usa `useMutation` con `onSuccess` en vez del patrón
  `await queryClient.invalidateQueries` (significa refactor posterior al plan — reporta antes
  de mezclar estilos).
- Un test falla tras dos intentos razonables de actualizar sus asserts.
- Descubres que el backend NO crea transacciones al pagar gastos fijos/deudas/statements
  (las invalidaciones de `['transactions']` serían innecesarias — son inocuas, pero repórtalo
  para ajustar el plan en vez de decidir tú).

## Maintenance notes

- Sobre-invalidar es seguro (solo provoca refetch); sub-invalidar muestra datos stale.
  Ante la duda en el futuro, invalidar `['dashboard']` en cualquier mutación que toque dinero.
- Si más adelante se centraliza esto (p. ej. helper `invalidateFinancialData(queryClient)` o
  migración a `useMutation` con `onSuccess`), este plan es el inventario de dependencias
  entre entidades — consérvalo como referencia.
- Revisor: verificar que no se cambió `staleTime` ni se añadió lógica nueva — solo keys.
- Deferred: `AccountTransactionsModal` hace fetch directo (sin React Query) con `limit: 1000`;
  su frescura no se beneficia de este plan. Hallazgo aparte de la auditoría (modales duplicados).

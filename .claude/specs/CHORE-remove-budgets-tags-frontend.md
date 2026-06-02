# SPEC: CHORE — Eliminar features Budgets y Tags (Frontend)

## Qué se pide

Eliminar completamente las features Budgets y Tags del frontend: carpeta `src/features/budgets/` entera, archivos de tags sueltos, y todas las referencias en archivos compartidos. Quitar la ruta `/budgets` del router, el item del Sidebar, y los tipos `Budget`, `Tag`, `TagSummary`, `TransactionTag` de `src/types/index.ts`.

---

## Archivos a eliminar completamente

| Archivo/Carpeta                                                         |
| ----------------------------------------------------------------------- |
| `src/features/budgets/` (carpeta completa con todos sus subdirectorios) |
| `src/pages/BudgetsPage.tsx`                                             |
| `src/api/tags.api.ts`                                                   |
| `src/hooks/useTags.ts`                                                  |
| `src/features/transactions/components/TagBadge.tsx`                     |
| `src/features/transactions/components/TagInput.tsx`                     |
| `src/features/transactions/components/TagSummaryView.tsx`               |

---

## Archivos compartidos a editar

| Archivo                                                          | Cambio                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.tsx`                                                    | Quitar import de `BudgetsPage`; quitar `<Route path="/budgets" .../>`                                                                                                                                                                                                                                                                       |
| `src/components/layout/Sidebar.tsx`                              | Quitar item `/budgets` del array `navItems`; quitar import del ícono `Target`                                                                                                                                                                                                                                                               |
| `src/types/index.ts`                                             | Quitar interfaces `Tag`, `TagSummary`, `TransactionTag`; quitar `Budget`, `CreateBudgetInput`; quitar campo `tags?: TransactionTag[]` de `Transaction`                                                                                                                                                                                      |
| `src/features/transactions/types.ts`                             | Quitar `tagNames` de `TransactionFormData`; quitar `tag` de `TransactionFilterState`; quitar `tagNames` de `TransactionEditInput`                                                                                                                                                                                                           |
| `src/features/transactions/components/TransactionBadges.tsx`     | Quitar render de tags                                                                                                                                                                                                                                                                                                                       |
| `src/features/transactions/components/TransactionCard.tsx`       | Quitar referencias a tags                                                                                                                                                                                                                                                                                                                   |
| `src/features/transactions/components/TransactionFormDialog.tsx` | Quitar prop `availableTags` y el campo `TagInput` del formulario                                                                                                                                                                                                                                                                            |
| `src/features/transactions/components/EditTransactionModal.tsx`  | Quitar prop `availableTags` y campo tags del formulario                                                                                                                                                                                                                                                                                     |
| `src/features/transactions/components/TransactionFilters.tsx`    | Quitar props `tag` y `availableTags`; quitar filtro por tags del UI                                                                                                                                                                                                                                                                         |
| `src/features/transactions/hooks/useTransactions.ts`             | Quitar parámetro `tag` del input y de la llamada a la API                                                                                                                                                                                                                                                                                   |
| `src/features/transactions/hooks/useTransactionsPage.ts`         | Quitar imports de `useTags`/`useTagsSummary`; quitar `tagNames` del formData inicial y de `buildInitialFormData`; quitar `tagNames` del payload en `handleSubmit` y `handleSaveEdit`; quitar `reloadTags`/`reloadTagSummary` de los handlers; quitar todo el bloque de estado de tags de `UseTransactionsPageReturn` y de la implementación |
| `src/features/transactions/api.ts`                               | Quitar campo `tagNames` de los payloads de create/update; quitar parámetro `tag` del query                                                                                                                                                                                                                                                  |
| `src/features/transactions/utils.ts`                             | Quitar utilidades de tags si existen                                                                                                                                                                                                                                                                                                        |
| `src/features/dashboard/hooks/useDashboard.ts`                   | Quitar import de `budgetsApi` y `Budget`; quitar `budgetsApi.getAll(...)` del `Promise.all` en el queryFn; quitar `budgets` del objeto retornado                                                                                                                                                                                            |
| `src/features/dashboard/types.ts`                                | Quitar campo `budgets: Budget[]` de `UseDashboardReturn`                                                                                                                                                                                                                                                                                    |
| `src/pages/DashboardPage.tsx`                                    | Quitar import de `BudgetDashboardWidget`; quitar destructuring de `budgets`; quitar `<BudgetDashboardWidget .../>` del JSX                                                                                                                                                                                                                  |
| `src/pages/TransactionsPage.tsx`                                 | Quitar imports de `TagSummaryView` y `Tag` icon; quitar botón "Resumen por tags"; quitar `{page.showTagSummary && <TagSummaryView .../>}`; quitar props `availableTags` de `TransactionFilters`, `TransactionFormDialog`, `EditTransactionModal`                                                                                            |
| `src/features/debts/components/DebtForm.tsx`                     | Verificar y quitar campo tags si existe                                                                                                                                                                                                                                                                                                     |
| `src/features/credit-cards/components/CreditCardHeader.tsx`      | Verificar y quitar referencias a tags si existen                                                                                                                                                                                                                                                                                            |
| `src/pages/SettingsPage.tsx`                                     | Verificar y quitar gestión de tags si existe                                                                                                                                                                                                                                                                                                |
| `src/features/dashboard/components/MonthComparisonCard.tsx`      | Verificar y quitar tags si existen                                                                                                                                                                                                                                                                                                          |
| `src/features/dashboard/utils.ts`                                | Verificar y quitar utilidades de tags si existen                                                                                                                                                                                                                                                                                            |
| `src/features/dashboard/hooks/useMonthComparison.ts`             | Verificar y quitar tags si existen                                                                                                                                                                                                                                                                                                          |

---

## Plan de implementación (orden seguro)

1. **Tipos globales** — editar `src/types/index.ts` primero. Al eliminar `Tag`, `TagSummary`, `TransactionTag`, `Budget`, `CreateBudgetInput` y el campo `tags` de `Transaction`, TypeScript marca todos los consumers rotos de inmediato, guiando el orden de los pasos siguientes.
2. **Tipos del módulo transactions** — editar `src/features/transactions/types.ts`. Es la capa más baja de tipos del módulo.
3. **API y hooks base** — editar `src/features/transactions/api.ts` y `src/features/transactions/hooks/useTransactions.ts`. Luego eliminar `src/api/tags.api.ts` y `src/hooks/useTags.ts`.
4. **Hook de página** — editar `src/features/transactions/hooks/useTransactionsPage.ts`. El más complejo: quitar imports, estado, interfaz pública y lógica de handlers. Eliminar `TagBadge.tsx`, `TagInput.tsx`, `TagSummaryView.tsx`.
5. **Componentes del módulo transactions** — editar `TransactionBadges`, `TransactionCard`, `TransactionFormDialog`, `EditTransactionModal`, `TransactionFilters`.
6. **Dashboard** — editar `useDashboard.ts`, `types.ts`, `DashboardPage.tsx`. Verificar y editar `MonthComparisonCard`, `utils.ts`, `useMonthComparison.ts`.
7. **Carpeta budgets y página** — eliminar `src/features/budgets/` completo y `src/pages/BudgetsPage.tsx`.
8. **Router y Sidebar** — editar `src/App.tsx` y `src/components/layout/Sidebar.tsx`. Al final, para evitar broken imports durante la edición.
9. **Verificaciones pendientes** — revisar `DebtForm.tsx`, `CreditCardHeader.tsx`, `SettingsPage.tsx`, `dashboard/utils.ts` antes de cerrar.
10. **Verificación final** — `npx tsc --noEmit` debe pasar sin errores.

---

## Criterios de verificación

- `npx tsc --noEmit` sin errores
- No quedan imports rotos en ningún archivo
- La ruta `/budgets` devuelve 404 (no existe en el router)
- El Sidebar no muestra el item "Presupuestos"
- Las transacciones crean y editan correctamente sin campos de tags

---

## Fuera de scope

- No se modifica `TransactionCategorySummaryModal` ni `TransactionGroupedView` — sin dependencias de tags
- No se toca `ReceiptScanner` — sin dependencias de tags/budgets
- No se rediseña la UI de transacciones más allá de quitar los elementos eliminados
- No se refactoriza ninguna lógica existente que no sea tags/budgets

---

## Notas de riesgo

- Tags es transversal — hay ~10 componentes de transacciones con referencias. Seguir el orden del plan para evitar broken imports intermedios
- `useTransactionsPage.ts` es el archivo más complejo: tiene estado, interfaz pública y handlers que mezclan tags con lógica de transacciones

# Implementation Plans

Generados por el skill improve el 2026-06-11, sobre el commit `c139899` (rama `main`).
Auditoría con foco en el frontend (`cuentas-frontend/`). Ejecutar en el orden de abajo
salvo que las dependencias indiquen otra cosa. Cada executor: leer el plan completo antes
de empezar, respetar sus STOP conditions y actualizar su fila al terminar.

Reglas del repo que aplican a TODOS los planes: branch `feature/<x>` desde `develop`,
nunca push directo a `main`, no pushear ni abrir PR sin confirmación explícita del usuario.

## Execution order & status

| Plan | Title                                                                     | Priority | Effort | Depends on | Status |
| ---- | ------------------------------------------------------------------------- | -------- | ------ | ---------- | ------ |
| 001  | Reconciliar migración httpOnly: tests stale + CI sin tests + docs de auth | P1       | S      | —          | TODO   |
| 002  | Invalidación de caché cross-entity tras mutaciones financieras            | P1       | M      | 001        | TODO   |
| 003  | Resolver vulnerabilidades npm audit (axios, react-router, vite)           | P2       | S      | 001        | TODO   |
| 004  | Code-splitting por ruta con React.lazy                                    | P2       | S      | 001        | TODO   |

## Dependency notes

- 002, 003 y 004 dependen de 001 porque hoy `npm test` sale con exit 1 (4 tests stale):
  sin suite verde no hay forma de verificar que esos cambios no rompen nada. 001 además
  añade `npm test` al CI, convirtiendo la suite en gate real.
- 002, 003 y 004 son independientes entre sí — pueden ejecutarse en paralelo en worktrees
  separados una vez landeado 001 (cuidado: 003 toca package-lock.json; mergearlo primero
  o último para minimizar conflictos triviales).

## Hallazgos auditados pero NO planificados (pendientes de decisión)

- **TEST-03**: 5 page hooks sin tests (`useCategoriesPage`, `useDebtsPage`,
  `useFixedExpensesPage`, `useCreditCardsPage`, `useSettingsPage`). Patrón existente:
  `useTransactionsPage.test.ts`. Esfuerzo M.
- **DEBT-01/PERF-02**: `AccountTransactionsModal` (374 LOC) y `CreditCardTransactionsModal`
  (338 LOC) duplican filtrado/agrupación/UI y hacen fetch con `limit: 1000` hardcodeado
  sin React Query. Esfuerzo M, riesgo MED.
- **DX-01**: README.md es boilerplate de Vite. Esfuerzo S.
- **Dirección — ReceiptScanner**: la UX de duplicados está construida pero desconectada
  (`TransactionsPage.tsx:162` nunca pasa `onViewExisting`; `receiptsApi.ocrOnly()` definido
  y sin uso). La feature más barata de completar.
- **Dirección — FEAT-014 Metas de ahorro**: pendiente en project-state.md, cero groundwork.
  Sería un plan de spike/diseño.
- **Dirección — FEAT-004 Dark mode**: PR #7 abierto desde 2026-04-12; investigar su estado
  antes de planificar.

## Findings considered and rejected

- **"Token de Sentry commiteado en .env"**: falso — `.env` no está trackeado (`git ls-files`
  vacío, `.gitignore` lo cubre); la versión histórica commiteada (`0204e10`, luego eliminada
  en `21a0429`) solo contenía `VITE_API_URL` (no secreto). El token de Sentry existe solo en
  el `.env` local. No re-auditar.
- **"Falta request interceptor JWT en client.ts"**: by-design — ADR-011 migró a cookie
  httpOnly con `withCredentials: true`; el interceptor sería redundante y peligroso. El bug
  real eran los tests stale (plan 001). NO añadir el interceptor jamás.
- **Non-null assertion en `credit-card-utils.ts:85`** (`account!.cutoffDay!`): protegido por
  el guard de `isInClosedPeriod` en la línea 80 (retorna false si `!account || !account.cutoffDay`).
  Frágil pero seguro; no amerita plan.
- **Comparación float en `FixedExpenseTable.tsx:65`** (`amount !== payingItem.amount`):
  el valor del input se prefija con `item.amount.toString()` y `parseFloat` hace round-trip
  exacto; el peor caso es enviar el monto explícito igual al default. Sin impacto.
- **"Race condition" en refs de ReceiptScanner**: JS es single-threaded; no existe tal carrera.
- **Catch silencioso en logout (`AuthContext.tsx:60`)**: intencional — si el logout falla en
  red, el estado del cliente igual se limpia. Edge case aceptable.
- **`manualChunks` en vite.config.ts**: prematuro — el split por ruta (plan 004) resuelve
  primero; medir después.

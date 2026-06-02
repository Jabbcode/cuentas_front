# SPEC: FEAT-018 — Rediseño dashboard — jerarquía visual y pagos próximos

## Qué se pide

Rediseñar el dashboard con jerarquía visual real. El objetivo es responder las dos preguntas clave en el primer viewport sin scroll: "¿cómo voy este mes?" y "¿qué me queda por pagar?". Implica 3 nuevos componentes, 1 nuevo hook de UI, extensión de `utils.ts` con 5 funciones puras y refactor de `DashboardPage.tsx`.

**Notion:** https://www.notion.so/37314748013a81dfbe96e6c488ec68d1

---

## Contexto relevante

- **ADR-005 (Pure UI Rule)** — `DashboardPage` debe quedar con zero `useState`, zero `useEffect`, zero API calls directas. Todo el estado va en hooks.
- **ADR-008 (Feature-module architecture)** — Nuevos componentes en `features/dashboard/components/`, nuevos hooks en `features/dashboard/hooks/`.
- **REFACTOR-FE-006** — `useDashboard` ya usa `useQuery` de TanStack Query v5. Los nuevos queries siguen el mismo patrón.
- **getMonthlyTrend** — endpoint ya existe en `dashboardApi` (api.ts línea 26) pero nunca fue consumido. Esta tarea lo usa por primera vez.

---

## Nuevo layout del dashboard

```
1. DashboardHeroCard          ← SIEMPRE VISIBLE (reemplaza SummaryCards como protagonista)
2. DashboardAlertsSection     ← CONDICIONAL (solo si hasAlerts() === true)
3. MonthlyTrendChart          ← NUEVO (6 meses, usa getMonthlyTrend)
4. DashboardSummaryCards      ← baja a posición 4, detalle secundario
5. CreditCards / Debts / FixedExpenses ← COLAPSADOS por defecto
6. NextMonthProjection        ← mantener (ya colapsable)
7. Charts detallados          ← TODO COLAPSADO por defecto
   (ExpensesByCategory, FixedVsVariable, MonthComparison, CategoryComparison)
```

---

## Archivos a crear

| Archivo                                                    | Descripción                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/dashboard/components/DashboardHeroCard.tsx`      | Balance neto (grande), progress bar % gastado, días restantes del mes, ingresos/gastos                                                             |
| `features/dashboard/components/DashboardAlertsSection.tsx` | Alertas condicionales — deudas vencidas, tarjetas >80%, pagos próximos 7 días. Renderiza `null` si `!hasAlerts(...)`                               |
| `features/dashboard/components/MonthlyTrendChart.tsx`      | Bar chart Recharts: income (verde) vs expenses (rojo). Props: `data: MonthlyTrend[]`, `loading?: boolean`. Empty state: "No hay datos disponibles" |
| `features/dashboard/hooks/useDashboardPage.ts`             | 7 boolean states para collapsibles + toggle handlers. Retorna `UseDashboardPageReturn`. Sin `useEffect`, sin API calls                             |

---

## Archivos a modificar

| Archivo                                    | Cambio                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `features/dashboard/utils.ts`              | Agregar constantes + 5 funciones puras (ver abajo)                                        |
| `features/dashboard/hooks/useDashboard.ts` | Agregar trend `useQuery` separado + `useQueryClient` + `reload()` con `invalidateQueries` |
| `features/dashboard/types.ts`              | Extender `UseDashboardReturn` + crear `UseDashboardPageReturn`                            |
| `features/dashboard/index.ts`              | Exportar nuevos componentes y hooks                                                       |
| `pages/DashboardPage.tsx`                  | Nuevo layout con `useDashboard` + `useDashboardPage`, sin `useState`                      |

---

## utils.ts — funciones y constantes nuevas

```typescript
// Constantes
export const CREDIT_UTILIZATION_ALERT_THRESHOLD = 0.8; // 80%
export const UPCOMING_PAYMENTS_DAYS_WINDOW = 7;

// Derivaciones para DashboardHeroCard
export function calcDaysLeftInMonth(): number;
export function calcSpentPercentage(expenses: number, income: number): number;
// → retorna 0 cuando income === 0

// Lógica de alertas para DashboardAlertsSection
export function calcDaysUntilDueDay(dueDay: number): number;
// → si dueDay >= hoy: dueDay - hoy
// → si dueDay < hoy: (días_restantes_en_mes) + dueDay  ← wrap-around fin de mes
// → validar: si dueDay < 1 || dueDay > 31, retornar Infinity

export function filterUpcomingFixedExpenses(
  items: (FixedExpense & { isPaidThisMonth: boolean })[],
  windowDays: number
): (FixedExpense & { isPaidThisMonth: boolean })[];
// → filtrar: isPaidThisMonth === false && calcDaysUntilDueDay(item.dueDay) <= windowDays

export function hasAlerts(
  debtsSummary: DebtsSummary | null,
  creditCardsSummary: CreditCardsSummary | null,
  fixedSummary: FixedExpenseSummary | null
): boolean;
// → true si: overdue debts > 0, O tarjeta con usagePercentage > threshold,
//           O upcoming credit payments dentro de ventana,
//           O gastos fijos pendientes dentro de ventana
```

---

## useDashboard.ts — cambios

```typescript
// Agregar al hook:
const trendQuery = useQuery<MonthlyTrend[], Error>({
  queryKey: ['dashboard', 'trend'],
  queryFn: () => dashboardApi.getMonthlyTrend(6),
});

// reload() actualizado:
const queryClient = useQueryClient();
reload: () => {
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

// Nuevos campos en el return:
monthlyTrend: trendQuery.data ?? [],
trendLoading: trendQuery.isLoading,
```

---

## types.ts — extensiones

```typescript
// Extender UseDashboardReturn (agregar):
monthlyTrend: MonthlyTrend[];
trendLoading: boolean;

// Nuevo:
export interface UseDashboardPageReturn {
  isCreditCardsOpen: boolean;
  isDebtsOpen: boolean;
  isFixedOpen: boolean;
  isProjectionOpen: boolean;
  isDetailOpen: boolean;
  toggleCreditCards: () => void;
  toggleDebts: () => void;
  toggleFixed: () => void;
  toggleProjection: () => void;
  toggleDetail: () => void;
}
```

---

## Tests requeridos (dashboard.test.ts)

Agregar describe blocks para las 5 nuevas funciones:

### `calcDaysLeftInMonth`

- retorna número positivo en día normal del mes
- retorna 0 en el último día del mes

### `calcSpentPercentage`

- caso normal (expenses=500, income=1000 → 50)
- income=0 → retorna 0 (no divide por cero)
- expenses > income → retorna >100

### `calcDaysUntilDueDay`

- dueDay >= hoy → dueDay - hoy
- dueDay < hoy → wrap-around (días restantes en mes + dueDay)
- dueDay === hoy → 0
- dueDay inválido (0, 32) → Infinity

### `filterUpcomingFixedExpenses`

- isPaidThisMonth === true → no incluye
- dentro de ventana → incluye
- fuera de ventana → no incluye

### `hasAlerts`

- todos null → false
- overdue debts > 0 → true
- tarjeta con usagePercentage > 0.8 → true

---

## Criterios de aceptación

- [ ] Abrir el dashboard → en el primer viewport: balance neto, % gastado, días restantes del mes
- [ ] Si hay deuda vencida o pago en <7 días → DashboardAlertsSection visible sin scroll
- [ ] Si no hay alertas → DashboardAlertsSection no renderiza (nada visible)
- [ ] MonthlyTrendChart visible con 6 barras (ingreso vs gasto por mes)
- [ ] Presionar "Actualizar" → recarga TODOS los datos incluyendo trend
- [ ] Secciones detalladas colapsadas por defecto
- [ ] `DashboardPage.tsx` sin `useState`, sin `useEffect`, sin llamadas API directas
- [ ] `tsc --noEmit` pasa sin errores
- [ ] `vitest run` pasa — incluyendo los 13 tests nuevos

---

## Orden de implementación

**Lane A (independiente):**

1. `utils.ts` — constantes + 5 funciones
2. `dashboard.test.ts` — 13 tests para funciones nuevas

**Lane B (paralelo con A):** 3. `types.ts` — extender UseDashboardReturn + UseDashboardPageReturn 4. `useDashboard.ts` — trend query + invalidateQueries 5. `useDashboardPage.ts` (nuevo)

**Después de A y B:** 6. `DashboardHeroCard.tsx` 7. `MonthlyTrendChart.tsx` (con empty state) 8. `DashboardAlertsSection.tsx` (usa utils) 9. `DashboardPage.tsx` — nuevo layout 10. `index.ts` — barrel exports 11. `tsc --noEmit` + `vitest run`

---

## Notas de diseño y edge cases

- `DashboardSummaryCards` NO se modifica — solo cambia de posición (pos 4). Su "Balance Total" es diferente al Hero: suma acumulada de todas las cuentas vs. el mes actual.
- `calcDaysUntilDueDay` maneja el wrap de fin de mes. Ejemplo: hoy=28, dueDay=2 → 4 días (no usa `dueDay >= hoy` simple).
- Collapsibles usan `useState` en `useDashboardPage.ts`, NO en `DashboardPage.tsx` (anti-pattern del proyecto).
- `reload()` usa `invalidateQueries(['dashboard'])` — invalida el main query Y el trend query con una sola llamada.
- MonthlyTrendChart renderiza empty state "No hay datos disponibles" cuando `data.length === 0`.

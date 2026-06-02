# SPEC: REFACTOR-FE-002 — Extraer BudgetDashboardWidget a hook + consolidar N+1 del Dashboard

## Qué se pide

`BudgetDashboardWidget` hace fetch propio con `useEffect` directo, violando Pure UI Rule (ADR-005).
`DashboardPage` monta con 3 bursts de API calls independientes. La tarea pide:

1. Eliminar el fetch interno del widget — recibe data como props.
2. Consolidar el fetch de presupuestos dentro de `useDashboard`, reduciendo los bursts de 3 a 2.

---

## Diagnóstico exacto

**Archivo violador:** `src/features/budgets/components/BudgetDashboardWidget.tsx`

**Violación (líneas 1–33):**

- Importa `budgetsApi` directamente en un componente (línea 8).
- Declara `useState` para `budgets` y `loading` (líneas 14–15).
- Ejecuta `useEffect` con `budgetsApi.getAll(now.getMonth() + 1, now.getFullYear())` al montar (líneas 17–33).
- El catch es silent (línea 23) — no hay manejo de error ni exposición al exterior.

**Endpoint usado:** `GET /budgets?month=<mes_actual>&year=<año_actual>` — mismo que `budgetsApi.getAll(month, year)` de `useBudgets.ts`.

**Datos que consume el widget:**

- `budgets: Budget[]` — lista completa del mes actual.
- Deriva `overBudgetCount` y `nearLimitCount` en el cuerpo del componente (líneas 37–38).
- Renderiza hasta los primeros 4 (`budgets.slice(0, 4)`).

**Situación actual en DashboardPage:**

- Burst 1 — `useDashboard`: `Promise.all` de 7 calls al montar.
- Burst 2 — `useMonthComparison`: 2 calls adicionales al montar.
- Burst 3 — `BudgetDashboardWidget`: 1 call propia (`budgetsApi.getAll`).

---

## Contexto de Notion (tareas Done relacionadas)

No se encontraron tareas Done directamente relacionadas en Notion. El contexto relevante proviene de las ADR y el project-state:

- **ADR-005 (Pure UI Rule):** Component files deben tener cero `useEffect` y cero fetch directo. Todo fetch va en hooks.
- **ADR-008 (Feature-module architecture):** `DashboardPage` solo puede importar desde barrels de features. El fetch de presupuestos debe vivir en `src/features/budgets/hooks/` o integrarse en `src/features/dashboard/hooks/useDashboard.ts`.
- **Refactor Feature-Module (PRs #22–#25):** Ya migró `budgets` a `src/features/budgets/`. `useBudgets.ts` existe y hace exactamente el mismo endpoint que el widget — reutilizable sin cambios.

---

## Contexto de código

- `src/features/budgets/components/BudgetDashboardWidget.tsx` — componente a sanear; actualmente hace fetch propio.
- `src/features/budgets/hooks/useBudgets.ts` — hook base que ya implementa `budgetsApi.getAll(month, year)` con `loading`, `error` y `reload`. Es el candidato exacto a reutilizar para el widget.
- `src/features/budgets/api.ts` — `budgetsApi.getAll(month, year)`: único método necesario para el widget.
- `src/features/budgets/types.ts` — tiene `UseBudgetsReturn`; necesita nueva interface `UseBudgetWidgetReturn` o puede reutilizar `UseBudgetsReturn` directamente.
- `src/features/dashboard/hooks/useDashboard.ts` — hook central del dashboard; hace `Promise.all` de 7 calls; es donde se añade la 8ª call para presupuestos del mes actual.
- `src/features/dashboard/types.ts` — debe extenderse con `budgets: Budget[]` en `UseDashboardReturn`.
- `src/pages/DashboardPage.tsx` — página orquestadora; actualmente usa `<BudgetDashboardWidget />` sin props; debe pasar `budgets` y `loading`.

---

## Archivos a tocar

| Archivo                                                     | Cambio                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/features/budgets/hooks/useBudgetWidget.ts`             | Crear: hook delgado que llama `useBudgets` con mes/año actual; expone `budgets` y `loading`        |
| `src/features/budgets/types.ts`                             | Agregar `UseBudgetWidgetReturn` con `budgets: Budget[]` y `loading: boolean`                       |
| `src/features/budgets/components/BudgetDashboardWidget.tsx` | Eliminar `useEffect`, `useState`, import de `budgetsApi`; recibir `budgets` y `loading` como props |
| `src/features/dashboard/hooks/useDashboard.ts`              | Añadir `budgetsApi.getAll` al `Promise.all`; exponer `budgets: Budget[]` en el return              |
| `src/features/dashboard/types.ts`                           | Añadir `budgets: Budget[]` a `UseDashboardReturn`                                                  |
| `src/features/budgets/index.ts`                             | Exportar `useBudgetWidget` y las props del widget si no están ya expuestas                         |
| `src/pages/DashboardPage.tsx`                               | Destruir `budgets` desde `useDashboard`; pasar `budgets` como prop a `<BudgetDashboardWidget>`     |

---

## Decisión requerida

**Opción A — Fetch integrado en `useDashboard` (propuesta de la tarea):**
`useDashboard` añade `budgetsApi.getAll` al `Promise.all` existente. `DashboardPage` pasa `budgets` al widget como prop. Se crea `useBudgetWidget` como hook delgado para que el widget pueda usarse en otros contextos con su propia fuente de datos.
Tradeoff: consolida el burst (2 bursts en lugar de 3), máxima cohesión en el dashboard. Requiere que `useDashboard` conozca el módulo `budgets` — acoplamiento cross-module controlado (ya existe este patrón con `creditCardsApi` y `debtsApi` en el mismo hook).

**Opción B — Hook propio `useBudgetWidget` sin tocar `useDashboard`:**
Solo se crea `useBudgetWidget` y `DashboardPage` lo llama directamente. El widget recibe props. No se toca `useDashboard`.
Tradeoff: más simple, no agrega acoplamiento en `useDashboard`; pero NO consolida el burst — siguen siendo 3 fuentes de datos en la página.

Recomiendo Opción A porque: (1) `useDashboard` ya importa de otros módulos (`creditCardsApi`, `debtsApi`, `fixedExpensesApi`) — el patrón está establecido; (2) la tarea pide explícitamente reducir a 2 bursts; (3) `useBudgetWidget` se crea igualmente como hook de conveniencia para uso fuera del dashboard, sin duplicar lógica.

---

## Propuesta

1. Crear `useBudgetWidget.ts`: wrapper delgado sobre `useBudgets` con mes/año actual hardcodeado — expone `{ budgets, loading }` tipados con `UseBudgetWidgetReturn`.
2. Modificar `useDashboard.ts`: añadir `budgetsApi.getAll(currentMonth, currentYear)` al `Promise.all`; añadir estado `budgets`; exponerlo en el return.
3. Actualizar `UseDashboardReturn` en `dashboard/types.ts` con `budgets: Budget[]`.
4. Limpiar `BudgetDashboardWidget.tsx`: eliminar `useEffect`, `useState`, import de `budgetsApi`; definir `BudgetDashboardWidgetProps` con `budgets: Budget[]` y `loading?: boolean`; renderizar `null` cuando `loading || budgets.length === 0` igual que ahora.
5. Actualizar `DashboardPage.tsx`: destruir `budgets` de `useDashboard`; pasar `budgets={budgets}` al widget.

El orden garantiza que el widget nunca quede roto: primero se crea el hook, luego se expone el dato desde `useDashboard`, luego se limpia el widget, finalmente se conecta la página.

---

## Fuera de scope

- Cambiar `useMonthComparison` — no es parte del problema.
- Añadir manejo de error visible en el widget — el comportamiento `null` en error se mantiene igual.
- Refactorizar otros widgets del dashboard que puedan tener violations similares.
- Agregar paginación o virtualización al widget (sigue mostrando máximo 4).
- Cambiar el endpoint de presupuestos en el backend.
- Mover `Budget` de `src/types/` a `src/features/budgets/types.ts` — fuera del scope de este refactor.

---

## Criterios de aceptación

- [ ] `BudgetDashboardWidget.tsx` no contiene `useEffect`, `useState`, ni import de `budgetsApi`
- [ ] `useBudgetWidget.ts` creado en `src/features/budgets/hooks/`
- [ ] `useDashboard` expone `budgets: Budget[]` en su return
- [ ] `DashboardPage` tiene exactamente 2 fuentes de datos: `useDashboard` y `useMonthComparison`
- [ ] `BudgetDashboardWidget` recibe `budgets` como prop — tests no requieren mock de `budgetsApi`
- [ ] `npx tsc --noEmit` pasa en 0 errores

---

## Preguntas abiertas

Ninguna. El scope está claro y el código existente confirma el patrón a seguir.

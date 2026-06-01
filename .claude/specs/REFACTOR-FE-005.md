# SPEC: REFACTOR-FE-005 — Desacoplar useAccountsPage de creditCardsApi (cross-module coupling)

## Qué se pide

Eliminar el import directo de `creditCardsApi` desde `useAccountsPage.ts` (módulo `accounts`).
El módulo `accounts` no debe conocer la implementación interna del módulo `credit-cards`.

---

## Diagnóstico exacto del coupling

**Archivo afectado:** `src/features/accounts/hooks/useAccountsPage.ts`

**Import problemático (línea 4):**

```
import { creditCardsApi } from '../../credit-cards/api';
```

**Qué hace con él (líneas 44–66):**
Un `useEffect` que se dispara cuando cambia `accounts` comprueba si hay tarjetas de crédito en la lista. Si las hay, llama `creditCardsApi.getSummary()` y construye un `Record<string, CreditCardStatement>` (llamado `statementsMap`) indexado por `account.id`. Este mapa se usa en `calculateBalanceTotals` (utils pura) y se expone en el return del hook para que la página lo consuma.

**Por qué es un problema bajo ADR-008:**
ADR-008 establece que cada feature vive en su propio directorio con un barrel como único punto de entrada público. Un módulo nunca debe importar desde el subdirectorio interno de otro módulo (`../../credit-cards/api`). La dependencia correcta, si existe, debe ir siempre a través del barrel (`../../credit-cards`). Pero en este caso el módulo `accounts` no debería tener dependencia estructural de `credit-cards` en absoluto: es una violación de separación de dominios.

---

## Contexto de Notion (tareas Done relacionadas)

No se encontraron tareas Done en Notion directamente relacionadas con este coupling. El contexto relevante viene de las decisiones arquitectónicas del proyecto:

- **ADR-008** — Feature-module architecture: barrel como único entry point público; un feature no importa internals de otro.
- **Refactor accounts (2026-05-01)** — Creó `useAccountsPage.ts` con Pure UI Rule, pero introdujo este coupling al mover lógica de resumen de tarjetas al hook de accounts.

---

## Contexto de código

- `src/features/accounts/hooks/useAccountsPage.ts` — Hook afectado. Importa `creditCardsApi` directamente desde el path interno del módulo `credit-cards`.
- `src/features/credit-cards/api.ts` — Define `creditCardsApi.getSummary()` que retorna `CreditCardsSummary` (con propiedad `cards: CreditCardStatement[]`).
- `src/features/credit-cards/index.ts` — Barrel del módulo. Ya exporta `creditCardsApi` públicamente — el import podría corregirse apuntando aquí, pero el objetivo es eliminar la dependencia estructural.
- `src/features/accounts/types.ts` — Define `UseAccountsPageReturn` con `statementsMap: Record<string, CreditCardStatement>`. Este tipo usa `CreditCardStatement` de `../../types` (global), lo cual es correcto.
- `src/features/accounts/utils.ts` — `calculateBalanceTotals` recibe `statementsMap` como parámetro — ya está desacoplada del API, no necesita cambio.
- `src/pages/AccountsPage.tsx` — Consumidor del hook. Solo consume el return, no toca APIs directamente.

---

## Archivos a tocar

| Archivo                                          | Cambio                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/accounts/hooks/useAccountsPage.ts` | Eliminar import de `creditCardsApi`; recibir `fetchCreditCardsSummary` como parámetro inyectado — o extraer la carga del summary a una prop de función del hook |
| `src/features/accounts/types.ts`                 | Agregar tipo `FetchCreditCardsSummary` para el parámetro inyectado; actualizar `UseAccountsPageReturn` si el hook recibe opciones                               |
| `src/pages/AccountsPage.tsx`                     | Importar `creditCardsApi` desde el barrel de `credit-cards` y pasarlo al hook como dependencia inyectada                                                        |

---

## Decisión requerida

**Opción A — Inyección por parámetro (dependency injection explícita):**
`useAccountsPage` acepta un parámetro opcional `fetchSummary?: () => Promise<CreditCardsSummary>`. La página lo llama pasando `creditCardsApi.getSummary`. El hook no importa nada de `credit-cards`.
Tradeoff: limpio, testeable sin mocks de módulo; la firma del hook cambia levemente — la página debe pasar la función.

**Opción B — Corrección de import al barrel (fix mínimo):**
Cambiar `import { creditCardsApi } from '../../credit-cards/api'` por `import { creditCardsApi } from '../../credit-cards'`. No elimina el coupling cross-module, solo lo hace ADR-008-compliant en cuanto a uso del barrel.
Tradeoff: cambio de una línea, sin refactor del hook; pero no resuelve el problema semántico — `accounts` sigue dependiendo estructuralmente de `credit-cards`.

Recomiendo Opción A porque el objetivo de la tarea es eliminar el coupling, no solo redirigir el import. La inyección por parámetro es el patrón correcto bajo ADR-005 y ADR-008: el hook declara qué necesita, la página decide cómo satisfacerlo. Además mejora la testeabilidad de `useAccountsPage` (los tests existentes en `useAccountsPage.test.ts` podrán mockear la función sin `vi.mock` de módulo completo).

---

## Propuesta

1. Añadir en `types.ts` el tipo `FetchCreditCardsSummary = () => Promise<CreditCardsSummary>` y agregar `fetchSummary?: FetchCreditCardsSummary` como parámetro opcional al hook.
2. En `useAccountsPage.ts`: eliminar el import de `creditCardsApi`; en el `useEffect` usar el parámetro `fetchSummary` en lugar de la llamada directa. Si `fetchSummary` no se provee, el efecto no ejecuta nada (mantiene el fallback actual de `statementsMap` vacío).
3. En `AccountsPage.tsx`: importar `creditCardsApi` desde `../../features/credit-cards` (barrel) y pasarlo como `fetchSummary={creditCardsApi.getSummary}` al invocar `useAccountsPage`.
4. Verificar que `useAccountsPage.test.ts` sigue pasando — si el test mockea el módulo de `credit-cards`, actualizar el mock para pasar la función directamente en lugar de mockear el módulo.

El cambio encaja con lo existente: `calculateBalanceTotals` ya era pura, `statementsMap` ya era el contrato del hook, y la página ya era el punto de composición correcto según ADR-005.

---

## Fuera de scope

- Cambiar la lógica de `calculateBalanceTotals` en `utils.ts` — ya está correctamente desacoplada.
- Mover `CreditCardStatement` fuera de `src/types/` — vive en el barrel global compartido, es correcto.
- Refactorizar `useCreditCards` o cualquier hook del módulo `credit-cards`.
- Cambiar cómo `AccountCard` renderiza datos de tarjeta de crédito.
- Añadir cache o React Query para el summary — fuera del scope de este refactor.

---

## Criterios de aceptación

- [ ] `useAccountsPage.ts` no tiene ningún import desde `../../credit-cards/*`
- [ ] El módulo `src/features/accounts/` no referencia ningún path de `src/features/credit-cards/` (verificable con grep)
- [ ] `AccountsPage.tsx` importa `creditCardsApi` desde el barrel `src/features/credit-cards`
- [ ] La funcionalidad de `statementsMap` sigue operativa (los balances de tarjetas se calculan igual)
- [ ] `npx tsc --noEmit` pasa en 0 errores
- [ ] Los tests existentes de `useAccountsPage.test.ts` y `accounts.test.ts` siguen en verde

---

## Preguntas abiertas

Ninguna. El scope está claro y el camino es directo.

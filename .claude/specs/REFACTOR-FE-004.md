# SPEC: REFACTOR-FE-004 — TransactionFilters mobile: colapsar detrás de botón con badge

## Qué se pide

En viewport <640px, el bloque de filtros de Transacciones ocupa toda la pantalla antes de mostrar
ninguna transacción. Se pide que en mobile los filtros estén colapsados por defecto detrás de un
botón "Filtros" con badge numérico que indica cuántos filtros están activos. En desktop el
comportamiento no cambia. Al expandir debe haber animación suave (transition).

---

## Diagnóstico del componente actual

**Archivo:** `src/features/transactions/components/TransactionFilters.tsx`

**Estructura actual:**

- Recibe 18 props: 8 valores de filtro + 2 arrays de datos (categories, accounts) + availableTags
  - `hasActiveFilters` + 8 handlers de cambio + `onClearFilters`.
- Renderiza siempre dos grids de inputs (sin ninguna condición responsive propia).
- Ya construye internamente el array `chips[]` para mostrar filtros activos como badges removibles.
  Este array tiene longitud exactamente igual al número de filtros activos — es la fuente de verdad
  para el badge del botón colapsador.
- Tiene estado local propio: `categoryDropdownOpen` y `tagDropdownOpen` (dropdowns internos).
- Tiene un `useEffect` para cerrar dropdowns al hacer click fuera (válido — no viola Pure UI Rule
  porque no hace fetch ni side effects de datos).

**Prop `hasActiveFilters`:** booleano computado en `useTransactionFilters` (línea 115–123 del hook).
No es un conteo — es `true/false`. El conteo numérico para el badge NO existe aún como valor
expuesto. Sin embargo, el array `chips[]` calculado dentro del componente ya tiene la longitud
exacta que se necesita para el badge.

**Valores default de cada filtro** (definidos en `useTransactionFilters`, línea 16–23):
| Campo | Valor default | Activo cuando |
|-------|--------------|---------------|
| `startDate` | `''` | `!== ''` |
| `endDate` | `''` | `!== ''` |
| `categoryIds` | `[]` | `length > 0` |
| `accountId` | `'all'` | `!== 'all'` |
| `minAmount` | `''` | `!== ''` |
| `maxAmount` | `''` | `!== ''` |
| `type` | `'all'` | `!== 'all'` |
| `tag` | `''` | `!== ''` |

Cada categoría seleccionada cuenta como 1 filtro activo (igual que en `chips[]`).

---

## Contexto de Notion (tareas Done relacionadas)

No se encontraron tareas Done en Notion directamente relacionadas con esta funcionalidad.
El contexto relevante proviene de las ADR del proyecto:

- **ADR-004 (TailwindCSS 4):** Sin estilos inline; usar prefijos responsive (`sm:`, `md:`, `lg:`).
- **ADR-005 (Pure UI Rule):** Estado de UI local (`useState isOpen`) es válido en el componente;
  ningún fetch, ningún side effect de datos.
- **ADR-008 (Feature-module architecture):** El cambio es contenido en
  `src/features/transactions/components/` — no requiere tocar el barrel ni otros módulos.

---

## Contexto de código

- `src/features/transactions/components/TransactionFilters.tsx` — componente a modificar; ya
  calcula `chips[]` internamente, que sirve directamente como conteo para el badge.
- `src/features/transactions/hooks/useTransactionFilters.ts` — fuente de estado de filtros;
  expone `hasActiveFilters` (boolean) pero no un conteo numérico. No necesita cambio para esta
  tarea — el conteo se deriva del array `chips[]` que ya existe en el componente.
- `src/features/transactions/hooks/useTransactionsPage.ts` — hook de página; pasa `hasActiveFilters`
  al componente vía props. No necesita cambio.
- `src/hooks/` — no existe `useMediaQuery`. No hay ningún hook de media query en el proyecto.

---

## Decisión requerida

**Opción A — CSS-only con clases Tailwind responsive (`sm:`):**
Usar `hidden sm:grid` / `block sm:hidden` para controlar visibilidad del bloque de filtros según
viewport. El estado `isOpen` se maneja con `useState` en el componente. En mobile el bloque se
oculta o muestra condicionalmente con la clase `hidden`. La animación se aplica con
`transition-all duration-200` sobre el contenedor.
Tradeoff: sin JS para detectar viewport; comportamiento controlado por CSS en desktop, por
`isOpen` en mobile. Requiere un único `useState` adicional. El badge solo aparece en mobile —
fácil de condicionar con `sm:hidden` sobre el propio botón.

**Opción B — Hook `useMediaQuery` nuevo:**
Crear `src/hooks/useMediaQuery.ts` con `window.matchMedia('(max-width: 639px)')` para detectar
mobile en JS. El componente lo usa para decidir si renderiza el botón o el bloque directo.
Tradeoff: más potente y reutilizable; pero introduce un hook nuevo para resolver algo que Tailwind
ya puede manejar con clases responsive. Agrega complejidad sin beneficio real para esta tarea
concreta. El `useEffect` interno con `matchMedia` sería un side effect adicional en el componente,
complicando su modelo mental.

Recomiendo **Opción A** porque: (1) el proyecto usa TailwindCSS 4 como única solución de estilos
(ADR-004) y los prefijos responsive son el patrón establecido para adaptar layout por viewport;
(2) no existe ningún `useMediaQuery` en el proyecto — crearlo para esta tarea sería sobre-ingeniería;
(3) el estado `isOpen` es local al componente y no cruza ninguna frontera — `useState` es correcto
(no hace falta Context ni hook externo); (4) la animación con `transition-all` es nativa de Tailwind.

---

## Propuesta

El cambio está contenido íntegramente en `TransactionFilters.tsx`:

1. Agregar `useState<boolean>` para `isFiltersOpen` (inicia en `false` en mobile — visible siempre
   en desktop por CSS).
2. El conteo del badge se obtiene de `chips.length` — ya calculado antes del return, sin cambio
   en la lógica de `chips[]`.
3. Envolver el bloque de filtros existente (los dos grids + el bloque de tags) en un `<div>`
   con clases `sm:block` + visibilidad condicional en mobile según `isFiltersOpen`. Aplicar
   `transition-all duration-200` para la animación.
4. Agregar un botón "Filtros" con badge visible solo en mobile (`sm:hidden`): muestra el conteo
   del badge solo cuando `chips.length > 0`.
5. El header existente (icono Filter + texto "Filtros" + botón "Limpiar filtros") se mantiene
   en desktop sin cambios. En mobile se reemplaza visualmente por el botón colapsador.

El orden de ejecución no afecta nada fuera del componente — es un cambio de presentación puro.

---

## Archivos a tocar

| Archivo                                                       | Cambio                                                                                                                           |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/transactions/components/TransactionFilters.tsx` | Agregar `isFiltersOpen` state; botón colapsador mobile con badge; envolver grids en div con visibilidad condicional + transition |

---

## Fuera de scope

- Crear un hook `useMediaQuery` — no necesario para esta tarea.
- Modificar `useTransactionFilters` para exponer `activeFiltersCount` — el conteo ya existe como
  `chips.length` en el componente; extraerlo al hook sería cambio de API sin beneficio en este scope.
- Modificar `useTransactionsPage` o `TransactionsPage` — el componente recibe las mismas props.
- Cambiar el comportamiento o diseño de los chips removibles en el bloque expandido.
- Añadir animación de collapse con height animada (CSS `grid-rows` trick) — `transition-all` con
  `overflow-hidden` es suficiente para cumplir el AC de "animación suave".
- Mover `TransactionFilters` a un directorio diferente o crear sub-componentes para el botón.
- Modificar los filtros de otras features (accounts, debts, etc.) aunque tengan el mismo problema.

---

## Criterios de aceptación

- [ ] En viewport <640px: bloque de filtros colapsado por defecto al cargar la página
- [ ] Botón "Filtros" siempre visible en mobile, oculto/irrelevante en desktop (desktop muestra
      el bloque directo sin botón)
- [ ] Badge numérico visible en el botón cuando `chips.length > 0`; no aparece cuando `chips.length === 0`
- [ ] Al pulsar el botón en mobile: bloque se expande/colapsa con transición suave
- [ ] Desktop (>=640px): comportamiento idéntico al actual — ningún cambio visible
- [ ] `npx tsc --noEmit` pasa en 0 errores
- [ ] No se añade ningún `useEffect` nuevo ni llamada a API dentro del componente

---

## Preguntas abiertas

Ninguna. El scope está claro, el componente está bien delimitado y el patrón con Tailwind responsive
es directo dado el ADR-004 establecido.

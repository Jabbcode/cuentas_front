# Plan 001: Reconciliar la migración a httpOnly cookies — tests stale, CI sin tests y docs de auth incorrectas

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat c139899..HEAD -- src/api/client.test.ts src/features/transactions/__tests__/transactions.test.ts src/features/settings/__tests__/settings.test.ts .github/workflows/ci.yml .claude/context.md .claude/conventions.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests / dx / docs
- **Planned at**: commit `c139899`, 2026-06-11

## Why this matters

En 2026-06-01, FIX-032 (PR #52) migró el JWT de localStorage a una cookie httpOnly
(documentado en `.claude/decisions/ADR-decisions.md`, ADR-011, línea 154). La migración
dejó tres residuos: (1) **4 tests fallan** porque asumen el diseño anterior o una feature
eliminada — `npm test` sale con exit 1; (2) **CI no ejecuta tests** (solo tsc/lint/build),
así que estas fallas no bloquean nada y futuras regresiones tampoco lo harán; (3) los
archivos de contexto `.claude/context.md` y `.claude/conventions.md` siguen diciendo
"JWT en localStorage con interceptor Authorization" — en este repo los agentes de IA leen
esos archivos antes de implementar, así que docs incorrectas producen regresiones de
seguridad reales. Este plan restaura el baseline de verificación: suite verde + CI que la
ejecuta + docs que reflejan la arquitectura actual.

## Current state

### Hechos clave (no negociables)

La arquitectura de auth ACTUAL y CORRECTA es: JWT en cookie httpOnly seteada por el
backend; el frontend usa `withCredentials: true` en Axios y NUNCA toca el token desde JS.
Fuente autoritativa: `.claude/decisions/ADR-decisions.md:154-160` (ADR-011) y línea 29:
"El interceptor de Authorization era redundante y peligroso". **El código de producción
está bien; lo que está mal son los tests y las docs.**

La feature **Tags fue eliminada** del frontend en el commit `f75113f`. El tipo
`TransactionFilterState` (`src/features/transactions/types.ts:22-31`) NO tiene campo
`tag`:

```ts
// src/features/transactions/types.ts:22
export interface TransactionFilterState {
  startDate: string;
  endDate: string;
  categoryIds: string[];
  accountId: string;
  minAmount: string;
  maxAmount: string;
  type: 'all' | 'expense' | 'income';
  groupByCategory: boolean;
}
```

### Las 4 fallas de test (salida real de `npm test` en c139899)

```
❯ src/features/transactions/__tests__/transactions.test.ts (23 tests | 1 failed)
    × returns true when tag is set
❯ src/api/client.test.ts (5 tests | 1 failed)
    × adds Authorization header when token exists in localStorage
❯ src/features/settings/__tests__/settings.test.ts (9 tests | 2 failed)
    × returns the nested error message from an Axios response
    × returns the fallback when err has no response
Test Files  3 failed | 12 passed (15)
     Tests  4 failed | 201 passed (205)
```

**Falla 1 — `src/api/client.test.ts:38-61`.** Hay un bloque `describe('request interceptor')`
con 2 tests que esperan que un interceptor lea `localStorage.token` y añada
`Authorization: Bearer ...`. Ese interceptor no existe **por diseño** (ADR-011). El cliente
real (`src/api/client.ts`, 25 líneas) solo tiene un response interceptor para 401:

```ts
// src/api/client.ts:5-11
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

Los tests del bloque `describe('response interceptor')` (líneas 63-94) son correctos y pasan.

**Falla 2 — `src/features/transactions/__tests__/transactions.test.ts:262-265`.** Test
residual de la feature Tags eliminada:

```ts
// transactions.test.ts:263-264
it('returns true when tag is set', () => {
  expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, tag: 'comida' })).toBe(true);
```

La implementación `hasActiveFilters` (`src/features/transactions/utils.ts:169-179`) es
correcta: chequea los 7 campos reales del tipo. El test está mal, no el código.

**Fallas 3 y 4 — `src/features/settings/__tests__/settings.test.ts:5-12`.** Los tests
asumen una implementación vieja de `extractApiError`. La implementación actual
(`src/features/settings/utils.ts:4-6`) delega en la utilidad compartida:

```ts
// src/features/settings/utils.ts:4
export function extractApiError(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback);
}
```

Y `getApiErrorMessage` (`src/lib/api-errors.ts:3-16`) tiene esta semántica:

- `AxiosError` sin `response` → `'Error de conexión. Verifica tu internet e intenta de nuevo.'`
- `AxiosError` con `response.data.error` → ese mensaje
- `AxiosError` con response pero sin `data.error` → fallback
- `Error` no-Axios → `err.message`
- cualquier otra cosa (null, undefined, string) → fallback

Los 2 tests que fallan:

```ts
// settings.test.ts:5-12
it('returns the nested error message from an Axios response', () => {
  const err = { response: { data: { error: 'Email already in use' } } };
  expect(extractApiError(err, 'fallback')).toBe('Email already in use');
});
// ^ falla porque el objeto plano NO es AxiosError → devuelve 'fallback'

it('returns the fallback when err has no response', () => {
  expect(extractApiError(new Error('network'), 'fallback')).toBe('fallback');
});
// ^ falla porque un Error no-Axios devuelve err.message → 'network'
```

`getApiErrorMessage` ya tiene su propio test que PASA y es el patrón a seguir:
`src/lib/__tests__/api-errors.test.ts` — construye errores con `new axios.AxiosError(...)`
y les asigna `.response`. Modela los tests nuevos sobre ese archivo.

### CI sin tests

`.github/workflows/ci.yml` (46 líneas, un solo job `lint-and-build`) ejecuta en orden:
`npm ci` → `npx tsc --noEmit` (línea 31) → `npm run lint` (línea 34) → `npm run build`
(línea 37) → check de `dist/`. **No hay paso `npm test`.**

### Docs stale

`.claude/context.md`:

- Líneas 61-67 (sección "🔐 Autenticación"): dice "Almacenamiento: localStorage con clave
  'token'" e "Interceptores: Axios intercepta requests para añadir token Authorization header".
- Línea 83: "API Client usa Axios con interceptor de token".
- Línea 107: "Autenticación: Bearer token en header `Authorization`".
- Líneas 109-115 (sección "👥 Estado del Usuario"): "Token JWT en `localStorage.token`".

`.claude/conventions.md`:

- Líneas 247-253 (sección "🔐 Manejo de Autenticación / Token JWT"): "Almacenado en
  `localStorage.token`", "Añadido automáticamente por interceptor en header
  `Authorization: Bearer <token>`".
- Línea 267 (sección "Manejo de Estado"): "**Server:** Datos del backend (no cachear
  localmente)" — stale desde REFACTOR-FE-006, que migró el server state a React Query
  (TanStack Query v5) con `staleTime: 30_000` (ver `src/App.tsx:18-25`).

## Commands you will need

Ejecutar desde `cuentas-frontend/` (Windows; los comandos npm son cross-platform):

| Purpose   | Command             | Expected on success |
| --------- | ------------------- | ------------------- |
| Typecheck | `npm run typecheck` | exit 0              |
| Tests     | `npm test`          | exit 0, 0 failed    |
| Lint      | `npm run lint`      | exit 0              |
| Build     | `npm run build`     | exit 0              |

## Scope

**In scope** (los únicos archivos que puedes modificar):

- `src/api/client.test.ts`
- `src/features/transactions/__tests__/transactions.test.ts`
- `src/features/settings/__tests__/settings.test.ts`
- `.github/workflows/ci.yml`
- `.claude/context.md`
- `.claude/conventions.md`
- `plans/README.md` (solo la fila de status)

**Out of scope** (NO tocar aunque parezca relacionado):

- `src/api/client.ts` — el cliente es correcto por diseño (ADR-011). NO añadas un request
  interceptor para hacer pasar el test viejo: eso reintroduciría el patrón localStorage
  que FIX-032 eliminó deliberadamente.
- `src/features/transactions/utils.ts` y `types.ts` — NO añadas un campo `tag`; la feature
  Tags fue eliminada a propósito.
- `src/lib/api-errors.ts` y su test — funcionan y están testeados.
- `src/features/settings/utils.ts` — la delegación es correcta.
- `.claude/decisions/ADR-decisions.md` y `.claude/project-state.md` — ya están correctos.

## Git workflow

- Branch: `feature/fix-stale-tests-ci-docs` creada desde `develop` (flujo del repo:
  `feature/<x>` → PR → `develop`; nunca PR directo a `main`).
- Commits estilo conventional (ejemplos del log: `fix: corregir tipo en Tooltip...`,
  `docs: actualizar project-state...`). Sugeridos: un commit `test:` para los tests,
  `chore:` para ci.yml, `docs:` para los .md.
- NO hagas push ni abras PR salvo que el operador lo instruya explícitamente.

## Steps

### Step 1: Eliminar el bloque de tests del request interceptor inexistente

En `src/api/client.test.ts`, borra el bloque completo `describe('request interceptor', ...)`
(líneas 38-61, incluido el comentario separador de la línea 38). Ambos tests del bloque
prueban un interceptor que no existe por diseño. Si tras borrarlo `localStorage.clear()`
en el `beforeEach` (línea 30) queda sin uso, déjalo — no rompe nada y otros tests podrían
añadirse.

**Verify**: `npx vitest run src/api/client.test.ts` → 3 tests, todos pasan.

### Step 2: Eliminar el test residual de Tags

En `src/features/transactions/__tests__/transactions.test.ts`, borra el test
`it('returns true when tag is set', ...)` (líneas 262-265).

**Verify**: `npx vitest run src/features/transactions/__tests__/transactions.test.ts`
→ 22 tests, todos pasan.

### Step 3: Alinear los tests de extractApiError con la semántica actual

En `src/features/settings/__tests__/settings.test.ts`, reemplaza los 2 tests que fallan
(líneas 5-12) siguiendo el patrón de `src/lib/__tests__/api-errors.test.ts`:

```ts
import axios from 'axios'; // añadir al import existente del archivo

it('returns the nested error message from an Axios response', () => {
  const err = new axios.AxiosError('Request failed with status code 400');
  err.response = {
    data: { error: 'Email already in use' },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: err.config ?? ({} as typeof err.config),
  };
  expect(extractApiError(err, 'fallback')).toBe('Email already in use');
});

it('returns the error message when err is a plain Error', () => {
  expect(extractApiError(new Error('network'), 'fallback')).toBe('network');
});
```

Los otros 3 tests del describe (objeto plano con `response.data` vacío → fallback, null
→ fallback, undefined → fallback) ya pasan con la implementación actual — no los toques.

**Verify**: `npx vitest run src/features/settings/__tests__/settings.test.ts`
→ 9 tests, todos pasan.

### Step 4: Añadir el paso de tests al CI

En `.github/workflows/ci.yml`, inserta entre el paso "Run ESLint" (termina en línea 34)
y "Build project" (línea 36):

```yaml
- name: Run tests
  run: npm test
```

Mantén la indentación de 6 espacios de los pasos vecinos.

**Verify**: `npx yaml-lint .github/workflows/ci.yml` si está disponible; si no, verificación
manual: el YAML tiene el nuevo paso con la misma indentación que `- name: Run ESLint`.
Además `npm test` local → exit 0 (tras los pasos 1-3).

### Step 5: Corregir las docs de autenticación

En `.claude/context.md`:

1. Reemplaza el contenido de la sección "🔐 Autenticación" (líneas 61-67) por:

```markdown
## 🔐 Autenticación

- **Tipo:** JWT (JSON Web Token) en cookie httpOnly gestionada por el backend (ADR-011, FIX-032)
- **Almacenamiento:** el frontend NO almacena ni lee el token — la cookie httpOnly es invisible para JS
- **Transporte:** Axios con `withCredentials: true`; el browser adjunta la cookie automáticamente
- **Sin interceptor de request:** no existe (ni debe existir) un interceptor Authorization
- **Logout automático:** el response interceptor de `src/api/client.ts` despacha el evento `auth:unauthorized` en 401 (excepto endpoints `/auth/*`); `AuthContext` lo escucha y cierra sesión
- **Sesión:** `AuthContext.checkAuth()` llama `GET /auth/me` al montar — si falla → no autenticado
- **Endpoints:** /api/auth/login, /api/auth/register, /api/auth/me, /api/auth/logout
```

2. Línea 83: cambia "API Client usa Axios con interceptor de token" por
   "API Client usa Axios con `withCredentials: true` (cookie httpOnly)".
3. Línea 107: cambia "Autenticación: Bearer token en header `Authorization`" por
   "Autenticación: cookie httpOnly enviada automáticamente (`withCredentials: true`)".
4. Sección "👥 Estado del Usuario" (líneas 109-115): elimina "Token JWT en
   `localStorage.token`" y reescribe indicando que la sesión vive en la cookie httpOnly,
   el estado de usuario en `AuthContext`, y el server state en React Query.

En `.claude/conventions.md`: 5. Sección "Token JWT" (líneas 249-253): reescribe a — token en cookie httpOnly seteada
por el backend; el frontend no lo lee ni lo escribe; `withCredentials: true`; en 401 el
response interceptor despacha `auth:unauthorized` y AuthContext cierra sesión. 6. Línea 267: cambia "**Server:** Datos del backend (no cachear localmente)" por
"**Server:** React Query (TanStack Query v5) — caché con `staleTime: 30s`, invalidación
con `queryClient.invalidateQueries` tras mutaciones".

**Verify**: `git grep -n "localStorage.token" -- .claude/` → 0 resultados en context.md y
conventions.md (puede seguir apareciendo en ADR-decisions.md/project-state.md como registro
histórico — esos archivos están fuera de scope y no deben tocarse).

### Step 6: Verificación completa

**Verify**: `npm run typecheck` → exit 0; `npm test` → exit 0 con `Tests  202 passed (202)`
(205 originales − 4 eliminados/stale + 1 reescrito = 202; acepta ±1 si el conteo difiere,
pero **0 failed** es obligatorio); `npm run lint` → exit 0; `npm run build` → exit 0.

## Test plan

Este plan corrige tests existentes; no requiere tests nuevos más allá del Step 3.
Patrón estructural para errores Axios: `src/lib/__tests__/api-errors.test.ts`.
Verificación final: `npm test` → 0 failed.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm test` exits 0 (0 failed)
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `.github/workflows/ci.yml` contiene un paso `run: npm test` entre lint y build
- [ ] `git grep -n "localStorage" -- src/api/client.test.ts` → 0 resultados
- [ ] `git grep -n "tag: 'comida'" -- src/features/transactions/` → 0 resultados
- [ ] `git grep -n "localStorage.token" -- .claude/context.md .claude/conventions.md` → 0 resultados
- [ ] `git status` no muestra archivos modificados fuera del scope
- [ ] Fila de status actualizada en `plans/README.md`

## STOP conditions

Stop and report back (do not improvise) if:

- `src/api/client.ts` contiene un request interceptor (significa que el código drifteó
  respecto a ADR-011 — la decisión de qué es correcto debe revisarla el operador).
- `TransactionFilterState` en `src/features/transactions/types.ts` SÍ tiene un campo `tag`
  (significa que Tags fue reintroducido y el test podría ser válido).
- Tras los Steps 1-3, `npm test` sigue con tests fallando que este plan no menciona.
- Cualquier fix parece requerir tocar `src/api/client.ts`, `src/lib/api-errors.ts` o
  `src/features/transactions/utils.ts`.

## Maintenance notes

- A futuro, cualquier cambio de auth debe actualizar ADR-decisions.md Y context.md Y
  conventions.md en el mismo PR — la causa raíz de este plan fue actualizar solo el código.
- Revisor: verificar que NO se añadió ningún request interceptor y que ningún archivo de
  producción cambió — este plan toca solo tests, CI y docs.
- Deferred: cobertura de los 5 page hooks sin tests (hallazgo TEST-03 de la auditoría) —
  fuera de scope aquí; puede planificarse aparte.

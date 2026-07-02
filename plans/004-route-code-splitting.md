# Plan 004: Code-splitting por ruta con React.lazy (reducir el bundle inicial)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat c139899..HEAD -- src/App.tsx src/pages/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-fix-stale-tests-ci-and-auth-docs.md (baseline de verificación)
- **Category**: perf
- **Planned at**: commit `c139899`, 2026-06-11

## Why this matters

`src/App.tsx` importa las 10 páginas de forma estática, así que el bundle inicial incluye
TODAS las rutas y sus dependencias pesadas: **recharts** (gráficos del dashboard) y
**@dnd-kit** se descargan y parsean aunque el usuario solo abra el login. Vite hace
code-splitting automático sobre `import()` dinámico — basta con convertir los imports de
páginas a `React.lazy` y añadir un `Suspense`. Resultado: primer paint más rápido
(especialmente en `/login`, la primera pantalla de toda sesión no autenticada) sin cambiar
ningún comportamiento.

## Current state

`src/App.tsx:7-16` — imports estáticos de las 10 páginas (todas con **named exports**,
detalle importante para `lazy`):

```tsx
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { FixedExpensesPage } from './pages/FixedExpensesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { DebtsPage } from './pages/DebtsPage';
import { SettingsPage } from './pages/SettingsPage';
```

Estructura de rutas (`src/App.tsx:32-53`): `/login` y `/register` sueltas; el resto anidadas
bajo un layout route `<MainLayout />` envuelto en `<ErrorBoundary>`.

Patrón de spinner existente (a reutilizar como fallback) — `src/components/layout/MainLayout.tsx:12-16`:

```tsx
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
```

Convenciones del repo que aplican: TypeScript strict (sin `any`), TailwindCSS sin inline
styles, componentes con props tipadas. `ErrorBoundary` ya existe
(`src/components/ErrorBoundary.tsx`) y captura errores de render — también capturará
fallos de carga de chunks dentro del layout route.

## Commands you will need

Ejecutar desde `cuentas-frontend/`:

| Purpose     | Command             | Expected on success                                 |
| ----------- | ------------------- | --------------------------------------------------- |
| Typecheck   | `npm run typecheck` | exit 0                                              |
| Tests       | `npm test`          | exit 0, 0 failed                                    |
| Lint        | `npm run lint`      | exit 0                                              |
| Build       | `npm run build`     | exit 0; dist/assets con chunks separados por página |
| Dev (smoke) | `npm run dev`       | app en http://localhost:5173                        |

## Scope

**In scope**:

- `src/App.tsx`
- `plans/README.md` (solo la fila de status)

**Out of scope** (NO tocar):

- Los archivos de `src/pages/` — NO cambies sus named exports a default exports; el mapeo
  se hace en App.tsx con `.then()`.
- `vite.config.ts` — no añadas `manualChunks`; el split por ruta es suficiente para este plan.
- `src/components/layout/MainLayout.tsx` y `ErrorBoundary.tsx`.
- Ningún prefetching/preloading — fuera de scope.

## Git workflow

- Branch: `feature/perf-route-code-splitting` desde `develop`.
- Commit estilo conventional: `refactor: code-splitting por ruta con React.lazy`.
- NO hagas push ni abras PR salvo instrucción explícita del operador.

## Steps

### Step 1: Convertir los imports de páginas a React.lazy

En `src/App.tsx`, reemplaza los 10 imports estáticos de páginas (líneas 7-16) por imports
lazy. Como las páginas usan named exports, el patrón es:

```tsx
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
// ... mismo patrón para las 7 restantes: AccountsPage, TransactionsPage,
// FixedExpensesPage, CategoriesPage, CreditCardsPage, DebtsPage, SettingsPage
```

Las declaraciones `const ... = lazy(...)` van a nivel de módulo, después de los imports
normales (BrowserRouter, Toaster, QueryClient, AuthProvider, ErrorBoundary, MainLayout
siguen siendo imports estáticos — no los toques).

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Añadir el componente de fallback y el Suspense

En el mismo `src/App.tsx`, añade un componente de fallback a nivel de módulo reutilizando
el patrón de spinner de MainLayout:

```tsx
function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}
```

Envuelve `<Routes>` (una sola vez, cubriendo todas las rutas) con
`<Suspense fallback={<PageFallback />}>`:

```tsx
<BrowserRouter>
  <Suspense fallback={<PageFallback />}>
    <Routes>{/* rutas sin cambios */}</Routes>
  </Suspense>
</BrowserRouter>
```

La estructura de `<Routes>`/`<Route>` no cambia en absoluto.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → exit 0.

### Step 3: Verificar el split en el build

Ejecuta `npm run build` y lista `dist/assets`.

**Verify**: `npm run build` → exit 0, y en `dist/assets/` aparecen múltiples chunks JS
nombrados por página (p. ej. `DashboardPage-*.js`, `DebtsPage-*.js`, ...) en lugar de un
único `index-*.js` monolítico. El chunk principal `index-*.js` debe ser notablemente menor
que antes del cambio (puedes comparar con `git stash` + rebuild si necesitas el número, pero
la existencia de ~10 chunks de página es suficiente como criterio).

### Step 4: Smoke test en dev

Arranca `npm run dev` y navega manualmente (o con un browser headless si tienes uno
disponible): `/login` → login → `/` (dashboard con gráficos) → `/transactions` →
`/credit-cards` → `/settings`. Cada ruta debe renderizar; entre navegaciones puede verse
brevemente el spinner del fallback — eso es correcto.

**Verify**: ninguna pantalla en blanco ni error en consola del browser sobre chunks
(`Failed to fetch dynamically imported module` sería fallo).

### Step 5: Suite completa

**Verify**: `npm test` → exit 0, 0 failed.

## Test plan

No se requieren tests nuevos: la convención del repo es no testear renderizado de UI
(CLAUDE.md: "test pure logic only"). La verificación es typecheck + build con chunks
separados + smoke test manual del Step 4 + suite existente verde.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 (0 failed)
- [ ] `npm run build` exits 0 y `dist/assets` contiene chunks JS separados por página
- [ ] `git grep -n "import { .*Page }" -- src/App.tsx` → 0 resultados (ya no hay imports estáticos de páginas)
- [ ] Solo `src/App.tsx` modificado (`git status`)
- [ ] Fila de status actualizada en `plans/README.md`

## STOP conditions

Stop and report back (do not improvise) if:

- Los imports de App.tsx no coinciden con el excerpt de Current state (drift).
- Alguna página NO usa named export (el `.then()` fallaría) — verifica antes con
  `git grep -n "export function\|export const\|export default" -- src/pages/`.
- Algún test existente importa páginas a través de App.tsx y rompe con lazy — repórtalo
  en vez de reescribir el test.
- El build no genera chunks separados (indicaría que algo re-importa todas las páginas
  estáticamente desde otro punto — investiga y reporta dónde).

## Maintenance notes

- Páginas nuevas deben seguir el mismo patrón lazy en App.tsx — vale la pena anotarlo en
  `.claude/conventions.md` en un cambio futuro de docs (fuera de scope aquí).
- Posible follow-up (no incluido, decisión del operador): mantener `LoginPage` estática
  para evitar el doble roundtrip en el primer load de usuarios no autenticados, o añadir
  `manualChunks` para separar recharts en su propio chunk vendor. Medir antes de hacerlo.
- Revisor: el diff debe ser SOLO App.tsx; la estructura de rutas idéntica; sin cambios en
  páginas.

# Decisions - Cuentas Frontend

Registro de decisiones arquitectónicas del proyecto.

---

## ADR-001: Context API para estado global de autenticación

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** `AuthContext` maneja el estado de sesión (user, isLoading, isAuthenticated). El token JWT vive en una httpOnly cookie gestionada por el backend — no en Context ni localStorage.

**Justificación:** Context API es suficiente para el volumen de estado global. El token deliberadamente no está en Context: la cookie httpOnly es invisible para JS y se envía automáticamente con cada request via `withCredentials: true`.

**Consecuencias:**

- ✅ Estado de auth simple y predecible
- ✅ Token protegido contra XSS
- ⚠️ Potencial prop drilling si el estado crece — mitigación: dividir Context por dominio

---

## ADR-002: Axios con withCredentials — sin interceptor de Authorization

**Fecha:** 2024 (actualizado 2026-06-01) | **Estado:** Aceptada

**Decisión:** Cliente Axios con `withCredentials: true`. El interceptor de request **no agrega** header `Authorization` — el browser envía la cookie automáticamente. El interceptor de response captura 401 y dispara el evento custom `auth:unauthorized`.

**Justificación:** FIX-032 migró el JWT a httpOnly cookie. Con `withCredentials: true`, el browser adjunta la cookie en cada request cross-origin sin intervención del código. El interceptor de Authorization era redundante y peligroso (podría loggear el token).

**Consecuencias:**

- ✅ Token nunca expuesto en JavaScript
- ✅ Logout automático en 401 via evento custom (FIX-023)
- ⚠️ Requiere `credentials: true` en CORS del backend
- ⚠️ `sameSite: 'none'` requerido para cross-origin (Vercel→Render)

---

## ADR-003: Zod + React Hook Form para formularios

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** Zod para schemas de validación, React Hook Form para gestión de estado del formulario. Tipos inferidos con `z.infer<>`.

**Justificación:** TypeScript-first, sin re-renders innecesarios, composable, validación consistente con el backend (que también usa Zod).

---

## ADR-004: TailwindCSS 4 — sin estilos inline

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** TailwindCSS 4 como única solución de estilos. `clsx` para condicionales. Sin `style={{}}` inline.

**Justificación:** Bundle pequeño, desarrollo rápido, temas y dark mode nativos, comunidad activa.

---

## ADR-005: Custom Hooks — Pure UI Rule

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** Toda lógica de estado, fetch y side effects en custom hooks. Componentes son UI pura — solo reciben props y llaman callbacks. Pages son orquestadores — solo componen componentes con hooks.

**Regla:** Hook files: cero JSX. Component files: cero `useEffect`, cero fetch directo.

---

## ADR-006: TypeScript strict — sin any

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** TypeScript strict mode. Sin `any`, sin `@ts-ignore`. `unknown` con type guards si necesario.

**Consecuencias:** `npx tsc --noEmit` debe pasar en 0 errores antes de cualquier PR.

---

## ADR-007: Vite 8 como build tool

**Fecha:** 2024 | **Estado:** Aceptada

**Decisión:** Vite 8 para dev server y build de producción.

**Justificación:** HMR instantáneo, build rápido via Rollup, zero config para React + TypeScript.

---

## ADR-008: Feature-module architecture

**Fecha:** 2026-05-01 | **Estado:** Aceptada

**Decisión:** Todo el código de dominio vive en `src/features/<module>/` con la estructura:

```
src/features/<module>/
├── index.ts          # barrel — único entry point público
├── types.ts          # tipos del módulo
├── utils.ts          # funciones puras
├── api.ts            # cliente HTTP del módulo
├── hooks/
│   ├── use<Resource>.ts       # fetch + estado base
│   └── use<Resource>Page.ts  # estado completo de página
└── components/
    └── ...
```

Pages en `src/pages/` solo importan desde el barrel del feature correspondiente.

**Justificación:** PRs #22–#25 migraron auth, budgets, credit-cards, debts, fixed-expenses, settings, transactions, dashboard. Elimina imports cruzados, facilita encontrar código por dominio, facilita tests unitarios de utils y hooks.

**Consecuencias:**

- ✅ Un feature = un directorio = una responsabilidad
- ✅ Tests de utils sin mocks de React
- ⚠️ Más archivos — trade-off aceptado a cambio de separación de concerns

---

## ADR-009: Vitest como test runner

**Fecha:** 2026-06-01 | **Estado:** Aceptada

**Decisión:** Vitest con `@testing-library/react` para tests de hooks. Patrón: `renderHook` + `vi.hoisted` para mocks de módulos. No se testean renders de componentes — solo lógica pura (utils) y transiciones de estado de hooks.

**Justificación:** Vitest es el test runner nativo de Vite — configuración mínima, velocidad máxima. `vi.hoisted` resuelve el problema de mocks con módulos que se importan antes del mock.

**Consecuencias:**

- ✅ Tests de hooks con `renderHook` sin levantar DOM
- ✅ Utils testables sin React
- ⚠️ Hooks con 10+ dependencias requieren muchos mocks — usar `vi.mock` de módulo completo

---

## ADR-010: Sentry para error tracking y observabilidad

**Fecha:** 2026-06-01 | **Estado:** Aceptada

**Decisión:** Sentry con source maps, user context (`setSentryUser`/`clearSentryUser`), browserTracing, Sentry Logs panel. Tunnel en `/api/monitoring/sentry-tunnel` para evitar bloqueo por ad blockers.

**Justificación:** En producción era imposible diagnosticar errores sin tracking. El tunnel es necesario porque los ad blockers bloquean `*.sentry.io` directamente.

**Consecuencias:**

- ✅ Stack traces reales en producción (source maps)
- ✅ Errores asociados al usuario
- ✅ Logs del frontend visibles en Sentry dashboard
- ⚠️ Requiere `VITE_SENTRY_DSN` en variables de entorno Vercel

---

## ADR-011: JWT en httpOnly cookie

**Fecha:** 2026-06-01 | **Estado:** Aceptada

**Decisión:** El JWT no se almacena en localStorage. El backend lo setea como httpOnly cookie en login/register. El frontend usa `withCredentials: true` en Axios. `AuthContext.checkAuth` llama `GET /auth/me` directamente al montar — si falla → no autenticado.

**Justificación:** localStorage es accesible desde JS. En una app financiera un XSS puede comprometer la sesión completa. httpOnly elimina ese vector sin cambiar la UX.

**Consecuencias:**

- ✅ `localStorage` completamente limpio de tokens
- ✅ `AuthResponse` ya no incluye `token`
- ✅ `checkAuth` siempre verifica sesión con el servidor (no confía en localStorage)
- ⚠️ `sameSite: 'none'` requerido en backend para cross-origin (Vercel→Render)
- ⚠️ Logout requiere llamar `POST /auth/logout` para limpiar la cookie del servidor

---

## Estado Actual

### Decisiones Activas: 11

- ADR-001: Context API para auth ✅
- ADR-002: Axios withCredentials ✅
- ADR-003: Zod + RHF ✅
- ADR-004: TailwindCSS 4 ✅
- ADR-005: Pure UI Rule ✅
- ADR-006: TypeScript strict ✅
- ADR-007: Vite 8 ✅
- ADR-008: Feature-module architecture ✅
- ADR-009: Vitest ✅
- ADR-010: Sentry ✅
- ADR-011: JWT httpOnly cookie ✅

# Plan 003: Resolver las 8 vulnerabilidades reportadas por npm audit (5 high, 3 moderate)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat c139899..HEAD -- package.json package-lock.json`
> Si package.json/package-lock.json cambiaron desde que se escribió este plan, re-ejecuta
> `npm audit` y compara con la tabla de "Current state" antes de continuar; si las
> vulnerabilidades ya no coinciden, trátalo como STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED (bumps de versión en deps de producción)
- **Depends on**: plans/001-fix-stale-tests-ci-and-auth-docs.md (sin suite verde no hay forma fiable de validar los bumps)
- **Category**: security / migration
- **Planned at**: commit `c139899`, 2026-06-11

## Why this matters

`npm audit` reporta 8 vulnerabilidades (0 critical, 5 high, 3 moderate) en c139899.
Las que importan en producción: **axios 1.13.6** (cadena larga de advisories de prototype
pollution, header injection y SSRF — axios es el cliente HTTP de TODA la app) y
**react-router-dom 7.13.1** (DoS y XSS reflejado). **vite 8.0.1** y **picomatch** son
high pero solo afectan al entorno de dev/build. Todas las vulnerabilidades indican
"fix available via `npm audit fix`" — es decir, los fixes son compatibles con los rangos
semver del package.json y no requieren bumps major.

## Current state

Versiones instaladas en c139899 (verificado con `npm ls`):

| Paquete                         | Instalada    | Severidad | Vector                                                           | ¿Producción?                             |
| ------------------------------- | ------------ | --------- | ---------------------------------------------------------------- | ---------------------------------------- |
| axios                           | 1.13.6       | high      | rango vulnerable 1.0.0–1.15.2 → necesita ≥1.15.3                 | Sí — cliente HTTP de la app              |
| react-router-dom / react-router | 7.13.1       | high      | rango vulnerable 7.0.0–7.14.2 → necesita ≥7.14.3                 | Sí — routing                             |
| vite                            | 8.0.1        | high      | path traversal / fs.deny bypass en dev server                    | No — dev/build                           |
| picomatch                       | 4.0.3        | high      | ReDoS, glob matching incorrecto                                  | No — tooling (vite, vitest, lint-staged) |
| follow-redirects                | 1.15.11      | moderate  | leak de headers de auth en redirects cross-domain (dep de axios) | Sí (transitiva)                          |
| postcss                         | 8.5.8        | moderate  | XSS vía `</style>` sin escapar (necesita ≥8.5.10)                | No — build                               |
| brace-expansion                 | (transitiva) | moderate  | DoS                                                              | No — tooling                             |

`package.json` usa rangos caret (`"axios": "^1.13.6"`, `"react-router-dom": "^7.13.1"`,
`"vite": "^8.0.1"`), así que `npm audit fix` puede subir todo dentro del mismo major.

Contexto de uso que el smoke test debe cubrir:

- axios: instancia única en `src/api/client.ts` con `withCredentials: true` y un response
  interceptor que despacha `auth:unauthorized` en 401. Los tests de `src/api/client.test.ts`
  cubren ese interceptor.
- react-router-dom: `BrowserRouter`/`Routes`/`Route` en `src/App.tsx:32-53`, navegación
  programática y rutas anidadas bajo `MainLayout`.

## Commands you will need

Ejecutar desde `cuentas-frontend/`:

| Purpose   | Command             | Expected on success                    |
| --------- | ------------------- | -------------------------------------- |
| Audit     | `npm audit`         | tras el fix: "found 0 vulnerabilities" |
| Fix       | `npm audit fix`     | exit 0, sin `--force`                  |
| Typecheck | `npm run typecheck` | exit 0                                 |
| Tests     | `npm test`          | exit 0, 0 failed                       |
| Lint      | `npm run lint`      | exit 0                                 |
| Build     | `npm run build`     | exit 0                                 |

## Scope

**In scope**:

- `package.json`
- `package-lock.json`
- `plans/README.md` (solo la fila de status)

**Out of scope** (NO tocar):

- Cualquier archivo de `src/` — si un bump exige cambios de código, es una STOP condition,
  no una licencia para refactorizar.
- NUNCA usar `npm audit fix --force` — puede instalar majors con breaking changes.
- No actualizar paquetes sin vulnerabilidades "ya que estamos" (react, tailwind, etc.).

## Git workflow

- Branch: `feature/chore-npm-audit-fixes` desde `develop`.
- Commit estilo conventional: `chore: resolver vulnerabilidades npm audit (axios, react-router, vite)`.
- NO hagas push ni abras PR salvo instrucción explícita del operador.

## Steps

### Step 1: Aplicar los fixes semver-compatibles

Ejecuta `npm audit fix` (SIN `--force`).

**Verify**: `npm audit` → `found 0 vulnerabilities`. Si quedan vulnerabilidades restantes,
anota cuáles y pasa al Step 2; si `npm audit fix` no resolvió axios o react-router-dom,
ve al Step 2.

### Step 2 (solo si el Step 1 dejó vulnerabilidades): bumps manuales dirigidos

Para cada paquete aún vulnerable, instala la versión mínima parcheada dentro del mismo major:

```
npm install axios@^1.15.3
npm install react-router-dom@^7.14.3
npm install vite@latest --save-dev   # solo si vite sigue vulnerable y latest sigue siendo 8.x
```

**Verify**: `npm audit` → `found 0 vulnerabilities`, y `npm ls axios react-router-dom vite`
muestra que NINGÚN paquete cambió de major (axios sigue 1.x, react-router-dom 7.x, vite 8.x).

### Step 3: Validar que nada se rompió

Ejecuta en orden: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`.

**Verify**: los 4 comandos → exit 0. En particular `src/api/client.test.ts` (interceptor 401)
debe pasar — es el canario del bump de axios.

### Step 4: Revisar el diff del manifest

`git diff package.json` — confirma que solo cambiaron versiones de los paquetes listados
en la tabla de Current state (más sus transitivas en el lockfile). Ningún paquete nuevo,
ninguno eliminado.

**Verify**: `git diff --stat` → solo `package.json` y `package-lock.json` modificados.

## Test plan

No se escriben tests nuevos: la validación es la suite existente (que el Plan 001 dejó
verde) + build. El test de `src/api/client.test.ts` cubre el comportamiento del interceptor
de axios, que es el punto de mayor riesgo del bump.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm audit` → 0 vulnerabilities (o las restantes documentadas en el reporte final
      como sin-fix-disponible, con su advisory)
- [ ] `npm ls axios react-router-dom vite` → mismos majors que antes (1.x / 7.x / 8.x)
- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 (0 failed)
- [ ] `npm run build` exits 0
- [ ] `git status` → solo package.json y package-lock.json modificados
- [ ] Fila de status actualizada en `plans/README.md`

## STOP conditions

Stop and report back (do not improvise) if:

- `npm audit fix` propone o requiere `--force` para resolver algo.
- Un bump dentro del mismo major rompe typecheck, tests o build y el fix exigiría tocar `src/`.
- La única versión parcheada de un paquete es un major nuevo (p. ej. axios 2.x) — eso es
  una migración aparte, no este plan.
- `npm audit` reporta vulnerabilidades distintas a las de la tabla (el ecosistema se movió
  desde que se escribió el plan) — re-evalúa con el operador si el alcance sigue siendo S.

## Maintenance notes

- Recomendado (fuera de scope, decisión del operador): activar Dependabot/Renovate en el
  repo de GitHub para no acumular advisories de nuevo.
- Revisor: el diff debe ser solo manifest+lockfile; cualquier cambio en `src/` es señal de
  que el executor improvisó.
- Las vulnerabilidades de vite/picomatch/postcss son de dev/build; si alguna queda sin fix,
  documentarla como riesgo aceptado tiene sentido — pero axios y react-router-dom no pueden
  quedar vulnerables.

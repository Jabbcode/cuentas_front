# Cuentas Frontend — Claude Code

## Inicio de sesión

Al comenzar cualquier conversación en este proyecto, carga automáticamente:

1. `.claude/context.md` — stack, estructura y flujo del proyecto
2. `.claude/conventions.md` — patrones de código y convenciones
3. `.claude/decisions/ADR-decisions.md` — decisiones arquitectónicas
4. `.claude/project-state.md` — estado actual del proyecto

Luego espera instrucciones del usuario.

---

## Flujo de trabajo

Sigue el flujo de PROPUESTA → confirmación → IMPLEMENTACIÓN definido en el CLAUDE.md global. Las specs de features/refactors viven en `~/vault/workspaces/cuentas-app/specs/<feature>/spec.md` — consultarlas antes de proponer cambios que toquen código ya especificado.

## Reglas críticas

- **TypeScript strict** — sin `any`, ejecutar `npx tsc --noEmit` antes de PR
- **Flujo de ramas:** `feature/<x>` → PR → `develop` → (release) → `main`. **Nunca PR directo a `main`.**
- **Nunca pushear a main** sin confirmación explícita del usuario
- **TailwindCSS** — sin inline styles, sin clases arbitrarias innecesarias
- Props interface siempre definida en componentes
- Respuestas máximo 15 líneas — directo al grano

## Stack

React 19 + TypeScript 5.9 + Vite 8 + TailwindCSS 4 + Axios + Zod + React Hook Form

## Agents disponibles

| Agent                       | Cuándo usarlo                                   |
| --------------------------- | ----------------------------------------------- |
| `component-generator-agent` | Componente React nuevo con props tipadas        |
| `hook-creator-agent`        | Custom hook con fetching y estado               |
| `api-integration-agent`     | Cliente API + hook para un endpoint del backend |
| `validation-schema-agent`   | Schema Zod para formulario                      |

## Estado actual

Ver `.claude/project-state.md`

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

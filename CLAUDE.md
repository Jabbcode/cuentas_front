# Cuentas Frontend — Claude Code

## Inicio de sesión

Al comenzar cualquier conversación en este proyecto, carga automáticamente:

1. `.claude/system-prompt.md` — instrucciones del meta-agente
2. `.claude/context.md` — stack, estructura y flujo del proyecto
3. `.claude/conventions.md` — patrones de código y convenciones
4. `.claude/decisions/ADR-decisions.md` — decisiones arquitectónicas
5. `.claude/project-state.md` — estado actual del proyecto

Luego espera instrucciones del usuario.

---

## Flujo de trabajo

```
Usuario: "Lee la tarea FEAT-XXX de Notion"
Claude:  → Lee Notion vía MCP → genera PROPUESTA (10 líneas máx)

Usuario: "OK" / "Cambio: ..."
Claude:  → IMPLEMENTA (componente + hook + API client si aplica)
         → Verifica TypeScript sin errores antes de reportar

Usuario: "OK"
Claude:  → LISTO — pide revisión, no auto-valida
```

## Reglas críticas

- **TypeScript strict** — sin `any`, ejecutar `npx tsc --noEmit` antes de PR
- **Nunca pushear a main** sin PR y confirmación explícita del usuario
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

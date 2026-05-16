---
name: claude-cuentas-meta-agent-frontend
description: Meta-Agente Orquestador para desarrollo Frontend con Claude
version: 4.0
---

# Claude Meta-Agente — Cuentas Frontend

Orquestador central que coordina agents, skills y flujos de trabajo. Propone soluciones, espera validación antes de implementar, y actualiza Notion automáticamente.

---

## Flujo Principal

```
Usuario: "Lee la tarea FEAT-XXX de Notion"
Claude:  → Lee Notion vía MCP
         → Si campos vacíos: genera ESTRUCTURA PROPUESTA (ver task-structure-generator.md)
         → Genera PROPUESTA de implementación
         → Espera confirmación

Usuario: "OK" / "Cambio: X"
Claude:  → Implementa usando agents y skills
         → Verifica TypeScript antes de reportar
         → Reporta IMPLEMENTADO

Usuario: "OK"
Claude:  → Listo para PR
```

**Detalle de Notion automation:** Ver `.claude/notion-automation.md`
**Detalle de generación de estructura:** Ver `.claude/task-structure-generator.md`

---

## Fase 1 — PROPUESTA

Cuando el usuario confirme leer una tarea:

1. Lee Notion vía MCP, extrae contexto
2. Identifica agents/skills necesarios
3. Determina componentes/hooks/API clients afectados

```
## 📋 PROPUESTA: [Nombre de tarea]

**Agents/Skills que usaré:** [lista]
**Archivos que crearé/modificaré:**
- `/src/components/X.tsx`
- `/src/hooks/useX.ts`
- `/src/api/x.api.ts`

¿Está bien? ¿Cambios?
```

Máximo 10 líneas. Sin código aún. Espera confirmación.

---

## Fase 2 — IMPLEMENTACIÓN

Cuando el usuario diga "OK":

1. Usa el agent correspondiente según la tarea
2. Verifica tipos TypeScript sin `any`
3. Ejecuta `npx tsc --noEmit` — corrige si hay errores
4. Reporta qué se creó

```
## ✅ IMPLEMENTADO

**Archivos creados/modificados:**
- `/src/components/X.tsx`
- `/src/hooks/useX.ts`

**Build:** ✅ 0 TypeScript errors

**Próximo:** Revisa el código. ¿OK o cambios?
```

Máximo 8 líneas. No auto-valides — el usuario revisa.

---

## Fase 3 — CAMBIOS Y PR

Si el usuario pide cambios:

1. Aplica el cambio
2. Re-verifica TypeScript
3. Reporta: "**CAMBIOS REALIZADOS:** [qué cambió]"

Cuando el código esté aprobado y listo para PR:

1. Ejecuta checklist pre-PR completo (ver abajo)
2. Crea rama `feature/<descripcion>`
3. Crea PR en GitHub

---

## Automatización Notion

Al final de cada fase indica:

| Fase completada              | Status Notion                    |
| ---------------------------- | -------------------------------- |
| Usuario aprueba PROPUESTA    | `In Progress`                    |
| Reportas IMPLEMENTADO        | `Review`                         |
| PR creada                    | `Review` (con URL en Related PR) |
| Usuario dice "pushea a main" | `Done`                           |

**Claude actualiza Notion directamente** via MCP cuando el usuario aprueba.

---

## Pre-PR Checklist (OBLIGATORIO)

Antes de cualquier PR:

```bash
npx tsc --noEmit   # debe retornar 0 errors
npm run build      # debe completar sin errores
```

- ✅ Sin `any` ni `@ts-ignore`
- ✅ Props interface definida en todos los componentes
- ✅ Sin `console.log` en código final
- ✅ Sin estilos inline (solo TailwindCSS)
- ✅ Acceptance criteria cubiertos

Mensaje de PR: `✅ BUILD SUCCESSFUL — TypeScript: 0 errors | Code quality: OK`

---

## Restricciones Críticas

### Flujo de ramas — OBLIGATORIO

```
feature/<x>  →  PR → develop  →  (release)  →  main
```

- ❌ PR directo a `main` — PROHIBIDO
- ✅ Todos los PRs apuntan a `develop`
- ✅ Solo mergear a `main` si usuario dice explícitamente "pushea a main" o "mergea a main"
- ✅ Siempre `feature/<descripcion>` como rama de trabajo

### TypeScript Strict

- ❌ `any` — usar tipos explícitos e inferidos de Zod
- ❌ Reportar IMPLEMENTADO si `tsc` tiene errores
- ✅ Corregir errores antes de reportar

### TailwindCSS

- ❌ Estilos inline `style={{}}`
- ❌ Clases arbitrarias innecesarias
- ✅ Clases utilitarias Tailwind 4

### Respuestas concisas

- ✅ Máximo 15 líneas por respuesta
- ✅ Sin explicaciones innecesarias
- ✅ Sin auto-validación — el usuario revisa

### Al terminar tarea significativa

Si 3+ archivos modificados, nueva feature o decisión arquitectural:

- Actualizar `.claude/project-state.md`
- Si hay nueva decisión técnica: añadir a `.claude/decisions/ADR-decisions.md`

---

## Agents Disponibles

| Agent                       | Cuándo usarlo                                   |
| --------------------------- | ----------------------------------------------- |
| `component-generator-agent` | Componente React nuevo con props tipadas        |
| `hook-creator-agent`        | Custom hook con fetching y estado               |
| `api-integration-agent`     | Cliente API + hook para un endpoint del backend |
| `validation-schema-agent`   | Schema Zod para formulario                      |

## Skills Disponibles

`component-composition-skill` · `data-fetching-skill` · `form-management-skill` · `routing-skill` · `state-management-skill` · `styling-skill`

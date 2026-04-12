# 📋 Generación Automática de Estructura de Tareas

**Archivo:** /claude/task-structure-generator.md
**Versión:** 1.0
**Prioridad:** Operativa / Automatización

---

## 🎯 Propósito
Este protocolo autoriza a Claude para actuar como Project Manager técnico. A partir de un Título y Descripción mínimos en Notion, Claude generará la estructura técnica completa de la tarea, asegurando que todos los campos y criterios de aceptación sigan los estándares del proyecto.

---

## 🚀 Flujo de Trabajo (Workflow)

### 1. Extracción de Contexto
El usuario solicita: "Lee la tarea [ID] de Notion". Claude analiza:
- Título (Identificación del tipo: FIX, FEAT, REFACTOR).
- Descripción (Alcance técnico y archivos afectados).

### 2. Propuesta de Estructura (Claude)
Claude devuelve una propuesta con:
- **Type:** Fix, Feature, Refactor, Docs o Chore.
- **Stack:** Frontend, Backend, Full Stack o DevOps.
- **Priority:** Critical, High, Medium, Low (basado en el impacto).
- **Effort:** XS (30m), S (2h), M (4h), L (8h), XL (16h+).
- **Acceptance Criteria (AC):** Lista de validaciones (incluyendo responsive, tipos y seguridad).
- **Implementation Details:** Skills necesarias y lista de archivos a modificar/crear.

### 3. Sincronización y Acción
- **"OK":** Claude actualiza Notion y pregunta si inicia la implementación.
- **"Cambia X":** Claude ajusta la propuesta antes de actualizar Notion.
- **"OK, implementa":** Claude actualiza Notion e inicia la FASE 1 de desarrollo inmediatamente.

---

## 🧠 Lógica de Análisis Técnico

### Categorización de Stack
- **Frontend:** Keywords: UI, componentes, CSS, Tailwind, responsive, formularios.
- **Backend:** Keywords: endpoints, API, Prisma, Database, queries, services.
- **Full Stack:** Involucra cambios en contrato de API y actualización de UI.

### Definición de Criterios de Aceptación (AC)
Claude DEBE incluir siempre:
- Validaciones de TypeScript (npx tsc --noEmit).
- Verificación de Build (npm run build).
- Mobile-first approach (en tareas de Frontend).
- Validación de `userId` y seguridad (en tareas de Backend).

---

## 🔐 Reglas de Oro

1. **Validación Previa:** NUNCA escribir en Notion sin aprobación de la estructura propuesta.
2. **Alineación de Skills:** Las tareas deben proponer el uso de las habilidades documentadas en `/claude/*-skill/`.
3. **Manejo de Errores:** Toda nueva funcionalidad debe incluir criterios de aceptación para "Happy Path" y "Error States".
4. **Referencia al Estado:** Consultar `project-state.md` para asegurar que la tarea no colisione con deuda técnica existente.

---

## 📝 Ejemplo de Salida Esperada

**## 📊 ESTRUCTURA PROPUESTA: FIX-005 - Error en Balance**
- **Análisis:** Error de cálculo en el dashboard por tipos Decimal vs Number.
- **Type:** Fix | **Stack:** Full Stack | **Priority:** Critical | **Effort:** S
- **Acceptance Criteria:**
  - [ ] Balance muestra 2 decimales exactos.
  - [ ] Interceptor de Axios maneja correctamente el 401.
  - [ ] Build exitoso sin errores de tipos (TSC).
- **Detalles:** Modifica `useBalance.ts` y `accounts.service.ts`.

---
Última actualización: 2026-04-12
Estado: Activo / Listo para producción
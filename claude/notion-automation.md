# 🤖 Guía de Automatización de Notion

**Archivo:** /claude/notion-automation.md
**Versión:** 1.0
**Estado:** Operativo / Sincronización obligatoria

---

## 🎯 Propósito
Definir el flujo de actualización de estados en Notion para que el tablero de Kanban refleje siempre el estado real del desarrollo en tiempo real.

---

## 🔄 Flujo de Estados (Status Flow)

| Acción de Claude / Usuario | Status en Notion |
|----------------------------|------------------|
| Tarea leída y analizada    | To Do            |
| Propuesta aprobada ("OK")  | In Progress      |
| Código implementado        | Review           |
| PR creada en GitHub        | Review (Add PR Link) |
| Mergeado a Main            | Done             |

---

## 📌 Protocolo de Notificación
Después de cada hito, Claude DEBE incluir en su respuesta el siguiente bloque visual:

📌 **Notion Update Requerido:**
- **Campo:** Status
- **De:** [Status Anterior]
- **A:** [Nuevo Status]
- **Acción:** [Instrucción para el usuario o confirmación de MCP]

---

## 🧠 Lectura de Campos (Mapeo)
Cuando Claude lee una tarea vía MCP, mapea automáticamente:
- **Campos Técnicos:** Title, Description, Type, Stack, Priority.
- **Campos de Control:** Status, Acceptance Criteria, Implementation Details.
- **Campos de Enlace:** Related PR (Link a GitHub), Effort (Estimación).

---

## 🔐 Reglas de Sincronización

1. **Transparencia:** NUNCA cambiar un estado en Notion sin informar al usuario en el chat.
2. **Validación Manual:** Si la automatización vía MCP falla, Claude debe pedir al usuario: "Por favor, actualiza el Status a [X] manualmente en Notion".
3. **Bloqueo de Seguridad:** No proceder al siguiente estado (ej: de Review a Done) sin confirmación de que el paso anterior (Merge) fue exitoso.
4. **Link de PR:** Es obligatorio actualizar el campo 'Related PR' en cuanto se genere la Pull Request.

---

## ⚠️ Resolución de Conflictos
- Si el Status en Notion es distinto al real: Claude debe preguntar al usuario cuál es el estado correcto antes de proceder.
- Si faltan criterios de aceptación (AC): Claude debe proponerlos y esperar el "OK" antes de mover a 'In Progress'.

---
Última actualización: 2026-04-12
Estado: Activo / Listo para producción
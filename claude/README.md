# 🧠 Claude Context Guide - Cuentas Frontend

Esta carpeta es la "Fuente de Verdad" del proyecto. Contiene el manual de operaciones y la inteligencia necesaria para mantener la integridad técnica y arquitectónica.

---

## 📌 Navegación Rápida (Matriz de Consulta)

| Si necesito saber... | Consulto... | Descripción |
|----------|----------|----------|
| **El proyecto general** | `context.md` | Stack, negocio y visión. |
| **Cómo escribir código** | `conventions.md` | Naming, estructura y patrones. |
| **Verificación Técnica** | `typescript-verification.md` | 🚨 Protocolo obligatorio de Build/TSC. |
| **Gestión de Tareas** | `task-structure-generator.md` | Automatización de tickets de Notion. |
| **Estado del Proyecto** | `project-state.md` | Sprints, bugs y deuda técnica. |
| **Arquitectura / API** | `architecture/` | Flujos de datos y cliente HTTP. |

---

## 📂 Estructura de la Carpeta

### 📑 Documentación Crítica
- **context.md**: Descripción general y stack tecnológico.
- **conventions.md**: Estándares de código y estructura "Source of Truth".
- **typescript-verification.md**: Protocolo de compilación pre-entrega.
- **system-prompt.md**: Instrucciones de comportamiento para Claude.

### 🛠️ Frontend Skills (Patrones por Dominio)
Cada carpeta contiene un `SKILL.md` (reglas) y un `EXAMPLES.md` (código real):
- **component-composition-skill/**: shadcn/ui y Atomic Design.
- **form-management-skill/**: React Hook Form + Zod.
- **data-fetching-skill/**: Axios, servicios y JWT.
- **routing-skill/**: Navigation y Guards (v7).
- **state-management-skill/**: Context API y Custom Hooks.
- **styling-skill/**: Tailwind CSS 4.0 y utilidades `cn`.

### 🏛️ Arquitectura y Decisiones
- **architecture/**: Detalles de hooks, componentes y cliente API.
- **decisions/**: Registro de decisiones técnicas (ADRs).
- **guidelines/**: Estilo de código, testing y manejo de errores.

---

## 🚀 Protocolo de Trabajo para Claude

1. **Análisis:** Leer la tarea en Notion y ejecutar `task-structure-generator.md`.
2. **Contexto:** Identificar el dominio (Skill) y revisar `conventions.md`.
3. **Implementación:** Escribir código siguiendo los ejemplos de la Skill correspondiente.
4. **Validación:** Ejecutar obligatoriamente `typescript-verification.md`. No se reporta éxito sin un `npx tsc --noEmit` limpio.
5. **Cierre:** Actualizar `project-state.md` si hay cambios significativos.

---

## 🔍 Búsqueda Rápida por Tópico

- **Autenticación:** Ver `context.md` y `architecture/api-client.md` (Interceptores).
- **Llamadas HTTP:** Ver `architecture/api-client.md` y `data-fetching-skill/`.
- **Estilos:** Ver `styling-skill/` y `conventions.md` (Sección Tailwind).
- **Manejo de Estado:** Ver `state-management-skill/` y `architecture/hooks.md`.

---

## ✅ Checklist Pre-PR
- [ ] ¿Cumple con el naming de `conventions.md`?
- [ ] ¿Pasa el check de `typescript-verification.md`?
- [ ] ¿Se han eliminado los `console.log`?
- [ ] ¿Es responsive (Mobile-first)?

---
**Última actualización:** 2026-04-12
**Estado:** Activo / Obligatorio para todo colaborador (Humano o IA).
# Workflow - functional-analyst-agent (The Guard)

## 1. Fase de Ingesta (Extract)
- Lee la tarea desde Notion.
- Identifica el "Dolor del Usuario" o "Bug Report" central.

## 2. Fase de Enriquecimiento (Enrich)
- Ejecuta '/claude/task-structure-generator.md'.
- **NUEVO**: Genera una sección de "Escenarios de Error" (Ej: ¿Qué pasa si la API falla?).
- **NUEVO**: Define el "Impacto UI" (Ej: ¿Afecta al Dark Mode o Responsive?).

## 3. Fase de Verificación Lógica
- Cruza la propuesta con 'context.md' para asegurar que el stack es correcto.
- Verifica en 'ADR-decisions.md' si la funcionalidad rompe alguna decisión arquitectónica previa.

## 4. Fase de Sincronización (Notion)
- Prepara el bloque de actualización según 'notion-automation.md'.
- Presenta la propuesta al usuario en formato tabla.

## 5. Salida Final
- Tabla de estructura + Checklist de "Ready for Dev".
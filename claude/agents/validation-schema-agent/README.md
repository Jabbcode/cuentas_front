# validation-schema-agent v2.0

Agente técnico especializado en la integridad de datos y validación de esquemas.

### 🚀 Integración con el Governor
Este agente es el encargado de blindar la entrada de datos. El Meta-Agente lo invoca generalmente antes de que el `api-integration-agent` o el `hook-creator-agent` comiencen su trabajo, para asegurar que el "contrato de datos" esté definido.

### 📦 Estructura del Agente
- `AGENT.md`: Definición técnica y protocolos de validación.
- `workflow.md`: Pasos para la construcción de esquemas seguros.
- `examples.md`: Guía de patrones de validación con Zod.

**Herramienta Principal**: Zod (TypeScript-first schema validation).
**Protocolo de Salida**: Local-First (Sin código en chat).
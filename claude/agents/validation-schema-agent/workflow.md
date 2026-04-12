# Workflow - validation-schema-agent (The Validator)

## 1. Fase de Definición de Reglas
- Analiza los requisitos de negocio (ej: longitud de password, formato de email).
- Identifica campos opcionales, nulos o valores por defecto.

## 2. Fase de Estructuración (File System)
- Crea o localiza el archivo en `src/schemas/` (ej: `auth.schema.ts`).
- Prepara la exportación tanto del esquema como del tipo inferido.

## 3. Fase de Implementación Silenciosa
- Escribe el esquema utilizando las primitivas de Zod.
- Añade validaciones avanzadas (regex, comparaciones entre campos).
- Incluye el bloque de mensajes de error (`required_error`, `invalid_type_error`).

## 4. Validación Técnica
- Verifica que el tipo inferido sea compatible con el resto del sistema.
- Asegura que se sigan las `conventions.md` en el nombrado de esquemas.

## 5. Reporte de Salida
- Confirma la creación del esquema y exporta el nombre del tipo generado para uso del Meta-Agente.
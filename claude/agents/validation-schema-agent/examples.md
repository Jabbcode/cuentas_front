# Ejemplos de Esquemas de Validación

## ✅ Creación de Schema de Registro
**Instrucción**: validation-schema-agent: crear RegisterSchema
**Contexto**: Email obligatorio, password min 8 caracteres, confirmar password debe coincidir.
**Resultado esperado**:
- Crea `register.schema.ts`.
- Implementa `.refine()` para comparar passwords.
- Retorna: "✅ RegisterSchema creado con validación cruzada de password."

## ✅ Actualización de Reglas
**Instrucción**: validation-schema-agent: actualizar UserSchema
**Contexto**: El campo 'phone' ahora es obligatorio y debe seguir formato internacional.
**Resultado esperado**: Modificación directa del archivo con la nueva regex de validación.

## ❌ Error: Falta de Especificación
**Instrucción**: validation-schema-agent: haz un schema de login.
**Respuesta**: "ERROR: No se han especificado las reglas de los campos. ¿Email y password son obligatorios? ¿Longitud mínima?"
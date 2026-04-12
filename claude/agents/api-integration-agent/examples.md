# Ejemplos de Integración de Datos

## ✅ Integración de Nuevo Endpoint
**Instrucción**: api-integration-agent: integrar GET /users/profile
**Contexto**: Crear servicio y hook para obtener datos del perfil. Usar Axios.
**Resultado esperado**:
- Crea `user.service.ts` y `useUserProfile.ts`.
- Define `UserProfileDTO`.
- Retorna: "✅ Servicio de perfil e interfaz de datos creados en local."

## ✅ Refactorización de Tipos
**Instrucción**: api-integration-agent: actualizar tipos de POST /auth/login
**Contexto**: El backend ahora devuelve un campo `lastLogin`. Actualizar interfaces.
**Resultado esperado**: Edición directa de los tipos y validación de impacto en hooks.

## ❌ Error: Falta de Contrato
**Instrucción**: api-integration-agent: conéctame al backend.
**Respuesta**: "ERROR: Información de endpoint o método insuficiente. Por favor, indica la ruta y estructura de datos."
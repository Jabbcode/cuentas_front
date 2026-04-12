# Ejemplos Pro de Análisis Funcional

## ✅ Caso: Refinado de Feature Vaga
**Input**: "Añadir botón de logout"
**Acción**: functional-analyst-agent: Analiza logout.
**Resultado**:
- **AC1**: El botón debe limpiar el LocalStorage.
- **AC2**: Debe redirigir a /login.
- **AC3**: Debe invalidar el token en el api-client (interceptores).
- **Edge Case**: ¿Qué pasa si el usuario está offline al desloguearse? -> Limpiar localmente y avisar.

## ✅ Caso: Prevención de Conflictos
**Input**: "Cambiar Axios por Fetch"
**Acción**: functional-analyst-agent: Valida cambio a Fetch.
**Resultado**:
- **Bloqueo**: Conflicto detectado con ADR-002 (Axios es el estándar).
- **Recomendación**: Mantener Axios o crear un nuevo ADR antes de proceder.

## ❌ Caso: Rechazo por Falta de Contexto
**Input**: "Arregla el bug del form"
**Respuesta**: "Información insuficiente. ¿En qué ruta? ¿Qué error lanza? Por favor, proporciona el ID de Notion o el mensaje de error."
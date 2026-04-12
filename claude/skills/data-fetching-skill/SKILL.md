---
name: data-fetching-skill
description: Estándar para la obtención de datos del backend mediante Axios y gestión de JWT.
---

# Skill: Data Fetching (Axios + JWT)

## 🎯 Propósito
Estandarizar la comunicación con el backend, asegurando que todas las peticiones estén autenticadas, tipadas y manejen errores de forma consistente.

## ⚡ Triggers (Cuándo activar esta skill)
- Al crear servicios de API o hooks de fetching.
- Al implementar endpoints que requieran autenticación JWT.
- Al configurar interceptores de Axios o lógica de refresco de tokens.

## 🛠️ Especificaciones Técnicas

### 1. Tipado de Datos (TypeScript)
- **Responses:** Definir siempre la interfaz del objeto que devuelve el backend.
- **Payloads:** Tipar los cuerpos de las peticiones POST/PUT.
- **Uso:** `axios.get<UserResponse>('/endpoint')`.

### 2. Gestión de JWT
- **Headers:** Adjuntar el token en el interceptor de `Authorization: Bearer <token>`.
- **Expiración:** Manejar el error 401 de forma global para redirigir al login o refrescar el token.

### 3. Manejo de Estados y Errores
- **Loading/Error:** Gestionar estados de carga y mensajes de error amigables.
- **Try/Catch:** Implementar bloques estandarizados o usar una utilidad de manejo de errores global.

## 📏 Reglas de Oro (Best Practices)
- ✅ **Instancias de Axios:** Usar una instancia configurada (`apiClient`) en lugar de importar axios directamente en cada archivo.
- ✅ **Clean Code:** Separar la definición de la llamada (servicio) de la lógica de UI (componente/hook).
- ✅ **Variables de Entorno:** Usar `process.env` o `import.meta.env` para las URLs base.

## 🚫 Anti-Patrones (Evitar)
- ❌ **Hardcoded URLs:** Nunca escribir la URL completa en el fetch.
- ❌ **Any Type:** Prohibido usar `any` para las respuestas de la API.
- ❌ **Silent Errors:** Evitar catch vacíos que no informan al usuario o al sistema de logs.

## ✅ Checklist de Validación
- [ ] ¿La petición incluye el token JWT en las cabeceras?
- [ ] ¿Se ha definido la interfaz de respuesta en TypeScript?
- [ ] ¿Existe un manejo de carga (loading) y de error?
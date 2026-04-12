---
name: routing-skill
type: skill
version: 1.1
description: Gestión de navegación con React Router v7, protección de rutas y optimización mediante Lazy Loading.
---

# Skill: Routing & Route Protection

## 🎯 Propósito
Estandarizar la estructura de navegación del proyecto, garantizando que el acceso a las vistas esté controlado por el estado de autenticación y que la carga de recursos sea eficiente.

## ⚡ Triggers (Cuándo activar esta skill)
- Al añadir una nueva vista (page) al proyecto.
- Al implementar flujos que requieran autenticación (Login, Dashboard).
- Al configurar sub-rutas o parámetros dinámicos (ej: `/user/:id`).

## 🛠️ Especificaciones Técnicas

### 1. Definición de Rutas
- **Estructura:** Centralizar las rutas en un archivo `routes.tsx` o similar usando `createBrowserRouter`.
- **Typing:** Definir constantes para las rutas (enun o objeto literal) para evitar strings hardcodeados en los componentes.

### 2. Protección de Rutas (Guards)
- **PrivateRoute:** Componente wrapper que verifica el token JWT y redirige al `/login` si no es válido.
- **PublicOnlyRoute:** Evita que usuarios logueados accedan a páginas de Login/Registro.

### 3. Rendimiento (Lazy Loading)
- **React.lazy:** Usar carga dinámica para todas las rutas principales para reducir el bundle inicial.
- **Suspense:** Implementar un componente de fallback (loader) consistente durante la carga de páginas.

## 📏 Reglas de Oro (Best Practices)
- ✅ **Navigation Hooks:** Usar `useNavigate` para redirecciones lógicas y `Link` para navegación de usuario.
- ✅ **Dynamic Params:** Validar los parámetros de la URL (ej: `:id`) antes de usarlos en llamadas a la API.
- ✅ **Scroll Management:** Asegurar que la página haga scroll al inicio tras cada navegación.

## 🚫 Anti-Patterns (Evitar)
- ❌ **Window Location:** No usar `window.location.href` para navegación interna (rompe el estado de SPA).
- ❌ **Flat Routes:** No crear una lista plana gigante si las rutas comparten layouts; usar `Outlet` para rutas anidadas.
- ❌ **Hardcoded Paths:** Evitar `<Link to="/dashboard/settings">`. Usar rutas parametrizadas o constantes.

## ✅ Checklist de Validación
- [ ] ¿La nueva ruta está protegida si requiere autenticación?
- [ ] ¿Se utiliza `React.lazy` para la importación de la vista?
- [ ] ¿Se maneja el estado "404 Not Found" para rutas inexistentes?
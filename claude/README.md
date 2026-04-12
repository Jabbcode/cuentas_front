# Claude Context Guide - Cuentas Frontend

Esta carpeta contiene documentación y contexto completo del proyecto frontend para que Claude (o cualquier desarrollador) pueda entender la arquitectura, convenciones y estado del proyecto.

## 📂 Estructura de esta carpeta

### Documentación Principal
- **context.md** - Descripción general del proyecto, stack tecnológico y estado actual
- **conventions.md** - Convenciones de código, naming, estructura de commits
- **system-prompt.md** - Instrucciones de rol y comportamiento esperado de Claude

### Arquitectura
- **architecture/overview.md** - Diagrama conceptual y flujos de datos
- **architecture/components.md** - Estructura y patrones de componentes
- **architecture/hooks.md** - Custom hooks y su propósito
- **architecture/api-client.md** - Configuración y patrones de cliente HTTP

### Patrones y Ejemplos
- **architecture/patterns/hooks.md** - Documentación detallada de hooks
- **examples/hooks/** - Ejemplos reales de custom hooks del proyecto
- **examples/components/** - Componentes bien implementados

### Decisiones y Guías
- **decisions/** - Registro de decisiones arquitectónicas
- **guidelines/code-style.md** - Estilo de código, formatting
- **guidelines/testing-strategy.md** - Cómo testear
- **guidelines/documentation.md** - Cómo documentar código

### Estado del Proyecto
- **project-state.md** - Estado actual, sprints, deuda técnica

## 🚀 Cómo usar esta carpeta

### Si necesitas entender...
| Necesito | Consulto |
|----------|----------|
| El proyecto en general | **context.md** |
| Estructura de componentes | **architecture/components.md** |
| Hooks disponibles | **architecture/hooks.md** |
| Cómo hacer una petición HTTP | **architecture/api-client.md** |
| Convenciones de nombres | **conventions.md** |
| Decisiones pasadas | **decisions/** |
| El estado actual | **project-state.md** |

### Pasando contexto a Claude
Puedes pasar los URLs o contenido de los archivos relevantes a Claude para que tenga el contexto necesario.

**Ejemplo:**
```
"Revisa este archivo de convenciones y ayúdame a crear un nuevo componente:
<pegar contenido de conventions.md>"
```

## 📝 Mantenimiento

Esta carpeta debe mantenerse actualizada:
- Revísala al menos una vez por sprint
- Actualiza **project-state.md** regularmente
- Documenta nuevas decisiones en **decisions/**
- Añade ejemplos cuando discovers nuevos patrones

## 📚 Referencias rápidas

- **Stack:** React 19, TypeScript, Vite, TailwindCSS, React Router, React Hook Form
- **API Base:** Configurada con Axios + interceptores de auth
- **Autenticación:** JWT Token almacenado en localStorage
- **Estado:** Combinación de React hooks + Context API

```markdown
# Routing Skill

Sistema de navegación, protección de accesos y optimización de carga de vistas.

## 📂 Contenido
- **SKILL.md**: Reglas sobre protección de rutas, lazy loading y estandarización de navegación.
- **EXAMPLES.md**: Plantillas para `createBrowserRouter`, componentes `PrivateRoute` y manejo de constantes.

## 🚀 Cómo usar
Cuando necesites añadir navegación o seguridad, indica a la IA:
> "Configura una nueva ruta para [Vista] usando la skill `@SKILL.md` y el patrón de lazy loading de `@EXAMPLES.md` de la carpeta `routing-skill`."

## 🎯 Objetivos de Calidad
1. Cero acceso no autorizado a rutas privadas.
2. Bundle size optimizado mediante división de código (code-splitting).
3. Navegación predecible y tipada sin strings hardcodeados.
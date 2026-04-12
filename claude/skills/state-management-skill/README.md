```markdown
# State Management Skill

Directrices para el manejo de flujos de datos, estados locales y contextos globales.

## 📂 Contenido
- **SKILL.md**: Estándares de uso de Hooks, optimización con memoización y reglas de Context.
- **EXAMPLES.md**: Plantilla de "Safe Context" y ejemplos de implementación con Reducers.

## 🚀 Cómo usar
Indica a la IA:
> "Crea un nuevo contexto para gestionar el estado de [Funcionalidad] siguiendo la skill `@SKILL.md` y el patrón de Provider de `@EXAMPLES.md` de la carpeta `state-management-skill`."

## 🎯 Objetivos de Calidad
1. Evitar el renderizado innecesario de componentes.
2. Asegurar que el estado global sea predecible y fácil de depurar.
3. Tipado estricto en todas las acciones y estados compartidos.
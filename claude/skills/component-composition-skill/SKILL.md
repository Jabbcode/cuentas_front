---
name: component-composition-skill
type: skill
description: Estándar para la creación de componentes React modulares y tipados.
---

# Skill: Component Composition

## 🎯 Propósito
Maximizar la reutilización y mantenibilidad del código mediante el patrón de composición, evitando componentes "monolíticos" que dependen de demasiadas props de configuración.

## ⚡ Triggers (Cuándo activar esta skill)
- Al crear cualquier componente nuevo en `/src/components`.
- Al refactorizar componentes con más de 5 props de datos.
- Cuando se detecte lógica de UI duplicada.

## 🛠️ Especificaciones Técnicas

### 1. Tipado (TypeScript)
- **Props:** Usar `interface` en lugar de `type`.
- **Extensibilidad:** Extender siempre de los tipos nativos de React si el componente renderiza un elemento HTML (ej. `interface Props extends React.HTMLAttributes<HTMLDivElement>`).
- **Opcionales:** Marcar claramente props opcionales y proveer valores por defecto en la desestructuración.

### 2. Estructura de Composición
- **Slots:** Priorizar el uso de `{children}`.
- **Sub-componentes:** Para componentes complejos, usar el patrón de componentes compuestos (ej. `Card`, `Card.Header`, `Card.Body`).

## 📏 Reglas de Oro (Best Practices)
- ✅ **Single Responsibility:** Si un componente maneja estado complejo y UI, extraer el estado a un custom hook.
- ✅ **Pureza:** El componente visual debe ser lo más puro posible.
- ✅ **Named Exports:** Usar `export const Component = ...` para facilitar el refactoring y autocompletado.

## 🚫 Anti-Patrones (Evitar)
- ❌ **Prop Drilling:** No pasar props a través de más de 2 niveles; usar composición o Context.
- ❌ **Configuration Overload:** No usar booleanos para cada variante visual (ej. `isBlue`, `isLarge`, `hasShadow`). Usar una prop `variant` o composición.

## ✅ Checklist de Validación
- [ ] ¿El componente es fácil de extender sin cambiar su código interno?
- [ ] ¿Los tipos de TypeScript cubren todos los casos de uso?
- [ ] ¿Se han evitado las dependencias circulares?
---
name: styling-skill
type: skill
version: 1.1
description: Estándar de estilizado funcional mediante TailwindCSS y gestión de clases dinámicas.
---

# Skill: Styling with TailwindCSS

## 🎯 Propósito
Garantizar una interfaz visual consistente, responsiva y mantenible utilizando un enfoque de utilidades primero, evitando el CSS personalizado y el desorden de clases en el JSX.

## ⚡ Triggers (Cuándo activar esta skill)
- Al crear nuevos componentes visuales o maquetar vistas.
- Al implementar estados visuales (hover, active, focus, disabled).
- Al adaptar interfaces para diferentes tamaños de pantalla (Responsive Design).

## 🛠️ Especificaciones Técnicas

### 1. Gestión de Clases Dinámicas
- **Condicionales:** Usar la utilidad `cn` (combinación de `clsx` y `twMerge`) para evitar conflictos de especificidad.
- **Variantes:** Definir las clases base primero y luego las variaciones según props.

### 2. Diseño Responsivo y Estados
- **Mobile First:** Escribir clases base para móvil y usar prefijos (`md:`, `lg:`) para pantallas grandes.
- **Interacción:** Implementar estados de feedback (`hover:`, `focus-within:`, `dark:`) de forma sistemática.

### 3. Orden de Clases
- Mantener un orden lógico: Layout (flex, grid) > Box Model (padding, margin) > Typography > Visuals (bg, border, shadow).

## 📏 Reglas de Oro (Best Practices)
- ✅ **Composición:** Extraer grupos de clases repetitivos a constantes o sub-componentes en lugar de usar `@apply` en CSS.
- ✅ **Arbitrary Values:** Evitar valores arbitrarios como `top-[13px]`. Usar la escala de Tailwind o extender el `tailwind.config.js`.
- ✅ **Semantic Colors:** Usar nombres de colores semánticos (ej: `text-primary`, `bg-error`) definidos en el tema.

## 🚫 Anti-Patterns (Evitar)
- ❌ **Inline Styles:** Prohibido el uso del atributo `style={{...}}` a menos que sea para valores calculados dinámicamente (ej: posiciones de scroll).
- ❌ **Long Class Strings:** No dejar strings de clases de más de 10 elementos sin organizar o extraer.
- ❌ **Specificity Wars:** No usar `!important` (prefijo `!`) a menos que se esté sobrescribiendo una librería externa.

## ✅ Checklist de Validación
- [ ] ¿El componente es totalmente funcional en móvil y escritorio?
- [ ] ¿Se han utilizado las variables del tema (colores, espaciados)?
- [ ] ¿Las clases condicionales usan la utilidad `cn` o `clsx`?
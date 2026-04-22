---
name: styling-skill
description: Estilizar con TailwindCSS 4 — clases utilitarias, clsx para condicionales y diseño responsivo
type: skill
---

## Cuándo Usar

- Al escribir JSX con clases TailwindCSS
- Al aplicar estilos condicionales
- Al construir layouts responsivos

## TailwindCSS 4 — Diferencias Clave

- Sin `tailwind.config.js` — configuración en `index.css` con `@theme`
- Sin purge manual — detección automática
- Clases utilitarias directas igual que v3

## clsx para Clases Condicionales

```typescript
import { clsx } from 'clsx';

// Condicional simple
<div className={clsx('p-4 rounded', isActive && 'bg-blue-500 text-white')} />

// Múltiples condiciones
<div className={clsx(
  'p-4 rounded-lg border-2 cursor-pointer transition-all',
  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

## Patrones de Layout Comunes

```typescript
// Flex row centrado
<div className="flex items-center gap-3" />

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// Card base
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" />

// Botón primario
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50" />

// Input base
<input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Error text
<p className="text-red-500 text-sm mt-1" />
```

## Orden de Clases (convención)

1. Layout: `flex`, `grid`, `block`
2. Dimensiones: `w-`, `h-`, `max-w-`
3. Espaciado: `p-`, `m-`, `gap-`
4. Visual: `bg-`, `border-`, `rounded-`, `shadow-`
5. Texto: `text-`, `font-`
6. Estado: `hover:`, `focus:`, `disabled:`

## Anti-patterns

- ❌ Estilos inline `style={{ color: 'red' }}` — usar clases Tailwind
- ❌ Clases arbitrarias sin necesidad `text-[#1a1a1a]` — usar escala de colores de Tailwind
- ❌ Copiar bloques de clases 3+ veces — extraer a componente
- ❌ Dark mode — no está configurado en el proyecto actualmente

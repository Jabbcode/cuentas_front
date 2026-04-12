---
name: state-management-skill
type: skill
version: 1.1
description: Gestión de estado local y global mediante Hooks (useState, useReducer) y Context API.
---

# Skill: State Management

## 🎯 Propósito
Estandarizar la gestión del flujo de datos en la aplicación, diferenciando claramente entre estado local, estado compartido y estado global, minimizando re-renders innecesarios.

## ⚡ Triggers (Cuándo activar esta skill)
- Al crear nuevos Contextos para compartir datos entre componentes no relacionados.
- Al implementar lógica de estado compleja que requiera `useReducer`.
- Al optimizar componentes mediante `useCallback` o `useMemo`.

## 🛠️ Especificaciones Técnicas

### 1. Context API Pattern
- **Provider Centralizado:** Crear un componente Provider que encapsule la lógica y el estado.
- **Custom Hook de Consumo:** Exportar siempre un hook (ej: `useMyContext`) que verifique si el contexto es `undefined`.

### 2. Hooks de Optimización
- **useCallback:** Envolver funciones que se pasan como props a componentes hijos memoizados.
- **useMemo:** Envolver cálculos costosos o derivaciones de estado complejas.

### 3. TypeScript
- **Interfaces:** Definir interfaces claras para el valor del contexto (Value) y para las acciones (si se usa reducer).

## 📏 Reglas de Oro (Best Practices)
- ✅ **Colocación del Estado:** Mantener el estado lo más cerca posible de donde se usa (Lift state up solo cuando sea necesario).
- ✅ **Multi-Context:** Preferir varios contextos pequeños por dominio (Auth, Theme, Cart) en lugar de un único "God Context" gigante.
- ✅ **Reducers:** Usar `useReducer` cuando el estado tenga múltiples sub-valores o la lógica de transición sea compleja.

## 🚫 Anti-Patterns (Evitar)
- ❌ **Prop Drilling:** No pasar estado a través de más de 3 niveles de componentes.
- ❌ **Context for Everything:** No usar Context para estados que cambian con extrema frecuencia (ej: tracking de mouse) sin optimización.
- ❌ **Missing Provider Check:** No consumir contextos sin validar si el componente está dentro del Provider.

## ✅ Checklist de Validación
- [ ] ¿El estado está tipado correctamente con TypeScript?
- [ ] ¿Existe un Custom Hook para consumir el contexto de forma segura?
- [ ] ¿Se han utilizado `useCallback` o `useMemo` en los valores del Provider para evitar re-renders?
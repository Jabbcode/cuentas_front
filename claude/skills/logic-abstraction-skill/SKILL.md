---
name: logic-abstraction-skill
description: Guía para la extracción de lógica, gestión de estado reactivo y optimización de hooks
version: 1.0
---

## 🎯 Objetivo
Proporcionar un marco de trabajo para separar la lógica de negocio y el estado de la capa de presentación (UI), garantizando que el código sea reutilizable, testeable y eficiente.

## 🧠 Principios de Abstracción

### 1. Cuándo crear un Custom Hook
- **Reutilización**: Cuando la misma lógica de estado se usa en 2 o más componentes.
- **Complejidad**: Cuando un componente supera las 50 líneas de lógica interna (estado/efectos).
- **Especialización**: Para aislar integraciones externas (APIs, WebSockets, LocalStorage).

### 2. Gestión de Estado Reactivo
- **Estado Mínimo**: No duplicar información que pueda ser calculada a partir de props o de otro estado.
- **Derivación**: Preferir el uso de `useMemo` para valores derivados en lugar de sincronizarlos con `useEffect`.
- **Agrupación**: Usar `useReducer` si el estado tiene múltiples sub-valores que cambian juntos.

## ⚡ Reglas de Optimización

### Memoización Estricta
- **useCallback**: Obligatorio para funciones que se pasan como props a componentes memorizados (`React.memo`).
- **useMemo**: Obligatorio para cálculos costosos o para mantener la referencia de objetos/arrays que son dependencias de otros hooks.

### Estructura de Retorno
- **Objetos**: Preferir devolver objetos `{ state, actions }` para hooks con mucha funcionalidad (facilita la extensión).
- **Tuplas**: Solo para hooks simples tipo `[value, setValue]` (estilo useState).

## 🧪 Validaciones (Checklist)
- [ ] ¿El hook cumple con las "Rules of Hooks" (no condicionales, nivel superior)?
- [ ] ¿Están todas las dependencias incluidas en el array de `useEffect/useMemo`?
- [ ] ¿Se limpian los efectos (cleanup) para evitar memory leaks?
- [ ] ¿El tipado de salida es explícito y no usa `any`?

---
Última actualización: 2026-04-12
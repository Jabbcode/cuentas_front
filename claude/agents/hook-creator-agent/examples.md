# Ejemplos - hook-creator-agent

## ✅ Ejemplo Correcto (Uso de Skill)
**Invocación**: `hook-creator-agent: crear useAuth.ts`
**Contexto**: Gestionar estado de sesión y tokens.
**Aplicación**: 
- Usa `logic-abstraction-skill` para memorizar funciones de login/logout con `useCallback`.
- Retorna un objeto `{ user, isAuthenticated, login, logout }`.

## ✅ Ejemplo de Refactorización
**Invocación**: `hook-creator-agent: optimizar useCart.ts`
**Contexto**: El cálculo del total del carrito es lento.
**Acción**: Envolver el cálculo en un `useMemo` siguiendo la regla de "Memoización Estricta" de la skill.

## ❌ Ejemplo Incorrecto
`hook-creator-agent: haz un hook para un botón rojo`
**Razón**: El agente no debe manejar estilos ni UI, solo lógica.
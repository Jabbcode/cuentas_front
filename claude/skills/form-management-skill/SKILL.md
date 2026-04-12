---
name: form-management-skill
type: skill
version: 1.1
description: Gestión de formularios complejos con React Hook Form y validación mediante Zod.
---

# Skill: Form Management (RHF + Zod)

## 🎯 Propósito
Estandarizar la creación de formularios type-safe, asegurando una validación robusta, manejo de errores claro y una experiencia de usuario fluida con estados de carga.

## ⚡ Triggers (Cuándo activar esta skill)
- Al crear formularios con más de 2 campos.
- Cuando se requiera validación de negocio en el cliente.
- Al integrar formularios con servicios de API (Data Fetching).

## 🛠️ Especificaciones Técnicas

### 1. Arquitectura "Schema-First"
- **Zod:** Definir siempre el esquema de validación antes que el componente.
- **Inferencia:** Extraer los tipos automáticamente usando `type FormValues = z.infer<typeof schema>`.
- **Resolvers:** Usar siempre `@hookform/resolvers/zod`.

### 2. Configuración de `useForm`
- **Default Values:** Definir siempre valores iniciales para evitar "uncontrolled components".
- **Modos:** Usar `mode: 'onTouched'` o `onChange` solo si la UX lo requiere específicamente.

### 3. UX y Estados
- **Loading:** Deshabilitar botones de submit mientras `isSubmitting` sea true.
- **Feedback:** Mostrar mensajes de error específicos por campo justo debajo del input.

## 📏 Reglas de Oro (Best Practices)
- ✅ **Reset:** Ejecutar `reset()` tras un envío exitoso si no hay redirección.
- ✅ **Memoización:** Envolver el `onSubmit` en un `useCallback` si se pasa a componentes hijos.
- ✅ **Componentización:** Extraer inputs complejos a componentes reutilizables (ej. `ControlledInput`).

## 🚫 Anti-Patterns (Evitar)
- ❌ **Manual Validation:** Prohibido validar campos manualmente mediante `if` dentro del submit.
- ❌ **Inline Styles:** No usar estilos inline para estados de error; usar clases de TailwindCSS.
- ❌ **Button Type:** No usar `type="button"` para el envío; usar siempre `type="submit"` dentro del tag `<form>`.

## ✅ Checklist de Validación
- [ ] ¿El esquema de Zod tiene mensajes de error amigables?
- [ ] ¿Se infieren los tipos de TypeScript del esquema?
- [ ] ¿El botón de submit muestra un estado de carga?
- [ ] ¿Se limpian los errores al corregir el campo?
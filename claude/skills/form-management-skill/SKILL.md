---
name: form-management-skill
description: Manejar formularios complejos con React Hook Form y validación Zod
type: skill
---

## Propósito

Encapsula todo el conocimiento para crear y validar formularios en el proyecto con React Hook Form y Zod.

## Cuándo Usar Este Skill

- ✅ Crear nuevo formulario
- ✅ Validar inputs de usuario
- ✅ Manejar errores de validación
- ✅ Integrar formulario con API
- ✅ Manejar estados de carga y error

## Lo Que Sabe Hacer

- Crear formularios con React Hook Form
- Validación type-safe con Zod
- Manejo de errores claros
- Estados: loading, success, error
- Integración con API
- Memoización de callbacks
- Field arrays para inputs dinámicos

## Cuándo NO Usar Este Skill

- ❌ Para búsquedas simples (usar input normal)
- ❌ Para filtros sin validación compleja
- ❌ Para componentes sin estado de formulario

## Patrones Clave

### 1. Schema Zod Primero
```typescript
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
});
```

### 2. Hook + Form Hook
```typescript
const { register, handleSubmit, formState: { errors, isLoading } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' }
});
```

### 3. Manejo de Errores
```typescript
{errors.email && (
  <span className="text-red-500">{errors.email.message}</span>
)}
```

### 4. Estados Correctos
```typescript
<button disabled={isLoading} type="submit">
  {isLoading ? 'Enviando...' : 'Enviar'}
</button>
```

## Best Practices

1. **Schema siempre primero**: Define Zod schema antes de usar en formulario
2. **TypeScript types**: Infiere tipos del schema con `z.infer<typeof schema>`
3. **Error messages claros**: Mensajes en español y específicos
4. **Loading state**: Siempre muestra estado durante envío
5. **Memoización**: useCallback para handlers pasados a children
6. **No hardcodear valores**: Todos los campos dinámicos
7. **Reset después de envío**: `reset()` en success
8. **Validación en tiempo real**: Modo onChange si es necesario

## Anti-Patterns

❌ Validación manual en handlers (usa Zod)
❌ Props sin tipado de Zod
❌ Handlers sin useCallback
❌ Errores genéricos ("Error")
❌ Formularios sin loading state
❌ type="button" en submit (siempre type="submit")
❌ Estilos inline (usa TailwindCSS)

## Dependencias

- react-hook-form (^7.71.0)
- zod (^4.3.0)
- @hookform/resolvers (para zodResolver)

## Ejemplos

Ver `examples.md`

## Referencias

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- `conventions.md` para patrones del proyecto

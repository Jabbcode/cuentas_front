---
name: form-management-skill
description: Manejar formularios con React Hook Form + Zod — schema, useForm, validación y estados
type: skill
---

## Cuándo Usar

- Al crear formularios con validación
- Al integrar un formulario con un endpoint de la API
- Al manejar estados loading/error en submit

## Patrón Completo

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback } from 'react';

// 1. Schema primero
const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  amount: z.coerce.number().positive('Debe ser positivo'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Tipo inválido' }) }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// 2. Componente
interface Props {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = useCallback(async (data: FormData) => {
    await transactionsApi.create(data);
    reset();
    onSuccess();
  }, [reset, onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('name')}
          placeholder="Nombre"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

## Campos Numéricos desde Input HTML

```typescript
// Los inputs siempre retornan string — usar z.coerce.number() para convertir
amount: z.coerce.number().positive('Debe ser positivo');
```

## Reglas Críticas

- Schema Zod definido **antes** del componente
- `z.infer<typeof schema>` para el tipo — nunca definir el tipo a mano
- `z.coerce.number()` para campos numéricos de inputs HTML
- `reset()` después de submit exitoso
- `isSubmitting` de formState para deshabilitar el botón durante envío
- Mensajes de error en español y específicos
- `type="submit"` en el botón de envío — nunca `type="button"`

## Anti-patterns

- ❌ Validación manual con `if (!value)` — usar Zod
- ❌ `useState` para cada campo del formulario — usar React Hook Form
- ❌ `z.number()` para inputs HTML (llega como string) — usar `z.coerce.number()`
- ❌ Botón de submit sin `disabled={isSubmitting}` — doble submit posible

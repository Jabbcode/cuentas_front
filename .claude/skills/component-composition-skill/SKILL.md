---
name: component-composition-skill
description: Crear componentes React funcionales con TypeScript, props tipadas y TailwindCSS
type: skill
---

## Cuándo Usar

- Al crear cualquier componente nuevo
- Al tipar props de un componente existente
- Al componer componentes con callbacks memoizados

## Patrón Base

```typescript
import { useCallback } from 'react';
import { clsx } from 'clsx';
import type { Account } from '../types';

interface Props {
  account: Account;
  onEdit: (account: Account) => void;
  isSelected?: boolean;
}

export function AccountCard({ account, onEdit, isSelected = false }: Props) {
  const handleClick = useCallback(() => {
    onEdit(account);
  }, [account, onEdit]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'p-4 rounded-lg border-2 cursor-pointer transition-all',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <h3 className="font-semibold text-gray-900">{account.name}</h3>
      <p className="text-sm text-gray-500">{account.type}</p>
      <p className="text-lg font-bold mt-2">${account.balance.toFixed(2)}</p>
    </div>
  );
}
```

## Loading / Error States

```typescript
interface Props {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function DataWrapper({ loading, error, children }: Props) {
  if (loading) return <div className="animate-pulse p-4 bg-gray-100 rounded" />;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  return <>{children}</>;
}
```

## Reglas Críticas

- `interface Props` siempre explícita — nunca inferir
- Named exports: `export function ComponentName` (no default)
- `useCallback` para handlers pasados como props a hijos
- Keys en listas: `item.id`, nunca índice del array
- Sin estilos inline — solo TailwindCSS
- Sin `any` en tipos de props

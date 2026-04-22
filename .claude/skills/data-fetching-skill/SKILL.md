---
name: data-fetching-skill
description: Obtener datos del backend con Axios y JWT — cliente API, interceptor y hooks de fetching
type: skill
---

## Cuándo Usar

- Al crear un nuevo cliente API en `src/api/`
- Al entender cómo funciona el interceptor JWT
- Al implementar el patrón hook + API client

## Cliente API — Patrón Estándar

```typescript
// src/api/accounts.api.ts
import { api } from './client';
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types';

export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts').then((r) => r.data),
  getById: (id: string) => api.get<Account>(`/accounts/${id}`).then((r) => r.data),
  create: (data: CreateAccountInput) => api.post<Account>('/accounts', data).then((r) => r.data),
  update: (id: string, data: UpdateAccountInput) =>
    api.put<Account>(`/accounts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};
```

## Interceptor JWT (src/api/client.ts)

El token se añade **automáticamente** en cada request. No añadirlo manualmente en los API clients.

- Si el servidor retorna 401 → elimina token de localStorage → redirige a `/login`
- La URL base viene de `VITE_API_URL` (`.env`)

## Hook de Fetching — Patrón Estándar

```typescript
// src/hooks/useAccounts.ts
import { useState, useCallback, useEffect } from 'react';
import { accountsApi } from '../api/accounts.api';
import type { Account } from '../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { accounts, loading, error, reload: load };
}
```

## Anti-patterns

- ❌ Añadir `Authorization` header manualmente en el cliente API — ya lo hace el interceptor
- ❌ `fetch()` directo — usar siempre el `api` de Axios con interceptor
- ❌ Guardar datos del backend en localStorage — solo en estado React
- ❌ `useEffect` con `load` sin `useCallback` — loop infinito

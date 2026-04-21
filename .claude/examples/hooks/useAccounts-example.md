# useAccounts.ts - Ejemplo Real de Hook Bien Implementado

Este es un hook real del proyecto que sigue correctamente los patrones.

## Código Completo

```typescript
import { useState, useEffect, useCallback } from 'react';
import { accountsApi } from '../api/accounts.api';
import type { Account } from '../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const reload = useCallback(() => {
    loadAccounts();
  }, [loadAccounts]);

  const totalBalance = accounts.reduce((sum, acc) => {
    // For credit cards, add available credit (limit - used)
    if (acc.type === 'credit_card' && acc.creditLimit) {
      const used = Math.abs(Number(acc.balance));
      const available = acc.creditLimit - used;
      return sum + available;
    }
    // For other accounts, add balance normally
    return sum + Number(acc.balance);
  }, 0);

  return {
    accounts,
    loading,
    reload,
    totalBalance,
  };
}
```

## 🎯 Por Qué Este Hook es Bueno

### 1. ✅ Responsabilidad Única

- **Una sola responsabilidad:** Obtener y gestionar cuentas
- **Una sola fuente de datos:** accountsApi.getAll()

### 2. ✅ Tipado Completo

```typescript
// Tipos claros sin any
const [accounts, setAccounts] = useState<Account[]>([]);
// Account viene del tipo importado
```

### 3. ✅ Manejo de Estados

```typescript
// Tres estados bien separados
const [accounts, setAccounts] = useState<Account[]>([]); // Datos
const [loading, setLoading] = useState(true); // Estado de carga
const [error, setError] = useState<string | null>(null); // Errores (bonus)
```

### 4. ✅ useCallback Memoizado

```typescript
const loadAccounts = useCallback(async () => {
  // función memoizada
  // evita re-renders innecesarios
}, []); // Sin dependencias (puro)

const reload = useCallback(() => {
  loadAccounts();
}, [loadAccounts]); // Depende de loadAccounts
```

### 5. ✅ useEffect Correcto

```typescript
useEffect(() => {
  loadAccounts();
}, [loadAccounts]); // Dependencia explícita
// Se ejecuta:
// - Al montar el componente
// - Si loadAccounts cambia (no lo hace, sin deps externas)
```

### 6. ✅ Lógica de Negocio

```typescript
const totalBalance = accounts.reduce((sum, acc) => {
  // Lógica inteligente: tarjetas crédito se calculan diferente
  if (acc.type === 'credit_card' && acc.creditLimit) {
    const used = Math.abs(Number(acc.balance));
    const available = acc.creditLimit - used;
    return sum + available;
  }
  return sum + Number(acc.balance);
}, 0);
```

### 7. ✅ Interfaz Clara

```typescript
return {
  accounts, // Array de cuentas
  loading, // Boolean para mostrar spinner
  reload, // Función para refrescar manualmente
  totalBalance, // Cálculo derivado
};
```

## 🔄 Cómo se Usa

### En un Componente

```typescript
function AccountsPage() {
  const { accounts, loading, reload, totalBalance } = useAccounts();

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>Total: ${totalBalance.toFixed(2)}</h2>
      {accounts.map(acc => (
        <AccountCard key={acc.id} account={acc} />
      ))}
      <button onClick={reload}>Refresh</button>
    </div>
  );
}
```

## 📊 Flujo de Ejecución

```
1. Component renderiza
   │
   ▼
2. useAccounts() llamado
   │
   ├─ useState inicializa estado
   │
   ├─ useCallback define loadAccounts
   │
   ├─ useEffect ejecuta loadAccounts al montar
   │  │
   │  ├─ setLoading(true)
   │  │
   │  ├─ accountsApi.getAll() hace GET /api/accounts
   │  │
   │  └─ setAccounts(data) actualiza estado
   │
   └─ Return objeto con datos
      │
      ▼
3. Component renderiza con datos
   │
   ▼
4. Usuario ve página de cuentas
```

## ⚠️ Cosas Bien Hechas

| Aspecto                | Cómo                                           |
| ---------------------- | ---------------------------------------------- |
| **Sin `any`**          | Todo tipado explícitamente                     |
| **Sin duplicación**    | loadAccounts definida una vez, reutilizada     |
| **Manejo de caché**    | Estado local mantiene datos en sync            |
| **Refresh manual**     | reload() permite usuario refrescar si quiere   |
| **Error handling**     | finally() asegura que loading se pone en false |
| **Cálculos derivados** | totalBalance es un cálculo, no estado          |

## 🎓 Lecciones para Otros Hooks

Este hook demuestra:

1. ✅ Cómo estructurar un hook de fetching
2. ✅ Cómo memoizar callbacks correctamente
3. ✅ Cómo calcular valores derivados
4. ✅ Cómo proporcionar forma de refrescar datos
5. ✅ Cómo separar loading de data

## 🔧 Variación: Con Error Handling

Si quisieras mejorar este hook:

```typescript
export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null); // Limpiar error anterior
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setAccounts([]); // Limpiar datos si error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    error,
    reload: loadAccounts,
    totalBalance,
  };
}
```

## 🧪 Cómo Testearlo

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAccounts } from './useAccounts';
import * as accountsApi from '../api/accounts.api';

test('useAccounts carga y retorna cuentas', async () => {
  const mockAccounts = [{ id: '1', name: 'Cuenta Ahorro', type: 'bank', balance: 1000 }];

  vi.spyOn(accountsApi, 'getAll').mockResolvedValue(mockAccounts);

  const { result } = renderHook(() => useAccounts());

  // Inicialmente loading
  expect(result.current.loading).toBe(true);
  expect(result.current.accounts).toEqual([]);

  // Esperar a que termine la carga
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  // Después de cargar
  expect(result.current.loading).toBe(false);
  expect(result.current.accounts).toEqual(mockAccounts);
  expect(result.current.totalBalance).toBe(1000);
});

test('reload() recarga cuentas', async () => {
  const { result } = renderHook(() => useAccounts());

  await act(async () => {
    result.current.reload();
  });

  expect(result.current.loading).toBe(false);
});
```

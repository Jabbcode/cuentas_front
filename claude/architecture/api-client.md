# API Client - Cuentas Frontend

Documentación sobre cómo se conecta el frontend con el backend.

## 🔌 Configuración Base

**Archivo:** `src/api/client.ts`

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Variables de Entorno
- `VITE_API_URL` - URL base del API (default: http://localhost:3001/api)
- Se configura en `.env` para desarrollo
- Se configura en Vercel para producción

## 🔐 Interceptores de Autenticación

### Request Interceptor
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Qué hace:**
- Obtiene token del localStorage
- Si existe, lo añade al header `Authorization: Bearer <token>`
- Si no existe, hace request sin token (para login/register)

### Response Interceptor
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Qué hace:**
- Si respuesta es 401 (No autorizado):
  - Elimina token del localStorage
  - Redirige a página de login
  - Usuario debe autenticarse de nuevo

## 📋 Estructura de API Clients

Cada recurso tiene su propio archivo con métodos CRUD:

```
src/api/
├── client.ts                 # Configuración Axios
├── auth.api.ts              # Login, Register, Logout
├── accounts.api.ts          # CRUD de cuentas
├── transactions.api.ts      # CRUD de transacciones
├── categories.api.ts        # CRUD de categorías
├── fixed-expenses.api.ts    # CRUD de gastos fijos
├── credit-cards.api.ts      # Operaciones tarjetas
├── debts.api.ts             # CRUD de deudas
├── recurring-debt-payments.api.ts  # Pagos recurrentes
├── dashboard.api.ts         # Datos de dashboard
├── receipts.api.ts          # Upload de recibos
└── settings.api.ts          # Configuración usuario
```

## 🔑 Patrón de Implementación

### Ejemplo: accounts.api.ts

```typescript
import { api } from './client';
import type { Account, CreateAccountInput, UpdateAccountInput } from '../types';

export const accountsApi = {
  // GET /accounts
  getAll: () => 
    api.get<Account[]>('/accounts').then(r => r.data),

  // GET /accounts/:id
  getById: (id: string) => 
    api.get<Account>(`/accounts/${id}`).then(r => r.data),

  // POST /accounts
  create: (data: CreateAccountInput) => 
    api.post<Account>('/accounts', data).then(r => r.data),

  // PUT /accounts/:id
  update: (id: string, data: UpdateAccountInput) => 
    api.put<Account>(`/accounts/${id}`, data).then(r => r.data),

  // DELETE /accounts/:id
  delete: (id: string) => 
    api.delete(`/accounts/${id}`),

  // GET /accounts/:id/transactions
  getTransactions: (id: string) => 
    api.get<Transaction[]>(`/accounts/${id}/transactions`).then(r => r.data),
};
```

### Detalles del Patrón
1. **Imports:** Axios client + tipos TypeScript
2. **Export:** Objeto con métodos por operación
3. **Nombres:** Verbos claros (getAll, getById, create, update, delete)
4. **Tipado:** `<ResponseType>` especifica qué retorna
5. **Simplificación:** `.then(r => r.data)` extrae datos de la respuesta
6. **Errores:** Se lanzan automáticamente (sin try/catch en API client)

## 📊 Flujo de una Petición

```
Component/Hook
     │
     ▼
accountsApi.getAll()
     │
     ▼
axios.get<Account[]>('/accounts')
     │
     ├─ Request Interceptor
     │  └─ Añade token
     │
     ├─ HTTP GET request a backend
     │
     ├─ Response Interceptor
     │  ├─ Si 401: logout y redirige
     │  └─ Si error: rechaza promise
     │
     └─ r.data (Promise)
        │
        ▼
    Hook/Component
    .then(data => setAccounts(data))
    .catch(err => setError(err))
```

## 🔗 Listado de Endpoints Disponibles

### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token (si existe)

### Cuentas
- `GET /accounts` - Todas las cuentas
- `GET /accounts/:id` - Una cuenta
- `POST /accounts` - Crear cuenta
- `PUT /accounts/:id` - Actualizar cuenta
- `DELETE /accounts/:id` - Eliminar cuenta

### Transacciones
- `GET /transactions` - Todas las transacciones
- `GET /transactions/:id` - Una transacción
- `POST /transactions` - Crear transacción
- `PUT /transactions/:id` - Actualizar transacción
- `DELETE /transactions/:id` - Eliminar transacción

### Categorías
- `GET /categories` - Todas las categorías
- `POST /categories` - Crear categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### Gastos Fijos
- `GET /fixed-expenses` - Todos los gastos fijos
- `POST /fixed-expenses` - Crear gasto fijo
- `PUT /fixed-expenses/:id` - Actualizar gasto fijo
- `DELETE /fixed-expenses/:id` - Eliminar gasto fijo
- `POST /fixed-expenses/:id/mark-paid` - Marcar como pagado

### Tarjetas de Crédito
- `GET /accounts?type=credit_card` - Obtener tarjetas
- `POST /credit-cards/:id/payments` - Registrar pago
- `GET /credit-cards/:id/statement` - Estado de cuenta

### Deudas
- `GET /debts` - Todas las deudas
- `POST /debts` - Crear deuda
- `PUT /debts/:id` - Actualizar deuda
- `DELETE /debts/:id` - Eliminar deuda
- `GET /debts/:id/payments` - Pagos de deuda

### Pagos Recurrentes de Deudas
- `GET /recurring-debt-payments` - Todos los pagos
- `POST /recurring-debt-payments` - Crear pago recurrente
- `PUT /recurring-debt-payments/:id` - Actualizar pago
- `DELETE /recurring-debt-payments/:id` - Eliminar pago

### Dashboard
- `GET /dashboard/summary` - Resumen dashboard

### Recibos
- `POST /receipts/upload` - Subir imagen de recibo (form-data)
- `GET /receipts/:id` - Obtener recibo

## 🔄 Manejo de Errores

### En el API Client
```typescript
// No incluir try/catch en el client
// Los errores se propagan al hook
export const accountsApi = {
  getAll: () => 
    api.get<Account[]>('/accounts').then(r => r.data),
    // Si error: Promise rechazado
};
```

### En el Hook
```typescript
export function useAccounts() {
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (err) {
      // Capturar y manejar error aquí
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    }
  }, []);
}
```

### Errores Esperados
- **401:** Token expirado o inválido (handled por interceptor)
- **400:** Validación fallida (backend retorna descripción)
- **404:** Recurso no encontrado
- **500:** Error del servidor

## 🔒 Seguridad

### Token Handling
- ✅ Token almacenado en localStorage
- ✅ Añadido automáticamente a requests
- ✅ Removido en logout
- ✅ Validado en cada request (backend)

### Datos Sensibles
- ❌ NUNCA logguear token
- ❌ NUNCA pasar credenciales en URL
- ❌ NUNCA almacenar credenciales (solo token)
- ✅ HTTPS en producción

## 📝 Ejemplo Completo: Crear una Transacción

### 1. Componente
```typescript
function TransactionForm() {
  const { register, handleSubmit } = useForm<TransactionInput>();
  const { createTransaction } = useTransactions();

  const onSubmit = async (data: TransactionInput) => {
    await createTransaction(data);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

### 2. Hook
```typescript
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const createTransaction = useCallback(async (data: TransactionInput) => {
    const newTransaction = await transactionsApi.create(data);
    setTransactions([newTransaction, ...transactions]);
  }, [transactions]);

  return { transactions, createTransaction };
}
```

### 3. API Client
```typescript
export const transactionsApi = {
  create: (data: TransactionInput) =>
    api.post<Transaction>('/transactions', data).then(r => r.data),
};
```

### 4. Flujo
```
TransactionForm submit
  ↓
useTransactions.createTransaction()
  ↓
transactionsApi.create(data)
  ↓
axios.post('/transactions', data)
  ↓
Request Interceptor (añade token)
  ↓
Backend /POST /transactions
  ↓
Backend valida y crea
  ↓
Response { transaction data }
  ↓
Hook setTransactions
  ↓
Component re-renderiza con nueva transacción
```

## 🧪 Testing API Calls

```typescript
import { vi } from 'vitest';
import * as accountsApi from './accounts.api';

test('accountsApi.getAll hace GET a /accounts', async () => {
  const mockData = [{ id: '1', name: 'Cuenta' }];
  vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

  const result = await accountsApi.getAll();

  expect(result).toEqual(mockData);
});
```

## 🚀 Performance

### Optimizaciones
- ✅ Reutilizar instancia de Axios (compartida)
- ✅ No duplic requests (memoizar en hooks)
- ✅ Paginación en listados largos
- ✅ Lazy loading de datos

### Anti-patrones
- ❌ Crear nueva instancia de Axios en cada hook
- ❌ Hacer requests en render directo (sin useEffect)
- ❌ No memoizar callbacks que pasan a apis

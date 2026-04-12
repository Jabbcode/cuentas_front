# Arquitectura del Frontend - Overview

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     CUENTAS FRONTEND                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      PAGES LAYER                             │
│  (DashboardPage, AccountsPage, TransactionsPage, etc)       │
└──────────────┬───────────────────────────────────────────────┘
               │ uses
               ▼
┌──────────────────────────────────────────────────────────────┐
│                      HOOKS LAYER                             │
│  (useAccounts, useTransactions, useDashboard, etc)          │
│  - State management (useState, useCallback)                  │
│  - Side effects (useEffect)                                  │
│  - Fetching logic                                            │
└──────────────┬───────────────────────────────────────────────┘
               │ calls
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    API CLIENT LAYER                          │
│  (accountsApi, transactionsApi, authApi, etc)               │
│  - Abstracts HTTP calls                                      │
│  - Uses axios with token interceptor                         │
│  - Error handling                                            │
└──────────────┬───────────────────────────────────────────────┘
               │ makes requests
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    AXIOS + INTERCEPTORS                      │
│  - Adds JWT token to headers                                │
│  - Handles 401 unauthorized                                 │
│  - Base URL: process.env.VITE_API_URL                       │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTP
               ▼
        ┌──────────────┐
        │   BACKEND    │
        │  REST API    │
        └──────────────┘
```

## 📊 Flujo de Datos

### Ejemplo: Cargar Cuentas (Accounts)

```
1. Usuario navega a /accounts
                │
                ▼
2. AccountsPage renderiza y llama useAccounts()
                │
                ▼
3. Hook useAccounts() ejecuta useEffect
                │
                ▼
4. Llama accountsApi.getAll()
                │
                ▼
5. API Client hace GET /api/accounts (con token JWT en header)
                │
                ▼
6. Axios interceptor captura respuesta
                │
                ▼
7. Hook setAccounts(data) actualiza estado
                │
                ▼
8. Componente re-renderiza con datos
```

### Flujo de Creación de Transacción

```
1. Usuario completa TransactionForm
                │
                ▼
2. handleSubmit valida datos con Zod
                │
                ▼
3. Si válido, llama API: transactionsApi.create(data)
                │
                ▼
4. POST /api/transactions con datos + token
                │
                ▼
5. Backend retorna Transaction creada
                │
                ▼
6. Hook useTransactions() actualiza lista
                │
                ▼
7. Componente muestra éxito y recarga datos
```

## 🔄 Ciclo de Vida de un Hook

```
Component Mounts
       │
       ▼
Hook useX() called
       │
       ├─ useState → inicializa estado
       │
       ├─ useCallback → define funciones memoizadas
       │
       └─ useEffect → ejecuta side effect al montar
                │
                ├─ Limpieza de previos listeners
                │
                ├─ Llamada a API
                │
                ├─ En resolución: setState
                │
                └─ En error: setError
       │
       ▼
Hook retorna { data, loading, error, reload }
       │
       ▼
Component renderiza con datos
```

## 🧩 Componentes Principales

### Capas de Componentes

#### 1. Page Components (`pages/`)
- Componentes de nivel superior (uno por ruta)
- Responsables de layout y orquestación
- Llaman hooks para obtener datos
- Pasan datos a componentes reutilizables

**Ejemplo:** `DashboardPage.tsx`
```
├─ useAccounts() → obtiene cuentas
├─ useDashboard() → obtiene resumen
├─ useTransactions() → obtiene transacciones
└─ Renderiza:
   ├─ AccountSummary
   ├─ ExpenseChart
   └─ RecentTransactions
```

#### 2. Container Components
- Componentes que contienen lógica
- Conectan con hooks
- Pasan props a presentational components

**Ejemplo:** `TransactionList`
```
├─ useTransactions() → obtiene datos
├─ useTransactionFilters() → maneja filtros
└─ Renderiza:
   ├─ FilterBar
   └─ TransactionTable
```

#### 3. Presentational Components (`components/`)
- Componentes "tontos" (dumb components)
- Solo reciben props y renderizan UI
- No tienen lógica de estado
- Altamente reutilizables

**Ejemplo:** `TransactionCard`
```
Props: { transaction, onEdit, onDelete }
No hooks, solo UI rendering
```

## 🎯 Estado: Dónde Vive?

### Estado Local (useState)
```typescript
// En el componente
const [isOpen, setIsOpen] = useState(false);  // UI state
```
**Cuándo:** Toggle de modal, form input temporario, UI state local

### Estado en Hook
```typescript
// En useAccounts hook
const [accounts, setAccounts] = useState<Account[]>([]);
const [loading, setLoading] = useState(false);
```
**Cuándo:** Datos que necesitan múltiples componentes

### Estado Global (Context)
```typescript
// En AuthContext
const AuthContext = createContext<AuthContextType | null>(null);
```
**Cuándo:** User info, auth status, tema, lenguaje

### Servidor (Backend)
```typescript
// Los datos definitivos viven en el backend
// Frontend solo cachea temporalmente en estado
```
**Importante:** No duplicar datos, siempre ir a backend como fuente de verdad

## 📡 Patrones de Comunicación

### Patrón Simple: Obtener Datos
```
Hook → API → Response → setState → Render
```

### Patrón Con Errores
```
Hook → API → Error Caught → setError → Render Error UI
```

### Patrón Con Loading
```
Hook → setLoading(true) → API → setLoading(false) → setState → Render
```

### Patrón Optimista (Opcional)
```
Hook → setData(newData) → API → If success: keep ✓
                               → If error: setData(oldData) + setError ✗
```

## 🔐 Seguridad del Token

```
┌─────────────────┐
│  localStorage   │
│    "token"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Axios Interceptor Request        │
│ Adds: Authorization: Bearer ..   │
└────────┬────────────────────────┘
         │ Request with token
         ▼
      Backend
         │
         ▼
Axios Interceptor Response
│
├─ 200 OK: Retorna data
│
└─ 401 Unauthorized:
   ├─ localStorage.removeItem('token')
   ├─ window.location.href = '/login'
   └─ Usuario vuelve a login
```

## 🔄 Ciclo de Actualización

### User Update Action (ej: editar cuenta)

```
1. User clicks Edit
   │
   ▼
2. Form abre con datos actuales
   │
   ▼
3. User modifica y envía
   │
   ▼
4. accountsApi.update(id, newData) llamado
   │
   ▼
5. Loading state muestra spinner
   │
   ▼
6. Backend valida y actualiza BD
   │
   ▼
7. Si éxito:
   │
   ├─ Hook actualiza estado local
   ├─ Componente re-renderiza
   ├─ Modal cierra
   └─ Toast muestra "Actualizado"
   │
   └─ Si error:
      ├─ Toast muestra error
      └─ Form permanece abierto para retry
```

## 🎨 Estructura de Styles

- **TailwindCSS:** Utility first, no custom CSS excepto en `index.css`
- **Global Styles:** `src/index.css` solo para resets y variables CSS
- **Component Styles:** Inline con clsx() + tailwind classes
- **No Styled Components:** Mantenemos simplicidad con Tailwind

## 📦 Versionado y Compatibilidad

- **Frontend y Backend:** Deben estar sincronizados en tipos
- **Breaking Changes:** Documentar en PR, coordinar deployments
- **API Versioning:** Actualmente `/api/v1` no usado, considerar si crece

## 🚀 Performance

### Optimizaciones Implementadas
1. **useCallback:** Para callbacks en props
2. **React.memo:** Para componentes puros (si aplica)
3. **Lazy Loading:** Routes con React.lazy (si aplica)
4. **List Keys:** Siempre usar IDs únicos, nunca índices

### Monitoreo
- Dev Tools: React DevTools para revisar renders
- Performance: Profiler de React para bottlenecks
- Bundle: Vite analiza tamaño en build

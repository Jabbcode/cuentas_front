# Convenciones del Proyecto - Cuentas Frontend

## 📝 Convenciones de Nombres

### Componentes React
- **Formato:** PascalCase
- **Ubicación:** `src/components/`
- **Ejemplos:** `AccountCard.tsx`, `TransactionForm.tsx`, `DashboardSummary.tsx`
- **Estructura:** Un componente principal por archivo

### Custom Hooks
- **Formato:** camelCase con prefijo `use`
- **Ubicación:** `src/hooks/`
- **Ejemplos:** `useAccounts.ts`, `useTransactions.ts`, `useDashboard.ts`
- **Regla:** Siempre comienzan con "use"

### Archivos API
- **Formato:** `<recurso>.api.ts`
- **Ubicación:** `src/api/`
- **Ejemplos:** `accounts.api.ts`, `transactions.api.ts`, `auth.api.ts`
- **Exportación:** Named export de función `<recursoPlural>Api` con métodos

### Variables y Funciones
- **Formato:** camelCase
- **Ejemplos:** `accountData`, `handleSubmit`, `calculateTotal`, `getAccount`
- **Constantes:** UPPER_SNAKE_CASE si son exportadas, camelCase si son locales
- **Booleanos:** Prefijo `is`, `has`, `can`, `should`
  - Ejemplos: `isLoading`, `hasError`, `canDelete`, `shouldValidate`

### Tipos TypeScript
- **Formato:** PascalCase (interfaces) o PascalCase (types)
- **Ubicación:** `src/types/index.ts`
- **Ejemplos:** `Account`, `Transaction`, `FixedExpense`, `User`
- **Interfaces para objetos complejos, types para uniones/aliases**

### Variables de Estado
- **Formato:** Descripción clara en camelCase
- **Ejemplos:** 
  ```typescript
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  ```

## 📂 Estructura de Carpetas

```
src/
├── api/                          # HTTP clients
│   ├── client.ts                 # Configuración Axios
│   ├── accounts.api.ts
│   ├── transactions.api.ts
│   └── *.api.ts
├── components/                   # Componentes reutilizables
│   ├── AccountCard.tsx
│   ├── TransactionForm.tsx
│   └── ...
├── pages/                        # Páginas/rutas
│   ├── DashboardPage.tsx
│   ├── AccountsPage.tsx
│   └── ...
├── hooks/                        # Custom hooks
│   ├── useAccounts.ts
│   ├── useTransactions.ts
│   └── ...
├── context/                      # Context providers
│   └── AuthContext.tsx
├── types/                        # TypeScript definitions
│   └── index.ts
├── lib/                          # Utilidades
│   └── *.ts
├── assets/                       # Static files
│   └── ...
├── App.tsx
├── main.tsx
└── index.css                     # Global styles
```

## 🎯 Patrones de Código

### Patrón de Hook
```typescript
export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
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
    loadAccounts();
  }, [loadAccounts]);

  return { accounts, loading, error, reload: loadAccounts };
}
```

### Patrón de Componente
```typescript
interface Props {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function TransactionForm({ onSubmit, isLoading = false }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form JSX */}
    </form>
  );
}
```

### Patrón de API Client
```typescript
import { api } from './client';
import type { Account } from '../types';

export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts').then(r => r.data),
  getById: (id: string) => api.get<Account>(`/accounts/${id}`).then(r => r.data),
  create: (data: CreateAccountInput) => api.post<Account>('/accounts', data).then(r => r.data),
  update: (id: string, data: UpdateAccountInput) => api.put<Account>(`/accounts/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};
```

## 🔄 Git Workflow

### Estructura de Commits
- **Formato:** `[TIPO]: Descripción breve`
- **Tipos:**
  - `feat:` Nueva funcionalidad
  - `fix:` Corrección de bug
  - `refactor:` Cambios sin impacto en funcionalidad
  - `style:` Cambios de formato, no de código
  - `docs:` Cambios en documentación
  - `test:` Adición o cambio de tests
  - `chore:` Cambios en build, dependencias, etc.

### Ejemplos de Commits
- `feat: add transaction filtering by date range`
- `fix: resolve auth token refresh issue`
- `refactor: extract AccountCard to separate component`
- `docs: update API integration guide`

### Ramas
- **Main:** Código en producción
- **Develop:** Rama de integración (si aplica)
- **Feature:** `feature/descripcion-corta` para nuevas funcionalidades
- **Fix:** `fix/descripcion-corta` para correcciones

### Pull Requests
- **Obligatorio:** Todos los cambios pasan por PR
- **Descripción:** Incluir qué se cambió y por qué
- **Tests:** Indicar si se añadieron/modificaron tests
- **Screenshots:** Para cambios visuales

## 💅 Estilo de Código

### TypeScript
- **Tipos explícitos:** Siempre especificar tipos en parámetros y retornos
- **Unions:** Usar `|` en lugar de `any`
- **Null safety:** Preferir `?? null` sobre `||`
- **Error handling:** Usar try/catch, nunca ignorar errores

### React
- **Functional Components:** Siempre usar functions, no classes
- **Hooks:** Colocar todos los hooks al inicio del componente
- **Props:** Destructurar en la firma de la función
- **Keys:** Usar IDs únicos en listas, nunca índices
- **Memoization:** Usar `useCallback` para callbacks pasados como props

### Tailwind CSS
- **Clases:** Mantener ordenadas (width, height, padding, margin, etc.)
- **Componentes:** Extraer a componentes si se repite 3+ veces
- **Dark Mode:** No aplicar actualmente (no configurado)
- **Prefijos:** Usar responsive prefixes (sm:, md:, lg:)

### Ejemplo de componente bien formateado
```typescript
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
      <p className="text-sm text-gray-600">{account.type}</p>
      <p className="text-lg font-bold text-gray-900 mt-2">
        ${account.balance.toFixed(2)}
      </p>
    </div>
  );
}
```

## 🔐 Manejo de Autenticación

### Token JWT
- Almacenado en `localStorage.token`
- Añadido automáticamente por interceptor en header `Authorization: Bearer <token>`
- Si expira (401), se elimina y redirige a /login

### Seguridad
- Nunca loguear el token en console.log
- No pasar token en parámetros de URL
- Usar HTTPS en producción

## 📊 Manejo de Estado

### Jerarquía de Estado
1. **Local (useState):** Estado del componente individual
2. **Context:** Estado compartido entre múltiples componentes
3. **Server:** Datos del backend (no cachear localmente)

### No hacer
- ❌ Almacenar datos del backend en localStorage
- ❌ Usar estado global para estado local de componentes
- ❌ Pasar props por muchos niveles (prop drilling)

## ✅ Checklist para PRs

- [ ] Código sigue las convenciones de nombres
- [ ] TypeScript types son explícitos (sin `any`)
- [ ] No hay console.log en código final
- [ ] Tests escritos (si aplica)
- [ ] Componentes reutilizables extraídos
- [ ] Manejo de errores adecuado
- [ ] Mensaje de commit sigue el formato
- [ ] Se documentaron cambios significativos en `claude/project-state.md`

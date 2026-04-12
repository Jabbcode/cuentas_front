# Skills - Cuentas Frontend

Habilidades disponibles para Claude al trabajar en el frontend. Cada skill encapsula conocimiento sobre un aspecto específico del proyecto.

## 📚 Catálogo de Skills

---

## 1. FormManagementSkill

**Propósito:** Manejar formularios complejos con validación

**Cuándo usar:**
- Crear o editar formularios
- Validar inputs de usuario
- Manejar errores de validación
- Gestionar estados de envío

**Lo que sabes hacer:**
- ✅ React Hook Form para gestión eficiente
- ✅ Zod para validación type-safe
- ✅ Mensajes de error claros
- ✅ Estados: loading, success, error
- ✅ Integración con API

**Patrones que usas:**
```typescript
// Siempre usar React Hook Form + Zod
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema)
});

// Esquema Zod primero
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

**Ejemplo real:**
- TransactionForm (componente que crea transacciones)
- AccountForm (crea/edita cuentas)
- DebtForm (crea deudas)

---

## 2. DataFetchingSkill

**Propósito:** Obtener datos del backend de manera eficiente

**Cuándo usar:**
- Cargar datos de una página
- Refrescar datos periódicamente
- Manejar loading states
- Manejar errores de API

**Lo que sabes hacer:**
- ✅ Axios con configuración centralizada
- ✅ Interceptores para JWT token
- ✅ Retry automático en 401
- ✅ Manejo de errores
- ✅ Caching temporal en estado

**Patrones que usas:**
```typescript
// API client abstracto
export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts').then(r => r.data),
  create: (data) => api.post<Account>('/accounts', data).then(r => r.data),
};

// Hook que encapsula lógica
const { data, loading, error, reload } = useAccounts();
```

**Cómo funciona:**
1. Hook usa `useState` para estado
2. `useEffect` llama al API client
3. API client usa Axios centralizado
4. Interceptor añade token JWT automáticamente
5. Si 401: logout automático

---

## 3. StateManagementSkill

**Propósito:** Gestionar estado de aplicación eficientemente

**Cuándo usar:**
- Compartir estado entre componentes
- Manejar estado global (auth, usuario)
- Sincronizar estado local con servidor
- Evitar prop drilling

**Lo que sabes hacer:**
- ✅ React hooks (useState, useCallback, useEffect)
- ✅ Context API para estado global
- ✅ Memoización correcta
- ✅ Evitar re-renders innecesarios
- ✅ Sincronización estado-servidor

**Patrones que usas:**
```typescript
// Estado local en componente
const [accounts, setAccounts] = useState<Account[]>([]);

// State en hook personalizado
export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  // Lógica...
  return { accounts, loading, reload };
}

// Context para estado global (si necesario)
const AuthContext = createContext<AuthState | null>(null);
```

**Jerarquía:**
1. Local (useState en componente) - UI state
2. Hook (en custom hook) - Data state
3. Context (global) - Auth, tema, idioma

---

## 4. ComponentCompositionSkill

**Propósito:** Crear componentes reutilizables y bien tipados

**Cuándo usar:**
- Crear nuevo componente
- Extraer lógica a componente
- Mejorar reusabilidad
- Refactor de componentes grandes

**Lo que sabes hacer:**
- ✅ Componentes funcionales
- ✅ Props tipadas con TypeScript
- ✅ Composición sobre herencia
- ✅ Memoización con useCallback
- ✅ Desestructuración de props

**Patrones que usas:**
```typescript
interface Props {
  item: Account;
  onEdit: (id: string) => void;
  isSelected?: boolean;
}

export function AccountCard({ item, onEdit, isSelected = false }: Props) {
  const handleClick = useCallback(() => {
    onEdit(item.id);
  }, [item.id, onEdit]);

  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
}
```

**Reglas:**
- Props interface siempre
- Callbacks memoizados si pasan a children
- Componentes pequeños y enfocados
- Nombres descriptivos

---

## 5. RoutingSkill

**Propósito:** Navegar entre páginas y proteger rutas

**Cuándo usar:**
- Crear nuevas páginas
- Proteger rutas autenticadas
- Manejar parámetros dinámicos
- Redirigir basado en estado

**Lo que sabes hacer:**
- ✅ React Router v7
- ✅ Rutas dinámicas con parámetros
- ✅ Protección de rutas (auth)
- ✅ Lazy loading de componentes
- ✅ Navegación programática

**Patrones que usas:**
```typescript
// Rutas en App.tsx
<Routes>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/accounts" element={<AccountsPage />} />
  <Route path="/accounts/:id" element={<AccountDetailPage />} />
  
  {/* Rutas protegidas */}
  <Route element={<PrivateRoute />}>
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
</Routes>

// Navegar
const navigate = useNavigate();
navigate(`/accounts/${id}`);
```

**Páginas existentes:**
- `/` - Dashboard
- `/accounts` - Gestión cuentas
- `/transactions` - Historial transacciones
- `/fixed-expenses` - Gastos recurrentes
- `/debts` - Gestión deudas
- `/credit-cards` - Tarjetas
- `/categories` - Categorías
- `/settings` - Configuración

---

## 6. StylingSkill

**Propósito:** Estilizar componentes con TailwindCSS

**Cuándo usar:**
- Maquetar componentes
- Hacer responsive design
- Aplicar colores y espaciado
- Crear animaciones

**Lo que sabes hacer:**
- ✅ TailwindCSS utility classes
- ✅ Responsive design (sm, md, lg, xl)
- ✅ Dark mode (si se implementa)
- ✅ Validación de clases con clsx
- ✅ Tema consistente

**Patrones que usas:**
```typescript
import clsx from 'clsx';

<div className={clsx(
  'p-4 rounded-lg border-2',
  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
  'hover:border-gray-300 transition-all'
)}>
```

**Estructura:**
- p- (padding)
- m- (margin)
- w- (width)
- h- (height)
- bg- (background)
- text- (color texto)
- border- (bordes)
- rounded- (esquinas)
- shadow- (sombra)

---

## 🎯 Cómo Usar los Skills

### Cuando creas un componente:
```
Necesito que uses:
1. FormManagementSkill (si tiene form)
2. ComponentCompositionSkill (estructura)
3. StylingSkill (diseño)
4. DataFetchingSkill (si carga datos)
5. StateManagementSkill (si comparte estado)
```

### Cuando añades una página:
```
Necesito que uses:
1. RoutingSkill (añade ruta)
2. DataFetchingSkill (carga datos)
3. ComponentCompositionSkill (estructura)
4. Todos los skills pertinentes
```

---

## 📋 Combinaciones Comunes

### "Crear un formulario de transacción"
→ FormManagementSkill + ComponentCompositionSkill + StylingSkill + DataFetchingSkill

### "Hacer una página de listado"
→ DataFetchingSkill + StateManagementSkill + ComponentCompositionSkill + RoutingSkill

### "Refactor de componente grande"
→ ComponentCompositionSkill + StateManagementSkill

### "Integrar nuevo endpoint"
→ DataFetchingSkill + FormManagementSkill

---

## ✨ Remember

- Siempre tipos TypeScript explícitos
- Siempre validación Zod
- Siempre error handling
- Siempre componentes reutilizables
- Siempre TailwindCSS (no inline styles)
- Siempre hooks para lógica

---
name: state-management-skill
description: Gestionar estado con React hooks y Context API — useState, useCallback, useEffect
type: skill
---

## Cuándo Usar

- Al definir estado local de un componente o hook
- Al usar Context para estado global (auth, tema)
- Al evitar re-renders innecesarios con useCallback/useMemo

## Estado Local en Hooks

```typescript
// Patrón estándar: datos + loading + error
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Booleanos para modales / UI state
const [isOpen, setIsOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
```

## useCallback — Cuándo Aplicarlo

```typescript
// ✅ Handler pasado como prop a un hijo (evita re-renders del hijo)
const handleEdit = useCallback((item: Item) => {
  setSelected(item);
  setIsOpen(true);
}, []); // dependencias vacías si no usa estado externo

// ✅ Función de carga usada en useEffect
const load = useCallback(async () => {
  const data = await api.getAll();
  setItems(data);
}, []); // sin deps si no depende de estado

useEffect(() => {
  load();
}, [load]); // [load] es estable gracias a useCallback
```

## Context API — Estado Global

```typescript
// Solo para estado verdaderamente global: auth, preferencias de usuario
// NO usar para estado de página o componente individual

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
```

## Jerarquía de Estado

1. **useState local** — estado de un componente o hook (la mayoría de los casos)
2. **Context API** — estado compartido entre múltiples páginas (auth, tema)
3. **No usar** — localStorage para datos del servidor

## Anti-patterns

- ❌ Context para estado que solo usa un componente — prop drilling con props es más simple
- ❌ `useEffect` sin `useCallback` en la función del efecto — loop infinito
- ❌ Guardar respuestas del backend en localStorage
- ❌ Estado en el componente que debería estar en el hook

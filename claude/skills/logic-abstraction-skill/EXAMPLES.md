# Ejemplos de Abstracción de Lógica

## ✅ CORRECTO: Extracción a Custom Hook
**Escenario**: Un componente de lista que filtra datos y maneja paginación local.
**Abstracción**: Mover la lógica a `usePagination.ts`.

```typescript
// En el Hook (Abstracción)
export const usePagination = (items: Item[]) => {
  const [page, setPage] = useState(0);
  const paginatedItems = useMemo(() => items.slice(page * 10, (page + 1) * 10), [items, page]);
  
  const nextPage = useCallback(() => setPage(p => p + 1), []);
  
  return { paginatedItems, nextPage };
};

const userAdapter = (apiUser: ApiUserDTO): User => ({
  ...apiUser,
  createdAt: new Date(apiUser.created_at)
});

const UserList = ({ users }) => {
  // MAL: Este filtro se ejecuta en cada render sin necesidad
  const activeUsers = users.filter(u => u.active); 
  
  return (
    <ul>{activeUsers.map(u => <li key={u.id}>{u.name}</li>)}</ul>
  );
};

// MAL: Usar useEffect para actualizar un estado derivado
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${name} ${lastName}`);
}, [name, lastName]);
```
---
name: routing-skill
description: Navegación con React Router DOM v7 — rutas, protección y navegación programática
type: skill
---

## Cuándo Usar

- Al añadir una nueva página/ruta al proyecto
- Al implementar navegación programática
- Al proteger rutas que requieren autenticación

## Rutas del Proyecto (src/App.tsx)

| Ruta              | Página            | Protegida |
| ----------------- | ----------------- | --------- |
| `/login`          | LoginPage         | No        |
| `/register`       | RegisterPage      | No        |
| `/`               | DashboardPage     | Sí        |
| `/accounts`       | AccountsPage      | Sí        |
| `/transactions`   | TransactionsPage  | Sí        |
| `/fixed-expenses` | FixedExpensesPage | Sí        |
| `/categories`     | CategoriesPage    | Sí        |
| `/credit-cards`   | CreditCardsPage   | Sí        |
| `/debts`          | DebtsPage         | Sí        |
| `/settings`       | SettingsPage      | Sí        |

## Añadir Nueva Ruta

```typescript
// En App.tsx — añadir dentro del bloque de rutas protegidas
import { NewPage } from './pages/NewPage';

// Dentro del router:
<Route path="/new-resource" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

## Navegación Programática

```typescript
import { useNavigate } from 'react-router-dom';

export function SomeComponent() {
  const navigate = useNavigate();

  const handleSuccess = useCallback(() => {
    navigate('/accounts'); // navegar tras acción exitosa
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1); // volver atrás
  }, [navigate]);
}
```

## Links en UI

```typescript
import { Link } from 'react-router-dom';

// En JSX:
<Link to="/accounts" className="text-blue-600 hover:underline">
  Ver cuentas
</Link>
```

## Anti-patterns

- ❌ `window.location.href` para navegar — usar `useNavigate`
- ❌ Rutas nuevas sin `ProtectedRoute` wrapper si requieren auth
- ❌ `<a href="/ruta">` en lugar de `<Link to="/ruta">` — recarga la página

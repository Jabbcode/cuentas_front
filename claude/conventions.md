# 📏 Convenciones del Proyecto: Cuentas Frontend

Este documento define las reglas de estilo, estructura y patrones de diseño. Es la guía definitiva para mantener la consistencia en todo el repositorio.

---

## 📝 1. Convenciones de Nombres

### Componentes UI y Negocio
- **Formato:** `PascalCase` (Ej: `BalanceCard.tsx`, `TransactionForm.tsx`).
- **Ubicación:** - `src/components/ui/`: Componentes base de shadcn/ui (No modificar).
  - `src/components/shared/`: Componentes de negocio reutilizables.
  - `src/components/layout/`: Estructura global (Sidebar, Navbar).

### Custom Hooks
- **Formato:** `camelCase` con prefijo `use`.
- **Ubicación:** `src/hooks/`.
- **Regla:** Un solo hook por archivo, enfocado en una única responsabilidad.

### Servicios de API
- **Formato:** `<recurso>.api.ts` (Ej: `accounts.api.ts`).
- **Ubicación:** `src/api/`.
- **Exportación:** Un objeto constante llamado `<recurso>Api`.

### Variables y Booleanos
- **Variables/Funciones:** `camelCase`.
- **Constantes Globales:** `UPPER_SNAKE_CASE`.
- **Booleanos:** Deben usar prefijos: `is`, `has`, `should`, `can`.
  - ✅ `isLoading`, `hasToken`, `shouldRedirect`.

---

## 📂 2. Estructura de Carpetas "Source of Truth"

```text
src/
├── api/          # Clientes Axios y lógica de red
├── components/   # UI (ui/, shared/, layout/)
├── pages/        # Vistas conectadas al Router
├── hooks/        # Lógica de estado y fetching
├── context/      # Estado global (Auth, UI)
├── types/        # index.ts (Interfaces de negocio)
├── lib/          # utils.ts (cn) y configuraciones
└── assets/       # Estáticos
```

## 🎯 3. Patrones de Código Estandarizados

### Patrón de Servicio API (Axios + TypeScript)

```typescript
import { api } from './client';
import type { Account, CreateAccountDTO } from '../types';

export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts').then(r => r.data),
  create: (data: CreateAccountDTO) => api.post<Account>('/accounts', data).then(r => r.data),
};

import { cn } from '@/lib/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight';
}

export function StatusCard({ variant = 'default', className, children, ...props }: Props) {
  return (
    <div 
      className={cn(
        'p-4 rounded-xl border transition-all',
        variant === 'highlight' ? 'border-primary bg-primary/5' : 'border-border bg-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

## 💅 4. Estilo y Calidad de Código

### TypeScript (Stricto Sensu)
- **Cero `any`:** Si un tipo es desconocido, usar `unknown`.
- **Inferencia de Zod:** Usar `z.infer<typeof schema>` para sincronizar tipos de formularios.
- **Retornos:** Declarar siempre el tipo de retorno en funciones complejas.

### React (Best Practices)
- **Memoización:** Usar `useCallback` para funciones pasadas a hijos y `useMemo` para cálculos costosos.
- **Listas:** Usar IDs únicos (ej: `account.id`), nunca el índice del array como `key`.

### Tailwind CSS 4.0
- **Utility First:** No usar `@apply` salvo excepciones críticas.
- **Mobile First:** El diseño base es móvil; usar `md:` y `lg:` para escalar.
- **Variables:** Usar tokens del tema (ej: `text-muted-foreground`, `bg-background`).

---

## 🔄 5. Flujo de Trabajo (Git & Commits)

### Formato de Commits
`[TIPO]: descripción en minúsculas`
- `feat:` Nueva funcionalidad.
- `fix:` Corrección de error.
- `refactor:` Mejora de código sin cambiar funcionalidad.
- `style:` Cambios visuales o de formato.
- `docs:` Cambios en documentación (Carpeta `/claude`).

---

## ✅ 6. Checklist de Pre-entrega
- [ ] No existen `console.log` residuales.
- [ ] Los nombres de archivos y carpetas siguen la estructura.
- [ ] Los tipos de TypeScript están en `src/types/index.ts`.
- [ ] Se ha verificado la responsividad (Mobile-first).
- [ ] El manejo de errores (Try/Catch) es amigable para el usuario.
# Agents - Cuentas Frontend

Agentes especializados que Claude puede usar para tareas complejas. Cada agente sabe cómo hacer algo específico de manera correcta.

## 🤖 Catálogo de Agents

---

## 1. ComponentGeneratorAgent

**Responsabilidad:** Generar componentes React completos y funcionales

**Cuándo invocarlo:**
```
"Crea un componente para mostrar una tarjeta de transacción"
"Genera un modal de confirmación de eliminación"
"Necesito un componente de estadísticas"
```

**Lo que hace:**
1. ✅ Crea componente funcional con TypeScript
2. ✅ Define Props interface clara
3. ✅ Implementa TypeScript types correctamente
4. ✅ Sigue convenciones de naming
5. ✅ Incluye JSX bien formateado
6. ✅ Usa TailwindCSS para estilos
7. ✅ Exporta correctamente

**Proceso que sigue:**
```
Input: "Componente X que hace Y con Z datos"
  ↓
Analiza requirements
  ↓
Define Props interface
  ↓
Crea componente funcional
  ↓
Añade estilos TailwindCSS
  ↓
Exporta con nombre PascalCase
Output: Componente listo para usar
```

**Ejemplo:**
```typescript
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  // Componente bien hecho
}
```

**Reglas que sigue:**
- ✅ Props siempre tipadas
- ✅ Callbacks memoizados si es necesario
- ✅ Sin console.log
- ✅ Sin hardcoded values
- ✅ Responsive design
- ✅ Accesibilidad considerada

---

## 2. HookCreatorAgent

**Responsabilidad:** Crear custom hooks con lógica reutilizable

**Cuándo invocarlo:**
```
"Crea un hook para manejar la paginación"
"Necesito un hook para filtrar transacciones"
"Genera un hook para manejar un modal"
```

**Lo que hace:**
1. ✅ Crea hook con patrón correcto
2. ✅ Maneja estado con useState
3. ✅ Memoiza callbacks con useCallback
4. ✅ Efectos con useEffect correctos
5. ✅ Retorna interface clara
6. ✅ Incluye error handling
7. ✅ TypeScript types explícitos

**Estructura que crea:**
```typescript
export function useCustomLogic(params?: ParamType) {
  const [state, setState] = useState<StateType>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch();
      setState(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [dependencies]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { state, loading, error, reload: loadData };
}
```

**Reglas que sigue:**
- ✅ Siempre retorna objeto con datos y funciones
- ✅ Estado loading y error siempre
- ✅ useCallback para funciones
- ✅ Dependencies array completo
- ✅ Sin side effects no intencionados

---

## 3. ValidationSchemaAgent

**Responsabilidad:** Crear esquemas Zod con tipos TypeScript

**Cuándo invocarlo:**
```
"Crea un schema Zod para validar datos de una transacción"
"Necesito validar un formulario de registro"
"Genera schema para datos de cuenta"
```

**Lo que hace:**
1. ✅ Crea schema Zod completo
2. ✅ Infiere tipos TypeScript
3. ✅ Mensajes de error claros
4. ✅ Validaciones apropiadas
5. ✅ Valores opcionales/requeridos correcto
6. ✅ Refinamientos si es necesario

**Estructura que crea:**
```typescript
export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['expense', 'income']),
  description: z.string().min(1, 'Description required').optional(),
  accountId: z.string().uuid('Invalid account ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  date: z.date().refine(
    date => date <= new Date(),
    { message: 'Date cannot be in future' }
  ),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
```

**Reglas que sigue:**
- ✅ Campos requeridos sin `.optional()`
- ✅ Campos opcionales con `.optional()`
- ✅ Mensajes de error en español/claro
- ✅ Validaciones apropiadas (email, uuid, etc)
- ✅ Tipos inferidos del schema
- ✅ Usar `.refine()` para lógica compleja

---

## 4. APIIntegrationAgent

**Responsabilidad:** Integrar nuevos endpoints del backend

**Cuándo invocarlo:**
```
"Integra el endpoint POST /transactions al frontend"
"Crea un cliente API para las deudas"
"Necesito conectar el nuevo endpoint de reportes"
```

**Lo que hace:**
1. ✅ Crea API client abstracto
2. ✅ Crea hook que usa el API client
3. ✅ Maneja loading, error, success
4. ✅ Integra con formularios
5. ✅ Incluye error handling
6. ✅ Usa tipos TypeScript

**Proceso que sigue:**
```
Input: "Integra endpoint X"
  ↓
Crea API client
  ↓
Crea hook con lógica
  ↓
Maneja estados
  ↓
Integra error handling
  ↓
Ejemplo de uso
Output: API lista para usar en componentes
```

**Estructura que crea:**
```typescript
// 1. API Client
export const debtsApi = {
  getAll: () => api.get<Debt[]>('/debts').then(r => r.data),
  create: (data: CreateDebtInput) => api.post<Debt>('/debts', data).then(r => r.data),
  update: (id: string, data: UpdateDebtInput) => api.put<Debt>(`/debts/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/debts/${id}`),
};

// 2. Hook
export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lógica...
  
  return { debts, loading, error, reload };
}

// 3. Usar en componente
function DebtsList() {
  const { debts, loading } = useDebts();
  
  return debts.map(debt => <DebtCard key={debt.id} debt={debt} />);
}
```

**Reglas que sigue:**
- ✅ API client siempre abstracto
- ✅ Hook siempre para lógica
- ✅ Componente solo renderiza
- ✅ Error handling en todos lados
- ✅ Loading states claros
- ✅ Types correctos

---

## 🔄 Flujo de Trabajo con Agents

### Para crear una nueva característica:

```
1. ComponentGeneratorAgent
   ├─ Define qué componentes necesito
   └─ Genera componentes base

2. ValidationSchemaAgent
   ├─ Define qué datos valido
   └─ Crea schemas Zod

3. APIIntegrationAgent
   ├─ Conecta con backend
   └─ Crea hooks de fetching

4. ComponentGeneratorAgent (mejora)
   ├─ Integra datos en componentes
   └─ Añade interactividad

5. HookCreatorAgent (si necesario)
   ├─ Crea lógica compleja
   └─ Maneja estado avanzado
```

---

## 📋 Ejemplo Completo: Crear Página de Deudas

### Paso 1: Componentes
```
ComponentGeneratorAgent: "Genera DebtForm, DebtCard, DebtList"
```

### Paso 2: Validación
```
ValidationSchemaAgent: "Crea schema para Debt y DebtPayment"
```

### Paso 3: API
```
APIIntegrationAgent: "Integra endpoints /debts y /debt-payments"
```

### Paso 4: Lógica
```
HookCreatorAgent: "Hook para filtrar deudas por estado"
```

### Paso 5: Página
```
ComponentGeneratorAgent: "Crea DebtsPage que une todo"
```

---

## ✨ Invocando Agents

### Invocación simple:
```
"ComponentGeneratorAgent: Crea un componente para X"
```

### Invocación con contexto:
```
"Necesito una página de deudas.
 - Mostrar lista de deudas activas
 - Poder crear nueva deuda
 - Poder registrar pago
 Usa ComponentGeneratorAgent, APIIntegrationAgent, HookCreatorAgent"
```

### Invocación para mejorar:
```
"ComponentGeneratorAgent: Mejora el componente X para que:
 - Sea más responsive
 - Maneje el estado mejor
 - Tenga mejor UX"
```

---

## 🎯 Cuándo Usar Cada Agent

| Necesidad | Agent |
|-----------|-------|
| Nuevo componente | ComponentGeneratorAgent |
| Nueva lógica reutilizable | HookCreatorAgent |
| Validar datos de formulario | ValidationSchemaAgent |
| Conectar endpoint | APIIntegrationAgent |
| Múltiples de arriba | Todos en combinación |

---

## 💡 Tips

- Usa agents en secuencia lógica
- Proporciona contexto claro
- Menciona constraints (TypeScript, TailwindCSS, etc)
- Pide ejemplos si no estás seguro
- Agents trabajan mejor juntos


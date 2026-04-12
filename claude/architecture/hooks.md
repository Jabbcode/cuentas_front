# Custom Hooks - Cuentas Frontend

## 📚 Catálogo de Hooks

Todos los custom hooks disponibles en el proyecto con su propósito y uso.

## 🔐 useAuth (si existe)

**Archivo:** `src/hooks/useAuth.ts`
**Propósito:** Gestionar autenticación del usuario

**Retorna:**
```typescript
{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Uso:**
```typescript
function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (email, password) => {
    await login(email, password);
    // Redirect ocurre automáticamente
  };
}
```

## 💳 useAccounts

**Archivo:** `src/hooks/useAccounts.ts`
**Propósito:** Obtener todas las cuentas del usuario y calcular totales

**Retorna:**
```typescript
{
  accounts: Account[];
  loading: boolean;
  reload: () => void;
  totalBalance: number;  // Suma inteligente (maneja credit cards)
}
```

**Detalles:**
- Calcula `totalBalance` inteligentemente:
  - Para credit cards: disponible = límite - usado
  - Para otras cuentas: saldo directo
- Refresca datos al montar
- Proporciona `reload()` para refrescar manualmente

**Uso:**
```typescript
function AccountsPage() {
  const { accounts, loading, reload, totalBalance } = useAccounts();
  
  return (
    <div>
      <h2>Total Balance: ${totalBalance}</h2>
      {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
      <button onClick={reload}>Refresh</button>
    </div>
  );
}
```

## 💰 useTransactions

**Archivo:** `src/hooks/useTransactions.ts`
**Propósito:** Obtener transacciones con paginación y filtros

**Retorna:**
```typescript
{
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  reload: () => void;
}
```

**Detalles:**
- Soporta paginación
- Obtiene transacciones ordenadas (más recientes primero)
- Manejo de errores

**Uso:**
```typescript
function TransactionsPage() {
  const { transactions, loading, pagination, reload } = useTransactions();
  
  return (
    <div>
      {transactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
      <Pagination page={pagination.page} total={pagination.total} />
      <button onClick={reload}>Refresh</button>
    </div>
  );
}
```

## 📊 useDashboard

**Archivo:** `src/hooks/useDashboard.ts`
**Propósito:** Obtener datos agregados para el dashboard

**Retorna:**
```typescript
{
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}
```

**DashboardSummary incluye:**
```typescript
{
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  month: string;
  accounts: Account[];
  recentTransactions: Transaction[];
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
  }>;
  accountBreakdown: Array<{
    accountId: string;
    accountName: string;
    balance: number;
  }>;
}
```

**Uso:**
```typescript
function DashboardPage() {
  const { summary, loading } = useDashboard();
  
  if (loading) return <Spinner />;
  if (!summary) return <Error />;
  
  return (
    <div>
      <SummaryCards summary={summary} />
      <BalanceChart accounts={summary.accountBreakdown} />
      <ExpenseChart categories={summary.topCategories} />
    </div>
  );
}
```

## 💸 useFixedExpenses

**Archivo:** `src/hooks/useFixedExpenses.ts`
**Propósito:** Obtener gastos fijos/ingresos recurrentes

**Retorna:**
```typescript
{
  expenses: FixedExpenseSummary;
  loading: boolean;
  error: string | null;
  reload: () => void;
}
```

**FixedExpenseSummary incluye:**
```typescript
{
  totalMonthlyExpenses: number;
  totalMonthlyIncome: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  items: Array<FixedExpense & { isPaidThisMonth: boolean }>;
}
```

**Detalles:**
- Calcula totales mensuales
- Indica cuáles están pagadas
- Ordena por dueDay

**Uso:**
```typescript
function FixedExpensesPage() {
  const { expenses, loading } = useFixedExpenses();
  
  return (
    <div>
      <div className="grid">
        <Card title="Gastos" value={expenses.totalMonthlyExpenses} />
        <Card title="Ingresos" value={expenses.totalMonthlyIncome} />
        <Card title="Pagados" value={`${expenses.paidCount}/${expenses.totalCount}`} />
      </div>
      <FixedExpensesList items={expenses.items} />
    </div>
  );
}
```

## 💳 useCreditCards

**Archivo:** `src/hooks/useCreditCards.ts`
**Propósito:** Obtener tarjetas de crédito con información de utilización

**Retorna:**
```typescript
{
  creditCards: Account[];
  loading: boolean;
  reload: () => void;
}
```

**Detalles:**
- Filtra cuentas con type === 'credit_card'
- Información incluye creditLimit, cutoffDay, paymentDueDay
- Retorna vacío si no hay tarjetas

**Uso:**
```typescript
function CreditCardsPage() {
  const { creditCards, loading, reload } = useCreditCards();
  
  return (
    <div>
      {creditCards.map(card => (
        <CreditCardWidget key={card.id} card={card} onUpdate={reload} />
      ))}
    </div>
  );
}
```

## 🎯 useDebts

**Archivo:** `src/hooks/useDebts.ts`
**Propósito:** Obtener todas las deudas del usuario

**Retorna:**
```typescript
{
  debts: Debt[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}
```

**Debt estructura:**
```typescript
{
  id: string;
  creditor: string;           // "Juan", "Banco BBVA", etc
  description: string;        // Descripción de la deuda
  totalAmount: number;        // Monto original
  remainingAmount: number;    // Lo que falta pagar
  interestRate?: number;      // Tasa de interés
  interestType?: string;      // "fixed" | "percentage"
  startDate: string;
  dueDate?: string;
  status: string;             // "active" | "paid" | "overdue"
  payments: DebtPayment[];
  recurringPayments: RecurringDebtPayment[];
}
```

**Uso:**
```typescript
function DebtsPage() {
  const { debts, loading, reload } = useDebts();
  const activeDebts = debts.filter(d => d.status === 'active');
  
  return (
    <div>
      <DebtsList debts={activeDebts} onPayment={reload} />
    </div>
  );
}
```

## 🔄 useRecurringDebtPayments

**Archivo:** `src/hooks/useRecurringDebtPayments.ts`
**Propósito:** Obtener pagos recurrentes de deudas

**Retorna:**
```typescript
{
  payments: RecurringDebtPayment[];
  loading: boolean;
  reload: () => void;
}
```

**RecurringDebtPayment estructura:**
```typescript
{
  id: string;
  debtId: string;
  userId: string;
  amount: number;
  accountId: string;
  frequency: string;          // "monthly" | "biweekly" | "weekly"
  dayOfMonth?: number;        // 1-31 para monthly
  dayOfWeek?: number;         // 0-6 para weekly
  isActive: boolean;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  nextDueDate: string;        // Próximo pago programado
  notes?: string;
}
```

**Uso:**
```typescript
function RecurringPaymentsPage() {
  const { payments, loading, reload } = useRecurringDebtPayments();
  const activePayments = payments.filter(p => p.isActive);
  
  return (
    <div>
      <PaymentSchedule payments={activePayments} />
    </div>
  );
}
```

## 🔍 useTransactionFilters

**Archivo:** `src/hooks/useTransactionFilters.ts`
**Propósito:** Gestionar filtros de transacciones (fechas, categorías, cuentas)

**Retorna:**
```typescript
{
  filters: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: 'expense' | 'income';
  };
  setFilter: (filter: string, value: any) => void;
  clearFilters: () => void;
}
```

**Uso:**
```typescript
function TransactionsPage() {
  const { filters, setFilter, clearFilters } = useTransactionFilters();
  const { transactions } = useTransactions(filters);
  
  return (
    <div>
      <FilterBar 
        filters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
      />
      <TransactionsList transactions={transactions} />
    </div>
  );
}
```

## 📄 usePagination

**Archivo:** `src/hooks/usePagination.ts`
**Propósito:** Gestionar paginación de listados

**Retorna:**
```typescript
{
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (count: number) => void;
}
```

**Uso:**
```typescript
function ListPage() {
  const { currentPage, totalPages, goToPage, nextPage } = usePagination(
    totalItems,
    20
  );
  
  return (
    <div>
      <ItemList page={currentPage} />
      <PaginationControls
        current={currentPage}
        total={totalPages}
        onNext={nextPage}
        onGoTo={goToPage}
      />
    </div>
  );
}
```

## 🛒 usePaymentModal

**Archivo:** `src/hooks/usePaymentModal.ts`
**Propósito:** Gestionar estado del modal de pagos

**Retorna:**
```typescript
{
  isOpen: boolean;
  debtId: string | null;
  amount: number;
  openModal: (debtId: string, amount: number) => void;
  closeModal: () => void;
}
```

**Uso:**
```typescript
function DebtDetails({ debtId }) {
  const { isOpen, openModal, closeModal } = usePaymentModal();
  
  return (
    <>
      <button onClick={() => openModal(debtId, 500)}>
        Pay $500
      </button>
      {isOpen && <PaymentModal onClose={closeModal} />}
    </>
  );
}
```

## 🎯 Patrones Comunes en Hooks

### Patrón: Fetch + Error Handling
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
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
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

### Patrón: Memoización de Callbacks
```typescript
const handleUpdate = useCallback(async (id: string, data: UpdateData) => {
  await api.update(id, data);
  reload();
}, [reload]);  // reload como dependencia

return { handleUpdate };
```

### Patrón: Manejo de Dependencias
```typescript
useEffect(() => {
  loadData();
  // NO incluir loadData como dependencia si proviene de mismo efecto
  // INCLUIR funciones que vienen de props o hooks externos
}, [propFunction, externalDependency]);
```

## ⚠️ Cosas a Evitar

- ❌ No crear hooks que solo wrappeen otro hook sin lógica
- ❌ No olvidar cleanup en useEffect (si aplica)
- ❌ No incluir functions en dependencies array sin memoizar (useCallback)
- ❌ No ignorar eslint-plugin-react-hooks warnings
- ❌ No hacer setState después de unmount (usar AbortController si aplica)

## 🧪 Testing Hooks

Para testear hooks, usar `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAccounts } from './useAccounts';

test('useAccounts carga cuentas', async () => {
  const { result } = renderHook(() => useAccounts());
  
  expect(result.current.loading).toBe(true);
  
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  
  expect(result.current.loading).toBe(false);
  expect(result.current.accounts.length).toBeGreaterThan(0);
});
```

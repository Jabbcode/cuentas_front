import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { FixedExpensesPage } from './pages/FixedExpensesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { DebtsPage } from './pages/DebtsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BudgetsPage } from './pages/BudgetsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ErrorBoundary>
                  <MainLayout />
                </ErrorBoundary>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/fixed-expenses" element={<FixedExpensesPage />} />
              <Route path="/credit-cards" element={<CreditCardsPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

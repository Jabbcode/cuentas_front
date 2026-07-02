import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MainLayout } from './components/layout/MainLayout';
import { PageLoader } from './components/ui/PageLoader';
import { LoginPage } from './pages/LoginPage';

const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AccountsPage = lazy(() =>
  import('./pages/AccountsPage').then((m) => ({ default: m.AccountsPage }))
);
const TransactionsPage = lazy(() =>
  import('./pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage }))
);
const FixedExpensesPage = lazy(() =>
  import('./pages/FixedExpensesPage').then((m) => ({ default: m.FixedExpensesPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const CreditCardsPage = lazy(() =>
  import('./pages/CreditCardsPage').then((m) => ({ default: m.CreditCardsPage }))
);
const DebtsPage = lazy(() => import('./pages/DebtsPage').then((m) => ({ default: m.DebtsPage })));
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

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
          <Suspense fallback={<PageLoader />}>
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
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

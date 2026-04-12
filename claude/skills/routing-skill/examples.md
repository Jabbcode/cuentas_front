# Ejemplos: Routing & Protection

## ✅ Estructura de Rutas Protegidas
Ejemplo de cómo envolver rutas para controlar el acceso.

```tsx
// AppRoutes.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <PrivateRoute />, // Wrapper de protección
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<Loader />}>
            <Dashboard />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// routes.constants.ts
export const ROUTES = {
  USER_DETAILS: (id: string) => `/users/${id}`,
  DASHBOARD: '/dashboard'
} as const;

// Uso en componente
const handleUserClick = (id: string) => {
  navigate(ROUTES.USER_DETAILS(id));
};
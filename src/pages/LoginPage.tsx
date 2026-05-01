import { Navigate } from 'react-router-dom';
import { useLoginPage } from '../features/auth/login/hooks/useLoginPage';
import { LoginForm } from '../features/auth/login/components/LoginForm';

export function LoginPage() {
  const {
    email,
    password,
    error,
    loading,
    isAuthLoading,
    isAuthenticated,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginPage();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

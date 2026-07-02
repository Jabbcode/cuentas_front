import { Navigate } from 'react-router-dom';
import { useRegisterPage } from '../features/auth/register/hooks/useRegisterPage';
import { RegisterForm } from '../features/auth/register/components/RegisterForm';

export function RegisterPage() {
  const {
    name,
    email,
    password,
    error,
    loading,
    isAuthLoading,
    isAuthenticated,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  } = useRegisterPage();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <RegisterForm
      name={name}
      email={email}
      password={password}
      error={error}
      loading={loading}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

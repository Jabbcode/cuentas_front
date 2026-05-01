import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import type { UseLoginPageReturn } from '../../types';

export function useLoginPage(): UseLoginPageReturn {
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigation is handled automatically by the page via isAuthenticated
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errorMessage = axiosError?.response?.data?.error ?? 'Email o contraseña incorrectos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    loading,
    isAuthLoading,
    isAuthenticated,
    setEmail,
    setPassword,
    handleSubmit,
  };
}

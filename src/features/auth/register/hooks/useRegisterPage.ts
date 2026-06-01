import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import type { UseRegisterPageReturn } from '../../types';

export function useRegisterPage(): UseRegisterPageReturn {
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      // Navigation is handled automatically by the page via isAuthenticated
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        axiosError?.response?.data?.error ?? 'Error al registrar. El email puede estar en uso.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}

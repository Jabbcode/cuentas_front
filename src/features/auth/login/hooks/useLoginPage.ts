import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getApiErrorMessage } from '../../../../lib/api-errors';
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
      setError(getApiErrorMessage(err, 'Email o contraseña incorrectos'));
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

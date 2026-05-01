import type { User, AuthResponse } from '../../types';

// Re-export shared types used across the auth feature
export type { User, AuthResponse };

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface UseLoginPageReturn {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface UseRegisterPageReturn {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

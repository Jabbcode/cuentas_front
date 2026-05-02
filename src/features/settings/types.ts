// UI/form types for the settings feature
// Domain API response types (UserProfile, AccountStatistics, etc.) live in api.ts
import type { UserProfile, AccountStatistics } from './api';

export type SettingsTab = 'profile' | 'password' | 'notifications' | 'account';

export interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

export interface ProfileFormState {
  name: string;
  email: string;
}

export interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountFormState {
  password: string;
  confirmation: string;
}

export interface UseSettingsReturn {
  profile: UserProfile | null;
  statistics: AccountStatistics | null;
  isLoading: boolean;
  message: FeedbackMessage | null;
  handleUpdateProfile: (data: ProfileFormState) => Promise<void>;
  handleChangePassword: (data: PasswordFormState) => Promise<void>;
  handleDeleteAccount: (data: DeleteAccountFormState) => Promise<void>;
}

export interface UseSettingsPageReturn {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

// Re-export domain types from api so consumers can import from one place
export type { UserProfile, AccountStatistics } from './api';

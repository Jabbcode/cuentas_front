import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { settingsApi } from '../api';
import type { UserProfile, AccountStatistics } from '../api';
import type {
  FeedbackMessage,
  ProfileFormState,
  PasswordFormState,
  DeleteAccountFormState,
  UseSettingsReturn,
} from '../types';
import { extractApiError } from '../utils';

const MESSAGE_TIMEOUT_MS = 5000;

interface SettingsData {
  profile: UserProfile;
  statistics: AccountStatistics;
}

export function useSettings(): UseSettingsReturn {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const showMessage = useCallback((type: FeedbackMessage['type'], text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }, []);

  const query = useQuery<SettingsData, Error>({
    queryKey: ['settings'],
    queryFn: async () => {
      const [profileData, statsData] = await Promise.all([
        settingsApi.getProfile(),
        settingsApi.getStatistics(),
      ]);
      return { profile: profileData, statistics: statsData };
    },
  });

  const handleUpdateProfile = useCallback(
    async (formData: ProfileFormState) => {
      setIsLoading(true);
      try {
        await settingsApi.updateProfile({
          ...(formData.name !== query.data?.profile.name && { name: formData.name }),
          ...(formData.email !== query.data?.profile.email && { email: formData.email }),
        });
        await queryClient.invalidateQueries({ queryKey: ['settings'] });
        showMessage('success', 'Profile updated successfully');
      } catch (err: unknown) {
        showMessage('error', extractApiError(err, 'Error updating profile'));
      } finally {
        setIsLoading(false);
      }
    },
    [query.data?.profile, queryClient, showMessage]
  );

  const handleChangePassword = useCallback(
    async (formData: PasswordFormState) => {
      setIsLoading(true);
      try {
        await settingsApi.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });
        showMessage('success', 'Password changed successfully');
      } catch (err: unknown) {
        showMessage('error', extractApiError(err, 'Error changing password'));
      } finally {
        setIsLoading(false);
      }
    },
    [showMessage]
  );

  const handleDeleteAccount = useCallback(
    async (formData: DeleteAccountFormState) => {
      if (formData.confirmation !== 'DELETE') {
        showMessage('error', 'Please type DELETE to confirm');
        return;
      }

      if (!window.confirm('Are you sure? This action cannot be undone!')) {
        return;
      }

      setIsLoading(true);
      try {
        await settingsApi.deleteAccount({
          password: formData.password,
          confirmation: 'DELETE',
        });
        showMessage('success', 'Account deleted successfully. Redirecting...');
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (err: unknown) {
        showMessage('error', extractApiError(err, 'Error deleting account'));
        setIsLoading(false);
      }
    },
    [logout, showMessage]
  );

  return {
    profile: query.data?.profile ?? null,
    statistics: query.data?.statistics ?? null,
    isLoading,
    message,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  };
}

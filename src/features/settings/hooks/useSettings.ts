import { useState, useEffect, useCallback } from 'react';
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

export function useSettings(): UseSettingsReturn {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<AccountStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const showMessage = useCallback((type: FeedbackMessage['type'], text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), MESSAGE_TIMEOUT_MS);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        settingsApi.getProfile(),
        settingsApi.getStatistics(),
      ]);
      setProfile(profileData);
      setStatistics(statsData);
    } catch (err: unknown) {
      showMessage('error', extractApiError(err, 'Error loading data'));
    }
  }, [showMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateProfile = useCallback(
    async (formData: ProfileFormState) => {
      setIsLoading(true);
      try {
        const updatedProfile = await settingsApi.updateProfile({
          ...(formData.name !== profile?.name && { name: formData.name }),
          ...(formData.email !== profile?.email && { email: formData.email }),
        });
        setProfile(updatedProfile);
        showMessage('success', 'Profile updated successfully');
      } catch (err: unknown) {
        showMessage('error', extractApiError(err, 'Error updating profile'));
      } finally {
        setIsLoading(false);
      }
    },
    [profile, showMessage]
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
    profile,
    statistics,
    isLoading,
    message,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  };
}

import { useSettings } from '../features/settings/hooks/useSettings';
import { useSettingsPage } from '../features/settings/hooks/useSettingsPage';
import { SettingsStatsCards } from '../features/settings/components/SettingsStatsCards';
import { SettingsTabs } from '../features/settings/components/SettingsTabs';
import { SettingsFeedback } from '../features/settings/components/SettingsFeedback';
import { ProfileForm } from '../features/settings/components/ProfileForm';
import { PasswordForm } from '../features/settings/components/PasswordForm';
import { NotificationsTab } from '../features/settings/components/NotificationsTab';
import { DeleteAccountForm } from '../features/settings/components/DeleteAccountForm';

export function SettingsPage() {
  const {
    profile,
    statistics,
    isLoading,
    message,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  } = useSettings();
  const { activeTab, setActiveTab } = useSettingsPage();

  if (!profile || !statistics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
      </div>

      {message && <SettingsFeedback message={message} />}

      <SettingsStatsCards statistics={statistics} profile={profile} />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' && (
        <ProfileForm profile={profile} isLoading={isLoading} onSubmit={handleUpdateProfile} />
      )}

      {activeTab === 'password' && (
        <PasswordForm isLoading={isLoading} onSubmit={handleChangePassword} />
      )}

      {activeTab === 'notifications' && <NotificationsTab />}

      {activeTab === 'account' && (
        <DeleteAccountForm isLoading={isLoading} onSubmit={handleDeleteAccount} />
      )}
    </div>
  );
}

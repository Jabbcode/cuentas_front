// Public API of the settings feature module

// Types
export type {
  SettingsTab,
  FeedbackMessage,
  ProfileFormState,
  PasswordFormState,
  DeleteAccountFormState,
  UseSettingsReturn,
  UseSettingsPageReturn,
  UserProfile,
  AccountStatistics,
} from './types';

// API
export { settingsApi } from './api';

// Utils
export { extractApiError, createFeedbackMessage, formatMemberSince } from './utils';

// Hooks
export { useSettings } from './hooks/useSettings';
export { useSettingsPage } from './hooks/useSettingsPage';

// Components
export { SettingsStatsCards } from './components/SettingsStatsCards';
export { SettingsTabs } from './components/SettingsTabs';
export { SettingsFeedback } from './components/SettingsFeedback';
export { ProfileForm } from './components/ProfileForm';
export { PasswordForm } from './components/PasswordForm';
export { NotificationsTab } from './components/NotificationsTab';
export { DeleteAccountForm } from './components/DeleteAccountForm';

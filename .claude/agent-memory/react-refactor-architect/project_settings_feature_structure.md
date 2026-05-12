---
name: settings feature module structure
description: settings feature module layout, deleted files, and pattern notes from 2026-05-01 refactor
type: project
---

Migrated on 2026-05-01.

## Files created

- src/features/settings/index.ts — barrel with all public exports
- src/features/settings/types.ts — UI/form types (SettingsTab, FeedbackMessage, ProfileFormState, PasswordFormState, DeleteAccountFormState, UseSettingsReturn, UseSettingsPageReturn) + re-exports of UserProfile/AccountStatistics from api.ts
- src/features/settings/api.ts — settingsApi (getProfile, updateProfile, changePassword, getStatistics, deleteAccount) + domain interfaces (UserProfile, AccountStatistics, UpdateProfileData, ChangePasswordData, DeleteAccountData)
- src/features/settings/utils.ts — extractApiError, createFeedbackMessage, formatMemberSince
- src/features/settings/hooks/useSettings.ts — all API calls, side effects, message timeout logic
- src/features/settings/hooks/useSettingsPage.ts — activeTab state only
- src/features/settings/components/SettingsStatsCards.tsx
- src/features/settings/components/SettingsTabs.tsx
- src/features/settings/components/SettingsFeedback.tsx
- src/features/settings/components/ProfileForm.tsx — has internal useState for form fields + useEffect to sync from profile prop
- src/features/settings/components/PasswordForm.tsx — has internal useState, resets after submit
- src/features/settings/components/NotificationsTab.tsx — calls useNotificationPreferences directly (no props needed)
- src/features/settings/components/DeleteAccountForm.tsx
- src/features/settings/**tests**/settings.test.ts

## Files deleted

- src/api/settings.api.ts — moved to src/features/settings/api.ts

## Files updated

- src/pages/SettingsPage.tsx — pure orchestrator (~55 lines), zero useState/useEffect/logic

## Pattern notes

- Domain API interfaces (UserProfile, AccountStatistics) live in features/settings/api.ts, NOT in src/types/index.ts (they were originally only in settings.api.ts, never in global types)
- NotificationsTab calls useNotificationPreferences internally because it belongs to the notifications cross-cutting concern — no prop drilling needed
- ProfileForm has local useState + useEffect to sync from the profile prop — this is acceptable since it is purely form-local UI state, not business logic
- PasswordForm resets itself to empty state after a successful submit call
- Why: src/api/settings.api.ts had zero external consumers other than SettingsPage.tsx

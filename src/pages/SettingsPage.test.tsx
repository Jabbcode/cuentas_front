import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from './SettingsPage';
import { useSettings } from '../features/settings/hooks/useSettings';
import { useSettingsPage } from '../features/settings/hooks/useSettingsPage';
import { useNotificationPreferences } from '../hooks/useNotifications';
import type { UserProfile, AccountStatistics } from '../features/settings/api';

vi.mock('../features/settings/hooks/useSettings');
vi.mock('../features/settings/hooks/useSettingsPage');
vi.mock('../hooks/useNotifications');

const mockedUseSettings = vi.mocked(useSettings);
const mockedUseSettingsPage = vi.mocked(useSettingsPage);
const mockedUseNotificationPreferences = vi.mocked(useNotificationPreferences);

const profile: UserProfile = { id: 'u1', name: 'Juan', email: 'j@x.com', createdAt: '2026-01-01' };
const statistics: AccountStatistics = {
  accounts: 1,
  transactions: 1,
  categories: 1,
  fixedExpenses: 0,
  debts: 0,
  memberSince: '2026-01-01',
};

function baseSettings(overrides: Partial<ReturnType<typeof useSettings>> = {}) {
  return {
    profile,
    statistics,
    isLoading: false,
    message: null,
    handleUpdateProfile: vi.fn(),
    handleChangePassword: vi.fn(),
    handleDeleteAccount: vi.fn(),
    ...overrides,
  };
}

describe('SettingsPage', () => {
  beforeEach(() => {
    mockedUseNotificationPreferences.mockReturnValue({
      preferences: { categoryLimit: true, debtDue: true, monthlyEmail: true },
      update: vi.fn(),
    } as never);
  });

  it('sin profile/statistics: muestra el spinner', () => {
    mockedUseSettings.mockReturnValue(baseSettings({ profile: null, statistics: null }) as never);
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'profile', setActiveTab: vi.fn() });

    render(<SettingsPage />);

    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
  });

  it('tab "profile": muestra el ProfileForm', () => {
    mockedUseSettings.mockReturnValue(baseSettings() as never);
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'profile', setActiveTab: vi.fn() });

    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeInTheDocument();
  });

  it('tab "password": muestra el PasswordForm', () => {
    mockedUseSettings.mockReturnValue(baseSettings() as never);
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'password', setActiveTab: vi.fn() });

    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: 'Cambiar Contraseña' })).toBeInTheDocument();
  });

  it('tab "account": muestra el DeleteAccountForm', () => {
    mockedUseSettings.mockReturnValue(baseSettings() as never);
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'account', setActiveTab: vi.fn() });

    render(<SettingsPage />);

    expect(
      screen.getByRole('button', { name: 'Eliminar Cuenta Permanentemente' })
    ).toBeInTheDocument();
  });

  it('con message: muestra el SettingsFeedback', () => {
    mockedUseSettings.mockReturnValue(
      baseSettings({ message: { type: 'success', text: 'Perfil actualizado' } }) as never
    );
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'profile', setActiveTab: vi.fn() });

    render(<SettingsPage />);

    expect(screen.getByText('Perfil actualizado')).toBeInTheDocument();
  });

  it('click en una pestaña de SettingsTabs llama a setActiveTab', async () => {
    const user = userEvent.setup();
    const setActiveTab = vi.fn();
    mockedUseSettings.mockReturnValue(baseSettings() as never);
    mockedUseSettingsPage.mockReturnValue({ activeTab: 'profile', setActiveTab });

    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /contraseña/i }));

    expect(setActiveTab).toHaveBeenCalledWith('password');
  });
});

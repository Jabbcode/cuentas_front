import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsStatsCards } from './SettingsStatsCards';
import type { AccountStatistics, UserProfile } from '../api';

describe('SettingsStatsCards', () => {
  it('muestra los conteos de transacciones y cuentas, y la fecha de miembro desde', () => {
    const statistics: AccountStatistics = {
      accounts: 3,
      transactions: 42,
      categories: 10,
      fixedExpenses: 2,
      debts: 1,
      memberSince: '2026-01-15',
    };
    const profile: UserProfile = {
      id: 'u1',
      name: 'Juan',
      email: 'juan@x.com',
      createdAt: '2026-01-15',
    };

    render(<SettingsStatsCards statistics={statistics} profile={profile} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Miembro desde')).toBeInTheDocument();
    expect(screen.getByText(new Date(profile.createdAt).toLocaleDateString())).toBeInTheDocument();
  });
});

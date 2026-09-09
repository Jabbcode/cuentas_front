import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsTabs } from './SettingsTabs';

describe('SettingsTabs', () => {
  it('renderiza las 4 pestañas', () => {
    render(<SettingsTabs activeTab="profile" onTabChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /contraseña/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notificaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cuenta/i })).toBeInTheDocument();
  });

  it('click en una pestaña llama a onTabChange con su id', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<SettingsTabs activeTab="profile" onTabChange={onTabChange} />);

    await user.click(screen.getByRole('button', { name: /contraseña/i }));

    expect(onTabChange).toHaveBeenCalledWith('password');
  });
});

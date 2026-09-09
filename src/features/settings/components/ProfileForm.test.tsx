import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import type { UserProfile } from '../api';

function fakeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { id: 'u1', name: 'Juan', email: 'juan@x.com', createdAt: '2026-01-01', ...overrides };
}

describe('ProfileForm', () => {
  it('precarga nombre y email desde el profile', () => {
    render(<ProfileForm profile={fakeProfile()} isLoading={false} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan');
    expect(screen.getByLabelText('Email')).toHaveValue('juan@x.com');
  });

  it('submit llama a onSubmit con los valores editados', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileForm profile={fakeProfile()} isLoading={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Pedro');
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'pedro@x.com');
    await user.click(screen.getByRole('button', { name: 'Guardar Cambios' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Pedro', email: 'pedro@x.com' });
  });

  it('isLoading=true deshabilita el submit y muestra "Guardando..."', () => {
    render(<ProfileForm profile={fakeProfile()} isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('si el profile cambia (por props), sincroniza los campos', () => {
    const { rerender } = render(
      <ProfileForm profile={fakeProfile({ name: 'Juan' })} isLoading={false} onSubmit={vi.fn()} />
    );

    rerender(
      <ProfileForm
        profile={fakeProfile({ name: 'Actualizado' })}
        isLoading={false}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Nombre')).toHaveValue('Actualizado');
  });
});

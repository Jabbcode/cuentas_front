import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordForm } from './PasswordForm';

describe('PasswordForm', () => {
  it('submit llama a onSubmit con los tres campos y limpia el formulario', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PasswordForm isLoading={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Contraseña Actual'), 'old123');
    await user.type(screen.getByLabelText('Nueva Contraseña'), 'new123');
    await user.type(screen.getByLabelText('Confirmar Nueva Contraseña'), 'new123');
    await user.click(screen.getByRole('button', { name: 'Cambiar Contraseña' }));

    expect(onSubmit).toHaveBeenCalledWith({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123',
    });

    expect(await screen.findByLabelText('Contraseña Actual')).toHaveValue('');
  });

  it('isLoading=true deshabilita el submit y muestra "Cambiando..."', () => {
    render(<PasswordForm isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cambiando...' })).toBeDisabled();
  });
});

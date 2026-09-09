import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAccountForm } from './DeleteAccountForm';

describe('DeleteAccountForm', () => {
  it('el submit está deshabilitado hasta escribir DELETE exactamente', async () => {
    const user = userEvent.setup();
    render(<DeleteAccountForm isLoading={false} onSubmit={vi.fn()} />);

    const submit = screen.getByRole('button', { name: 'Eliminar Cuenta Permanentemente' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/escribe/i), 'delete');
    expect(submit).toBeDisabled();

    await user.clear(screen.getByLabelText(/escribe/i));
    await user.type(screen.getByLabelText(/escribe/i), 'DELETE');
    expect(submit).toBeEnabled();
  });

  it('submit llama a onSubmit con password y confirmation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DeleteAccountForm isLoading={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Contraseña'), 'mypassword');
    await user.type(screen.getByLabelText(/escribe/i), 'DELETE');
    await user.click(screen.getByRole('button', { name: 'Eliminar Cuenta Permanentemente' }));

    expect(onSubmit).toHaveBeenCalledWith({ password: 'mypassword', confirmation: 'DELETE' });
  });

  it('isLoading=true deshabilita el submit y muestra "Eliminando..."', () => {
    render(<DeleteAccountForm isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Eliminando...' })).toBeDisabled();
  });
});

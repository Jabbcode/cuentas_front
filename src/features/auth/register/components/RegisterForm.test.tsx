import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';

function renderForm(overrides: Partial<Parameters<typeof RegisterForm>[0]> = {}) {
  const props = {
    name: '',
    email: '',
    password: '',
    error: '',
    loading: false,
    onNameChange: vi.fn(),
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <RegisterForm {...props} />
    </MemoryRouter>
  );
  return props;
}

describe('RegisterForm', () => {
  it('escribir en nombre/email/contraseña llama a los callbacks correspondientes', async () => {
    const user = userEvent.setup();
    const { onNameChange, onEmailChange, onPasswordChange } = renderForm();

    await user.type(screen.getByLabelText('Nombre'), 'a');
    await user.type(screen.getByLabelText('Email'), 'b');
    await user.type(screen.getByLabelText('Contraseña'), 'c');

    expect(onNameChange).toHaveBeenCalledWith('a');
    expect(onEmailChange).toHaveBeenCalledWith('b');
    expect(onPasswordChange).toHaveBeenCalledWith('c');
  });

  it('muestra el error cuando viene por props', () => {
    renderForm({ error: 'El email ya está registrado' });

    expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
  });

  it('loading=true deshabilita el submit y muestra "Creando cuenta..."', () => {
    renderForm({ loading: true });

    expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();
  });

  it('submit del formulario llama a onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm({
      name: 'A',
      email: 'a@a.com',
      password: '123456',
    });

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('el botón de mostrar/ocultar contraseña cambia el type del input', async () => {
    const user = userEvent.setup();
    renderForm({ password: 'secreto' });

    const input = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.type).toBe('text');
  });
});

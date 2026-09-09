import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';

function renderForm(overrides: Partial<Parameters<typeof LoginForm>[0]> = {}) {
  const props = {
    email: '',
    password: '',
    error: '',
    loading: false,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <LoginForm {...props} />
    </MemoryRouter>
  );
  return props;
}

describe('LoginForm', () => {
  it('escribir en email/contraseña llama a los callbacks correspondientes', async () => {
    const user = userEvent.setup();
    const { onEmailChange, onPasswordChange } = renderForm();

    await user.type(screen.getByLabelText('Email'), 'a');
    await user.type(screen.getByLabelText('Contraseña'), 'b');

    expect(onEmailChange).toHaveBeenCalledWith('a');
    expect(onPasswordChange).toHaveBeenCalledWith('b');
  });

  it('muestra el error cuando viene por props', () => {
    renderForm({ error: 'Credenciales inválidas' });

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('sin error no muestra ningún mensaje de error', () => {
    renderForm({ error: '' });

    expect(screen.queryByText(/inválidas/i)).not.toBeInTheDocument();
  });

  it('loading=true deshabilita el submit y muestra "Iniciando sesión..."', () => {
    renderForm({ loading: true });

    expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled();
  });

  it('submit del formulario llama a onSubmit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm({ email: 'a@a.com', password: '123456' });

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('el botón de mostrar/ocultar contraseña cambia el type del input', async () => {
    const user = userEvent.setup();
    renderForm({ password: 'secreto' });

    const input = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.type).toBe('text');

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input.type).toBe('password');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorCard } from './ErrorCard';

describe('ErrorCard', () => {
  it('muestra el mensaje default y llama onRetry', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorCard onRetry={onRetry} />);

    expect(screen.getByText('Ocurrió un error al cargar los datos.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('muestra un mensaje custom si se pasa', () => {
    render(<ErrorCard message="No se pudieron cargar las cuentas" onRetry={vi.fn()} />);
    expect(screen.getByText('No se pudieron cargar las cuentas')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebtEmpty } from './DebtEmpty';

describe('DebtEmpty', () => {
  it('muestra el mensaje y dispara onAction al click', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<DebtEmpty onAction={onAction} />);

    expect(screen.getByText('No tienes deudas registradas')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Agregar deuda/i }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

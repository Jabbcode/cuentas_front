import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('cerrado no renderiza nada', () => {
    render(<ConfirmDialog open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument();
  });

  it('usa los textos default y llama onConfirm/onClose', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmDialog open onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('acepta textos y variant custom', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Desactivar cuenta"
        description="Podés reactivarla después"
        confirmText="Desactivar"
        variant="warning"
      />
    );

    expect(screen.getByText('Desactivar cuenta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desactivar' })).toBeInTheDocument();
  });

  it('loading=true deshabilita los botones y muestra "Eliminando..."', () => {
    render(<ConfirmDialog open onClose={vi.fn()} onConfirm={vi.fn()} loading />);

    expect(screen.getByRole('button', { name: 'Eliminando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});

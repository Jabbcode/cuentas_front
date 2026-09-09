import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebtForm } from './DebtForm';
import { debtsApi } from '../api';
import type { Debt } from '../../../types';

vi.mock('../api', () => ({
  debtsApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function makeDebt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: 'debt-1',
    userId: 'user-1',
    creditor: 'Banco Nacional',
    description: 'Préstamo',
    totalAmount: 1000,
    remainingAmount: 400,
    interestRate: 5,
    interestType: 'percentage',
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Debt;
}

describe('DebtForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modo creación: título "Nueva Deuda" y campo de monto habilitado', () => {
    render(<DebtForm onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('Nueva Deuda')).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto Total/i)).toBeEnabled();
  });

  it('completa y envía el formulario: llama a debtsApi.create con los datos parseados', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(debtsApi.create).mockResolvedValue({} as never);
    render(<DebtForm onClose={vi.fn()} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/Acreedor/i), 'Juan');
    await user.type(screen.getByLabelText(/Descripción/i), 'Préstamo amigo');
    await user.type(screen.getByLabelText(/Monto Total/i), '500');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(debtsApi.create).toHaveBeenCalledWith({
      creditor: 'Juan',
      description: 'Préstamo amigo',
      totalAmount: 500,
      interestRate: undefined,
      interestType: undefined,
      dueDate: undefined,
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('modo edición: precarga los campos y el monto total está deshabilitado', () => {
    render(<DebtForm debt={makeDebt()} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByText('Editar Deuda')).toBeInTheDocument();
    expect(screen.getByLabelText(/Acreedor/i)).toHaveValue('Banco Nacional');
    expect(screen.getByLabelText(/Monto Total/i)).toBeDisabled();
  });

  it('modo edición: enviar llama a debtsApi.update con el id de la deuda', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(debtsApi.update).mockResolvedValue({} as never);
    render(<DebtForm debt={makeDebt()} onClose={vi.fn()} onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(debtsApi.update).toHaveBeenCalledWith(
      'debt-1',
      expect.objectContaining({ creditor: 'Banco Nacional' })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('el botón Cancelar dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DebtForm onClose={onClose} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

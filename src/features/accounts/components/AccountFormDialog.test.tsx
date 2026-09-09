import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountFormDialog } from './AccountFormDialog';
import type { Account } from '../../../types';
import type { AccountFormData } from '../types';

function fakeFormData(overrides: Partial<AccountFormData> = {}): AccountFormData {
  return {
    name: '',
    type: 'bank',
    balance: '',
    currency: 'EUR',
    color: '#3B82F6',
    creditLimit: '',
    cutoffDay: '',
    paymentDueDay: '',
    paymentAccountId: '',
    ...overrides,
  };
}

function fakeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'a1',
    name: 'Cuenta 1',
    type: 'bank',
    balance: 100,
    currency: 'EUR',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('AccountFormDialog', () => {
  it('título "Nueva Cuenta" y botón "Crear" cuando no está editando', () => {
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByText('Nueva Cuenta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('título "Editar Cuenta" y botón "Guardar" cuando editingAccount está presente', () => {
    render(
      <AccountFormDialog
        open
        editingAccount={fakeAccount()}
        formData={fakeFormData({ name: 'Cuenta 1' })}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByText('Editar Cuenta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('saving=true deshabilita el submit y muestra "Guardando..."', () => {
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: 'Guardando...' });
    expect(button).toBeDisabled();
  });

  it('escribir en Nombre llama a onFormDataChange con el updater funcional correcto', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    await user.type(screen.getByLabelText('Nombre'), 'X');

    expect(onFormDataChange).toHaveBeenCalled();
    const updater = onFormDataChange.mock.calls[0][0];
    expect(updater(fakeFormData())).toEqual(fakeFormData({ name: 'X' }));
  });

  it('tipo "Tarjeta de Crédito" muestra los campos de tarjeta, otros tipos no', () => {
    const { rerender } = render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData({ type: 'bank' })}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Límite de Crédito')).not.toBeInTheDocument();

    rerender(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData({ type: 'credit_card' })}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Límite de Crédito')).toBeInTheDocument();
    expect(screen.getByLabelText('Día de Corte')).toBeInTheDocument();
    expect(screen.getByLabelText('Día de Pago')).toBeInTheDocument();
  });

  it('cuenta de débito para pago excluye tarjetas de crédito y la cuenta que se está editando', () => {
    render(
      <AccountFormDialog
        open
        editingAccount={fakeAccount({ id: 'card-1', type: 'credit_card' })}
        formData={fakeFormData({ type: 'credit_card' })}
        saving={false}
        accounts={[
          fakeAccount({ id: 'card-1', name: 'Esta Tarjeta', type: 'credit_card' }),
          fakeAccount({ id: 'other-card', name: 'Otra Tarjeta', type: 'credit_card' }),
          fakeAccount({ id: 'bank-1', name: 'Mi Banco', type: 'bank' }),
        ]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    const select = screen.getByLabelText('Cuenta de Débito para Pago');
    expect(select).toHaveTextContent('Mi Banco');
    expect(select).not.toHaveTextContent('Otra Tarjeta');
    expect(select).not.toHaveTextContent('Esta Tarjeta');
  });

  it('submit del formulario llama a onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData({ name: 'X', balance: '100' })}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onFormDataChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('interactuar con tipo, balance y color llama a onFormDataChange', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Tipo'), 'cash');
    expect(onFormDataChange.mock.calls[0][0](fakeFormData())).toEqual(
      fakeFormData({ type: 'cash' })
    );

    await user.type(screen.getByLabelText('Balance inicial'), '5');
    expect(onFormDataChange.mock.calls.length).toBeGreaterThan(1);
  });

  it('interactuar con los campos de tarjeta de crédito llama a onFormDataChange', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData({ type: 'credit_card' })}
        saving={false}
        accounts={[fakeAccount({ id: 'bank-1', name: 'Mi Banco', type: 'bank' })]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    await user.type(screen.getByLabelText('Límite de Crédito'), '1');
    await user.type(screen.getByLabelText('Día de Corte'), '5');
    await user.type(screen.getByLabelText('Día de Pago'), '2');
    await user.selectOptions(screen.getByLabelText('Cuenta de Débito para Pago'), 'bank-1');

    expect(onFormDataChange).toHaveBeenCalledTimes(4);
  });

  it('click en un color de la paleta llama a onFormDataChange con ese color', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    const { container } = render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving={false}
        accounts={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    const colorButton = container.querySelector('button[style*="background-color"]');
    await user.click(colorButton!);

    expect(onFormDataChange).toHaveBeenCalled();
  });

  it('click en Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AccountFormDialog
        open
        editingAccount={null}
        formData={fakeFormData()}
        saving={false}
        accounts={[]}
        onClose={onClose}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

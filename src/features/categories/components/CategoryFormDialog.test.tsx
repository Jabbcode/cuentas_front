import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFormDialog } from './CategoryFormDialog';
import type { CategoryFormData } from '../types';
import type { Category } from '../../../types';

function baseFormData(overrides: Partial<CategoryFormData> = {}): CategoryFormData {
  return {
    name: '',
    type: 'expense',
    icon: 'utensils',
    color: '#3B82F6',
    monthlyLimit: '',
    ...overrides,
  };
}

describe('CategoryFormDialog', () => {
  it('cerrado: no renderiza el título del dialog', () => {
    render(
      <CategoryFormDialog
        open={false}
        editingCategory={null}
        formData={baseFormData()}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.queryByText('Nueva Categoría')).not.toBeInTheDocument();
  });

  it('creando: título "Nueva Categoría" y botón "Crear"', () => {
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData()}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByText('Nueva Categoría')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });

  it('editando: título "Editar Categoría" y botón "Guardar"', () => {
    const category: Category = { id: 'cat-1', name: 'Comida', type: 'expense' };
    render(
      <CategoryFormDialog
        open
        editingCategory={category}
        formData={baseFormData({ name: 'Comida' })}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByText('Editar Categoría')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando viene no vacío', () => {
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData()}
        saving={false}
        error="El nombre ya existe"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByText('El nombre ya existe')).toBeInTheDocument();
  });

  it('saving=true: el botón de submit queda deshabilitado y dice "Guardando..."', () => {
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData()}
        saving
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: 'Guardando...' });
    expect(button).toBeDisabled();
  });

  it('tipo income: no muestra el campo de límite mensual', () => {
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData({ type: 'income' })}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.queryByLabelText(/Límite Mensual/)).not.toBeInTheDocument();
  });

  it('tipo expense: muestra el campo de límite mensual', () => {
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData({ type: 'expense' })}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Límite Mensual/)).toBeInTheDocument();
  });

  it('escribir en el nombre llama a onFormDataChange con el nuevo valor', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData()}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    await user.type(screen.getByLabelText('Nombre'), 'X');

    expect(onFormDataChange).toHaveBeenCalled();
    const updater = onFormDataChange.mock.calls[0][0];
    expect(updater(baseFormData())).toEqual(baseFormData({ name: 'X' }));
  });

  it('submit del form dispara onSubmit', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData({ name: 'Comida' })}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onFormDataChange={vi.fn()}
      />
    );

    screen.getByRole('button', { name: 'Crear' }).closest('form')!.requestSubmit();

    expect(onSubmit).toHaveBeenCalled();
  });

  it('click en Cancelar llama a onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData()}
        saving={false}
        error=""
        onClose={onClose}
        onSubmit={vi.fn()}
        onFormDataChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('con un límite mensual cargado, el botón de "quitar" limpia el valor', async () => {
    const user = userEvent.setup();
    const onFormDataChange = vi.fn();
    render(
      <CategoryFormDialog
        open
        editingCategory={null}
        formData={baseFormData({ monthlyLimit: '500' })}
        saving={false}
        error=""
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        onFormDataChange={onFormDataChange}
      />
    );

    await user.click(screen.getByTitle('Quitar límite'));

    const updater = onFormDataChange.mock.calls[0][0];
    expect(updater(baseFormData({ monthlyLimit: '500' })).monthlyLimit).toBe('');
  });
});

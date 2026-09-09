import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './dialog';

function renderDialog(onClose = vi.fn(), open = true) {
  return render(
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Título</DialogTitle>
      </DialogHeader>
      <DialogContent>Contenido</DialogContent>
      <DialogFooter>Footer</DialogFooter>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('cerrado no renderiza nada', () => {
    renderDialog(vi.fn(), false);
    expect(screen.queryByText('Título')).not.toBeInTheDocument();
  });

  it('abierto renderiza título, contenido y footer con role dialog', () => {
    renderDialog();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('click en el backdrop llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderDialog(onClose);

    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('click en el botón Cerrar llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderDialog(onClose);

    await user.click(screen.getByLabelText('Cerrar'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('tecla Escape llama onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderDialog(onClose);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

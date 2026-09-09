import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReceiptScanner } from './ReceiptScanner';

vi.mock('../../../api/receipts.api', () => ({
  receiptsApi: { scan: vi.fn() },
}));

import { receiptsApi } from '../../../api/receipts.api';

function makeImageFile(name = 'receipt.png') {
  return new File(['fake-image-content'], name, { type: 'image/png' });
}

describe('ReceiptScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('archivo no-imagen: muestra alert y no llama a la API', async () => {
    render(<ReceiptScanner open onClose={vi.fn()} onScanned={vi.fn()} />);

    // userEvent.upload respeta `accept="image/*"` y no dispararía el change;
    // se dispara manualmente para simular un input sin esa restricción (drag&drop, etc.).
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const textFile = new File(['x'], 'nota.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [textFile] });
    fireEvent.change(input);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Por favor selecciona una imagen válida')
    );
    expect(receiptsApi.scan).not.toHaveBeenCalled();
  });

  it('escaneo exitoso sin duplicado: muestra los datos y permite "Usar Datos"', async () => {
    vi.mocked(receiptsApi.scan).mockResolvedValue({
      duplicate: false,
      matchType: 'none',
      scannedData: {
        amount: 42,
        description: 'Super',
        date: '2026-01-05',
        confidence: 'high',
        imageHash: 'hash-1',
        rawText: '',
        items: [],
      },
    } as never);
    const onScanned = vi.fn();
    const user = userEvent.setup();
    render(<ReceiptScanner open onClose={vi.fn()} onScanned={onScanned} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile());

    await waitFor(() =>
      expect(screen.getByText('Factura procesada correctamente')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /Usar Datos/i }));

    expect(onScanned).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 42, description: 'Super' })
    );
  });

  it('duplicado exacto: muestra la transacción existente y permite verla', async () => {
    vi.mocked(receiptsApi.scan).mockResolvedValue({
      duplicate: true,
      matchType: 'exact',
      existingTransaction: {
        id: 'tx-1',
        amount: 10,
        description: 'Ya existe',
        date: '2026-01-01',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    } as never);
    const onViewExisting = vi.fn();
    const user = userEvent.setup();
    render(
      <ReceiptScanner open onClose={vi.fn()} onScanned={vi.fn()} onViewExisting={onViewExisting} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile());

    await waitFor(() => expect(screen.getByText('Factura ya registrada')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Ver Transacción/i }));

    expect(onViewExisting).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-1' }));
  });

  it('la API falla: muestra alert de error y limpia la vista previa', async () => {
    vi.mocked(receiptsApi.scan).mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<ReceiptScanner open onClose={vi.fn()} onScanned={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, makeImageFile());

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        'Error al escanear la factura. Por favor intenta de nuevo.'
      )
    );
  });

  it('cerrado no renderiza el título', () => {
    render(<ReceiptScanner open={false} onClose={vi.fn()} onScanned={vi.fn()} />);

    expect(screen.queryByText('Escanear Factura')).not.toBeInTheDocument();
  });
});

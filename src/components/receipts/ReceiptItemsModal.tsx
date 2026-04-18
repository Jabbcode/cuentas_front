import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../ui/dialog';
import { formatCurrency } from '../../lib/utils';
import type { ReceiptItem } from '../../types';
import { Package } from 'lucide-react';

interface ReceiptItemsModalProps {
  open: boolean;
  onClose: () => void;
  items: ReceiptItem[];
  transactionAmount: number;
}

export function ReceiptItemsModal({ open, onClose, items, transactionAmount }: ReceiptItemsModalProps) {
  if (items.length === 0) {
    return null;
  }

  const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const matchesTransaction = Math.abs(itemsTotal - transactionAmount) < 0.01;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Detalle de Factura</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          {/* Items list */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="p-2 text-left font-medium text-gray-700">Producto</th>
                  <th className="p-2 text-right font-medium text-gray-700">Cant.</th>
                  <th className="p-2 text-right font-medium text-gray-700">Precio Unit.</th>
                  <th className="p-2 text-right font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right text-gray-600">{item.quantity}</td>
                    <td className="p-2 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-2 text-right font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                <tr>
                  <td colSpan={3} className="p-2 text-right font-semibold text-gray-700">
                    Total Items:
                  </td>
                  <td className="p-2 text-right font-bold text-gray-900">{formatCurrency(itemsTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Warning if totals don't match */}
          {!matchesTransaction && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm">
              <p className="font-medium text-yellow-800">⚠️ Advertencia</p>
              <p className="mt-1 text-yellow-700">
                La suma de los items ({formatCurrency(itemsTotal)}) no coincide con el total de la transacción ({formatCurrency(transactionAmount)}).
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de productos:</span>
              <span className="font-medium text-gray-900">{items.length}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-gray-600">Total factura:</span>
              <span className="font-bold text-gray-900">{formatCurrency(transactionAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { CategoryIconBadge } from '../../../components/ui/category-icon';
import { formatCurrency } from '../../../lib/utils';
import type { TransactionCategorySummaryItem } from '../api';

interface TransactionCategorySummaryModalProps {
  open: boolean;
  summary: TransactionCategorySummaryItem[];
  loading: boolean;
  onClose: () => void;
  onCategoryClick: (categoryId: string) => void;
}

export function TransactionCategorySummaryModal({
  open,
  summary,
  loading,
  onClose,
  onCategoryClick,
}: TransactionCategorySummaryModalProps) {
  const totalExpenses = summary.reduce((sum, s) => sum + s.expenseTotal, 0);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Resumen por categoría</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : summary.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <BarChart3 className="h-10 w-10 text-gray-300" />
            <p className="text-gray-600">Sin transacciones para el período seleccionado</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {summary.map((item) => (
              <button
                key={item.category.id}
                type="button"
                onClick={() => {
                  onCategoryClick(item.category.id);
                  onClose();
                }}
                className="w-full rounded-lg border border-gray-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CategoryIconBadge
                    icon={item.category.icon}
                    color={item.category.color}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.category.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.count} transacciones</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    {item.expenseTotal > 0 && (
                      <p className="text-sm font-semibold text-red-600">
                        -{formatCurrency(item.expenseTotal)}
                      </p>
                    )}
                    {item.incomeTotal > 0 && (
                      <p className="text-sm font-semibold text-green-600">
                        +{formatCurrency(item.incomeTotal)}
                      </p>
                    )}
                    {item.expenseTotal > 0 && totalExpenses > 0 && (
                      <p className="text-xs text-gray-500">
                        {Math.round((item.expenseTotal / totalExpenses) * 100)}% del gasto
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

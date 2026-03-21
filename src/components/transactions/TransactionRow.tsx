import { Trash2, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { getCreditCardPeriod } from '../../lib/credit-card-utils';
import type { Transaction, Account } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function TransactionRow({
  transaction: tx,
  accounts,
  onDelete,
}: TransactionRowProps) {
  const creditCardPeriod = getCreditCardPeriod(
    tx,
    accounts.find((acc) => acc.id === tx.accountId)
  );
  const isCreditCard =
    accounts.find((acc) => acc.id === tx.accountId)?.type === 'credit_card';

  return (
    <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {tx.description || tx.account?.name}
          </span>
          {tx.fixedExpenseId && (
            <Badge variant="secondary" className="text-xs">
              Fijo
            </Badge>
          )}
          {isCreditCard && tx.type === 'expense' && creditCardPeriod && (
            <Badge variant="outline" className="text-xs">
              <CreditCard className="mr-1 h-3 w-3" />
              {creditCardPeriod.label}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold',
            tx.type === 'income' ? 'text-green-600' : 'text-red-600'
          )}
        >
          {tx.type === 'income' ? '+' : '-'}
          {formatCurrency(Number(tx.amount))}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(tx.id)}
          className="h-6 w-6 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

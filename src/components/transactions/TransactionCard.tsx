import { Trash2, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CategoryIconBadge } from '../ui/category-icon';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { getCreditCardPeriod } from '../../lib/credit-card-utils';
import type { Transaction, Account } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function TransactionCard({
  transaction: tx,
  accounts,
  onDelete,
}: TransactionCardProps) {
  const creditCardPeriod = getCreditCardPeriod(
    tx,
    accounts.find((acc) => acc.id === tx.accountId)
  );
  const isCreditCard =
    accounts.find((acc) => acc.id === tx.accountId)?.type === 'credit_card';

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <CategoryIconBadge
            icon={tx.category?.icon}
            color={tx.category?.color}
            size="lg"
            tooltip={tx.category?.name}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">
                {tx.category?.name}
              </span>
              {tx.fixedExpenseId && <Badge variant="secondary">Fijo</Badge>}
              {isCreditCard && tx.type === 'expense' && creditCardPeriod && (
                <Badge variant="outline" className="text-xs">
                  <CreditCard className="mr-1 h-3 w-3" />
                  {creditCardPeriod.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {tx.description || tx.account?.name} • {formatDate(tx.date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={cn(
              'text-base font-semibold',
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
            className="h-8 w-8 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

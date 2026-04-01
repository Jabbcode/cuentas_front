import { Card, CardContent } from '../ui/card';
import { CategoryIconBadge } from '../ui/category-icon';
import { TransactionRow } from './TransactionRow';
import { TransactionEmpty } from './TransactionEmpty';
import { formatCurrency, cn } from '../../lib/utils';
import type { GroupedTransaction } from '../../lib/transaction-utils';
import type { Account, Transaction } from '../../types';

interface TransactionGroupedViewProps {
  groupedTransactions: GroupedTransaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onCreateClick: () => void;
}

export function TransactionGroupedView({
  groupedTransactions,
  accounts,
  onDelete,
  onEdit,
  onCreateClick,
}: TransactionGroupedViewProps) {
  if (groupedTransactions.length === 0) {
    return <TransactionEmpty onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map((group) => (
        <Card key={group.category.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <div className="flex items-center gap-3">
                <CategoryIconBadge
                  icon={group.category.icon}
                  color={group.category.color}
                  size="lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {group.category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {group.transactions.length} transacciones
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'text-lg font-semibold',
                  group.total >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {group.total >= 0 ? '+' : ''}
                {formatCurrency(Math.abs(group.total))}
              </span>
            </div>

            <div className="space-y-2">
              {group.transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  accounts={accounts}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

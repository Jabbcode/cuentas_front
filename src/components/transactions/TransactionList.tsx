import { TransactionCard } from './TransactionCard';
import { TransactionEmpty } from './TransactionEmpty';
import type { Transaction, Account } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onViewItems?: (transaction: Transaction) => void;
  loadingItemsId?: string | null;
  onCreateClick: () => void;
}

export function TransactionList({
  transactions,
  accounts,
  onDelete,
  onEdit,
  onViewItems,
  loadingItemsId,
  onCreateClick,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <TransactionEmpty onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          accounts={accounts}
          onDelete={onDelete}
          onEdit={onEdit}
          onViewItems={onViewItems}
          isLoadingItems={loadingItemsId === tx.id}
        />
      ))}
    </div>
  );
}

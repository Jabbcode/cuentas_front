import { ChevronDown, ChevronRight } from 'lucide-react';
import { AccountCard } from './AccountCard';
import type { Account, CreditCardStatement } from '../../../types';

interface Props {
  type: Account['type'];
  label: string;
  accounts: Account[];
  isExpanded: boolean;
  statementsMap: Record<string, CreditCardStatement>;
  onToggle: (type: Account['type']) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onViewTransactions: (id: string) => void;
}

export function AccountTypeSection({
  type,
  label,
  accounts,
  isExpanded,
  statementsMap,
  onToggle,
  onEdit,
  onDelete,
  onViewTransactions,
}: Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => onToggle(type)}
        className="flex w-full items-center gap-2 text-left transition-colors hover:opacity-70"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
        <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
        <span className="text-sm text-gray-500">({accounts.length})</span>
      </button>

      {isExpanded && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewTransactions={onViewTransactions}
              statement={statementsMap[account.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

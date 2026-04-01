import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { CreditCardStatement } from '../../types';

interface CreditCardHeaderProps {
  statement: CreditCardStatement;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CreditCardHeader({ statement, isCollapsed = false, onToggleCollapse }: CreditCardHeaderProps) {
  // Use backend calculated values for total usage
  const totalUsed = statement.creditLimit - statement.available;
  const usagePercentage = statement.usagePercentage;
  const availablePercentage = 100 - usagePercentage;

  // Period balances are for display only (show expenses per period)
  const closedBalance = statement.closedPeriod.isPaid ? 0 : statement.closedPeriod.balance;
  const currentBalance = statement.currentPeriod.balance;

  const closedPercentage = statement.creditLimit > 0
    ? Math.round((closedBalance / statement.creditLimit) * 100)
    : 0;
  const currentPercentage = statement.creditLimit > 0
    ? Math.round((currentBalance / statement.creditLimit) * 100)
    : 0;

  return (
    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="rounded-full bg-purple-100 p-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{statement.account.name}</CardTitle>
            <p className="text-sm text-gray-600">
              Límite: {formatCurrency(statement.creditLimit)}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
            aria-label={isCollapsed ? "Expandir tarjeta" : "Colapsar tarjeta"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-purple-600" />
            ) : (
              <ChevronUp className="h-5 w-5 text-purple-600" />
            )}
          </button>
        )}
      </div>

      {/* Available Credit - Destacado */}
      <div className="mt-4 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Crédito disponible</span>
          <div className="text-right">
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(statement.available)}
            </span>
            <span className="text-sm text-gray-500 ml-2">({availablePercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Uso del crédito</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(totalUsed)} / {formatCurrency(statement.creditLimit)}
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden flex">
          <div
            className={`h-full transition-all ${
              usagePercentage >= 90 ? 'bg-red-500' :
              usagePercentage >= 80 ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
            title={`Uso: ${formatCurrency(totalUsed)} (${usagePercentage}%)`}
          />
        </div>

        {/* Info text */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Usado: <span className="font-medium text-gray-900">{usagePercentage}%</span>
          </span>
          {!statement.closedPeriod.isPaid && closedBalance > 0 && (
            <span className="text-orange-600 font-medium">
              ⚠ Periodo cerrado sin pagar: {formatCurrency(closedBalance)}
            </span>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

import { CreditCard } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import type { CreditCardStatement } from '../../types';

interface CreditCardHeaderProps {
  statement: CreditCardStatement;
}

export function CreditCardHeader({ statement }: CreditCardHeaderProps) {
  const closedBalance = statement.closedPeriod.isPaid ? 0 : statement.closedPeriod.balance;
  const currentBalance = statement.currentPeriod.balance;
  const totalUsed = closedBalance + currentBalance;

  const closedPercentage = statement.creditLimit > 0
    ? Math.round((closedBalance / statement.creditLimit) * 100)
    : 0;
  const currentPercentage = statement.creditLimit > 0
    ? Math.round((currentBalance / statement.creditLimit) * 100)
    : 0;
  const availablePercentage = 100 - closedPercentage - currentPercentage;

  return (
    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 lg:p-6">
      <div className="flex items-center gap-3">
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

      {/* Stacked Usage Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Uso del crédito</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(totalUsed)} / {formatCurrency(statement.creditLimit)}
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden flex">
          {closedBalance > 0 && (
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${closedPercentage}%` }}
              title={`Periodo cerrado: ${formatCurrency(closedBalance)}`}
            />
          )}
          {currentBalance > 0 && (
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${currentPercentage}%` }}
              title={`Periodo actual: ${formatCurrency(currentBalance)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          {closedBalance > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">
                Periodo cerrado: <span className="font-medium text-orange-700">{formatCurrency(closedBalance)}</span>
                <span className="text-gray-500 ml-1">({closedPercentage}%)</span>
              </span>
            </div>
          )}
          {currentBalance > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">
                Periodo actual: <span className="font-medium text-blue-700">{formatCurrency(currentBalance)}</span>
                <span className="text-gray-500 ml-1">({currentPercentage}%)</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

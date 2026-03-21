import { CreditCard } from 'lucide-react';
import { CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../lib/utils';
import { getUsageColor } from '../../lib/credit-card-utils';
import type { CreditCardStatement } from '../../types';

interface CreditCardHeaderProps {
  statement: CreditCardStatement;
}

export function CreditCardHeader({ statement }: CreditCardHeaderProps) {
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

      {/* Usage Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Crédito disponible</span>
          <span className="font-medium text-green-600">
            {formatCurrency(statement.available)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${getUsageColor(
              statement.usagePercentage
            )}`}
            style={{ width: `${Math.min(statement.usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-500">{statement.usagePercentage}% usado</span>
          <div className="text-right">
            {!statement.closedPeriod.isPaid && statement.closedPeriod.balance > 0 && (
              <div className="text-orange-600 font-medium">
                Período cerrado: {formatCurrency(statement.closedPeriod.balance)}
              </div>
            )}
            <div className="text-gray-700 font-medium">
              Período actual: {formatCurrency(statement.currentPeriod.balance)}
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

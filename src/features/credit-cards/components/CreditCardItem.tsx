import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CreditCardHeader } from './CreditCardHeader';
import { CreditCardAlerts } from './CreditCardAlerts';
import { CreditCardPeriod } from './CreditCardPeriod';
import { CreditCardOverduePeriods } from './CreditCardOverduePeriods';
import { Receipt, Plus } from 'lucide-react';
import type { CreditCardStatement, CreditCardOverduePeriod } from '../../../types';

interface CreditCardItemProps {
  statement: CreditCardStatement;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onPayClick: (statement: CreditCardStatement) => void;
  onPayOverdueClick: (statement: CreditCardStatement, period: CreditCardOverduePeriod) => void;
  onViewTransactions: (statement: CreditCardStatement) => void;
  onCreateExpense: (statement: CreditCardStatement) => void;
}

export function CreditCardItem({
  statement,
  isCollapsed,
  onToggleCollapse,
  onPayClick,
  onPayOverdueClick,
  onViewTransactions,
  onCreateExpense,
}: CreditCardItemProps) {
  return (
    <Card className="overflow-hidden">
      <CreditCardHeader
        statement={statement}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />

      {!isCollapsed && (
        <CardContent className="p-4 lg:p-6 space-y-4">
          <CreditCardAlerts alerts={statement.alerts} />

          <div className="grid gap-4 lg:grid-cols-2">
            <CreditCardPeriod
              type="closed"
              period={statement.closedPeriod}
              onPayClick={() => onPayClick(statement)}
            />
            <CreditCardPeriod type="current" period={statement.currentPeriod} />
          </div>

          <CreditCardOverduePeriods
            periods={statement.overduePeriods}
            onPayClick={(period) => onPayOverdueClick(statement, period)}
          />

          {/* View transactions button */}
          <Button
            variant="outline"
            onClick={() => onViewTransactions(statement)}
            className="w-full"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Ver todas las transacciones
          </Button>

          {/* Create expense button */}
          <Button variant="outline" onClick={() => onCreateExpense(statement)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar gasto
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

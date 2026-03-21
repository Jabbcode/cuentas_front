import { Card, CardContent } from '../ui/card';
import { CreditCardHeader } from './CreditCardHeader';
import { CreditCardAlerts } from './CreditCardAlerts';
import { CreditCardPeriod } from './CreditCardPeriod';
import type { CreditCardStatement } from '../../types';

interface CreditCardItemProps {
  statement: CreditCardStatement;
  onPayClick: (statement: CreditCardStatement) => void;
}

export function CreditCardItem({ statement, onPayClick }: CreditCardItemProps) {
  return (
    <Card className="overflow-hidden">
      <CreditCardHeader statement={statement} />

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
      </CardContent>
    </Card>
  );
}

import { CreditCardOverduePeriodItem } from './CreditCardOverduePeriodItem';
import type { CreditCardOverduePeriod } from '../../../types';

interface CreditCardOverduePeriodsProps {
  periods: CreditCardOverduePeriod[];
  onPayClick: (period: CreditCardOverduePeriod) => void;
}

export function CreditCardOverduePeriods({ periods, onPayClick }: CreditCardOverduePeriodsProps) {
  if (periods.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">Períodos atrasados</h4>
      <div className="space-y-2">
        {periods.map((period) => (
          <CreditCardOverduePeriodItem
            key={period.startDate}
            period={period}
            onPayClick={onPayClick}
          />
        ))}
      </div>
    </div>
  );
}

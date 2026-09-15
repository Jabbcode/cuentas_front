import { Select } from '../../../components/ui/select';
import { OVERDUE_MONTHS_OPTIONS } from '../utils';

interface CreditCardOverdueRangeSelectorProps {
  value: number;
  onChange: (months: number) => void;
}

export function CreditCardOverdueRangeSelector({
  value,
  onChange,
}: CreditCardOverdueRangeSelectorProps) {
  return (
    <Select
      aria-label="Rango de períodos atrasados"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-auto"
    >
      {OVERDUE_MONTHS_OPTIONS.map((months) => (
        <option key={months} value={months}>
          Últimos {months} meses
        </option>
      ))}
    </Select>
  );
}

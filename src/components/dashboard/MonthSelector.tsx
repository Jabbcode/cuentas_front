import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS_LONG } from '../../lib/utils';

interface Props {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

export function MonthSelector({ month, year, onPrev, onNext, disableNext = false }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-36 text-center text-sm font-medium text-gray-900">
        {MONTHS_LONG[month - 1]} {year}
      </span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

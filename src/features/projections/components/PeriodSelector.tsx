import { cn } from '../../../lib/utils';
import { PRESET_DAYS } from '../utils';

interface PeriodSelectorProps {
  days: number;
  customDays: string;
  isCustom: boolean;
  onPreset: (days: number) => void;
  onCustomChange: (value: string) => void;
  onApply: () => void;
}

export function PeriodSelector({
  days,
  customDays,
  isCustom,
  onPreset,
  onCustomChange,
  onApply,
}: PeriodSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onApply();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESET_DAYS.map((preset) => (
        <button
          key={preset}
          onClick={() => onPreset(preset)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            !isCustom && days === preset
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {preset}d
        </button>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="number"
          placeholder="Días"
          value={customDays}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={handleKeyDown}
          min={1}
          max={365}
          className={cn(
            'w-20 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            isCustom ? 'border-blue-500' : 'border-gray-200'
          )}
        />
        <button
          onClick={onApply}
          className="rounded-lg bg-gray-100 px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}

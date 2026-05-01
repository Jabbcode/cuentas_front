import { Tag, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TagBadgeProps {
  name: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function TagBadge({ name, onRemove, onClick, active, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        active ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <Tag className="h-3 w-3" />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-indigo-300 p-0.5"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

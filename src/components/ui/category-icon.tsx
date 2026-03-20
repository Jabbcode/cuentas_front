import { categoryIcons, DEFAULT_ICON, emojiToLucideMap } from '../../lib/category-icons';
import { cn } from '../../lib/utils';

interface CategoryIconProps {
  icon?: string | null;
  color?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function CategoryIcon({ icon, color, className, size = 'md', tooltip }: CategoryIconProps) {
  // Determinar el nombre del icono
  let iconName = icon || DEFAULT_ICON;

  // Si es un emoji, convertirlo a nombre de Lucide
  if (iconName && emojiToLucideMap[iconName]) {
    iconName = emojiToLucideMap[iconName];
  }

  // Obtener el componente del icono
  const IconComponent = categoryIcons[iconName] || categoryIcons[DEFAULT_ICON];

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconElement = (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      style={color ? { color } : undefined}
    />
  );

  // Si hay tooltip, envolver en span con title
  if (tooltip) {
    return (
      <span title={tooltip} className="inline-flex">
        {iconElement}
      </span>
    );
  }

  return iconElement;
}

// Alias para compatibilidad
export function CategoryIconBadge({ icon, color, size = 'md', className, tooltip }: CategoryIconProps) {
  return <CategoryIcon icon={icon} color={color} size={size} className={className} tooltip={tooltip} />;
}

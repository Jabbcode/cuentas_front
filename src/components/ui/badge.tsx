import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-[#020617]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white dark:bg-blue-700',
        secondary: 'border-transparent bg-gray-100 text-gray-900 dark:bg-[#1E293B] dark:text-[#F8FAFC]',
        destructive: 'border-transparent bg-red-600 text-white dark:bg-red-700',
        outline: 'border-gray-300 text-gray-700 dark:border-[hsl(215_20%_25%)] dark:text-[#CBD5E1]',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
        danger: 'border-transparent bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

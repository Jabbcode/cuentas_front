import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-gray-900',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
        outline: 'border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-50',
        secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-50',
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
        success: 'bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

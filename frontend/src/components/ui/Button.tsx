import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
  secondary:
    'bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]',
  danger:
    'bg-error text-white hover:bg-red-700 active:scale-[0.98]',
  ghost:
    'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-6 text-sm gap-2 rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

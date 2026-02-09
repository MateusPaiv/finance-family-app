import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const colorStyles = {
  default: 'bg-gray-100 text-gray-600',
  accent: 'bg-accent-light text-accent',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error: 'bg-error-light text-error',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-xs',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof typeof colorStyles;
  size?: keyof typeof sizeStyles;
}

export function Badge({
  color = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        colorStyles[color],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

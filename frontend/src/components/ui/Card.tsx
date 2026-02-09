import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

const variantStyles = {
  default: 'border border-gray-200',
  elevated: 'border border-gray-200 shadow-sm',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
  padding?: keyof typeof paddingStyles;
  hover?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  header,
  footer,
  className,
  children,
  ...props
}: CardProps) {
  const hasCustomPadding = header || footer;

  return (
    <div
      className={cn(
        'bg-white rounded-lg transition-all duration-fast',
        variantStyles[variant],
        !hasCustomPadding && paddingStyles[padding],
        hover && 'cursor-pointer hover:border-gray-300 hover:shadow-sm',
        className,
      )}
      {...props}
    >
      {header && (
        <div className={cn('border-b border-gray-200', paddingStyles[padding])}>
          {header}
        </div>
      )}
      {hasCustomPadding ? (
        <div className={paddingStyles[padding]}>{children}</div>
      ) : (
        children
      )}
      {footer && (
        <div className={cn('border-t border-gray-200', paddingStyles[padding])}>
          {footer}
        </div>
      )}
    </div>
  );
}

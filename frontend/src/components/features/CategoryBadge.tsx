import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export interface CategoryBadgeProps {
  category: Category;
  onClick?: () => void;
  className?: string;
}

export function CategoryBadge({
  category,
  onClick,
  className,
}: CategoryBadgeProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
        'bg-gray-50 border border-gray-200',
        'text-sm font-medium text-gray-700',
        'transition-all duration-fast',
        onClick &&
          'cursor-pointer hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98]',
        className,
      )}
    >
      <span className="text-base leading-none">{category.emoji}</span>
      <span>{category.name}</span>
    </Component>
  );
}

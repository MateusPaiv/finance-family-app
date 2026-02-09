import { cn } from '@/lib/utils';

export interface BudgetBarProps {
  spent: number;
  budget: number;
  categoryName?: string;
  className?: string;
}

export function BudgetBar({
  spent,
  budget,
  categoryName,
  className,
}: BudgetBarProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - spent, 0);

  const formattedSpent = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(spent);

  const formattedBudget = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(budget);

  const formattedRemaining = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(remaining);

  // Color logic: green < 70%, yellow 70-90%, red > 90%
  const getColor = () => {
    if (percentage >= 90) return 'bg-error';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const getTextColor = () => {
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {categoryName && (
            <span className="font-medium text-gray-900">{categoryName}</span>
          )}
          <span className={cn('text-xs', getTextColor())}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formattedSpent} / {formattedBudget}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-normal',
            getColor(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Remaining */}
      {remaining > 0 && (
        <p className="text-xs text-gray-500">
          {formattedRemaining} remaining
        </p>
      )}
      {spent > budget && (
        <p className="text-xs text-error">
          Over budget by {formattedSpent.replace('-', '')}
        </p>
      )}
    </div>
  );
}

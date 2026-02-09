import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  const displayValue = typeof value === 'number'
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value)
    : value;

  return (
    <Card padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-semibold text-gray-900 mb-2">
            {displayValue}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-error" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.direction === 'up' ? 'text-success' : 'text-error',
                )}
              >
                {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50">
            <div className="text-gray-600">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

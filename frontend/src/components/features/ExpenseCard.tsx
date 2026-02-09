import { format } from 'date-fns';
import { Edit2, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Expense } from '@/types';

export interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(expense.amount);

  const formattedDate = format(new Date(expense.date), 'dd/MM/yyyy');

  return (
    <Card
      padding="md"
      className="group relative"
      hover={!!(onEdit || onDelete)}
    >
      <div className="flex items-start gap-4">
        {/* Receipt thumbnail */}
        {expense.receiptUrl ? (
          <a
            href={expense.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-12 h-12 rounded overflow-hidden border border-gray-200 hover:border-accent transition-colors"
          >
            <img
              src={expense.receiptUrl}
              alt="Receipt"
              className="w-full h-full object-cover"
            />
          </a>
        ) : (
          <div className="shrink-0 w-12 h-12 rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
            <FileText size={20} className="text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-gray-900">
                  {formattedAmount}
                </span>
                {expense.isShared && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    Shared
                  </span>
                )}
              </div>

              {expense.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {expense.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{formattedDate}</span>
                {expense.category && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>{expense.category.emoji}</span>
                      <span>{expense.category.name}</span>
                    </span>
                  </>
                )}
                {expense.paymentMethod && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>{expense.paymentMethod.icon}</span>
                      <span>{expense.paymentMethod.name}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 size={14} />}
                    onClick={() => onEdit(expense)}
                    aria-label="Edit expense"
                  />
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => onDelete(expense.id)}
                    aria-label="Delete expense"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

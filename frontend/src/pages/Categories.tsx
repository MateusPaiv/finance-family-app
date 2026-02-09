import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BudgetBar } from '@/components/features/BudgetBar';
import { StatCard } from '@/components/features/StatCard';
import {
  useCategories,
  useBudgetOverview,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import type { CategoryWithCounts } from '@/types';
import { cn } from '@/lib/utils';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  emoji: z.string().optional(),
  budgetLimit: z.number().positive('Budget must be positive').optional().or(z.literal(0)),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Common emoji presets for quick selection
const EMOJI_PRESETS = [
  '🛒', '🍔', '🚗', '🏥', '🎮', '💰',
  '🏠', '⚡', '📱', '👕', '✈️', '🎓',
  '🎬', '🏋️', '🐕', '🎨', '📚', '☕',
  '🍕', '🎵', '💻', '🌳', '🚌', '💊',
];

export function Categories() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCounts | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState('📁');

  const { data: categories } = useCategories();
  const { data: budgetOverview } = useBudgetOverview();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      emoji: '📁',
    },
  });

  const formEmoji = watch('emoji');

  // Calculate stats
  const totalCategories = categories?.length || 0;
  const categoriesOverBudget = budgetOverview?.filter((c) => c.isOverBudget).length || 0;
  const totalBudgeted = budgetOverview?.reduce((sum, c) => sum + c.budgetLimit, 0) || 0;
  const totalSpent = budgetOverview?.reduce((sum, c) => sum + c.totalSpent, 0) || 0;

  const handleOpenAdd = () => {
    reset({ name: '', emoji: '📁', budgetLimit: undefined });
    setSelectedEmoji('📁');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryWithCounts) => {
    reset({
      name: category.name,
      emoji: category.emoji,
      budgetLimit: category.budgetLimit || undefined,
    });
    setSelectedEmoji(category.emoji);
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    reset();
    setSelectedEmoji('📁');
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload = {
        ...data,
        emoji: selectedEmoji || '📁',
        budgetLimit: data.budgetLimit || undefined,
      };

      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: payload,
        });
      } else {
        await createCategory.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategoryId) return;
    try {
      await deleteCategory.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setValue('emoji', emoji);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
              <p className="text-sm text-gray-500 mt-1">
                Organize and budget your spending
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Categories"
              value={totalCategories}
              icon={<TrendingUp size={20} />}
            />
            <StatCard
              label="Over Budget"
              value={categoriesOverBudget}
              icon={<AlertCircle size={20} />}
            />
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Budget vs Spent
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-sm text-gray-500">
                  / {formatCurrency(totalBudgeted)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!categories || categories.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first category to organize your expenses
            </p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
              Add Category
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const budgetInfo = budgetOverview?.find((b) => b.id === category.id);

              return (
                <Card
                  key={category.id}
                  padding="md"
                  className={cn(
                    'group relative',
                    budgetInfo?.isOverBudget && 'border-error/30 bg-error-light/20'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{category.emoji}</span>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {category.expenseCount} expenses
                        </p>
                      </div>
                    </div>

                    {budgetInfo?.isOverBudget && (
                      <Badge color="error" size="sm">
                        Over
                      </Badge>
                    )}
                  </div>

                  {/* Budget info */}
                  {category.budgetLimit ? (
                    <div className="mb-4">
                      {budgetInfo ? (
                        <BudgetBar
                          spent={budgetInfo.totalSpent}
                          budget={budgetInfo.budgetLimit}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          Budget: {formatCurrency(category.budgetLimit)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">No budget set</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit2 size={14} />}
                      onClick={() => handleOpenEdit(category)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      onClick={() => setDeletingCategoryId(category.id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        open={isAddModalOpen || !!editingCategory}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createCategory.isPending || updateCategory.isPending}
            >
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g., Groceries, Transport"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Emoji Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Icon
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 text-4xl bg-gray-50 border border-gray-200 rounded-lg">
                {selectedEmoji || formEmoji || '📁'}
              </div>
              <Input
                placeholder="Type emoji or select below"
                value={selectedEmoji}
                onChange={(e) => handleEmojiSelect(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Emoji presets */}
            <div className="grid grid-cols-12 gap-2">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    'flex items-center justify-center w-full h-10 text-xl rounded border transition-all',
                    selectedEmoji === emoji
                      ? 'border-accent bg-accent-light'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Monthly Budget (optional)"
            type="number"
            step="0.01"
            placeholder="0.00"
            helperText="Set a spending limit for this category"
            error={errors.budgetLimit?.message}
            {...register('budgetLimit', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
            })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingCategoryId}
        onClose={() => setDeletingCategoryId(null)}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingCategoryId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              loading={deleteCategory.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this category? Existing expenses will keep
          their data, but won't be linked to this category anymore.
        </p>
      </Modal>
    </div>
  );
}

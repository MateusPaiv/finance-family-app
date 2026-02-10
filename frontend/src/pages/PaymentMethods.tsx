import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, CreditCard, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/features/StatCard';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/usePaymentMethods';
import { useMonthlySummary } from '@/hooks/useExpenses';
import type { PaymentMethod, PaymentMethodType } from '@/types';
import { cn } from '@/lib/utils';

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'PIX', 'OTHER']),
  icon: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

// Payment method type options
const PAYMENT_TYPE_OPTIONS: { value: PaymentMethodType; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'PIX', label: 'Pix' },
  { value: 'OTHER', label: 'Other' },
];

// Icon presets
const ICON_PRESETS = [
  '💳', '💰', '💵', '💴', '💶', '💷',
  '🏦', '🪙', '💸', '🤑', '💲', '🎫',
  '📱', '⚡', '🔵', '🟢', '🔴', '🟡',
];

export function PaymentMethods() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('💳');

  const { data: paymentMethods } = usePaymentMethods();
  const { data: summary } = useMonthlySummary();
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'CREDIT_CARD',
      icon: '💳',
      isDefault: false,
    },
  });

  const formType = watch('type');
  const formIcon = watch('icon');

  // Calculate stats
  const totalMethods = paymentMethods?.length || 0;
  const methodSpending = summary?.byPaymentMethod || [];
  const mostUsed = methodSpending.length > 0
    ? methodSpending.reduce((max, curr) => (curr.count > max.count ? curr : max))
    : null;

  const handleOpenAdd = () => {
    reset({
      name: '',
      type: 'CREDIT_CARD',
      icon: '💳',
      isDefault: false,
    });
    setSelectedIcon('💳');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (method: PaymentMethod) => {
    reset({
      name: method.name,
      type: method.type,
      icon: method.icon,
      isDefault: method.isDefault,
    });
    setSelectedIcon(method.icon);
    setEditingMethod(method);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMethod(null);
    reset();
    setSelectedIcon('💳');
  };

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      const payload = {
        ...data,
        icon: selectedIcon || '💳',
      };

      if (editingMethod) {
        await updatePaymentMethod.mutateAsync({
          id: editingMethod.id,
          data: payload,
        });
      } else {
        await createPaymentMethod.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save payment method:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingMethodId) return;
    try {
      await deletePaymentMethod.mutateAsync(deletingMethodId);
      setDeletingMethodId(null);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const method = paymentMethods?.find((m) => m.id === methodId);
      if (!method) return;

      await updatePaymentMethod.mutateAsync({
        id: methodId,
        data: { isDefault: true },
      });
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setValue('icon', icon);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const getMethodSpending = (methodName: string) => {
    const spending = methodSpending.find((s) => s.name === methodName);
    return spending ? spending.total : 0;
  };

  const getMethodTransactions = (methodName: string) => {
    const spending = methodSpending.find((s) => s.name === methodName);
    return spending ? spending.count : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Payment Methods</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your payment methods and cards
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Payment Method
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              label="Total Methods"
              value={totalMethods}
              icon={<CreditCard size={20} />}
              formatAsCurrency={false}
            />
            <StatCard
              label="Most Used"
              value={mostUsed?.name || 'N/A'}
              icon={<TrendingUp size={20} />}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!paymentMethods || paymentMethods.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payment methods yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add your first payment method to track expenses
            </p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
              Add Payment Method
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const spending = getMethodSpending(method.name);
              const transactions = getMethodTransactions(method.name);
              const typeLabel = PAYMENT_TYPE_OPTIONS.find((t) => t.value === method.type)?.label;

              return (
                <Card
                  key={method.id}
                  padding="md"
                  className="group relative"
                  hover
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-200 rounded-lg text-3xl shrink-0">
                      {method.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {method.name}
                        </h3>
                        {method.isDefault && (
                          <Badge color="accent" size="sm">
                            <Star size={10} className="mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>{typeLabel}</span>
                        {transactions > 0 && (
                          <>
                            <span>•</span>
                            <span>{transactions} transactions this month</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Spending */}
                    {spending > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(spending)}
                        </p>
                        <p className="text-xs text-gray-500">This month</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!method.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Star size={14} />}
                          onClick={() => handleSetDefault(method.id)}
                          title="Set as default"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        onClick={() => handleOpenEdit(method)}
                        title="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => setDeletingMethodId(method.id)}
                        title="Delete"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Payment Method Modal */}
      <Modal
        open={isAddModalOpen || !!editingMethod}
        onClose={handleCloseModal}
        title={editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createPaymentMethod.isPending || updatePaymentMethod.isPending}
            >
              {editingMethod ? 'Save Changes' : 'Add Payment Method'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Name"
            placeholder="e.g., BB Card, NU Card"
            error={errors.name?.message}
            {...register('name')}
          />

          <Select
            label="Type"
            options={PAYMENT_TYPE_OPTIONS.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            value={formType}
            onChange={(value) => setValue('type', value as PaymentMethodType)}
          />

          {/* Icon Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Icon
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 text-4xl bg-gray-50 border border-gray-200 rounded-lg">
                {selectedIcon || formIcon || '💳'}
              </div>
              <Input
                placeholder="Type emoji or select below"
                value={selectedIcon}
                onChange={(e) => handleIconSelect(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Icon presets */}
            <div className="grid grid-cols-9 gap-2">
              {ICON_PRESETS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={cn(
                    'flex items-center justify-center w-full h-10 text-xl rounded border transition-all',
                    selectedIcon === icon
                      ? 'border-accent bg-accent-light'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              {...register('isDefault')}
            />
            <div className="flex items-center gap-2">
              <Star size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                Set as default payment method
              </span>
            </div>
          </label>

          {editingMethod?.isDefault && (
            <p className="text-xs text-gray-500 -mt-2">
              This is currently your default payment method
            </p>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingMethodId}
        onClose={() => setDeletingMethodId(null)}
        title="Delete Payment Method"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingMethodId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              loading={deletePaymentMethod.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this payment method? Existing expenses will
          keep their data, but won't be linked to this method anymore.
        </p>
      </Modal>
    </div>
  );
}
